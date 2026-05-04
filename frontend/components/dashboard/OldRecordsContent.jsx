'use client';
import { useState, useEffect } from 'react';

export default function OldRecordsContent({ onNotify }) {
  const [records, setRecords] = useState([]); // Start empty[cite: 6]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      const response = await fetch('http://localhost:5000/api/patients/records', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setRecords(data);
      setLoading(false);
    };
    fetchRecords();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Old Records</h1>
      
      {/* bg-[#1d4ed8]: This is your "Royal Blue" action color. 
          hover:bg-[#1e40af]: Darkens slightly when mouse is over it. */}
      <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-lg transition-colors font-medium">
        Add File
      </button>

      <div className="space-y-3">
        {records.map((record) => (
          /* border-gray-200: Light gray border. 
             hover:shadow-md: Adds a subtle shadow when hovering to make it feel "clickable" */
          <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900">{record.name}</h3>
            <p className="text-sm text-gray-500">{record.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}