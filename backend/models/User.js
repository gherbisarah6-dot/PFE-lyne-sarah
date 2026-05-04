/**
 * =============================================================================
 * STAFF MODEL — models/user.js
 * =============================================================================
 *
 * STUDENT DEFENSE NOTE:
 * This is the "blueprint" (Schema) for a staff member in our MongoDB database.
 * We use Mongoose schemas to enforce data integrity — without one, MongoDB would
 * accept any data in any shape, which is dangerous.
 *
 * Key design decisions:
 *  - `required` fields prevent saving an incomplete record (e.g., no name).
 *  - `enum` on `status` ensures only the two legal values can ever be stored.
 *  - `timestamps: true` auto-adds `createdAt` and `updatedAt` to every document.
 *  - Workload fields (consultations, hoursWorked, etc.) allow the admin Dashboard
 *    to show a "Staff Workload" section with real data, not mock data.
 * =============================================================================
 */

const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({

    // ─── Core Identity ──────────────────────────────────────────────────────────

    // `trim: true` automatically strips leading/trailing whitespace.
    name: {
        type: String,
        required: [true, 'Staff name is required'],
        trim: true
    },

    // The role determines what the staff member does in the clinic.
    // The frontend role dropdown has: Receptionist, Gyneco Doctor, Cardio Doctor, General Doctor.
    role: {
        type: String,
        required: [true, 'Role is required'],
        trim: true
    },

    // ─── Contact Details (sent from the Add Staff modal) ────────────────────────

    email: {
        type: String,
        trim: true,
        lowercase: true  // Normalize emails so "Admin@clinic.com" === "admin@clinic.com"
    },

    // STUDENT DEFENSE NOTE: Added password field for authentication.
    // `select: false` prevents the password hash from accidentally leaking in standard API responses.
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false 
    },

    phone: { type: String, trim: true },
    dob: { type: String },                    // Date of Birth, stored as a string for flexibility
    emergencyContact: { type: String },

    // ─── Schedule ───────────────────────────────────────────────────────────────

    workingHours: { type: String, default: '08:00 - 18:00' },
    workingDays:  { type: String, default: 'Mon, Tue, Wed, Thu, Fri' },

    // ─── Permissions & Status ───────────────────────────────────────────────────

    // isAdmin protects the main administrator account from being deleted or disabled.
    isAdmin: { type: Boolean, default: false },

    status: {
        type: String,
        enum: ['Active', 'Suspended'],  // Only these two values are valid. Mongoose rejects anything else.
        default: 'Active'
    },

    joined: {
        type: Date,
        default: Date.now  // Automatically set to the moment of creation
    },

    // ─── Dashboard Workload Tracking ────────────────────────────────────────────
    // STUDENT DEFENSE NOTE:
    // These fields power the "Staff Workload" section on the Admin Dashboard.
    // In a real system these would be calculated dynamically from Appointment records.
    // For our current scope, they are updated manually and serve as the data source
    // for the dashboard's workload table.

    consultations:         { type: Number, default: 0 }, // For doctors: number of patient consultations
    appointmentsManaged:   { type: Number, default: 0 }, // For receptionists: appointments they handled
    tasksCompleted:        { type: Number, default: 0 }, // For admin staff: tasks completed
    hoursWorked:           { type: Number, default: 0 }, // Total hours worked this month

    // ─── Doctor Scheduling Engine ────────────────────────────────────────────────
    //
    // STUDENT DEFENSE NOTE — WHY A SCHEDULE SUB-DOCUMENT?
    // Instead of creating a separate "Schedule" collection and linking to it with
    // a foreign key (ObjectId reference), we EMBED the schedule directly inside
    // the Staff document. This is called an "embedded sub-document."
    //
    // WHY EMBED instead of REFERENCE?
    // The schedule belongs exclusively to ONE doctor and is always read together
    // with the doctor's data (e.g., "show me Dr. Ahmed's schedule"). Embedding
    // avoids an extra database query — we get the doctor AND their schedule in
    // one single read operation. MongoDB is designed for this pattern.
    //
    // THE FIELDS:
    //   slotDuration  — How long each appointment lasts (in minutes), e.g., 30.
    //   restInterval  — Buffer time BETWEEN slots (in minutes), e.g., 5.
    //                   This is critical: without it, appointments stack back-to-back
    //                   with no time for the doctor to write notes, wash hands, etc.
    //   shiftStart    — When the doctor's working day begins, e.g., "08:00".
    //   shiftEnd      — When the doctor's working day ends, e.g., "17:00".
    //   availableSlots — The generated array of time cards, each with:
    //                      { startTime, endTime, status: 'available' | 'blocked' }

    schedule: {
        slotDuration:   { type: Number, default: 30  },  // minutes per slot
        restInterval:   { type: Number, default: 5   },  // minutes buffer between slots
        shiftStart:     { type: String, default: '08:00' },
        shiftEnd:       { type: String, default: '17:00' },
        availableSlots: [
            {
                startTime: { type: String },  // e.g. "09:00"
                endTime:   { type: String },  // e.g. "09:30"
                // 'available' = bookable by receptionist
                // 'blocked'   = break / prayer time / manually blocked by admin
                status:    { type: String, enum: ['available', 'blocked'], default: 'available' }
            }
        ]
    },

}, {
    timestamps: true  // Auto-generates createdAt and updatedAt fields
});

// ─── Pre-Save Hook for Password Hashing ─────────────────────────────────────
// STUDENT DEFENSE NOTE:
// This Mongoose "pre-save" hook runs automatically right BEFORE a Staff document 
// is saved to MongoDB. 
//
// Security concept: We NEVER store plain-text passwords. We use 'bcryptjs' to 
// create a cryptographic hash. Even if the database is compromised, the actual 
// passwords remain mathematically unreadable.
//
// We use `isModified('password')` to ensure we only hash the password when it is 
// first created or intentionally changed, preventing double-hashing on normal updates.
staffSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const bcrypt = require('bcryptjs');
        // Generate a random salt
        const salt = await bcrypt.genSalt(10);
        // Replace the plain-text password with the hash
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Export the compiled model. Mongoose will create a 'staffs' collection in MongoDB.
module.exports = mongoose.model('Staff', staffSchema);

