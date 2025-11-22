import React from 'react';

export type UserRole = 'patient' | 'admin';

export interface UserBasicInfo {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
}

export interface PatientProfile {
  id: number;
  user_id: number;
  // User fields (for updates)
  email?: string;
  phone?: string;
  // Patient fields
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_type?: string;
  height?: number;
  weight?: number;
  status: 'stable' | 'critical' | 'under_observation';
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  assigned_admin_id?: number;
  created_at: string;
  updated_at?: string;
  user?: UserBasicInfo;
  adherence?: number; // percentage 0-100
  active_meds?: string[]; // array of active medication names
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (userData: { fullName: string; email: string; phone?: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
}

export interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}