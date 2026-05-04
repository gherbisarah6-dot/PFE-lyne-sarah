/**
 * =============================================================================
 * DOCTOR MY PATIENTS PAGE
 * =============================================================================
 * 
 * PURPOSE:
 * View and manage patient records for the doctor.
 * 
 * FEATURES:
 * - Patient cards grid with search and filters
 * - Patient profile modal with:
 *   - Add new allergies/chronic conditions (can't edit existing, only delete)
 *   - View all visit history
 *   - View all medical records
 *   - "Ask for Upload" sends request to patient dashboard (not receptionist)
 * 
 * =============================================================================
 */

"use client";

import { useState } from "react";
import { Search, X, User, Calendar, FileText, Trash2, FileCheck, Plus } from "lucide-react";

// -----------------------------------------------------------------------------
// MOCK DATA: Patients with full medical info
// -----------------------------------------------------------------------------
const initialPatients = [
  {
    id: 1,
    name: "Ahmed Benali",
    age: 45,
    contact: "+213 555 123456",
    lastVisit: "2026-03-15",
    visits: 8,
    allergies: ["Penicillin"],
    chronicConditions: ["Hypertension"],
    visitHistory: [
      { date: "2026-03-15", reason: "Check-up", notes: "Blood pressure normal" },
      { date: "2026-02-10", reason: "Chest pain", notes: "Prescribed medication" },
      { date: "2026-01-05", reason: "Follow-up", notes: "Condition improving" },
    ],
    medicalRecords: [
      { id: 1, date: "2026-03-15", title: "Blood Test", type: "Lab report", notes: "Results normal" },
      { id: 2, date: "2026-02-10", title: "ECG Report", type: "Imaging", notes: "Normal sinus rhythm" },
    ],
    justifications: [
      { date: "2026-03-15", content: "Medical leave for follow-up treatment", days: 2 },
    ],
  },
  {
    id: 2,
    name: "Fatima Zohra",
    age: 32,
    contact: "+213 555 234567",
    lastVisit: "2026-03-20",
    visits: 3,
    allergies: [],
    chronicConditions: ["Hypertension"],
    visitHistory: [
      { date: "2026-03-20", reason: "Annual check-up", notes: "All vitals normal" },
      { date: "2025-12-15", reason: "Flu symptoms", notes: "Prescribed rest and fluids" },
    ],
    medicalRecords: [
      { id: 1, date: "2026-03-20", title: "Complete Blood Count", type: "Lab report", notes: "Normal values" },
    ],
    justifications: [],
  },
  {
    id: 3,
    name: "Youssef Amrani",
    age: 52,
    contact: "+213 555 345678",
    lastVisit: "2026-02-28",
    visits: 12,
    allergies: ["Aspirin"],
    chronicConditions: ["Diabetes"],
    visitHistory: [
      { date: "2026-02-28", reason: "Diabetes follow-up", notes: "HbA1c levels stable" },
      { date: "2026-01-20", reason: "Routine check", notes: "Medication adjusted" },
    ],
    medicalRecords: [
      { id: 1, date: "2026-02-28", title: "HbA1c Test", type: "Lab report", notes: "6.5% - well controlled" },
      { id: 2, date: "2026-01-20", title: "Kidney Function", type: "Lab report", notes: "Normal" },
    ],
    justifications: [
      { date: "2026-02-28", content: "Rest recommended for diabetes management", days: 1 },
    ],
  },
  {
    id: 4,
    name: "Nadia Boudiaf",
    age: 36,
    contact: "+213 555 456789",
    lastVisit: "2026-03-01",
    visits: 5,
    allergies: ["Sulfa drugs"],
    chronicConditions: ["Asthma"],
    visitHistory: [
      { date: "2026-03-01", reason: "Asthma review", notes: "Inhaler technique reviewed" },
    ],
    medicalRecords: [
      { id: 1, date: "2026-03-01", title: "Spirometry", type: "Lab report", notes: "Mild obstruction" },
    ],
    justifications: [],
  },
  {
    id: 5,
    name: "Rachid Hamidi",
    age: 67,
    contact: "+213 555 567890",
    lastVisit: "2026-03-05",
    visits: 15,
    allergies: ["Penicillin"],
    chronicConditions: ["Diabetes", "Heart disease"],
    visitHistory: [
      { date: "2026-03-05", reason: "Cardiac follow-up", notes: "Stable condition" },
      { date: "2026-02-01", reason: "Diabetes check", notes: "Blood sugar controlled" },
    ],
    medicalRecords: [
      { id: 1, date: "2026-03-05", title: "Echocardiogram", type: "Imaging", notes: "EF 55%" },
      { id: 2, date: "2026-02-01", title: "Fasting Glucose", type: "Lab report", notes: "110 mg/dL" },
    ],
    justifications: [
      { date: "2026-03-05", content: "Cardiac follow-up care", days: 3 },
    ],
  },
];

