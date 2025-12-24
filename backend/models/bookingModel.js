const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    slot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot",
        required: true,
    },
    vehicleNumber: {
        type: String,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["BOOKED", "COMPLETED", "CANCELLED"],
        default: "BOOKED",
    },
    payment: {
        amount: {
            type: Number,
            default: 0,
        },
        method: {
            type: String,
            enum: ["credit_card", "paypal", "upi", "none"],
            default: "none",
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
        transactionId: {
            type: String,
        },
        paidAt: {
            type: Date,
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Booking", BookingSchema);
