// API functions for doctor dashboard operations

const API_BASE = 'http://localhost:8000';

// Patient Management
export async function getMyPatients() {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE}/api/doctors/my-patients`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch patients');
  }
  
  return response.json();
}

export async function createPatient(data: {
  name: string;
  dob: string;
  gender: string;
  admission_date: string;
  ward_id: string;
}) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE}/api/patients/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create patient');
  }
  
  return response.json();
}

export async function getPatientDetails(patientId: string) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE}/api/patients/${patientId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch patient details');
  }
  
  return response.json();
}

export async function updatePatient(patientId: string, data: any) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE}/api/patients/${patientId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update patient');
  }
  
  return response.json();
}

// BHT Management
export async function uploadBHTRecord(patientId: string, doctorId: string, file: File) {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(
    `${API_BASE}/api/bht_records/upload?patient_id=${patientId}&doctor_id=${doctorId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to upload BHT record');
  }
  
  return response.json();
}

export async function getMyBHTRecords(status?: string) {
  const token = localStorage.getItem('access_token');
  const url = status 
    ? `${API_BASE}/api/doctors/my-bhts?status=${status}`
    : `${API_BASE}/api/doctors/my-bhts`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch BHT records');
  }
  
  return response.json();
}

export async function getPatientBHTRecords(patientId: string, status?: string) {
  const token = localStorage.getItem('access_token');
  const url = status
    ? `${API_BASE}/api/patients/${patientId}/bht_records?status=${status}`
    : `${API_BASE}/api/patients/${patientId}/bht_records`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch patient BHT records');
  }
  
  return response.json();
}

export async function updateBHTRecord(recordId: string, data: any) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE}/api/bht_records/${recordId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update BHT record');
  }
  
  return response.json();
}

// Ward Management
export async function getWardPatients(wardId: string) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE}/api/wards/${wardId}/patients`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch ward patients');
  }
  
  return response.json();
}

export async function getWardBHTRecords(wardId: string, status?: string) {
  const token = localStorage.getItem('access_token');
  const url = status
    ? `${API_BASE}/api/wards/${wardId}/bht_records?status=${status}`
    : `${API_BASE}/api/wards/${wardId}/bht_records`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch ward BHT records');
  }
  
  return response.json();
}

// Summary & Review
export async function generatePatientSummary(patientId: string) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }
  
  const response = await fetch(`${API_BASE}/api/patients/${patientId}/generate-summary`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('Authentication failed. Please login again.');
    }
    throw new Error(`Failed to generate summary: ${errorText}`);
  }
  
  return response.json();
}

export async function getPatientSummary(patientId: string) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }
  
  const response = await fetch(`${API_BASE}/api/patients/${patientId}/summary`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (response.status === 404) {
    return null; // No summary exists yet
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('Authentication failed. Please login again.');
    }
    throw new Error(`Failed to get summary: ${errorText}`);
  }
  
  return response.json();
}

export async function updatePatientSummary(patientId: string, summaryText: string) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }
  
  const response = await fetch(`${API_BASE}/api/patients/${patientId}/summary`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ summary_text: summaryText }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('Authentication failed. Please login again.');
    }
    throw new Error(`Failed to update summary: ${errorText}`);
  }
  
  return response.json();
}

export async function deletePatientSummary(patientId: string) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }
  
  const response = await fetch(`${API_BASE}/api/patients/${patientId}/summary`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('Authentication failed. Please login again.');
    }
    throw new Error(`Failed to delete summary: ${errorText}`);
  }
  
  return response.json();
}

export async function submitPatientForReview(patientId: string) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }
  
  const response = await fetch(`${API_BASE}/api/patients/${patientId}/submit-for-review`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('Authentication failed. Please login again.');
    }
    throw new Error(`Failed to submit for review: ${errorText}`);
  }
  
  return response.json();
}
