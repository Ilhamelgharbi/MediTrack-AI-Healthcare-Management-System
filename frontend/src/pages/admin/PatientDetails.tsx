import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PatientAvatar, StatusBadge, AgeDisplay } from '@/components/patient';
import { patientsAPI } from '../../services/patient.service';
import type { PatientProfile } from '../../types/patient.types';
import {
  ArrowLeft, Edit2, Mail, Smartphone, Loader2, AlertTriangle
} from 'lucide-react';
import { PatientProfileTabs } from '../../components/patient/PatientProfileTabs';

const PatientDetailsPage = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  // Patient state
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<PatientProfile & {email?: string, phone?: string}>>({});

  // Fetch patient data on mount
  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
    }
  }, [patientId]);

  const fetchPatientDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientsAPI.getPatientById(parseInt(patientId!));
      setPatient(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patient details');
      console.error('Error fetching patient:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/patients')} leftIcon={<ArrowLeft size={16} />}>
              Back to Patients
            </Button>
          </div>
          <Card className="p-8 text-center">
            <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-600">Loading patient details...</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !patient) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/patients')} leftIcon={<ArrowLeft size={16} />}>
              Back to Patients
            </Button>
          </div>
          <Card className="p-8 text-center">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error || 'Patient not found'}</p>
            <Button onClick={() => navigate('/admin/patients')}>Back to Patients</Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/patients')} leftIcon={<ArrowLeft size={16} />}>
              Back to Patients
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Patient Details</h1>
              <p className="text-slate-500">Manage patient information and medical records</p>
            </div>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} leftIcon={<Edit2 size={16} />}>
              Edit Patient
            </Button>
          )}
        </div>

        {/* Patient Header */}
        <Card className="p-6">
          <div className="flex items-center gap-6">
            <PatientAvatar fullName={patient.user?.full_name} size="lg" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{patient.user?.full_name}</h2>
              <div className="flex items-center gap-4 mt-2 text-slate-600">
                <span className="flex items-center gap-1"><Mail size={14} /> {patient.user?.email}</span>
                <span className="flex items-center gap-1"><Smartphone size={14} /> {patient.user?.phone || 'Not provided'}</span>
                <AgeDisplay dateOfBirth={patient.date_of_birth} />
              </div>
              <div className="mt-3">
                <StatusBadge status={patient.status} />
              </div>
            </div>
          </div>
        </Card>

        {/* Patient Profile Tabs */}
        <PatientProfileTabs
          patient={patient}
          userRole="admin"
          isEditing={isEditing}
          saving={saving}
          editFormData={editFormData}
          onEditToggle={() => setIsEditing(!isEditing)}
          onSave={() => {
            // TODO: Implement save functionality
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
          onFormDataChange={(field, value) => {
            setEditFormData(prev => ({ ...prev, [field]: value }));
          }}
          error={error}
          onErrorDismiss={() => setError(null)}
        />
      </div>
    </DashboardLayout>
  );
};

export default PatientDetailsPage;