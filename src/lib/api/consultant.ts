// API utility functions for Consultant dashboard
const API_BASE_URL = 'http://localhost:8000';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Helper function to create headers
const createHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Types
export interface DashboardStats {
  pending_doctors: number;
  pending_bhts: number;
  total_patients: number;
  total_wards_managed: number;
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
  }>;
  recent_approvals_count: number;
  recent_rejections_count: number;
}

export interface PendingDoctor {
  user_id: string;
  name: string;
  email: string;
  role: string;
  account_status: string;
  created_at: string;
  updated_at: string;
}

export interface Ward {
  ward_id: string;
  ward_name: string;
  location: string;
  total_patients: number;
}

export interface Patient {
  patient_id: string;
  name: string;
  age: number;
  gender: string;
  contact_number: string;
  current_ward_id: string;
}

export interface BHTRecord {
  bht_id: string;
  patient_id: string;
  patient_name?: string;
  ward_id: string;
  ward_name?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  updated_at: string;
}

// Dashboard APIs
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/api/consultants/dashboard`, {
    headers: createHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }

  return response.json();
}

// User Management APIs
export async function getPendingDoctorRegistrations(): Promise<PendingDoctor[]> {
  const response = await fetch(`${API_BASE_URL}/api/users/pending-registrations`, {
    headers: createHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch pending registrations');
  }

  return response.json();
}

export async function approveDoctorRegistration(userId: string, notes?: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/approve`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({ notes: notes || 'Approved by consultant' }),
  });

  if (!response.ok) {
    throw new Error('Failed to approve doctor registration');
  }
}

export async function rejectDoctorRegistration(userId: string, reason: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/reject`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({ rejection_reason: reason }),
  });

  if (!response.ok) {
    throw new Error('Failed to reject doctor registration');
  }
}

// Ward Management APIs
export async function createWard(wardName: string, location: string, consultantId: string): Promise<Ward> {
  const response = await fetch(`${API_BASE_URL}/api/wards/`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({
      name: wardName,
      location: location,
      consultant_id: consultantId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create ward');
  }

  return response.json();
}

export async function getConsultantWards(consultantId: string): Promise<Ward[]> {
  const response = await fetch(`${API_BASE_URL}/api/consultants/${consultantId}/wards`, {
    headers: createHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch consultant wards');
  }

  return response.json();
}

export async function getWardPatients(wardId: string): Promise<Patient[]> {
  const response = await fetch(`${API_BASE_URL}/api/wards/${wardId}/patients`, {
    headers: createHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch ward patients');
  }

  return response.json();
}

export async function getWardBHTRecords(wardId: string): Promise<BHTRecord[]> {
  const response = await fetch(`${API_BASE_URL}/api/wards/${wardId}/bht_records`, {
    headers: createHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch ward BHT records');
  }

  return response.json();
}

// BHT Records APIs
export interface BHTRecordsFilters {
  ward_id?: string;
  patient_id?: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
}

export async function listBHTRecords(filters?: BHTRecordsFilters): Promise<BHTRecord[]> {
  const params = new URLSearchParams();
  
  if (filters?.ward_id) params.append('ward_id', filters.ward_id);
  if (filters?.patient_id) params.append('patient_id', filters.patient_id);
  if (filters?.status) params.append('status', filters.status);

  const url = `${API_BASE_URL}/api/bht_records/${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: createHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch BHT records');
  }

  return response.json();
}

// Error handling wrapper
export async function withErrorHandling<T>(
  apiCall: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }
}
