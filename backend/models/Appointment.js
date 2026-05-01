/**
 * =============================================================================
 * APPOINTMENT MODEL — models/Appointment.js
 * =============================================================================
 *
 * STUDENT DEFENSE NOTE:
 * An Appointment document links a Patient to a Doctor on a specific date/time.
 * This is the most important collection for the admin dashboard because it
 * provides the real data for:
 *
 *   1) "Total Appointments" stat card     ← Appointment.countDocuments()
 *   2) "No Show Rate" stat card           ← Count where status === 'No Show' / total
 *   3) "Monthly Activity" table           ← Group by month using MongoDB $group aggregation
 *
 * KEY DESIGN CONCEPT — REFERENCES (ObjectId):
 * Instead of copying the patient's name and doctor's name into every appointment,
 * we store their database IDs (ObjectId) and use Mongoose's `.populate()` to
 * load the full data when needed. This avoids data duplication.
 *
 * ANALOGY: Think of it like a school register. Instead of writing "Ahmed Karim,
 * 18 years old, Class 3B" on every attendance sheet, you just write ID: 1042
 * and look up the full record when you need it.
 * =============================================================================
 */

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({

    // ─── Relationships ───────────────────────────────────────────────────────────

    // STUDENT DEFENSE NOTE:
    // `ref: 'Patient'` tells Mongoose which collection to look in when
    // populating. When we call `.populate('patient')`, Mongoose replaces this
    // ObjectId with the full Patient document automatically.
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Appointment must be linked to a patient']
    },

    // We also store the patient's name directly so we can display it quickly
    // without always needing to populate the full Patient document.
    patientName: { type: String, required: true },

    // Doctor who handles this appointment. Reference to the Staff collection.
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },

    // Stored directly for quick read access (avoiding a join for simple listings).
    doctorName: { type: String, default: 'Unassigned' },

    // ─── Scheduling ─────────────────────────────────────────────────────────────

    // The date and time of the appointment. Stored as a Date object.
    // Using Date type allows MongoDB to sort, filter, and group by date efficiently.
    date: {
        type: Date,
        required: [true, 'Appointment date is required']
    },

    // Duration in minutes, e.g., 30 for a standard consultation.
    duration: { type: Number, default: 30 },

    // The reason or department for the appointment (e.g., "Cardiology Check-up")
    reason: { type: String, default: 'General Consultation' },

    // ─── Status ─────────────────────────────────────────────────────────────────

    // STUDENT DEFENSE NOTE:
    // The `status` field is the most critical for the dashboard's "No Show Rate".
    // Formula: noShowRate = (count of 'No Show' appointments / total appointments) * 100
    // The enum enforces a strict workflow: Pending → Confirmed → Completed or No Show/Cancelled.
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No Show'],
        default: 'Pending'
    },

    // Free-text notes the receptionist or doctor can add, e.g., "Patient called to reschedule."
    notes: { type: String, default: '' },

    // Prevent duplicate "Success" emails in workflows where status updates
    // might be called multiple times.
    successEmailSent: { type: Boolean, default: false },
    successEmailSentAt: { type: Date }
    
}, {
    // `timestamps: true` adds `createdAt` and `updatedAt` automatically.
    // `createdAt` is used by the Monthly Activity chart to count new appointments per month.
    timestamps: true
});

// ─── Indexes ────────────────────────────────────────────────────────────────────

// STUDENT DEFENSE NOTE:
// An index is like the index page at the back of a textbook — it lets MongoDB find
// records without scanning every single document. We index `date` and `status`
// because the dashboard queries heavily filter by these two fields.
// Without indexes, every query would be a "full collection scan" (very slow at scale).
appointmentSchema.index({ date: -1 });    // -1 = descending (newest first)
appointmentSchema.index({ status: 1 });   //  1 = ascending

// Export the model. Mongoose will create an 'appointments' collection.
module.exports = mongoose.model('Appointment', appointmentSchema);
