'use client';

import { useState, useEffect } from 'react';

export default function MedicalHistoryContent() {
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  // REAL DATA STATE: We start with an empty array instead of mock data[cite: 7]
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the login token
        const response = await fetch('http://localhost:5000/api/patients/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setConsultations(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Filter logic remains the same, but uses the 'consultations' state[cite: 7]
  const filteredConsultations = consultations.filter((consultation) => {
    const consultDate = new Date(consultation.date);
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;
    if (filterDoctor && consultation.doctor !== filterDoctor) return false;
    if (startDate && consultDate < startDate) return false;
    if (endDate && consultDate > endDate) return false;
    return true;
  });

  if (loading) return <div className="p-8 text-center">Loading your medical records...</div>;

  return (
    <div className="space-y-6"> {/* space-y-6: Adds 24px vertical spacing between children */}
      <div>
        {/* text-gray-900: Dark near-black color. Change to text-blue-900 for a brand feel */}
        <h1 className="text-2xl font-semibold text-gray-900">Consultation History</h1>
        <p className="text-base text-gray-600 mt-1">View your past consultations</p>
      </div>

      {/* Filter Box */}
      <div className="bg-white border border-gray-200 rounded-lg p-4"> {/* rounded-lg: 8px corner radius */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor</label>
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              /* focus:ring-[#1d4ed8]: This is the blue glow when you click the box. 
                 Change hex to #dc2626 for Red, etc. */
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
            >
              <option value="">All Doctors</option>
              {/* This should eventually come from a 'doctors' API as well */}
              <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
            </select>
          </div>
          {/* ... Date inputs same as before ... */}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredConsultations.map((consultation, index) => (
          <div
            key={consultation.id}
            /* bg-gray-50: Very light gray background for alternating rows[cite: 7] */
            className={`rounded-lg overflow-hidden border ${
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            } border-gray-200`}
          >
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900">{consultation.doctor}</h3>
              <p className="text-gray-600">{consultation.diagnosis}</p>
              {/* bg-blue-50: Light blue tint for the "button-like" area[cite: 7] */}
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-700">Prescription: {consultation.prescription?.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}