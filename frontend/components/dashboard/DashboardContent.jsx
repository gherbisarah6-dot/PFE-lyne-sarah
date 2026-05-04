'use client';

import { useState, useEffect } from 'react';

export default function DashboardContent() {
  const [appointments, setAppointments] = useState([]);
  const [countdowns, setCountdowns] = useState({});

  // FETCH REAL APPOINTMENTS
  useEffect(() => {
    const fetchAppointments = async () => {
      const response = await fetch('http://localhost:5000/api/patients/appointments/upcoming', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setAppointments(data);
    };
    fetchAppointments();
  }, []);

  // Countdown logic logic stays, but now uses the REAL appointments state[cite: 8]
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newCountdowns = {};
      appointments.forEach((apt) => {
        const diff = new Date(apt.date) - now;
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          newCountdowns[apt.id] = `in ${days} days`;
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);
    return () => clearInterval(interval);
  }, [appointments]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Welcome Back</h1>

      <div className="grid gap-4">
        {appointments.map((apt) => (
          <div key={apt.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">{apt.doctor}</p>
                <p className="text-gray-500">{apt.specialty}</p>
              </div>
              {/* text-[#1d4ed8]: This is your primary blue[cite: 8]. 
                  Change this HEX code to change your brand color across the app. */}
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <p className="text-[#1d4ed8] font-semibold">{countdowns[apt.id] || 'Starting soon'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}