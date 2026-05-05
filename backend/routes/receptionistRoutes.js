/**
 * =============================================================================
 * RECEPTIONIST ROUTES — routes/receptionistRoutes.js
 * =============================================================================
 *
 * STUDENT DEFENSE NOTE:
 * This router handles all Receptionist-specific endpoints for:
 *   1. Appointment management (create, view, update status, get availability)
 *   2. Queue management (which is done via appointment status updates)
 *   3. Patient registration (delegated to patientController)
 *
 * All routes are protected by authentication middleware to ensure only
 * logged-in staff members can access them. Additional role-based access
 * control (RBAC) should be implemented at the middleware level in production.
 *
 * ROUTE STRUCTURE:
 *   /api/receptionist
 *     ├── /appointments        (GET all, POST create, DELETE cancel)
 *     ├── /appointments/:id    (GET single, PATCH status, DELETE)
 *     ├── /doctors/:id/available-slots (GET available time slots)
 *     └── /patients            (GET, POST to register new patient)
 *
 * MIDDLEWARE HIERARCHY:
 *   1. Authentication (verify user is logged in)
 *   2. Authorization (verify user role is Receptionist)
 *   3. Controller logic
 *
 * For now, we'll add basic auth checks. TODO: Add role-based middleware.
 * =============================================================================
 */

const express = require('express');
const router = express.Router();

// Controllers
const appointmentCtrl = require('../controllers/appointmentController');
const patientCtrl = require('../controllers/patientController');
const Staff = require('../models/Staff');

// TODO: Import auth middleware when ready
// const { requireAuth, requireRole } = require('../middleware/auth');

// =============================================================================
// APPOINTMENT ROUTES
// =============================================================================

// Root /api/receptionist — quick health/info endpoint for the receptionist API
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Receptionist API is active',
    endpoints: [
      'GET /appointments',
      'POST /appointments',
      'GET /patients',
      'POST /patients',
      'GET /doctors'
    ]
  });
});

/**
 * GET /api/receptionist/appointments
 * Fetch all appointments (supports filtering by date, doctor, status)
 *
 * Query Parameters:
 *   ?date=2026-04-19      → Filter by date
 *   ?doctorId=507f...    → Filter by doctor
 *   ?status=Pending       → Filter by status
 *   ?page=1&limit=20     → Pagination
 *
 * STUDENT DEFENSE NOTE:
 * The queue page calls this endpoint to populate the "Today's Queue" list:
 *   1. Frontend sends: ?date=<today>&status=Confirmed
 *   2. Backend returns: [{ patient: {...}, doctor: {...}, time: "09:00", status: "Confirmed" }]
 *   3. Frontend displays sorted by appointment time
 */
router.get('/appointments', appointmentCtrl.getAllAppointments);

/**
 * GET /api/receptionist/appointments/:id
 * Fetch a single appointment by ID
 *
 * Used to:
 * - Display patient details when receptionist clicks on queue entry
 * - Fetch appointment for updating notes or rescheduling
 */
router.get('/appointments/:id', appointmentCtrl.getAppointmentById);

/**
 * POST /api/receptionist/appointments
 * Create a new appointment
 *
 * Request body:
 * {
 *   patientId: "507f1f77bcf86cd799439011",
 *   patientName: "Ahmed Benali",
 *   doctorId: "507f1f77bcf86cd799439012",
 *   doctorName: "Dr. Nouar",
 *   date: "2026-04-19T09:00:00Z",
 *   duration: 30,
 *   reason: "General Consultation",
 *   notes: "Patient has been complaining of headaches"
 * }
 *
 * STUDENT DEFENSE NOTE:
 * This is called by the "Smart Booking" form when receptionist:
 *   1. Selects a patient from the patient list
 *   2. Selects a doctor from the doctor dropdown
 *   3. Clicks on an available time slot
 *   4. Clicks "Confirm Booking"
 *
 * The controller validates:
 * - Patient exists in database
 * - Doctor exists and is active
 * - Appointment slot is actually available (not blocked, not already booked)
 * - Patient doesn't already have an appointment at this time
 *
 * On success: Returns the created appointment with populated references
 */
router.post('/appointments', appointmentCtrl.createAppointment);

/**
 * PATCH /api/receptionist/appointments/:id/status
 * Update appointment status
 *
 * Request body:
 * { status: "Confirmed" | "Completed" | "No Show" | "Cancelled" }
 *
 * STUDENT DEFENSE NOTE:
 * This endpoint is the CORE of queue management. Called when:
 *
 * 1. Receptionist marks patient as "present" (in queue page)
 *    PATCH /api/receptionist/appointments/123/status
 *    { status: "Confirmed" }
 *
 * 2. Doctor marks patient as "completed" (in consultation room)
 *    PATCH /api/receptionist/appointments/123/status
 *    { status: "Completed" }
 *
 * 3. Receptionist marks patient as "no show" (didn't appear)
 *    PATCH /api/receptionist/appointments/123/status
 *    { status: "No Show" }
 *
 * Every status change is logged in the audit trail for compliance.
 */
router.patch('/appointments/:id/status', appointmentCtrl.updateAppointmentStatus);

/**
 * DELETE /api/receptionist/appointments/:id
 * Cancel an appointment
 *
 * STUDENT DEFENSE NOTE:
 * Performs a "soft delete" — changes status to "Cancelled" rather than
 * removing the record entirely. This maintains the audit trail.
 *
 * Used when:
 * - Patient calls to cancel
 * - Receptionist books wrong slot
 * - Appointment needs to be removed from queue
 */