// Filter options
const filterOptions = ["All Patients", "Recent (30 days)", "Frequent (5+ visits)"];

export default function DoctorPatients() {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Patients");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Add new allergy/condition state
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [showAddCondition, setShowAddCondition] = useState(false);
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");

  // -------------------------------------------------------------------------
  // FILTER PATIENTS
  // -------------------------------------------------------------------------
  const filteredPatients = patients.filter((p) => {
    // Search filter
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    
    // Tab filter
    if (filter === "Recent (30 days)") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(p.lastVisit) >= thirtyDaysAgo;
    }
    if (filter === "Frequent (5+ visits)") {
      return p.visits >= 5;
    }
    return true;
  });

  // -------------------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------------------
  
  // Open patient profile modal
  const handleViewProfile = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  // Close modal and reset states
  const handleCloseModal = () => {
    setShowModal(false);
    setShowAddAllergy(false);
    setShowAddCondition(false);
    setNewAllergy("");
    setNewCondition("");
  };

  // Add new allergy to patient
  const handleAddAllergy = () => {
    if (!newAllergy.trim() || !selectedPatient) return;
    
    const updatedPatient = {
      ...selectedPatient,
      allergies: [...selectedPatient.allergies, newAllergy.trim()],
    };
    
    setPatients((prev) =>
      prev.map((p) => (p.id === selectedPatient.id ? updatedPatient : p))
    );
    setSelectedPatient(updatedPatient);
    setNewAllergy("");
    setShowAddAllergy(false);
  };

  // Delete allergy from patient
  const handleDeleteAllergy = (allergyToDelete) => {
    if (!selectedPatient) return;
    
    const updatedPatient = {
      ...selectedPatient,
      allergies: selectedPatient.allergies.filter((a) => a !== allergyToDelete),
    };
    
    setPatients((prev) =>
      prev.map((p) => (p.id === selectedPatient.id ? updatedPatient : p))
    );
    setSelectedPatient(updatedPatient);
  };

  // Add new chronic condition to patient
  const handleAddCondition = () => {
    if (!newCondition.trim() || !selectedPatient) return;
    
    const updatedPatient = {
      ...selectedPatient,
      chronicConditions: [...selectedPatient.chronicConditions, newCondition.trim()],
    };
    
    setPatients((prev) =>
      prev.map((p) => (p.id === selectedPatient.id ? updatedPatient : p))
    );
    setSelectedPatient(updatedPatient);
    setNewCondition("");
    setShowAddCondition(false);
  };

  // Delete chronic condition from patient
  const handleDeleteCondition = (conditionToDelete) => {
    if (!selectedPatient) return;
    
    const updatedPatient = {
      ...selectedPatient,
      chronicConditions: selectedPatient.chronicConditions.filter((c) => c !== conditionToDelete),
    };
    
    setPatients((prev) =>
      prev.map((p) => (p.id === selectedPatient.id ? updatedPatient : p))
    );
    setSelectedPatient(updatedPatient);
  };

  

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Page Title - No subtitle */}
      <h1 className="text-2xl font-bold text-foreground">My Patients</h1>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
              filter === opt
                ? "bg-[#1d4ed8] text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search patients by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] focus:border-[#1d4ed8] outline-none transition-all text-gray-900 bg-white placeholder:text-gray-400 min-h-[44px]"
        />
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900/30">
                <User className="w-5 h-5 text-[#1d4ed8] dark:text-[#1d4ed8]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{patient.name}</h3>
                <p className="text-sm text-muted-foreground">{patient.age} years old</p>
              </div>
            </div>
            <div className="space-y-1 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Visit:</span>
                <span className="text-foreground">{patient.lastVisit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Visits:</span>
                <span className="text-foreground">{patient.visits}</span>
              </div>
            </div>
            <button
              onClick={() => handleViewProfile(patient)}
              aria-label={`View profile of ${patient.name}`}
              className="w-full bg-[#1d4ed8] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#1e40af] min-h-[44px] transition-colors"
            >
              View Profile
            </button>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No patients found matching your criteria.
        </div>
      )}

      {/* ===================================================================
          PATIENT PROFILE MODAL
          =================================================================== */}
      {showModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <div>
                <h2 className="font-semibold text-lg text-foreground">{selectedPatient.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedPatient.age} years old - {selectedPatient.contact}</p>
              </div>
              <button
                onClick={handleCloseModal}
                aria-label="Close Modal"
                className="p-2 hover:bg-muted rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* ---------------------------------------------------------
                  ALLERGIES SECTION
                  - Can add new, can delete existing, cannot edit
                  --------------------------------------------------------- */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">Allergies</h3>
                  <button
                    onClick={() => setShowAddAllergy(true)}
                    aria-label="Add allergy"
                    className="text-[#1d4ed8] hover:text-[#1e40af] p-1 flex items-center gap-1 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                
                {/* Add allergy input */}
                {showAddAllergy && (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      placeholder="Enter allergy..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] focus:border-[#1d4ed8] outline-none transition-all text-gray-900 bg-white"
                    />
                    <button
                      onClick={handleAddAllergy}
                      aria-label="Save allergy"
                      className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 text-sm min-h-[40px]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setShowAddAllergy(false); setNewAllergy(""); }}
                      aria-label="Cancel"
                      className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 text-sm min-h-[40px] font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                {/* Allergies list */}
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.allergies.length === 0 ? (
                    <p className="text-muted-foreground text-sm">None</p>
                  ) : (
                    selectedPatient.allergies.map((allergy, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1.5 rounded-full text-sm"
                      >
                        {allergy}
                        <button
                          onClick={() => handleDeleteAllergy(allergy)}
                          aria-label={`Delete ${allergy}`}
                          className="hover:bg-red-200 dark:hover:bg-red-800/50 rounded-full p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* ---------------------------------------------------------
                  CHRONIC CONDITIONS SECTION
                  - Can add new, can delete existing, cannot edit
                  --------------------------------------------------------- */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">Chronic Conditions</h3>
                  <button
                    onClick={() => setShowAddCondition(true)}
                    aria-label="Add condition"
                    className="text-[#1d4ed8] hover:text-[#1e40af] p-1 flex items-center gap-1 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                
                {/* Add condition input */}
                {showAddCondition && (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      placeholder="Enter condition..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] focus:border-[#1d4ed8] outline-none transition-all text-gray-900 bg-white"
                    />
                    <button
                      onClick={handleAddCondition}
                      aria-label="Save condition"
                      className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 text-sm min-h-[40px]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setShowAddCondition(false); setNewCondition(""); }}
                      aria-label="Cancel"
                      className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 text-sm min-h-[40px] font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                {/* Conditions list */}
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.chronicConditions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">None</p>
                  ) : (
                    selectedPatient.chronicConditions.map((condition, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-3 py-1.5 rounded-full text-sm"
                      >
                        {condition}
                        <button
                          onClick={() => handleDeleteCondition(condition)}
                          aria-label={`Delete ${condition}`}
                          className="hover:bg-orange-200 dark:hover:bg-orange-800/50 rounded-full p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* ---------------------------------------------------------
                  VISIT HISTORY SECTION
                  --------------------------------------------------------- */}
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-[#1d4ed8]" />
                  Visit History
                </h3>
                <div className="space-y-2">
                  {selectedPatient.visitHistory?.map((visit, idx) => (
                    <div key={idx} className="bg-muted rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-foreground">{visit.reason}</span>
                        <span className="text-xs text-muted-foreground">{visit.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{visit.notes}</p>
                    </div>
                  ))}
                  {(!selectedPatient.visitHistory || selectedPatient.visitHistory.length === 0) && (
                    <p className="text-muted-foreground text-sm">No visit history</p>
                  )}
                </div>
              </div>

              {/* ---------------------------------------------------------
                  MEDICAL RECORDS SECTION
                  --------------------------------------------------------- */}
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-[#1d4ed8]" />
                  Medical Records
                </h3>
                <div className="space-y-2">
                  {selectedPatient.medicalRecords?.map((record) => (
                    <div key={record.id} className="bg-muted rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-foreground">{record.title}</span>
                        <span className="text-xs text-muted-foreground">{record.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-[#1d4ed8] px-2 py-0.5 rounded dark:bg-blue-900/30 dark:text-blue-400">
                          {record.type}
                        </span>
                        <span className="text-sm text-muted-foreground">{record.notes}</span>
                      </div>
                    </div>
                  ))}
                  {(!selectedPatient.medicalRecords || selectedPatient.medicalRecords.length === 0) && (
                    <p className="text-muted-foreground text-sm">No medical records</p>
                  )}
                </div>
              </div>

              {/* ---------------------------------------------------------
                  JUSTIFICATIONS SECTION
                  --------------------------------------------------------- */}
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <FileCheck className="w-5 h-5 text-purple-600" />
                  Medical Justifications
                </h3>
                <div className="space-y-2">
                  {selectedPatient.justifications?.map((just, idx) => (
                    <div key={idx} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-purple-700 dark:text-purple-400">
                          {just.days} day{just.days > 1 ? "s" : ""} leave
                        </span>
                        <span className="text-xs text-muted-foreground">{just.date}</span>
                      </div>
                      <p className="text-sm text-purple-600 dark:text-purple-300">{just.content}</p>
                    </div>
                  ))}
                  {(!selectedPatient.justifications || selectedPatient.justifications.length === 0) && (
                    <p className="text-muted-foreground text-sm">No justifications issued</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}
