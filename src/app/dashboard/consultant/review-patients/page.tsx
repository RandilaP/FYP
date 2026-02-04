'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface SubmittedPatient {
  patient_id: string;
  patient_name: string;
  age: number;
  gender: string;
  admission_date: string;
  ward_id: string;
  ward_name: string;
  doctor_id: string;
  doctor_name: string;
  doctor_email: string;
  total_bhts: number;
  finalized_bhts: number;
  summary_id: string;
  summary_text: string;
  summary_status: string;
  submitted_at: string;
  created_at: string;
}

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
  summary: {
    report_id: string;
    summary_text: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  bht_records: Array<{
    bht_id: string;
    diagnosis: string;
    symptoms: string;
    treatment_plan: string;
    medications: string;
    vitals: any;
    status: string;
    upload_date: string;
  }>;
  statistics: {
    total_bhts: number;
    draft_bhts: number;
    finalized_bhts: number;
    approved_bhts: number;
    rejected_bhts: number;
  };
}

function ReviewPatientsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<SubmittedPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'Consultant')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && user.role === 'Consultant') {
      loadSubmittedPatients();
    }
  }, [user]);

  const loadSubmittedPatients = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/consultants/submitted-patients', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submitted patients');
      }

      const data = await response.json();
      setPatients(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const viewPatientDetails = async (patientId: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setDetailsLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8000/api/consultants/patients/${patientId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('This patient is not in your ward');
        }
        throw new Error('Failed to fetch patient details');
      }

      const data = await response.json();
      setSelectedPatient(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load patient details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedPatient) return;
    if (!confirm(`Approve ${selectedPatient.patient.name} for discharge?`)) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/consultants/patients/${selectedPatient.patient.patient_id}/review`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'approve',
            notes: reviewNotes || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to approve patient');
      }

      const result = await response.json();
      setSuccessMessage(result.message);
      setSelectedPatient(null);
      setReviewNotes('');
      loadSubmittedPatients();

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to approve patient');
    }
  };

  const handleReject = async () => {
    if (!selectedPatient || !rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/consultants/patients/${selectedPatient.patient.patient_id}/review`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'reject',
            rejection_reason: rejectionReason,
            notes: reviewNotes || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to reject patient');
      }

      const result = await response.json();
      setSuccessMessage(result.message);
      setSelectedPatient(null);
      setShowRejectModal(false);
      setRejectionReason('');
      setReviewNotes('');
      loadSubmittedPatients();

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to reject patient');
    }
  };

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

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-800"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent absolute inset-0"></div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading patient queue...</p>
      </div>
    );
  }

  if (!user || user.role !== 'Consultant') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-black dark:to-gray-900 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-300 dark:to-white bg-clip-text text-transparent">
                Patient Review Queue
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Review and approve patient discharge requests
              </p>
            </div>
            <div className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30">
              {patients.length} Submitted
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 shadow-lg">
            <p className="text-green-800 dark:text-green-400 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Patients List */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Age/Gender</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Ward</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Doctor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">BHT Records</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Submitted</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No submitted patients for review
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr
                      key={patient.patient_id}
                      className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {patient.patient_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {patient.age} / {patient.gender}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 dark:text-white font-medium">
                          {patient.ward_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 dark:text-white">{patient.doctor_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{patient.doctor_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-semibold shadow-lg shadow-green-500/30">
                          {patient.finalized_bhts}/{patient.total_bhts}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-sm">
                        {formatDate(patient.submitted_at)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => viewPatientDetails(patient.patient_id)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patient Details Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent absolute inset-0"></div>
                  </div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading patient details...</p>
                </div>
              ) : (
                <>
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-bold text-white">
                          {selectedPatient.patient.name}
                        </h2>
                        <p className="text-blue-100 mt-1">
                          {selectedPatient.patient.age} years • {selectedPatient.patient.gender}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPatient(null);
                          setReviewNotes('');
                          setError('');
                        }}
                        className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                      >
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
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
                          <p className="font-semibold text-gray-900 dark:text-white">{formatDate(selectedPatient.patient.admission_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Ward</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedPatient.ward.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPatient.ward.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Attending Doctor</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedPatient.doctor?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPatient.doctor?.email || ''}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Emergency Contact</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedPatient.patient.emergency_contact || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Medical History</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedPatient.patient.medical_history || 'None recorded'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Allergies</p>
                          <p className="font-semibold text-red-600 dark:text-red-400">{selectedPatient.patient.allergies || 'None recorded'}</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Summary */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        AI-Generated Summary
                      </h3>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-300 dark:border-blue-700">
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                          {selectedPatient.summary?.summary_text || 'No summary available'}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                          {selectedPatient.summary?.status}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Updated: {formatDateTime(selectedPatient.summary?.updated_at)}
                        </span>
                      </div>
                    </div>

                    {/* BHT Records */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        BHT Records ({selectedPatient.bht_records.length})
                      </h3>
                      <div className="space-y-4">
                        {selectedPatient.bht_records.map((bht, index) => (
                          <div key={bht.bht_id} className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
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
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPatient.statistics.total_bhts}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total</p>
                      </div>
                      <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-xl p-4 text-center border border-yellow-200 dark:border-yellow-800">
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{selectedPatient.statistics.draft_bhts}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Draft</p>
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800">
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{selectedPatient.statistics.finalized_bhts}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Finalized</p>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900/20 rounded-xl p-4 text-center border border-green-200 dark:border-green-800">
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">{selectedPatient.statistics.approved_bhts}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Approved</p>
                      </div>
                      <div className="bg-red-100 dark:bg-red-900/20 rounded-xl p-4 text-center border border-red-200 dark:border-red-800">
                        <p className="text-2xl font-bold text-red-700 dark:text-red-400">{selectedPatient.statistics.rejected_bhts}</p>
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
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add any notes about your decision..."
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        rows={3}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleApprove}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve for Discharge
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject & Send Back
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatient(null);
                          setReviewNotes('');
                          setError('');
                        }}
                        className="px-6 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reject Patient Summary</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please provide a reason for rejecting this patient summary. This will help the doctor make necessary corrections.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g., Missing vital signs data, Incomplete medical history..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    rows={4}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all shadow-lg disabled:shadow-none"
                  >
                    Confirm Rejection
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason('');
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewPatientsPage;
