const express = require("express");
const router = express.Router();
const Booking = require("../models/bookingModel");
const Slot = require("../models/slotModel");
const authMiddleware = require("../middleware/authMiddleware");
const { emitBookingNotification, emitSlotUpdate } = require("../socketHandlers");
const axios = require("axios");

// Java Validation Service URL
const JAVA_VALIDATOR_URL = process.env.JAVA_VALIDATOR_URL || "http://localhost:8080/api/validate-slot";

// POST /api/bookings/create
router.post("/create", authMiddleware, async (req, res) => {
    try {
        const { slotId, vehicleNumber, startTime, endTime } = req.body;
        const userId = req.user.id;

        // 1. Basic Validation
        if (!slotId || !vehicleNumber || !startTime || !endTime) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start >= end) {
            return res.status(400).json({ message: "End time must be after start time" });
        }

        // 2. Get slot details
        const slot = await Slot.findById(slotId);
        if (!slot) {
            return res.status(404).json({ message: "Slot not found" });
        }

        // 3. Call Java Validation Service (REQUIRED)
        const validationResponse = await axios.post(JAVA_VALIDATOR_URL, {
            slotId: slot._id.toString(),
            slotNumber: slot.slotNumber,
            vehicleNumber,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
        }, {
            timeout: 5000,
        });

        if (!validationResponse.data.valid) {
            return res.status(400).json({
                message: validationResponse.data.message || "Slot validation failed"
            });
        }

        // 4. Check for time conflicts on this specific slot
        const conflict = await Booking.findOne({
            slot: slotId,
            status: "BOOKED",
            $or: [
                { startTime: { $lt: end, $gte: start } },
                { endTime: { $gt: start, $lte: end } },
                { startTime: { $lte: start }, endTime: { $gte: end } }
            ]
        });

        if (conflict) {
            return res.status(400).json({ message: "Slot is already booked for this time period" });
        }

        // 5. Create Booking
        const newBooking = new Booking({
            user: userId,
            slot: slotId,
            vehicleNumber,
            startTime: start,
            endTime: end
        });

        await newBooking.save();

        // 6. Update slot availability
        slot.isAvailable = false;
        await slot.save();

        // 7. Emit real-time events to all connected clients
        emitBookingNotification({
            bookingId: newBooking._id,
            slotNumber: slot.slotNumber,
            vehicleNumber,
            userName: req.user.name,
            startTime: start,
            endTime: end,
        });

        emitSlotUpdate(slot);

        res.status(201).json({
            message: "Booking successful!",
            booking: newBooking,
            slot: slot
        });

    } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/bookings/my-bookings
router.get("/my-bookings", authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).populate("slot");
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/bookings/all - Admin only
router.get("/all", authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const bookings = await Booking.find()
            .populate("user", "name email vehicleNumber")
            .populate("slot", "slotNumber")
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

