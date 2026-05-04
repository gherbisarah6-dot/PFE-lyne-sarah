const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

/**
 * Handles the "Request Appointment" form for new patients.
 * Splits full name and creates both a Patient and an Appointment record.
 */
exports.registerPatient = async (req, res) => {
    try {
        const { fullName, email, phone, additionalNotes, doctorName, date, timeSlot } = req.body;

        // Split "First Last" name string into separate DB fields
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        // 1. Save personal info to 'patients' collection
        const newPatient = new Patient({
            firstName,
            lastName,
            email,
            phone,
            isExisting: false,
            status: 'Pending'
        });
        const savedPatient = await newPatient.save();

        // 2. Save appointment details to 'appointments' collection linked by ID
        const newAppointment = new Appointment({
            patientId: savedPatient._id,
            doctorName,
            date,
            timeSlot,
            additionalNotes,
            status: 'Pending'
        });
        await newAppointment.save();

        res.status(201).json({ message: "Request received successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

/**
 * Handles login for patients using their unique File Number.
 */
exports.loginByFileCode = async (req, res) => {
    try {
        const { fileCode } = req.body;

        // Search for existing patient by fileCode
        const patient = await Patient.findOne({ fileCode });

        if (!patient) {
            return res.status(404).json({ message: "Invalid File Number" });
        }

        res.status(200).json({
            message: "Login successful",
            patientId: patient._id,
            fullName: `${patient.firstName} ${patient.lastName}`
        });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
};

/**
 * Updates patient profile in settings */
exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Updates only the fields sent in the request 
        const updatedPatient = await Patient.findByIdAndUpdate(
            id, 
            { $set: req.body }, 
            { new: true } 
        );

        res.status(200).json({ message: "Profile updated", data: updatedPatient });
    } catch (error) {
        res.status(500).json({ error: "Update failed" });
    }
};

/**
 * Handles appointment booking ( confirm appointment) for old patients
 */
exports.bookAppointmentInternal = async (req, res) => {
    try {
        // The patientId comes from the session or the URL since they are logged in
        const { patientId, doctorName, date, timeSlot, additionalNotes } = req.body;

        const newAppointment = new Appointment({
            patientId: patientId, // Linked to the existing patient
            doctorName: doctorName,
            date: date,
            timeSlot: timeSlot,
            additionalNotes: additionalNotes, 
            status: 'Pending' // Internal bookings also start as Pending for staff review
        });

        await newAppointment.save();

        res.status(201).json({ 
            message: "Appointment confirmed! View it in your dashboard." 
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to book appointment", details: error.message });
    }
};

/**
 * FETCH DASHBOARD DATA
 * Retrieves all upcoming appointments for thepatient
 */
exports.getDashboard = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Find appointments that are NOT 'Cancelled' or 'Completed'
        const appointments = await Appointment.find({ 
            patientId: patientId,
            status: { $in: ['Pending', 'Confirmed'] }
        }).sort({ date: 1 }); // Sort by soonest date first

        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch dashboard data" });
    }
};

/**
 * CANCEL APPOINTMENT
 * Triggered by the "Cancel" button.
 * We change status to 'Cancelled' rather than deleting to keep a history record.
 */
exports.cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        await Appointment.findByIdAndUpdate(appointmentId, { 
            status: 'Cancelled' 
        });

        res.status(200).json({ message: "Appointment cancelled successfully" });
    } catch (error) {
        res.status(500).json({ error: "Cancellation failed" });
    }
};

/**
 * FETCH CONSULTATION HISTORY
 * Retrieves past medical sessions where the patient sees prescriptions/justifications.
 */
exports.getConsultationHistory = async (req, res) => {
    try {
        const { patientId } = req.params;
        // We will create the Consultation model next, but this is how we fetch it
        const history = await Consultation.find({ patientId }).sort({ date: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch history" });
    }
};

/**
 * UPLOAD OLD RECORD
 * Handles adding a file to the Old Records page.
 */
exports.uploadOldRecord = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { fileName, fileType, fileUrl } = req.body;

        const updatedPatient = await Patient.findByIdAndUpdate(
            patientId,
            { $push: { oldRecords: { fileName, fileType, fileUrl } } },
            { new: true }
        );

        res.status(200).json({ message: "File uploaded", data: updatedPatient.oldRecords });
    } catch (error) {
        res.status(500).json({ error: "Upload failed" });
    }
};

/**
 * GET PROFILE BY TOKEN
 * This is the "Who Am I?" function. 
 * Instead of taking an ID from the URL, it takes the ID from the secure JWT token.
 */
exports.getProfileByToken = async (req, res) => {
    try {
        // 'req.user.id' is set by your protect middleware after it unlocks the token[cite: 9]
        const patient = await Patient.findById(req.user.id);

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // We send back exactly what the Sidebar and Settings need to show[cite: 4, 5]
        res.status(200).json({
            name: `${patient.firstName} ${patient.lastName}`,
            patientId: patient.fileCode || patient._id, // Uses your fileCode or DB ID
            email: patient.email,
            phone: patient.phone
        });
    } catch (error) {
        res.status(500).json({ error: "Could not retrieve profile" });
    }
};