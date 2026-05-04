const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

// --- DASHBOARD & MAIN QUEUE ---
// Fetches today's checked-in and completed patients
router.get('/dashboard', protect, doctorController.getDoctorDashboard);

// --- CONSULTATION ACTIONS ---
// Saves a permanent consultation record and completes the appointment
router.post('/consultation/save', protect, doctorController.saveConsultation);

// Update existing appointments (Reschedule or Cancel)
router.patch('/appointment/:appointmentId/reschedule', protect, doctorController.rescheduleAppointment);
router.delete('/appointment/:appointmentId/cancel', protect, doctorController.deleteAppointment);

// --- PATIENT DATA & HISTORY ---
// Loads history for the modal inside the dashboard
router.get('/patient/:patientId/history', protect, doctorController.getPatientMedicalHistory);
// Loads the full detailed profile (Allergies, Records, History)
router.get('/patient/:patientId/profile', protect, doctorController.getDetailedPatientProfile);
// Simple list for "Select Patient" dropdowns
router.get('/patients/dropdown', protect, doctorController.getPatientDropdown);
// List of all unique patients who have visited this doctor
router.get('/my-patients', protect, doctorController.getMyPatients);

// --- CALENDAR & SCHEDULE ---
// Used for weekly/monthly calendar views
router.get('/schedule/range', protect, doctorController.getScheduleByRange);

// --- PRINTING (PDF GENERATION) ---
router.post('/print/prescription', protect, doctorController.printPrescription);
router.post('/print/justification', protect, doctorController.printJustification);

// --- JUSTIFICATION ARCHIVE & MANUAL ENTRY ---
// Fetches all past justifications for the Archive page
router.get('/justifications', protect, doctorController.getAllJustifications);
// Manually add a justification (independent of a specific appointment)
router.post('/justifications/new', protect, doctorController.addNewJustification);

// --- SETTINGS ---
// Updates doctor profile information
router.patch('/profile/:doctorId', protect, doctorController.updateDoctorProfile);

module.exports = router;