'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateBHTRecord } from '@/lib/api/doctor';

interface BHTRecord {
  bht_id: string;
  patient_id: string;
  doctor_id: string;
  upload_date: string;
  status: 'draft' | 'finalized' | 'rejected';
  diagnosis: string;
  symptoms: string;
  treatment_plan: string;
  medications: string;
  vitals: {
    temperature?: string;
    blood_pressure?: string;
    heart_rate?: string;
    respiratory_rate?: string;
    oxygen_saturation?: string;
  };
  procedures: string | null;
  lab_results: any;
  notes: string;
  ocr_text: string;
}

export default function BHTEditPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<Partial<BHTRecord>>({
    diagnosis: '',
    symptoms: '',
    treatment_plan: '',
    medications: '',
    vitals: {},
    procedures: '',
    lab_results: {},
    notes: '',
  });

  useEffect(() => {
    if (recordId) {
      fetchBHTRecord();
    }
  }, [recordId]);

  const fetchBHTRecord = async () => {
    if (!recordId) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/bht_records/${recordId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch BHT record');
      }

      const data = await response.json();
      setFormData(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch BHT record');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateBHTRecord(recordId, {
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms,
        treatment_plan: formData.treatment_plan,
        medications: formData.medications,
        vitals: formData.vitals,
        procedures: formData.procedures,
        lab_results: formData.lab_results,
        notes: formData.notes,
        validated_text: JSON.stringify({
          diagnosis: formData.diagnosis,
          symptoms: formData.symptoms,
          treatment_plan: formData.treatment_plan,
          medications: formData.medications,
          procedures: formData.procedures,
          notes: formData.notes,
        }),
      });
      setSuccess('BHT record updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update BHT record');
    } finally {
      setSaving(false);
    }
  };

  const updateVitals = (key: string, value: string) => {
    setFormData({
      ...formData,
      vitals: {
        ...formData.vitals,
        [key]: value,
      },
    });
  };

  const updateLabResults = (key: string, value: string) => {
    setFormData({
      ...formData,
      lab_results: {
        ...(formData.lab_results || {}),
        [key]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit BHT Record</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review and edit extracted data from the medical record
            </p>
          </div>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            formData.status === 'draft'
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
              : formData.status === 'finalized'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
          }`}>
            {formData.status}
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-400">{success}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Main Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Primary Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Diagnosis
                </label>
                <input
                  type="text"
                  value={formData.diagnosis || ''}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Primary diagnosis"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Symptoms
                </label>
                <textarea
                  rows={3}
                  value={formData.symptoms || ''}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="List of symptoms"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Treatment Plan
                </label>
                <textarea
                  rows={3}
                  value={formData.treatment_plan || ''}
                  onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Planned treatment approach"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Medications
                </label>
                <textarea
                  rows={3}
                  value={formData.medications || ''}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="List of medications with dosages"
                />
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vital Signs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Temperature
                </label>
                <input
                  type="text"
                  value={formData.vitals?.temperature || ''}
                  onChange={(e) => updateVitals('temperature', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="98.6°F"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Blood Pressure
                </label>
                <input
                  type="text"
                  value={formData.vitals?.blood_pressure || ''}
                  onChange={(e) => updateVitals('blood_pressure', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="120/80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Heart Rate
                </label>
                <input
                  type="text"
                  value={formData.vitals?.heart_rate || ''}
                  onChange={(e) => updateVitals('heart_rate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="72 bpm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Respiratory Rate
                </label>
                <input
                  type="text"
                  value={formData.vitals?.respiratory_rate || ''}
                  onChange={(e) => updateVitals('respiratory_rate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="16/min"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Oxygen Saturation
                </label>
                <input
                  type="text"
                  value={formData.vitals?.oxygen_saturation || ''}
                  onChange={(e) => updateVitals('oxygen_saturation', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="98%"
                />
              </div>
            </div>
          </div>

          {/* Procedures & Lab Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Procedures</h2>
              <textarea
                rows={4}
                value={formData.procedures || ''}
                onChange={(e) => setFormData({ ...formData, procedures: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                placeholder="Any procedures performed"
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lab Results (JSON)</h2>
              <textarea
                rows={4}
                value={typeof formData.lab_results === 'string' ? formData.lab_results : JSON.stringify(formData.lab_results || {}, null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({ ...formData, lab_results: JSON.parse(e.target.value) });
                  } catch {
                    setFormData({ ...formData, lab_results: e.target.value });
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none font-mono text-sm"
                placeholder='{"WBC": "7500/μL", "Hemoglobin": "14 g/dL"}'
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Notes</h2>
            <textarea
              rows={4}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Any additional observations or notes"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
