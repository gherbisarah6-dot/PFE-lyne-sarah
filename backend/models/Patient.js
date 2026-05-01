/**
 * =============================================================================
 * PATIENT MODEL — models/Patient.js
 * =============================================================================
 *
 * STUDENT DEFENSE NOTE:
 * A Patient document represents one person who has visited or registered at
 * CityMed Clinic. This schema is intentionally kept "lean" — it stores the
 * essential personal and medical details, but NOT appointment history.
 * Appointments are stored in their own separate collection (Appointment.js)
 * and reference the Patient by ID.
 *
 * WHY SEPARATE COLLECTIONS?
 * This is called "normalization." Storing appointments inside the patient
 * document would mean the document grows infinitely over time. Separate
 * collections also make querying much faster.
 *
 * The dashboard uses:
 *   Patient.countDocuments()          → "Total Patients" stat card
 *   Patient.countDocuments({createdAt: ...}) → "New Patients" per month chart
 * =============================================================================
 */

const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({

    // ─── Personal Information ────────────────────────────────────────────────────

    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },

    // Patient file number used by the Patient Portal to identify existing patients.
    // Kept optional to avoid breaking existing seeded patients.
    fileNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        match: [/^\d{3,}$/, 'File number must be numeric and at least 3 digits']
    },

    // `unique: true` means no two patients can share the same email.
    // This prevents duplicate registrations.
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        sparse: true // Allows `null` / missing emails without breaking the unique constraint
    },

    phone: { type: String, trim: true },

    // Date of birth — stored as a Date type so we can calculate age if needed.
    dateOfBirth: { type: Date },

    // Gender uses an enum to ensure only valid values are stored.
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Other'
    },

    // ─── Medical Information ─────────────────────────────────────────────────────

    // Blood type helps in emergencies. Made optional since not all patients provide it.
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
        default: 'Unknown'
    },

    // Free-text field for known allergies, e.g., "Penicillin, Peanuts"
    allergies: { type: String, default: 'None' },

    // Any ongoing health conditions, e.g., "Type 2 Diabetes, Hypertension"
    conditions: { type: String, default: 'None' },

    // ─── Status ─────────────────────────────────────────────────────────────────

    // STUDENT DEFENSE NOTE:
    // `status` lets us "archive" patients who no longer visit the clinic,
    // rather than deleting their records (which could affect historical reports).
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },

    // The name of the doctor who primarily handles this patient.
    assignedDoctor: { type: String, default: 'Unassigned' },

    // Emergency contact information for this patient.
    emergencyContact: {
        name:  { type: String },
        phone: { type: String }
    },

    // Address information for correspondence
    address: { type: String },

}, {
    // STUDENT DEFENSE NOTE:
    // `timestamps: true` tells Mongoose to automatically add two fields:
    //   - createdAt: when was this patient first registered?
    //   - updatedAt: when was this record last modified?
    // The `createdAt` field is especially useful. The dashboard uses it to
    // group patients by month and show "New Patients per Month".
    timestamps: true
});

// Export the model. Mongoose will create a 'patients' collection in MongoDB.
module.exports = mongoose.model('Patient', patientSchema);
