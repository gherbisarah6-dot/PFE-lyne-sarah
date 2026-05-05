/**
 * PATIENT MODEL
 */

const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    // --- Identity ---
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },

    // --- Portal Security & Logic ---
    // fileCode matches the File Number 
    fileCode: { 
        type: String, 
        unique: true, 
        sparse: true, 
        trim: true 
    },
    isExisting: { type: Boolean, default: false },

    // --- Medical conditions ---
    chronicConditions: { type: String, default: 'None' },
    allergies: { type: String, default: 'None' },
    hereditaryConditions: { type: String, default: 'None' },
    
    // --- Emergency & Settings ---
    emergencyNumber: { type: String },
    
    // Toggles for the Settings & Help page
    reminders: {
        email: { type: Boolean, default: true },
    },

    // --- Old Records (File Storage) ---
    // Stores the metadata and link for files the patient adds
    oldRecords: [{
        fileName: { type: String },
        fileType: { type: String }, // e.g., "Report", "Lab Result"
        uploadDate: { type: Date, default: Date.now },
        fileUrl: { type: String } // The path to the file in the uploads folder
    }],

    // Status :
    //  Pending : just requested an appointement can't login yet or book another one
    //  Active : patient exist with file num and can use everything 
    //  Inactive : hasn't visited the clinic for a while
    status: { 
        type: String, 
        enum: ['Active', 'Inactive', 'Pending'], 
        default: 'Active' 
    }
}, 
{ 
    timestamps: true // This provides the "Member Since" date seen in the UI
});

//'users' so it matches your report in Atlas
module.exports = mongoose.model('Patient', patientSchema, 'users');