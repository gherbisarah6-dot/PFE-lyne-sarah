'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CalendarPicker from './CalendarPicker';
import TimeSlotSelector from './TimeSlotSelector';

// =============================================================================
// TODO: DELETE THIS ENTIRE MOCK DATA SECTION WHEN IMPLEMENTING REAL BACKEND
// Replace with actual API calls to fetch doctors and available time slots
// =============================================================================
const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Sarah Johnson', specialty: 'General Practice' },
  { id: 2, name: 'Dr. Michael Chen', specialty: 'Cardiology' },
];

// Helper to get today's date in YYYY-MM-DD format for testing
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper to get tomorrow's date for testing
const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const MOCK_TIME_SLOTS = {
  '1': {
    [getTodayDate()]: ['10:00', '14:00', '15:30'],
    [getTomorrowDate()]: ['09:00', '10:30', '11:00', '14:00', '16:00'],
  },
  '2': {
    [getTodayDate()]: ['09:00', '11:00', '13:00'],
    [getTomorrowDate()]: ['10:00', '14:00', '15:00', '16:30'],
  },
};
// =============================================================================
// END OF MOCK DATA - DELETE ABOVE WHEN IMPLEMENTING REAL BACKEND
// =============================================================================

export default function NewPatientForm() {
  const router = useRouter();
  const [clinic] = useState('Central Clinic');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableTimeSlots = selectedDoctor && selectedDate 
    ? (MOCK_TIME_SLOTS[selectedDoctor]?.[selectedDate] || [])
    : [];

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[0-9+\-\s()]{8,}$/.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setError('Please complete appointment selection');
      return;
    }

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!phoneNumber.trim() || !validatePhone(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!additionalNotes.trim()) {
      setError('Please provide additional notes or reason for visit');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Clinic Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Clinic
        </label>
        <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
          {clinic}
        </div>
        <p className="text-xs text-gray-500 mt-1">Currently available clinic</p>
      </div>

      {/* Doctor Selection */}
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
        >
          <option value="">Choose a doctor...</option>
          {MOCK_DOCTORS.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} • {doctor.specialty}
            </option>
          ))}
        </select>
      </div>

      {/* Calendar Picker - Only show after doctor selection */}
      {selectedDoctor && (
        <CalendarPicker 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate}
          availableDates={Object.keys(MOCK_TIME_SLOTS[selectedDoctor] || {})}
        />
      )}

      {/* Time Slot Selector - Only show after date selection */}
      {selectedDate && (
        <TimeSlotSelector
          selectedTime={selectedTime}
          onSelectTime={setSelectedTime}
          timeSlots={availableTimeSlots}
        />
      )}

      {/* Patient Information - Only show after time selection */}
      {selectedTime && (
        <div className="space-y-4 animate-fade-in border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">4</span>
            Your Information
          </h3>
          
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes / Reason for Visit <span className="text-red-500">*</span>
            </label>
            <textarea
              id="additionalNotes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Please describe your symptoms or reason for visit..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!selectedDoctor || !selectedDate || !selectedTime || !fullName.trim() || !email.trim() || !phoneNumber.trim() || !additionalNotes.trim() || loading}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {loading ? 'Requesting...' : 'Request Appointment'}
      </button>

      <p className="text-xs text-center text-gray-500">
        Your appointment will be confirmed within 24 hours via email.
      </p>
    </form>
  );
}
