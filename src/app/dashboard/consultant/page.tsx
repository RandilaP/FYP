'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  total_pending_doctors: number;
  total_pending_bhts: number;
  total_patients_in_wards: number;
  total_wards_managed: number;
  recent_approvals_count: number;
  recent_rejections_count: number;
  wards_summary: Array<{
    ward_id: string;
    ward_name: string;
    location: string;
    total_patients: number;
  }>;
  pending_bhts_by_ward: Array<{
    ward_id: string;
    ward_name: string;
    pending_bhts_count: number;
    total_patients: number;
  }>;
}

function ConsultantDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'Consultant')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:8000/api/consultants/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'Consultant') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Consultant Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back, {user.name}</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Doctors</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {stats?.total_pending_doctors || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending BHTs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {stats?.total_pending_bhts || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {stats?.total_patients_in_wards || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Wards Managed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {stats?.total_wards_managed || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Wards Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Wards Overview</h2>
          <div className="space-y-3">
            {stats?.wards_summary && stats.wards_summary.length > 0 ? (
              stats.wards_summary.map((ward) => (
                <div key={ward.ward_id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{ward.ward_name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{ward.location}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm font-medium">
                      {ward.total_patients} patients
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No wards assigned</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Pending BHTs by Ward</h2>
          <div className="space-y-3">
            {stats?.pending_bhts_by_ward && stats.pending_bhts_by_ward.length > 0 ? (
              stats.pending_bhts_by_ward.map((ward) => (
                <div key={ward.ward_id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{ward.ward_name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{ward.total_patients} patients</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-sm font-medium">
                      {ward.pending_bhts_count} pending
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No pending BHTs</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Recent Approvals</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {stats?.recent_approvals_count || 0}
            </p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Recent Rejections</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {stats?.recent_rejections_count || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsultantDashboard;