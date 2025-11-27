// src/services/adherence.service.ts
import api from './api';

export interface MedicationLog {
  id: number;
  patient_medication_id: number;
  patient_id: number;
  scheduled_time: string;
  scheduled_date: string;
  status: string;
  actual_time?: string;
  on_time: boolean;
  minutes_late?: number;
  notes?: string;
  skipped_reason?: string;
  logged_via: string;
  reminder_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface AdherenceStats {
  id: number;
  patient_id: number;
  patient_medication_id?: number;
  period_type: string;
  period_start: string;
  period_end: string;
  total_scheduled: number;
  total_taken: number;
  total_skipped: number;
  total_missed: number;
  adherence_score: number;
  on_time_score: number;
  current_streak: number;
  longest_streak: number;
  calculated_at: string;
}

export interface AdherenceChartData {
  date: string;
  score: number;
  taken: number;
  scheduled: number;
  status: string;
}

export interface AdherenceDashboard {
  overall_stats: AdherenceStats;
  weekly_stats: AdherenceStats;
  daily_stats: AdherenceStats;
  chart_data: AdherenceChartData[];
  recent_logs: MedicationLog[];
}

export const adherenceService = {
  // Get adherence stats for current patient
  getStats: async (
    period: 'daily' | 'weekly' | 'monthly' | 'overall' = 'weekly',
    patientMedicationId?: number
  ): Promise<AdherenceStats> => {
    const params = new URLSearchParams({ period });
    if (patientMedicationId) {
      params.append('patient_medication_id', patientMedicationId.toString());
    }
    const response = await api.get<AdherenceStats>(`/adherence/stats?${params}`);
    return response.data;
  },

  // Get chart data for visualization
  getChartData: async (days: number = 7): Promise<AdherenceChartData[]> => {
    const response = await api.get<AdherenceChartData[]>(`/adherence/chart?days=${days}`);
    return response.data;
  },

  // Get complete dashboard data
  getDashboard: async (): Promise<AdherenceDashboard> => {
    const response = await api.get<AdherenceDashboard>('/adherence/dashboard');
    return response.data;
  },

  // Log a medication dose
  logDose: async (data: {
    patient_medication_id: number;
    scheduled_time: string;
    status: 'taken' | 'skipped' | 'missed';
    actual_time?: string;
    notes?: string;
    skipped_reason?: string;
  }): Promise<MedicationLog> => {
    const response = await api.post<MedicationLog>('/adherence/logs', data);
    return response.data;
  },

  // Update existing log
  updateLog: async (
    logId: number,
    data: {
      status?: 'taken' | 'skipped' | 'missed';
      actual_time?: string;
      notes?: string;
      skipped_reason?: string;
    }
  ): Promise<MedicationLog> => {
    const response = await api.put<MedicationLog>(`/adherence/logs/${logId}`, data);
    return response.data;
  },

  // Get medication logs
  getLogs: async (params?: {
    patient_medication_id?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
    skip?: number;
    limit?: number;
  }): Promise<MedicationLog[]> => {
    const query = new URLSearchParams();
    if (params?.patient_medication_id) query.append('patient_medication_id', params.patient_medication_id.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.start_date) query.append('start_date', params.start_date);
    if (params?.end_date) query.append('end_date', params.end_date);
    if (params?.skip) query.append('skip', params.skip.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const response = await api.get<MedicationLog[]>(`/adherence/logs?${query}`);
    return response.data;
  },

  // Delete medication log
  deleteLog: async (logId: number): Promise<void> => {
    await api.delete(`/adherence/logs/${logId}`);
  },

  // Get adherence stats for a specific patient (admin only)
  getPatientAdherenceStats: async (
    patientId: number,
    period: 'daily' | 'weekly' | 'monthly' | 'overall' = 'weekly'
  ): Promise<AdherenceStats> => {
    const response = await api.get<AdherenceStats>(`/adherence/patients/${patientId}/stats?period=${period}`);
    return response.data;
  },

  // Get patient dashboard (admin only)
  getPatientDashboard: async (patientId: number): Promise<AdherenceDashboard> => {
    const response = await api.get<AdherenceDashboard>(`/adherence/patients/${patientId}/dashboard`);
    return response.data;
  },

  // Get patient logs (admin only)
  getPatientLogs: async (
    patientId: number,
    params?: {
      patient_medication_id?: number;
      status?: string;
      start_date?: string;
      end_date?: string;
      skip?: number;
      limit?: number;
    }
  ): Promise<MedicationLog[]> => {
    const query = new URLSearchParams();
    if (params?.patient_medication_id) query.append('patient_medication_id', params.patient_medication_id.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.start_date) query.append('start_date', params.start_date);
    if (params?.end_date) query.append('end_date', params.end_date);
    if (params?.skip) query.append('skip', params.skip.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const response = await api.get<MedicationLog[]>(`/adherence/patients/${patientId}/logs?${query}`);
    return response.data;
  },
};