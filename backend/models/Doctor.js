/**
 * DOCTOR MODEL
 */

const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Doctor' },
    specialization: { type: String, trim: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    
    // For the Smart Booking feature
    schedule: {
        slotDuration: { type: Number, default: 30 },
        availableSlots: [{
            startTime: String,
            endTime: String,
            status: { type: String, default: 'available' }
        }]
    }
}, { timestamps: true });

// pointing it to the 'users' collection to match your documentation
module.exports = mongoose.model('Doctor', doctorSchema, 'users');