'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import PatientDetailsSidePanel from '../review-patients/PatientDetailsSidePanel';

type Vitals = Record<string, string | number | null | undefined>;

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

interface Ward {
  ward_id: string;
  ward_name: string;
  location: string;
  total_patients: number;
}

interface Patient {
  patient_id: string;
  name: string;
  age: number;
  gender: string;
  contact_number: string;
  current_ward_id: string;
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

export default function WardManagementPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWardName, setNewWardName] = useState('');
  const [newWardLocation, setNewWardLocation] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'Consultant')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchWards = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token || !user) return;

    try {
      const response = await fetch(`http://localhost:8000/api/consultants/${user.user_id}/wards`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wards');
      }

      const data = await response.json();
      setWards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wards');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchWardPatients = async (wardId: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setLoadingDetails(true);
    try {
      const response = await fetch(`http://localhost:8000/api/wards/${wardId}/patients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }

      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchPatientDetails = async (patientId: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setLoadingDetails(true);
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load patient details'));
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWards();
    }
  }, [user, fetchWards]);

  const handleWardSelect = (ward: Ward) => {
    setSelectedWard(ward);
    setSelectedPatient(null);
    fetchWardPatients(ward.ward_id);
  };

  const handlePatientSelect = (patient: Patient) => {
    fetchPatientDetails(patient.patient_id);
  };

  const handleCreateWard = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token || !user) return;

    setCreating(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/wards/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newWardName,
          location: newWardLocation,
          consultant_id: user.user_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create ward');
      }

      // Reset form and close modal
      setNewWardName('');
      setNewWardLocation('');
      setShowCreateModal(false);

      // Refresh wards list
      await fetchWards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ward');
    } finally {
      setCreating(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-800"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent absolute inset-0"></div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading wards...</p>
      </div>
    );
  }

  if (!user || user.role !== 'Consultant') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Ward Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage wards and view patients</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wards List */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">My Wards</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
              >
                + Create
              </button>
            </div>
            {wards.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-sm">No wards assigned</p>
            ) : (
              <div className="space-y-2">
                {wards.map((ward) => (
                  <button
                    key={ward.ward_id}
                    onClick={() => handleWardSelect(ward)}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${
                      selectedWard?.ward_id === ward.ward_id
                        ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">{ward.ward_name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{ward.location}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {ward.total_patients} patients
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ward Details */}
        <div className="lg:col-span-2">
          {selectedWard && (
            <div className="card">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedWard.ward_name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{selectedWard.location}</p>
              </div>

              {loadingDetails ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {patients.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">No patients in this ward</p>
                  ) : (
                    patients.map((patient) => (
                      <button
                        key={patient.patient_id}
                        onClick={() => handlePatientSelect(patient)}
                        className="w-full text-left p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-500"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{patient.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {patient.age} years • {patient.gender}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                              {patient.contact_number}
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Patient Details Side Panel */}
      <PatientDetailsSidePanel
        patient={selectedPatient}
        isOpen={!!selectedPatient}
        isLoading={false}
        reviewNotes=""
        onReviewNotesChange={() => {}}
        onApprove={() => {}}
        onReject={() => {}}
        onClose={() => {
          setSelectedPatient(null);
          setError('');
        }}
        detailsLoading={loadingDetails}
      />

      {/* Create Ward Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Create New Ward</h2>
            
            <form onSubmit={handleCreateWard}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ward Name *
                  </label>
                  <input
                    type="text"
                    value={newWardName}
                    onChange={(e) => setNewWardName(e.target.value)}
                    placeholder="e.g., ICU Ward A"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={newWardLocation}
                    onChange={(e) => setNewWardLocation(e.target.value)}
                    placeholder="e.g., Building A, 3rd Floor"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewWardName('');
                    setNewWardLocation('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Ward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
