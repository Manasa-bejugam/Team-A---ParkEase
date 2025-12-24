const express = require("express");
const router = express.Router();
const Booking = require("../models/bookingModel");
const authMiddleware = require("../middleware/authMiddleware");
const axios = require("axios");

const JAVA_ANALYTICS_URL = process.env.JAVA_ANALYTICS_URL || "http://localhost:8080/api/analytics";

// GET /api/analytics/dashboard - Get comprehensive analytics
router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        // Fetch all bookings from MongoDB
        const bookings = await Booking.find()
            .populate("slot", "slotNumber")
            .sort({ createdAt: -1 });

        // Transform bookings to format expected by Java service
        const bookingData = bookings.map(booking => ({
            id: booking._id.toString(),
            slotNumber: booking.slot?.slotNumber || "Unknown",
            vehicleNumber: booking.vehicleNumber,
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status
        }));

        // Call Java analytics service
        const analyticsResponse = await axios.post(`${JAVA_ANALYTICS_URL}/stats`, {
            bookings: bookingData
        }, {
            timeout: 10000
        });

        res.json(analyticsResponse.data);

    } catch (error) {
        console.error("Analytics error:", error.message);

        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            return res.status(503).json({
                message: "Analytics service unavailable. Please ensure Java service is running.",
                error: error.message
            });
        }

        res.status(500).json({
            message: "Failed to fetch analytics",
            error: error.message
        });
    }
});

module.exports = router;