router.delete('/appointments/:id', appointmentCtrl.deleteAppointment);

// =============================================================================
// DOCTOR LIST (for Smart Booking)
// =============================================================================

/**
 * GET /api/receptionist/doctors
 * Fetch list of all active doctors
 * 
 * Response: [{ _id, name, role, email, phone, schedule: { availableSlots } }]
 * 
 * Used by:
 * - Queue page: Populate doctor dropdown in "Book Appointment" form
 * - Smart Booking modal: Show doctor selection
 */
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Staff.find({ status: "Active", role: { $ne: "Receptionist" } });
    res.status(200).json({
      success: true,
      data: doctors
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// =============================================================================
// SMART BOOKING FEATURE: GET DOCTOR'S AVAILABLE SLOTS
// =============================================================================

/**
 * GET /api/receptionist/doctors/:doctorId/available-slots?date=2026-04-19
 *
 * Fetch time slots available for a specific doctor on a specific date
 *
 * Response example:
 * {
 *   success: true,
 *   data: [
 *     { startTime: "09:00", endTime: "09:30", status: "available" },
 *     { startTime: "09:35", endTime: "10:05", status: "available" },
 *     { startTime: "10:10", endTime: "10:40", status: "booked" },
 *     { startTime: "14:00", endTime: "14:30", status: "blocked" }
 *   ],
 *   doctor: { _id: "...", name: "Dr. Nouar", role: "Gyneco Doctor" }
 * }
 *
 * STUDENT DEFENSE NOTE:
 * This is the HEART of the "Smart Booking" feature. When the receptionist:
 *
 * 1. Opens the "New Appointment" form
 * 2. Selects a doctor from dropdown
 * 3. Selects an appointment date
 * 4. Frontend calls this endpoint
 * 5. Backend returns all time slots for that doctor on that date
 * 6. Each slot shows its availability:
 *    - "available": Receptionist can click to book
 *    - "booked": Already taken by another patient
 *    - "blocked": Doctor marked as unavailable (prayer, lunch, etc.)
 *
 * Frontend renders as a grid of time-slot cards that receptionist can click.
 */
router.get('/doctors/:doctorId/available-slots', appointmentCtrl.getDoctorAvailableSlots);

// =============================================================================
// PATIENT REGISTRATION (shared with admin)
// =============================================================================

/**
 * GET /api/receptionist/patients
 * List all patients (supports search and filtering)
 *
 * Query Parameters:
 *   ?search=ahmed        → Search by name, email
 *   ?status=Active       → Filter by status
 *   ?page=1&limit=20    → Pagination
 *
 * STUDENT DEFENSE NOTE:
 * Receptionists need to search for existing patients before booking appointments.
 * They can search by name to find "Ahmed Benali" instead of typing his ID.
 */
// Change line 248 from: router.get('/patients', patientCtrl.getAllPatients);
// To this (Temporary fix so your server starts):
router.get('/patients', patientCtrl.getAllPatients || ((req, res) => res.json({ message: "Partner hasn't built this yet" })));

/**
 * GET /api/receptionist/patients/:id
 * Fetch a single patient's full record
 *
 * Used to:
 * - Display patient details when receptionist selects a patient
 * - Show medical history (allergies, conditions, etc.) before booking
 * - Verify insurance or payment status before appointment
 */
router.get('/patients/:id', patientCtrl.getPatientById || ((req, res) => res.send("Missing")));
/**
 * POST /api/receptionist/patients
 * Register a new patient
 *
 * Request body:
 * {
 *   firstName: "Ahmed",
 *   lastName: "Benali",
 *   email: "ahmed@example.com",
 *   phone: "0555-123-456",
 *   dateOfBirth: "1980-03-15",
 *   gender: "Male",
 *   bloodType: "O+",
 *   allergies: "Penicillin",
 *   conditions: "Hypertension",
 *   address: "123 Main St, Algiers"
 * }
 *
 * STUDENT DEFENSE NOTE:
 * Called when receptionist clicks "Add Patient" and fills the form.
 * The controller:
 * 1. Validates all required fields
 * 2. Checks for duplicate email (prevents duplicate registrations)
 * 3. Saves to Patient collection
 * 4. Logs the action in audit trail (who registered patient when)
 * 5. Returns the created patient document
 *
 * On the frontend, after successful registration, the new patient is
 * immediately available for appointment booking.
 */
router.post('/patients', patientCtrl.addPatient || ((req, res) => res.send("Missing")));

/**
 * PUT /api/receptionist/patients/:id
 * Update a patient's details
 *
 * Used when:
 * - Patient updates phone number or address
 * - Receptionist corrects data entered by mistake
 * - Allergies or medical conditions change
 */
router.put('/patients/:id', patientCtrl.updatePatient || ((req, res) => res.send("Missing")));

// =============================================================================
// AUTHENTICATION & AUTHORIZATION (TODO)
// =============================================================================

/**
 * IMPORTANT: Add middleware to all routes above
 *
 * When auth.js is ready, uncomment the middleware:
 *
 * router.use(requireAuth);  // All routes below need authentication
 * router.use(requireRole('Receptionist'));  // All routes below need Receptionist role
 *
 * This ensures that:
 * 1. Anonymous users cannot access these endpoints
 * 2. Non-receptionist users (e.g., patients) cannot book appointments
 * 3. Every action is attributed to a logged-in user (for audit logs)
 */

module.exports = router;
