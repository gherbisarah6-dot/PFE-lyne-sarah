"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, Clock, CheckCircle, Play, X, Printer, Save, RefreshCw, Trash2, History, FileCheck, CalendarPlus, FileUp, FileText 
} from "lucide-react";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [summary, setSummary] = useState({ today: 0, waiting: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [showConsultation, setShowConsultation] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Form States - matching your doctorController.saveConsultation[cite: 6]
  const [consultNotes, setConsultNotes] = useState("");
  const [consultPrescription, setConsultPrescription] = useState("");
  const [consultJustification, setConsultJustification] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [requestedDocs, setRequestedDocs] = useState("");

  // 1. Load Dashboard Data[cite: 6]
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        // Your controller looks for 'doctorName' in req.query[cite: 6]
        const response = await fetch('http://localhost:5000/api/doctor/dashboard?doctorName=Dr. Ahmed Nouar', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setAppointments(data.schedule);
          setSummary(data.summary);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleStartConsultation = (apt) => {
    setSelectedPatient(apt);
    // Flattening the data from your populated patientId field[cite: 6]
    setConsultNotes("");
    setShowConsultation(true);
  };

  // 2. Save Consultation[cite: 6]
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/consultation/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: selectedPatient._id,
          patientId: selectedPatient.patientId._id,
          notes: consultNotes,
          prescription: consultPrescription,
          medicalJustification: consultJustification,
          followUpDate: followUpDate,
          requestedDocuments: requestedDocs
        })
      });

      if (response.ok) {
        setShowConsultation(false);
        window.location.reload(); // Refresh to update stats and queue
      }
    } catch (err) {
      alert("Error saving consultation");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Schedule...</div>;

  return (
    <div className="space-y-6 p-4">
      {/* Stats Section using your summary data[cite: 6] */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-2xl font-bold">{summary.today}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">Waiting</p>
          <p className="text-2xl font-bold text-amber-600">{summary.waiting}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">{summary.completed}</p>
        </div>
      </div>

      {/* Appointment Table */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b bg-gray-50"><h2 className="font-bold">Today's Patient Queue</h2></div>
        <div className="divide-y">
          {appointments.map((apt) => (
            <div key={apt._id} className="p-4 flex justify-between items-center">
              <div>
                <span className="font-bold text-blue-600 mr-4">{apt.timeSlot}</span>
                <span className="font-medium">{apt.patientId?.firstName} {apt.patientId?.lastName}</span>
                <p className="text-xs text-gray-400">{apt.status}</p>
              </div>
              {apt.status === 'Checked-In' && (
                <button onClick={() => handleStartConsultation(apt)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Play size={14}/> Start
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Consultation Modal */}
      {showConsultation && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6">
             <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">Consultation: {selectedPatient.patientId.firstName}</h2>
                <button onClick={() => setShowConsultation(false)}><X/></button>
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                   <label className="block font-bold">Notes</label>
                   <textarea value={consultNotes} onChange={(e) => setConsultNotes(e.target.value)} className="w-full border p-2 rounded h-32"/>
                   
                   <label className="block font-bold">Prescription</label>
                   <textarea value={consultPrescription} onChange={(e) => setConsultPrescription(e.target.value)} className="w-full border p-2 rounded h-32"/>
                </div>
                <div className="space-y-4">
                   <label className="block font-bold">Medical Justification</label>
                   <textarea value={consultJustification} onChange={(e) => setConsultJustification(e.target.value)} className="w-full border p-2 rounded h-32"/>
                   
                   <label className="block font-bold">Follow-up Date</label>
                   <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="w-full border p-2 rounded"/>
                </div>
             </div>

             <div className="mt-8 flex gap-4">
                <button onClick={handleSave} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                   <Save/> Finalize & Save
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}