const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    // Link to the specific patient record
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    //'Select Doctor' dropdown 
    
    // Default clinic name 
    clinicName: { type: String, default: 'Central Clinic' },

    // Date and time slot selected by the patient
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, 

    // Additional Notes
    additionalNotes: { type: String },

    // Status 
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Checked-In', 'Completed', 'No Show'],
        default: 'Pending'
    }
}, { 
    // Automatically tracks when the appointment was created
    timestamps: true 
});

module.exports = mongoose.model('Appointment', appointmentSchema);