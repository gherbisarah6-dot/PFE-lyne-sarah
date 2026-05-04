'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CalendarPicker from './CalendarPicker';
import TimeSlotSelector from './TimeSlotSelector';

export default function NewPatientForm() {
  const router = useRouter();
  const [doctors, setDoctors] = useState([]); // Array starts empty, filled by DB[cite: 7]
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch real doctors from the backend on load
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/doctors');
        const data = await response.json();
        setDoctors(data);
      } catch (err) {
        console.error("Failed to load doctors");
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/patients/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone: phoneNumber,
          additionalNotes,
          doctorName: selectedDoctor, // Sends the selected doctor's ID or Name
          date: selectedDate,
          timeSlot: selectedTime
        })
      });

      if (response.ok) {
        alert("Appointment requested successfully!");
        router.push('/'); 
      } else {
        const data = await response.json();
        setError(data.error || "Submission failed");
      }
    } catch (err) {
      setError("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Doctor Selection - Dynamically populated */}
      <div>
        <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-2">
          Select Doctor
        </label>
        <select
          id="doctor"
          value={selectedDoctor}
          onChange={(e) => {
            setSelectedDoctor(e.target.value);
            setSelectedDate('');
            setSelectedTime('');
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white outline-none"
        >
          <option value="">Choose a doctor...</option>
          {doctors.map((doctor) => (
            <option key={doctor._id} value={doctor.name}>
              {doctor.name} • {doctor.specialty}
            </option>
          ))}
        </select>
      </div>

      {/* Calendar and Time Slot components remain linked to the real state */}
      {selectedDoctor && (
        <CalendarPicker 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate}
        />
      )}

      {selectedDate && (
        <TimeSlotSelector
          selectedTime={selectedTime}
          onSelectTime={setSelectedTime}
        />
      )}

      {selectedTime && (
        <div className="space-y-4 animate-fade-in border-t border-gray-200 pt-6">
          <input 
            type="text" 
            placeholder="Full Name" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input 
            type="tel" 
            placeholder="Phone Number" 
            value={phoneNumber} 
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <textarea 
            placeholder="Reason for Visit" 
            value={additionalNotes} 
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32"
          />
        </div>
      )}

      {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 transition-all disabled:opacity-50"
      >
        {loading ? 'Requesting...' : 'Request Appointment'}
      </button>
    </form>
  );
}