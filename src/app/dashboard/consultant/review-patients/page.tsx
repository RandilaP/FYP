'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getApiBaseUrl } from '@/lib/api/base';
import PatientDetailsSidePanel from './PatientDetailsSidePanel';
import NotificationToast from '@/app/components/NotificationToast';
import ConfirmDialog from '@/app/components/ConfirmDialog';

type Vitals = Record<string, string | number | null | undefined>;

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

interface SubmittedPatient {
  patient_id: string;
  patient_name: string;
  age: number;
  gender: string;
  admission_date: string;
  ward_id: string;
  ward_name: string;
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
    vitals: Vitals;
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
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [notification, setNotification] = useState<{
    variant: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);

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
      const response = await fetch(`${getApiBaseUrl()}/api/consultants/submitted-patients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submitted patients');
      }

      const data = await response.json();
      setPatients(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load patients'));
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
      const response = await fetch(`${getApiBaseUrl()}/api/consultants/patients/${patientId}/details`, {
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load patient details'));
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedPatient) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(
        `${getApiBaseUrl()}/api/consultants/patients/${selectedPatient.patient.patient_id}/review`,
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
      setNotification({
        variant: 'success',
        title: 'Patient approved',
        message: result.message || 'Patient discharge request approved successfully.',
      });
      setSelectedPatient(null);
      setReviewNotes('');
      loadSubmittedPatients();
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Failed to approve patient');
      setError(message);
      setNotification({
        variant: 'error',
        title: 'Approval failed',
        message,
      });
    }
  };

  const handleReject = async () => {
    if (!selectedPatient || !rejectionReason.trim()) {
      setNotification({
        variant: 'warning',
        title: 'Reason required',
        message: 'Rejection reason is required.',
      });
      setError('Rejection reason is required');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(
        `${getApiBaseUrl()}/api/consultants/patients/${selectedPatient.patient.patient_id}/review`,
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
      setNotification({
        variant: 'success',
        title: 'Patient rejected',
        message: result.message || 'Patient discharge request rejected.',
      });
      setSelectedPatient(null);
      setShowRejectModal(false);
      setRejectionReason('');
      setReviewNotes('');
      loadSubmittedPatients();
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Failed to reject patient');
      setError(message);
      setNotification({
        variant: 'error',
        title: 'Rejection failed',
        message,
      });
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
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
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-black dark:to-gray-900 p-6">
      <div className="space-y-6">
        <NotificationToast
          open={!!notification}
          variant={notification?.variant}
          title={notification?.title || ''}
          message={notification?.message || ''}
          onClose={() => setNotification(null)}
        />

        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-300 dark:to-white bg-clip-text text-transparent">
                Patient Review Queue
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Review and approve patient discharge requests
              </p>
            </div>
            <div className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30">
              {patients.length} Submitted
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Main Content Grid */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Submitted Patients</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Pick a patient card to inspect the discharge review details.</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30">
              {patients.length} queued
            </div>
          </div>

          {patients.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-10 text-center text-gray-500 dark:text-gray-400">
              No submitted patients for review.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {patients.map((patient) => {
                const isSelected = selectedPatient?.patient.patient_id === patient.patient_id;
                return (
                  <button
                    key={patient.patient_id}
                    onClick={() => viewPatientDetails(patient.patient_id)}
                    className={`group rounded-2xl border p-5 text-left transition-all hover:-translate-y-1 hover:shadow-xl ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/80 shadow-lg shadow-blue-500/10 dark:border-blue-400 dark:bg-blue-900/10'
                        : 'border-gray-200 bg-white hover:border-blue-300 dark:border-gray-700 dark:bg-gray-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{patient.patient_name}</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {patient.age} years • {patient.gender}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500 truncate">Ward: {patient.ward_name}</p>
                      </div>
                      <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-blue-500/30">
                        {patient.finalized_bhts}/{patient.total_bhts}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        Submitted: {new Date(patient.submitted_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-blue-700 dark:text-blue-300">
                      <span className="font-medium">Open review panel</span>
                      <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Patient Details Side Panel */}
        <PatientDetailsSidePanel
          patient={selectedPatient}
          isOpen={!!selectedPatient}
          isLoading={false}
          reviewNotes={reviewNotes}
          onReviewNotesChange={setReviewNotes}
          onApprove={() => setShowApproveModal(true)}
          onReject={() => setShowRejectModal(true)}
          onClose={() => {
            setSelectedPatient(null);
            setReviewNotes('');
            setError('');
          }}
          detailsLoading={detailsLoading}
        />

        <ConfirmDialog
          open={showApproveModal}
          title="Approve discharge?"
          description={selectedPatient ? `Approve ${selectedPatient.patient.name} for discharge review?` : 'Approve this discharge request?'}
          confirmLabel="Approve"
          cancelLabel="Cancel"
          onConfirm={() => {
            setShowApproveModal(false);
            void handleApprove();
          }}
          onCancel={() => setShowApproveModal(false)}
          tone="primary"
        />



        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-60">
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
                    className="flex-1 px-4 py-3 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all shadow-lg disabled:shadow-none"
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
