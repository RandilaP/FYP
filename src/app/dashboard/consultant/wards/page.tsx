'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

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

interface BHTRecord {
  bht_id: string;
  patient_id: string;
  patient_name: string;
  ward_id: string;
  status: string;
  created_at: string;
}

export default function WardManagementPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [bhtRecords, setBhtRecords] = useState<BHTRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'patients' | 'bhts'>('patients');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWardName, setNewWardName] = useState('');
  const [newWardLocation, setNewWardLocation] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'Consultant')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchWards = async () => {
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
  };

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

  const fetchWardBHTs = async (wardId: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setLoadingDetails(true);
    try {
      const response = await fetch(`http://localhost:8000/api/wards/${wardId}/bht_records`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch BHT records');
      }

      const data = await response.json();
      setBhtRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load BHT records');
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWards();
    }
  }, [user]);

  const handleWardSelect = (ward: Ward) => {
    setSelectedWard(ward);
    setActiveTab('patients');
    fetchWardPatients(ward.ward_id);
  };

  useEffect(() => {
    if (selectedWard && activeTab === 'bhts') {
      fetchWardBHTs(selectedWard.ward_id);
    }
  }, [activeTab, selectedWard]);

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
          {!selectedWard ? (
            <div className="card p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Select a Ward</h3>
              <p className="text-gray-600 dark:text-gray-400">Choose a ward from the list to view details</p>
            </div>
          ) : (
            <div className="card">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedWard.ward_name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{selectedWard.location}</p>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('patients')}
                  className={`pb-2 px-1 font-medium transition-colors ${
                    activeTab === 'patients'
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Patients ({patients.length})
                </button>
                <button
                  onClick={() => setActiveTab('bhts')}
                  className={`pb-2 px-1 font-medium transition-colors ${
                    activeTab === 'bhts'
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  BHT Records ({bhtRecords.length})
                </button>
              </div>

              {loadingDetails ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : (
                <>
                  {activeTab === 'patients' && (
                    <div className="space-y-3">
                      {patients.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400 text-center py-8">No patients in this ward</p>
                      ) : (
                        patients.map((patient) => (
                          <div key={patient.patient_id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'bhts' && (
                    <div className="space-y-3">
                      {bhtRecords.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400 text-center py-8">No BHT records in this ward</p>
                      ) : (
                        bhtRecords.map((bht) => (
                          <div key={bht.bht_id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">BHT #{bht.bht_id?.slice(0, 8) || 'N/A'}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  Patient: {bht.patient_name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                  Created: {new Date(bht.created_at).toLocaleDateString()}
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                bht.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                                bht.status === 'Approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                                'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                              }`}>
                                {bht.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

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
