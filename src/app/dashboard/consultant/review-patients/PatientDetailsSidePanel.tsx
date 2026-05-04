'use client';

import React from 'react';

type Vitals = Record<string, string | number | null | undefined>;

interface PatientDetails {
  patient: {
    patient_id: string;
    name: string;
    age: number;
    gender: string;
    admission_date: string;
    medical_history: string;
    allergies: string;
    emergency_contact: string;
    created_at: string;
  };
  ward: {
    ward_id: string;
    name: string;
    location: string;
    capacity: number;
  };
  doctor: {
    user_id: string;
    name: string;
    email: string;
    role: string;
  };
  bht_records: Array<{
    bht_id: string;
    diagnosis: string;
    symptoms: string;
    treatment_plan: string;
    medications: string;
    status: string;
    vitals?: Vitals;
    upload_date: string;
  }>;
  summary: {
    report_id: string;
    summary_text: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  statistics: {
    total_bhts: number;
    draft_bhts: number;
    finalized_bhts: number;
    approved_bhts: number;
    rejected_bhts: number;
  };
}

interface PatientDetailsSidePanelProps {
  patient: PatientDetails | null;
  isOpen: boolean;
  isLoading: boolean;
  reviewNotes: string;
  onReviewNotesChange: (notes: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
  detailsLoading?: boolean;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function PatientDetailsSidePanel({
  patient,
  isOpen,
  isLoading,
  reviewNotes,
  onReviewNotesChange,
  onApprove,
  onReject,
  onClose,
  detailsLoading = false,
}: PatientDetailsSidePanelProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 overflow-hidden flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {detailsLoading && patient ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent absolute inset-0"></div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading patient details...</p>
          </div>
        ) : patient ? (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 border-b border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white">{patient.patient.name}</h2>
                  <p className="text-blue-100 mt-1">
                    {patient.patient.age} years • {patient.patient.gender}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  title="Close patient details"
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Patient Information */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Admission Date</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(patient.patient.admission_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ward</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{patient.ward.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{patient.ward.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Attending Doctor</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{patient.doctor?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{patient.doctor?.email || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Emergency Contact</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {patient.patient.emergency_contact || 'N/A'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Medical History</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {patient.patient.medical_history || 'None recorded'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Allergies</p>
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        {patient.patient.allergies || 'None recorded'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Patient Summary
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-300 dark:border-blue-700">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {patient.summary?.summary_text || 'No summary available'}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                      {patient.summary?.status}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Updated: {formatDateTime(patient.summary?.updated_at)}
                    </span>
                  </div>
                </div>

                {/* BHT Records */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    BHT Records ({patient.bht_records.length})
                  </h3>
                  <div className="space-y-4">
                    {patient.bht_records.map((bht, index) => (
                      <div
                        key={bht.bht_id}
                        className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">BHT #{index + 1}</h4>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-semibold">
                              {bht.status}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(bht.upload_date)}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Diagnosis</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{bht.diagnosis}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Symptoms</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{bht.symptoms}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Treatment Plan</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{bht.treatment_plan}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Medications</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{bht.medications}</p>
                          </div>
                          {bht.vitals && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Vitals</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {typeof bht.vitals === 'string' ? bht.vitals : JSON.stringify(bht.vitals)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{patient.statistics.total_bhts}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total</p>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-xl p-4 text-center border border-yellow-200 dark:border-yellow-800">
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                      {patient.statistics.draft_bhts}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Draft</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800">
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {patient.statistics.finalized_bhts}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Finalized</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/20 rounded-xl p-4 text-center border border-green-200 dark:border-green-800">
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {patient.statistics.approved_bhts}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Approved</p>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/20 rounded-xl p-4 text-center border border-red-200 dark:border-red-800">
                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                      {patient.statistics.rejected_bhts}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Rejected</p>
                  </div>
                </div>

                {/* Review Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Review Notes (Optional)
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => onReviewNotesChange(e.target.value)}
                    placeholder="Add any notes about your decision..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Footer with Action Buttons */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 space-y-3">
              <div className="flex gap-4">
                <button
                  onClick={onApprove}
                  disabled={isLoading}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve
                </button>
                <button
                  onClick={onReject}
                  disabled={isLoading}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-400 disabled:to-red-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 text-lg">No patient selected</p>
          </div>
        )}
      </div>
    </>
  );
}
