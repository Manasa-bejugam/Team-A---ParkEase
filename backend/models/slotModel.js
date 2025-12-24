const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
    slotNumber: { type: String, required: true, unique: true },
    isAvailable: { type: Boolean, default: true },
    location: {
        x: Number,
        y: Number
    },
    city: {
        type: String,
        required: true,
        default: 'Hyderabad'
    },
    area: {
        type: String,
        required: true,
        default: 'Madhapur'
    },
    address: {
        type: String,
        required: true,
        default: 'Smart Parking Complex'
    },
    placeType: {
        type: String,
        enum: ['Shopping Mall', 'Cinema', 'Hospital', 'Metro Station', 'Market', 'Office Complex', 'Restaurant', 'Airport', 'Railway Station'],
        default: 'Shopping Mall'
    },
    imageUrl: { type: String }
});

module.exports = mongoose.model("Slot", slotSchema);