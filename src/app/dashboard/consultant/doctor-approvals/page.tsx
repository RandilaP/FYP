'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getApiBaseUrl } from '@/lib/api/base';

interface PendingDoctor {
  user_id: string;
  name: string;
  email: string;
  role: string;
  account_status: string;
  ward_id?: string;
  created_at: string;
  updated_at: string;
}

interface Ward {
  ward_id: string;
  name: string;
  location: string;
}

export default function DoctorApprovalsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState<PendingDoctor[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejected, setShowRejected] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectUserId, setRejectUserId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'Consultant')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchPendingDoctors = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      // Fetch wards first
      const wardsResponse = await fetch(`${getApiBaseUrl()}/api/wards/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (wardsResponse.ok) {
        const wardsData = await wardsResponse.json();
        setWards(wardsData);
      }

      // Fetch pending and rejected doctors
      const response = await fetch(`${getApiBaseUrl()}/api/users/pending-registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending registrations');
      }

      const pendingData = await response.json();
      
      // Also fetch rejected doctors (you may need to adjust this based on your API)
      // For now, we'll filter from the same endpoint if it includes all statuses
      setDoctors(pendingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending doctors');
    } finally {
      setLoading(false);
    }
  };

  const getWardName = (wardId?: string) => {
    if (!wardId) return 'Not assigned';
    const ward = wards.find(w => w.ward_id === wardId);
    return ward ? `${ward.name} - ${ward.location}` : 'Unknown ward';
  };

  useEffect(() => {
    if (user) {
      fetchPendingDoctors();
    }
  }, [user]);

  const handleApprove = async (userId: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setProcessingId(userId);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Approved by consultant',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve doctor');
      }

      // Refresh the list
      await fetchPendingDoctors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve doctor');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    setRejectUserId(userId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectUserId || !rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    setProcessingId(rejectUserId);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/users/${rejectUserId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejection_reason: rejectionReason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject doctor');
      }

      // Close modal and reset state
      setShowRejectModal(false);
      setRejectUserId(null);
      setRejectionReason('');

      // Refresh the list
      await fetchPendingDoctors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject doctor');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-800"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent absolute inset-0"></div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading doctor approvals...</p>
      </div>
    );
  }

  if (!user || user.role !== 'Consultant') {
    return null;
  }

  const filteredDoctors = doctors.filter(d => 
    showRejected ? d.account_status === 'rejected' : d.account_status === 'pending'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Doctor Approvals</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and approve doctor registrations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRejected(false)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !showRejected
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setShowRejected(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showRejected
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {filteredDoctors.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M17 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {showRejected ? 'No Rejected Doctors' : 'No Pending Approvals'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {showRejected 
              ? 'There are no rejected doctor registrations'
              : 'There are no doctor registrations pending approval'
            }
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Doctor Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ward Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            {doctor.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {doctor.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{doctor.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{getWardName(doctor.ward_id)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(doctor.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        doctor.account_status === 'pending' 
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}>
                        {doctor.account_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        {doctor.account_status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(doctor.user_id)}
                              disabled={processingId === doctor.user_id}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === doctor.user_id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(doctor.user_id)}
                              disabled={processingId === doctor.user_id}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {doctor.account_status === 'rejected' && (
                          <button
                            onClick={() => handleApprove(doctor.user_id)}
                            disabled={processingId === doctor.user_id}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingId === doctor.user_id ? 'Processing...' : 'Re-approve'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Reject Doctor Registration
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please provide a reason for rejecting this registration. This will be shown to the doctor.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            />
            {error && rejectionReason === '' && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectUserId(null);
                  setRejectionReason('');
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={processingId === rejectUserId}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processingId === rejectUserId ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
