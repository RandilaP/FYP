'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface PendingDoctor {
  user_id: string;
  name: string;
  email: string;
  role: string;
  account_status: string;
  created_at: string;
  updated_at: string;
}

export default function DoctorApprovalsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState<PendingDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'Consultant')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchPendingDoctors = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/users/pending-registrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending registrations');
      }

      const data = await response.json();
      setDoctors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending doctors');
    } finally {
      setLoading(false);
    }
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
      const response = await fetch(`http://localhost:8000/api/users/${userId}/approve`, {
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
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    setProcessingId(userId);
    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejection_reason: reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject doctor');
      }

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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'Consultant') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Doctor Approvals</h1>
        <p className="text-gray-600 dark:text-gray-400">Review and approve doctor registrations</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {doctors.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M17 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Pending Approvals</h3>
          <p className="text-gray-600 dark:text-gray-400">There are no doctor registrations pending approval</p>
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
                {doctors.map((doctor) => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(doctor.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                        {doctor.account_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
