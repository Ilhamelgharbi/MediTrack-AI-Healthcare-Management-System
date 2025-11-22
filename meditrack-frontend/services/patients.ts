import { PatientProfile } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

class PatientsAPI {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('meditrack_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getAllPatients(search?: string, statusFilter?: string, sort?: string): Promise<PatientProfile[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status_filter', statusFilter);
      if (sort) params.append('sort', sort);

      const queryString = params.toString();
      const url = `${API_BASE_URL}/patients/${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch patients: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  async getPatientById(patientId: number): Promise<PatientProfile> {
    try {
      console.log(`[API] Fetching patient by ID: ${patientId}`);
      const url = `${API_BASE_URL}/patients/${patientId}`;
      console.log(`[API] URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      console.log(`[API] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API] Error response:`, errorText);
        throw new Error(`Failed to fetch patient: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[API] Patient data received:`, data);
      return data;
    } catch (error) {
      console.error('[API] Error fetching patient:', error);
      throw error;
    }
  }

  async getMyProfile(): Promise<PatientProfile> {
    try {
      console.log('[API] Fetching my profile');
      const url = `${API_BASE_URL}/patients/me/profile`;
      console.log(`[API] URL: ${url}`);
      const headers = this.getAuthHeaders();
      console.log('[API] Headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : 'none' });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log(`[API] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API] Error response:`, errorText);
        throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[API] Profile data received:`, data);
      return data;
    } catch (error) {
      console.error('[API] Error fetching profile:', error);
      throw error;
    }
  }

  async updatePatientByAdmin(patientId: number, adminData: Partial<PatientProfile>): Promise<PatientProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/admin-update`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update patient: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  async updateMyProfile(patientData: Partial<PatientProfile>): Promise<PatientProfile> {
    try {
      console.log('[API] Updating my profile with data:', patientData);
      const url = `${API_BASE_URL}/patients/me/profile`;
      console.log(`[API] URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(patientData),
      });

      console.log(`[API] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API] Error response:`, errorText);
        throw new Error(`Failed to update profile: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[API] Updated profile data:`, data);
      return data;
    } catch (error) {
      console.error('[API] Error updating profile:', error);
      throw error;
    }
  }
}

export const patientsAPI = new PatientsAPI();