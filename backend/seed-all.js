require('dotenv').config();
const mongoose = require('mongoose');
const Staff = require('./models/Staff');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    await Staff.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});

    // 1. Seed Staff[cite: 4]
    const staff = await Staff.insertMany([
      {
        name: "Dr. Ahmed Nouar",
        role: "Doctor",
        email: "dr.nouar@clinic.com",
        password: "password123",
        specialization: "General Medicine",
        status: "Active",
        schedule: { slotDuration: 30, availableSlots: [{ startTime: "09:00", endTime: "12:00", status: "available" }] }
      },
      {
        name: "Dr. Selina Ryad",
        role: "Doctor",
        email: "dr.ryad@clinic.com",
        password: "password123",
        specialization: "Pediatrics", 
        status: "Active",
        schedule: { slotDuration: 30, availableSlots: [{ startTime: "09:00", endTime: "12:00", status: "available" }] }
      },
      {
        name: "Karima Reception",
        role: "Receptionist",
        email: "reception@clinic.com",
        password: "password123",
        status: "Active"
      }
    ]);

    // 2. Seed 6 Patients
    const patients = await Patient.insertMany([
      { firstName: "Mourad", lastName: "Bensmain", fileCode: "P-2026-001", phone: "0555-10-20-30", dateOfBirth: "1985-05-12", allergies: "Penicillin", chronicConditions: "Hypertension", hereditaryConditions: "Diabetes" },
      { firstName: "Sara", lastName: "Algiers", fileCode: "P-2026-002", phone: "0666-11-22-33", dateOfBirth: "1992-08-24", allergies: "None", chronicConditions: "None", hereditaryConditions: "None" },
      { firstName: "Yacine", lastName: "Hamidi", fileCode: "P-2026-003", phone: "0777-44-55-66", dateOfBirth: "1978-11-03", allergies: "Latex", chronicConditions: "Asthma", hereditaryConditions: "Asthma" },
      { firstName: "Lina", lastName: "Khelifa", fileCode: "P-2026-004", phone: "0550-99-88-77", dateOfBirth: "1995-02-15", allergies: "None", chronicConditions: "None", hereditaryConditions: "None" },
      { firstName: "Omar", lastName: "Farrah", fileCode: "P-2026-005", phone: "0661-33-44-55", dateOfBirth: "1964-07-30", allergies: "Dust", chronicConditions: "Arthritis", hereditaryConditions: "Heart Disease" },
      { firstName: "Amira", lastName: "Zitouni", fileCode: "P-2026-006", phone: "0772-00-11-22", dateOfBirth: "2001-12-10", allergies: "Aspirin", chronicConditions: "None", hereditaryConditions: "None" }
    ]);

    // 3. Multi-Doctor Appointment History
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    await Appointment.insertMany([
      // LIVE QUEUE FOR DR. NOUAR (TODAY)
      {
        patientId: patients[0]._id, // Mourad
        doctorName: "Dr. Ahmed Nouar",
        date: today,
        timeSlot: "09:00",
        status: "Checked-In",
        reason: "General Consultation"
      },
      {
        patientId: patients[1]._id, // Sara
        doctorName: "Dr. Ahmed Nouar",
        date: today,
        timeSlot: "09:30",
        status: "Checked-In",
        reason: "Follow-up"
      },
      // HISTORICAL RECORD FOR DR. RYAD (YESTERDAY)
      {
        patientId: patients[0]._id, // Mourad (Same patient, different doctor!)
        doctorName: "Dr. Selina Ryad",
        date: yesterday,
        timeSlot: "10:00",
        status: "Completed",
        reason: "Pediatric Consultation for Son"
      }
    ]);

    console.log('⭐⭐⭐ DATABASE SEEDED: MULTI-DOCTOR FLOW READY ⭐⭐⭐');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err.message);
    process.exit(1);
  }
};

seedData();