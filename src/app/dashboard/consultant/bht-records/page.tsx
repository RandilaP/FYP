'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface BHTRecord {
  bht_id: string;
  patient_id: string;
  patient_name: string;
  ward_id: string;
  ward_name: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  updated_at: string;
}

export default function BHTRecordsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [bhtRecords, setBhtRecords] = useState<BHTRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filterWard, setFilterWard] = useState('');
  const [filterPatient, setFilterPatient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'Consultant')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchBHTRecords = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filterWard) params.append('ward_id', filterWard);
      if (filterPatient) params.append('patient_id', filterPatient);
      if (filterStatus) params.append('status', filterStatus);

      const url = `http://localhost:8000/api/bht_records/${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBHTRecords();
    }
  }, [user, filterWard, filterPatient, filterStatus]);

  const clearFilters = () => {
    setFilterWard('');
    setFilterPatient('');
    setFilterStatus('');
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

  const statusColors = {
    Pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    Approved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    Rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">BHT Records</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage all BHT records</p>
      </div>

      {/* Filters */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ward ID
            </label>
            <input
              type="text"
              value={filterWard}
              onChange={(e) => setFilterWard(e.target.value)}
              placeholder="Enter ward ID"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Patient ID
            </label>
            <input
              type="text"
              value={filterPatient}
              onChange={(e) => setFilterPatient(e.target.value)}
              placeholder="Enter patient ID"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Records ({bhtRecords.length})
          </h2>
        </div>

        {bhtRecords.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No BHT Records Found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    BHT ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {bhtRecords.map((bht) => (
                  <tr key={bht.bht_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {bht.bht_id?.slice(0, 8) || 'N/A'}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {bht.patient_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-500">
                          ID: {bht.patient_id?.slice(0, 8) || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {bht.ward_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-500">
                          {bht.ward_id?.slice(0, 8) || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[bht.status]}`}>
                        {bht.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(bht.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-500">
                        {new Date(bht.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(bht.updated_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-500">
                        {new Date(bht.updated_at).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
