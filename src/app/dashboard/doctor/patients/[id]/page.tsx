'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getPatientDetails,
  getPatientBHTRecords,
  uploadBHTRecord,
  generatePatientSummary,
  getPatientSummary,
  updatePatientSummary,
  submitPatientForReview,
} from '@/lib/api/doctor';

interface Patient {
  patient_id: string;
  name: string;
  dob: string;
  gender: string;
  ward_id: string;
  admission_date: string;
  discharge_date: string | null;
}

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
  vitals: any;
  procedures: string | null;
  lab_results: any;
  notes: string;
}

interface PatientSummary {
  report_id: string;
  patient_id: string;
  summary_text: string;
  generated_at: string;
  updated_at: string | null;
  created_by: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  bht_id: string | null;
  approved_by_consultant_id: string | null;
}

export default function PatientDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [bhts, setBhts] = useState<BHTRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState<PatientSummary | null>(null);
  const [summaryText, setSummaryText] = useState('');
  const [editingSummary, setEditingSummary] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [savingSummary, setSavingSummary] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const [patientData, bhtsData, summaryData] = await Promise.all([
        getPatientDetails(patientId),
        getPatientBHTRecords(patientId),
        getPatientSummary(patientId),
      ]);
      console.log('BHT records received:', bhtsData); // Debug log
      setPatient(patientData);
      setBhts(bhtsData);
      if (summaryData) {
        setSummaryData(summaryData);
        setSummaryText(summaryData.summary_text);
      }
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadBHT = async () => {
    if (!selectedFile || !user?.user_id) return;

    setUploading(true);
    setError('');

    try {
      const result = await uploadBHTRecord(patientId, user.user_id, selectedFile);
      console.log('Upload response:', result); // Debug log
      setSelectedFile(null);
      
      // Check if bht_id exists in the response
      if (result && result.bht_id) {
        // Navigate to edit page with extracted data
        router.push(`/dashboard/doctor/bht-records/${result.bht_id}/edit`);
      } else {
        // If no record_id, refresh the patient data to show the new BHT
        await fetchPatientData();
        setError('BHT uploaded successfully, but unable to navigate to edit page');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload BHT');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!patient) return;
    
    setGeneratingSummary(true);
    setError('');

    try {
      // Generate the summary
      await generatePatientSummary(patientId);
      
      // Fetch the created summary to get the full object
      const createdSummary = await getPatientSummary(patientId);
      if (createdSummary) {
        setSummaryData(createdSummary);
        setSummaryText(createdSummary.summary_text);
        setEditingSummary(true); // Open in edit mode
      }
      setShowSummaryModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!patient || !summaryText.trim()) {
      alert('Summary text cannot be empty');
      return;
    }

    setSavingSummary(true);
    try {
      const updatedSummary = await updatePatientSummary(patient.patient_id, summaryText);
      setSummaryData(updatedSummary);
      setEditingSummary(false);
      alert('Summary saved successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save summary');
    } finally {
      setSavingSummary(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!summaryData) {
      alert('Please generate a summary before submitting for review');
      return;
    }
    
    if (summaryData.status !== 'draft') {
      alert('Summary has already been submitted');
      return;
    }

    if (!confirm('Are you sure you want to submit this patient for consultant review? All draft BHTs will be finalized.')) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await submitPatientForReview(patientId);
      alert('Patient successfully submitted for review!');
      await fetchPatientData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit for review');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-800"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent absolute inset-0"></div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading patient details...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400">Patient not found</p>
          <Link href="/dashboard/doctor/patients" className="text-red-600 hover:underline mt-4 inline-block">
            Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  const draftBHTs = bhts.filter(b => b.status === 'draft');
  const finalizedBHTs = bhts.filter(b => b.status === 'finalized');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard/doctor/patients"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{patient.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {patient.gender}, {calculateAge(patient.dob)} years old
            </p>
          </div>
          <div className="flex gap-3">
            {summaryData ? (
              <button
                onClick={() => {
                  setShowSummaryModal(true);
                  setEditingSummary(false);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Summary
              </button>
            ) : (
              <button
                onClick={handleGenerateSummary}
                disabled={generatingSummary || bhts.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {generatingSummary ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate Summary
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleSubmitForReview}
              disabled={submitting || bhts.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Patient Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Date of Birth</p>
                  <p className="text-gray-900 dark:text-white font-medium">{new Date(patient.dob).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Admission Date</p>
                  <p className="text-gray-900 dark:text-white font-medium">{new Date(patient.admission_date).toLocaleString()}</p>
                </div>
                {patient.discharge_date && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Discharge Date</p>
                    <p className="text-gray-900 dark:text-white font-medium">{new Date(patient.discharge_date).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Status</p>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    patient.discharge_date 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                  }`}>
                    {patient.discharge_date ? 'Discharged' : 'Active'}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400">Total BHT Records</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{bhts.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {draftBHTs.length} draft, {finalizedBHTs.length} finalized
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BHT Upload & Records */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload BHT Record</h2>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="mb-4">
                    <label className="cursor-pointer">
                      <span className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-block">
                        Select Image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Selected: {selectedFile.name}
                      </p>
                      <button
                        onClick={handleUploadBHT}
                        disabled={uploading}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {uploading ? 'Uploading & Extracting...' : 'Upload & Extract Data'}
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Upload a medical record image. AI will automatically extract data for you to review.
                  </p>
                </div>
              </div>
            </div>

            {/* BHT Records List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">BHT Records</h2>
              </div>
              {bhts.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">No BHT records yet. Upload the first record above.</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {bhts.map((bht) => (
                    <Link
                      key={bht.bht_id}
                      href={`/dashboard/doctor/bht-records/${bht.bht_id}/edit`}
                      className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-500 dark:hover:border-red-500 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                              {bht.diagnosis || 'No diagnosis'}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              bht.status === 'draft'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                : bht.status === 'finalized'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                            }`}>
                              {bht.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {bht.symptoms || 'No symptoms recorded'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Uploaded: {new Date(bht.upload_date).toLocaleString()}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Modal */}
        {showSummaryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Patient Summary</h3>
                  {summaryData && (
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      summaryData.status === 'draft'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                        : summaryData.status === 'submitted'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                        : summaryData.status === 'approved'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      {summaryData.status}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowSummaryModal(false);
                    setEditingSummary(false);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close summary modal"
                >
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {editingSummary ? (
                  <div className="space-y-4">
                    <textarea
                      value={summaryText}
                      onChange={(e) => setSummaryText(e.target.value)}
                      disabled={summaryData?.status !== 'draft'}
                      className="w-full h-96 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed font-mono text-sm"
                      placeholder="Edit summary text..."
                    />
                    {summaryData?.updated_at && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last updated: {new Date(summaryData.updated_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                      {summaryText || 'No summary available'}
                    </pre>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                {editingSummary ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveSummary}
                      disabled={savingSummary || summaryData?.status !== 'draft'}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingSummary ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingSummary(false);
                        // Reset to original text from summaryData
                        if (summaryData) {
                          setSummaryText(summaryData.summary_text);
                        }
                      }}
                      disabled={savingSummary}
                      className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingSummary(true)}
                    disabled={summaryData?.status !== 'draft'}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit Summary
                  </button>
                )}
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
