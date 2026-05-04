/**
 * PATIENT ROUTES
 * Maps the Patient Portal URLs to the logic in patientController.js.
 */
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// --- ENTRY POINTS (External & Login) ---

// POST /api/patients/request -> For NEW patients 
router.post('/request', patientController.registerPatient);

// POST /api/patients/login -> Existing patient login 
router.post('/login', patientController.loginByFileCode);


// --- INTERNAL PORTAL ACTIONS ---

// POST /api/patients/book -> "Confirm Appointment" inside portal 
router.post('/book', patientController.bookAppointmentInternal);

// GET /api/patients/dashboard/:patientId
// we need it to know who is logged in to Load Upcoming Appointments
router.get('/dashboard/:patientId', patientController.getDashboard);

// PATCH /api/patients/cancel/:appointmentId 
// we need it to know which specific appointment to cancel 
router.patch('/cancel/:appointmentId', patientController.cancelAppointment);


// ---  PROFILE & SETTINGS ---

// PATCH /api/patients/profile/:id 
// handles all edits in Settings (name, email, phone, conditions, etc.)
router.patch('/profile/:id', patientController.updateProfile);

// --- HISTORY & RECORDS ---

// GET /api/patients/history/:patientId -> For "Consultation History" cards
router.get('/history/:patientId', patientController.getConsultationHistory);

// POST /api/patients/records/:patientId -> For "Add File" in Old Records
router.post('/records/:patientId', patientController.uploadOldRecord);


module.exports = router;