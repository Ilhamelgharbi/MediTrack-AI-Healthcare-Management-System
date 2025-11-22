import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import {
  User, Pill, Activity, ChevronLeft, Edit2, Save, Plus,
  Trash2, Clock, AlertTriangle, CheckCircle, Calendar,
  FileText, Heart, Scissors, Stethoscope, Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { patientsAPI } from '../../services/patients';
import { PatientProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';

const PatientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'medications' | 'analytics'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<PatientProfile>>({});

  // Mock data for analytics (since we don't have real analytics yet)
  const adherenceData = [
    { day: 'Mon', score: 90, missed: 0 },
    { day: 'Tue', score: 100, missed: 0 },
    { day: 'Wed', score: 80, missed: 1 },
    { day: 'Thu', score: 100, missed: 0 },
    { day: 'Fri', score: 70, missed: 1 },
    { day: 'Sat', score: 100, missed: 0 },
    { day: 'Sun', score: 100, missed: 0 },
  ];

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError(null);

        let patientData: PatientProfile;

        // Check if current user is a patient viewing their own profile
        // If id is undefined/null, we're on /patients/me route (patient viewing own profile)
        // If id is a number string, we're on /patients/:id route (admin viewing patient)
        const isPatientViewingOwnProfile = user?.role === 'patient' && (!id || id === 'me');

        console.log('Fetching patient data:', { id, userRole: user?.role, isPatientViewingOwnProfile });

        if (isPatientViewingOwnProfile) {
          // Use /me/profile endpoint for patients viewing their own profile
          console.log('Calling getMyProfile()');
          patientData = await patientsAPI.getMyProfile();
        } else if (id) {
          // Use admin endpoint for admins viewing patient details
          console.log('Calling getPatientById:', parseInt(id));
          patientData = await patientsAPI.getPatientById(parseInt(id));
        } else {
          // Should not happen - admin without patient ID
          throw new Error('No patient ID provided for admin view');
        }

        console.log('Patient data received:', patientData);

        // Ensure we have the correct data structure
        if (!patientData) {
          throw new Error('No patient data received');
        }

        // Add mock adherence and active meds (60-100% range)
        const mockAdherence = Math.floor(Math.random() * 40) + 60;
        const mockActiveMeds = patientData.current_medications
          ? patientData.current_medications.split(', ').slice(0, Math.min(4, patientData.current_medications.split(', ').length))
          : [];

        // Create properly typed patient object
        const enhancedPatient: PatientProfile = {
          ...patientData,
          adherence: mockAdherence,
          active_meds: mockActiveMeds
        };

        setPatient(enhancedPatient);
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError(err instanceof Error ? err.message : 'Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, user]);

  const calculateAge = (dateOfBirth?: string): number | null => {
    if (!dateOfBirth) return null;
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-700 border-green-200';
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'under_observation': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 80) return 'text-green-600';
    if (adherence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSaveProfile = async () => {
    if (!patient) return;

    try {
      setSaving(true);
      setError(null);

      // Validate Moroccan phone number format if phone is being updated
      if (editFormData.phone) {
        const moroccanPhoneRegex = /^(\+212|0)[5-7]\d{8}$/;
        if (!moroccanPhoneRegex.test(editFormData.phone.replace(/\s/g, ''))) {
          throw new Error('Invalid Moroccan phone number. Format: +212XXXXXXXXX or 0XXXXXXXXX (must start with 5, 6, or 7)');
        }
      }

      // Validate email format if email is being updated
      if (editFormData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editFormData.email)) {
          throw new Error('Invalid email format');
        }

        // Confirm email change
        if (editFormData.email !== patient.user?.email) {
          const confirmChange = window.confirm(
            `Are you sure you want to change the email from "${patient.user?.email}" to "${editFormData.email}"?\n\nThis will be used for login and communication.`
          );
          if (!confirmChange) {
            setSaving(false);
            return;
          }
        }
      }

      // Determine if this is a patient self-update or admin update
      const isPatientSelfUpdate = user?.role === 'patient' && (!id || id === 'me');
      
      let updatedPatient: PatientProfile;
      
      if (isPatientSelfUpdate) {
        // Patient updating their own profile
        console.log('Patient updating own profile');
        updatedPatient = await patientsAPI.updateMyProfile(editFormData);
      } else if (user?.role === 'admin' && patient.id) {
        // Admin updating patient profile
        console.log('Admin updating patient profile:', patient.id);
        updatedPatient = await patientsAPI.updatePatientByAdmin(patient.id, editFormData);
      } else {
        throw new Error('Unauthorized to update this profile');
      }

      // Update the local state with the response
      setPatient(updatedPatient);
      setIsEditingProfile(false);
      setEditFormData({});
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = () => {
    if (isEditingProfile) {
      handleSaveProfile();
    } else {
      // Initialize form data with current patient data
      setEditFormData({
        email: patient?.user?.email,
        phone: patient?.user?.phone,
        weight: patient?.weight,
        height: patient?.height,
        blood_type: patient?.blood_type,
        gender: patient?.gender,
        date_of_birth: patient?.date_of_birth,
        allergies: patient?.allergies,
        medical_history: patient?.medical_history,
        current_medications: patient?.current_medications,
      });
      setIsEditingProfile(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditFormData({});
    setError(null);
  };

  const updateFormData = (field: keyof PatientProfile, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin h-6 w-6" />
          <span>Loading patient details...</span>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Patient</h2>
          <p className="text-gray-600 mb-4">{error || 'Patient not found'}</p>
          <Button onClick={() => navigate('/patients')}>
            Back to Patients
          </Button>
        </div>
      </div>
    );
  }

  const age = calculateAge(patient.date_of_birth);

  const isPatientViewingOwnProfile = user?.role === 'patient' && (!id || id === 'me');
  const canEdit = isPatientViewingOwnProfile || user?.role === 'admin';

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-10">
        {/* Top Nav */}
        {isPatientViewingOwnProfile ? (
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4">
              <ChevronLeft size={18} /> Back to Dashboard
          </button>
        ) : (
          <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4">
              <ChevronLeft size={18} /> Back to Patients
          </button>
        )}

        {/* Patient Header Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden flex-shrink-0">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.user?.full_name || 'Patient'}`}
                  alt={patient.user?.full_name || 'Patient'}
                  className="w-full h-full object-cover"
                />
            </div>
            <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900">
                      {patient.user?.full_name || 'Unknown Patient'}
                    </h1>
                    {!isPatientViewingOwnProfile && (
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(patient.status)}`}>
                        {patient.status.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500 text-sm">
                    {age && <span className="flex items-center gap-1"><User size={14} /> {age} yrs</span>}
                    {patient.weight && patient.height && (
                      <span className="flex items-center gap-1"><Activity size={14} /> {patient.weight}kg • {patient.height}cm</span>
                    )}
                    {patient.blood_type && <span className="flex items-center gap-1"><Heart size={14} /> {patient.blood_type}</span>}
                    {patient.adherence && (
                      <span className={`flex items-center gap-1 ${getAdherenceColor(patient.adherence)}`}>
                        <CheckCircle size={14} /> {patient.adherence}% Adherence
                      </span>
                    )}
                </div>
            </div>
            <div className="flex gap-3">
                {canEdit && (
                  <>
                    <Button 
                      variant="secondary" 
                      icon={isEditingProfile ? <Save size={18}/> : <Edit2 size={18}/>}
                      onClick={handleEditClick}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : (isEditingProfile ? 'Save Changes' : 'Edit Profile')}
                    </Button>
                    {isEditingProfile && (
                      <Button 
                        variant="outline" 
                        onClick={handleCancelEdit}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    )}
                  </>
                )}
                {!isPatientViewingOwnProfile && user?.role === 'admin' && (
                  <>
                    <Button variant="secondary" icon={<FileText size={18}/>}>Reports</Button>
                    <Button icon={<Pill size={18}/>}>Prescribe</Button>
                  </>
                )}
                {isPatientViewingOwnProfile && !isEditingProfile && (
                  <Button icon={<FileText size={18}/>}>View Reports</Button>
                )}
            </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 flex gap-8">
            <button
                onClick={() => setActiveTab('profile')}
                className={`pb-4 px-2 font-medium text-sm transition-all relative ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Clinical Profile
                {activeTab === 'profile' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
            </button>
            <button
                onClick={() => setActiveTab('medications')}
                className={`pb-4 px-2 font-medium text-sm transition-all relative ${activeTab === 'medications' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Medication Management
                {activeTab === 'medications' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
            </button>
            <button
                onClick={() => setActiveTab('analytics')}
                className={`pb-4 px-2 font-medium text-sm transition-all relative ${activeTab === 'analytics' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Adherence Analytics
                {activeTab === 'analytics' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
            </button>
        </div>

        {/* Tab Content */}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* TAB 1: CLINICAL PROFILE */}
        {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                {/* Vitals & Stats */}
                <div className="space-y-6">
                     <Card title="Vitals & Attributes">
                         <div className="space-y-4">
                             {isEditingProfile ? (
                               <>
                                 <div className="space-y-2">
                                   <label className="text-slate-500 text-sm">Weight (kg)</label>
                                   <Input
                                     type="number"
                                     value={editFormData.weight || ''}
                                     onChange={(e) => updateFormData('weight', parseFloat(e.target.value) || undefined)}
                                     placeholder="Enter weight"
                                   />
                                 </div>
                                 <div className="space-y-2">
                                   <label className="text-slate-500 text-sm">Height (cm)</label>
                                   <Input
                                     type="number"
                                     value={editFormData.height || ''}
                                     onChange={(e) => updateFormData('height', parseFloat(e.target.value) || undefined)}
                                     placeholder="Enter height"
                                   />
                                 </div>
                               </>
                             ) : (
                               <>
                                 {patient.weight && (
                                   <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                       <span className="text-slate-500 text-sm">Weight</span>
                                       <span className="font-bold text-slate-900">{patient.weight} kg</span>
                                   </div>
                                 )}
                                 {patient.height && (
                                   <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                       <span className="text-slate-500 text-sm">Height</span>
                                       <span className="font-bold text-slate-900">{patient.height} cm</span>
                                   </div>
                                 )}
                               </>
                             )}
                             {isEditingProfile ? (
                               <>
                                 <div className="space-y-2">
                                   <label className="text-slate-500 text-sm">Blood Type</label>
                                   <select
                                     value={editFormData.blood_type || ''}
                                     onChange={(e) => updateFormData('blood_type', e.target.value)}
                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   >
                                     <option value="">Select blood type</option>
                                     <option value="A+">A+</option>
                                     <option value="A-">A-</option>
                                     <option value="B+">B+</option>
                                     <option value="B-">B-</option>
                                     <option value="AB+">AB+</option>
                                     <option value="AB-">AB-</option>
                                     <option value="O+">O+</option>
                                     <option value="O-">O-</option>
                                   </select>
                                 </div>
                                 <div className="space-y-2">
                                   <label className="text-slate-500 text-sm">Gender</label>
                                   <select
                                     value={editFormData.gender || ''}
                                     onChange={(e) => updateFormData('gender', e.target.value as 'male' | 'female' | 'other')}
                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   >
                                     <option value="">Select gender</option>
                                     <option value="male">Male</option>
                                     <option value="female">Female</option>
                                   </select>
                                 </div>
                                 <div className="space-y-2">
                                   <label className="text-slate-500 text-sm">Date of Birth</label>
                                   <Input
                                     type="date"
                                     value={editFormData.date_of_birth || ''}
                                     onChange={(e) => updateFormData('date_of_birth', e.target.value)}
                                   />
                                 </div>
                               </>
                             ) : (
                               <>
                                 {patient.blood_type && (
                                   <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                       <span className="text-slate-500 text-sm">Blood Type</span>
                                       <span className="font-bold text-slate-900">{patient.blood_type}</span>
                                   </div>
                                 )}
                                 {patient.gender && (
                                   <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                       <span className="text-slate-500 text-sm">Gender</span>
                                       <span className="font-bold text-slate-900">{patient.gender}</span>
                                   </div>
                                 )}
                                 {patient.date_of_birth && (
                                   <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                       <span className="text-slate-500 text-sm">Date of Birth</span>
                                       <span className="font-bold text-slate-900">{new Date(patient.date_of_birth).toLocaleDateString()}</span>
                                   </div>
                                 )}
                               </>
                             )}
                         </div>
                     </Card>

                     {/* Contact Information */}
                     <Card title="Contact Information">
                         <div className="space-y-3">
                             {isEditingProfile ? (
                               <>
                                 <div className="space-y-2">
                                   <label className="text-slate-500 text-sm">Email</label>
                                   <Input
                                     type="email"
                                     value={editFormData.email || patient.user?.email || ''}
                                     onChange={(e) => updateFormData('email', e.target.value)}
                                     placeholder="Enter email"
                                   />
                                 </div>
                                 <div className="space-y-2">
                                   <label className="text-slate-500 text-sm">Phone (Moroccan)</label>
                                   <Input
                                     type="tel"
                                     value={editFormData.phone || patient.user?.phone || ''}
                                     onChange={(e) => updateFormData('phone', e.target.value)}
                                     placeholder="+212XXXXXXXXX or 0XXXXXXXXX"
                                   />
                                   <p className="text-xs text-slate-500">Format: +212 followed by 9 digits starting with 5, 6, or 7</p>
                                 </div>
                               </>
                             ) : (
                               <>
                                 <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                     <span className="text-slate-500 text-sm">Email</span>
                                     <span className="font-bold text-slate-900 text-sm">{patient.user?.email}</span>
                                 </div>
                                 {patient.user?.phone && (
                                   <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                       <span className="text-slate-500 text-sm">Phone</span>
                                       <span className="font-bold text-slate-900">{patient.user?.phone}</span>
                                   </div>
                                 )}
                               </>
                             )}
                         </div>
                     </Card>

                     {/* Patient Status (Admin Only) */}
                     {user?.role === 'admin' && (
                       <Card title="Patient Status">
                         <div className="space-y-3">
                           {isEditingProfile ? (
                             <div className="space-y-2">
                               <label className="text-slate-500 text-sm">Status</label>
                               <select
                                 value={editFormData.status || patient.status}
                                 onChange={(e) => updateFormData('status', e.target.value as 'stable' | 'critical' | 'under_observation')}
                                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                               >
                                 <option value="stable">Stable</option>
                                 <option value="critical">Critical</option>
                                 <option value="under_observation">Under Observation</option>
                               </select>
                             </div>
                           ) : (
                             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                               <span className="text-slate-500 text-sm">Current Status</span>
                               <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(patient.status)}`}>
                                 {patient.status.replace('_', ' ').toUpperCase()}
                               </span>
                             </div>
                           )}
                         </div>
                       </Card>
                     )}
                </div>

                {/* History & Notes */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Medical History">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <AlertTriangle size={14} className="text-amber-500"/> Allergies
                                    </h4>
                                    {isEditingProfile ? (
                                      <textarea
                                        value={editFormData.allergies || ''}
                                        onChange={(e) => updateFormData('allergies', e.target.value)}
                                        placeholder="List any allergies..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        rows={3}
                                        maxLength={500}
                                      />
                                    ) : (
                                      <div className="p-3 bg-amber-50 text-amber-800 rounded-lg border border-amber-100 text-sm font-medium">
                                          {patient.allergies || 'No known allergies'}
                                      </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Stethoscope size={14} className="text-blue-500"/> Medical History
                                    </h4>
                                    {isEditingProfile ? (
                                      <textarea
                                        value={editFormData.medical_history || ''}
                                        onChange={(e) => updateFormData('medical_history', e.target.value)}
                                        placeholder="Enter medical history..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        rows={3}
                                        maxLength={2000}
                                      />
                                    ) : (
                                      <div className="p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 text-sm font-medium">
                                          {patient.medical_history || 'No medical history recorded'}
                                      </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Pill size={14} className="text-green-500"/> Current Medications
                                </h4>
                                {isEditingProfile ? (
                                  <textarea
                                    value={editFormData.current_medications || ''}
                                    onChange={(e) => updateFormData('current_medications', e.target.value)}
                                    placeholder="List current medications..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    rows={3}
                                    maxLength={1000}
                                  />
                                ) : (
                                  <div className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-100 text-sm font-medium">
                                      {patient.current_medications || 'No current medications'}
                                  </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Active Medications Summary */}
                    {patient.active_meds && patient.active_meds.length > 0 && (
                      <Card title="Active Medications Summary">
                          <div className="flex flex-wrap gap-2">
                              {patient.active_meds.map((med, index) => (
                                  <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200">
                                      <Pill size={12} />
                                      {med}
                                  </span>
                              ))}
                          </div>
                      </Card>
                    )}
                </div>
            </div>
        )}

        {/* TAB 2: MEDICATION MANAGEMENT */}
        {activeTab === 'medications' && (
            <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Medication Management</h3>
                    <Button icon={<Plus size={18}/>}>Add Medication</Button>
                </div>

                {patient.active_meds && patient.active_meds.length > 0 ? (
                  <Card title="Active Medications">
                      <div className="space-y-4">
                          {patient.active_meds.map((medication, index) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                          <Pill size={20} className="text-blue-600" />
                                      </div>
                                      <div>
                                          <h4 className="font-medium text-slate-900">{medication}</h4>
                                          <p className="text-sm text-slate-500">Active prescription</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded border border-green-200">ACTIVE</span>
                                      <Button variant="ghost" size="sm">Edit</Button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </Card>
                ) : (
                  <Card>
                      <div className="text-center py-8">
                          <Pill size={48} className="text-slate-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Medications</h3>
                          <p className="text-slate-500 mb-4">This patient has no active medication prescriptions.</p>
                          <Button icon={<Plus size={18}/>}>Add First Medication</Button>
                      </div>
                  </Card>
                )}
            </div>
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === 'analytics' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                 <Card title="Adherence Overview" subtitle="Past 7 Days">
                    <div className="h-64 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={adherenceData}>
                                <defs>
                                    <linearGradient id="colorAdhere" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2A7EF0" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#2A7EF0" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Area type="monotone" dataKey="score" stroke="#2A7EF0" strokeWidth={3} fillOpacity={1} fill="url(#colorAdhere)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                 </Card>

                 <Card title="Adherence Summary" subtitle={`Current: ${patient.adherence || 0}%`}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Overall Adherence</span>
                            <span className={`text-lg font-bold ${getAdherenceColor(patient.adherence || 0)}`}>
                                {patient.adherence || 0}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    (patient.adherence || 0) >= 80 ? 'bg-green-500' :
                                    (patient.adherence || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(patient.adherence || 0, 100)}%` }}
                            ></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                <div className="text-2xl font-bold text-green-600">{patient.active_meds?.length || 0}</div>
                                <div className="text-xs text-green-700">Active Meds</div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="text-2xl font-bold text-blue-600">{patient.status === 'stable' ? 'Good' : 'Monitor'}</div>
                                <div className="text-xs text-blue-700">Status</div>
                            </div>
                        </div>
                    </div>
                 </Card>

                 <div className="lg:col-span-2">
                     <Card title="Clinical Notes" subtitle="Patient monitoring and observations">
                         <div className="space-y-4">
                             <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                 <div className="flex items-start gap-3">
                                     <CheckCircle size={18} className="text-green-500 mt-0.5" />
                                     <div>
                                         <p className="text-sm font-bold text-slate-800">Patient Status: {patient.status.replace('_', ' ').toUpperCase()}</p>
                                         <p className="text-sm text-slate-600">
                                             {patient.status === 'stable' ? 'Patient is responding well to current treatment plan.' :
                                              patient.status === 'critical' ? 'Patient requires immediate attention and monitoring.' :
                                              'Patient requires close monitoring and regular check-ups.'}
                                         </p>
                                     </div>
                                 </div>
                             </div>

                             {patient.adherence && patient.adherence < 80 && (
                               <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                   <div className="flex items-start gap-3">
                                       <AlertTriangle size={18} className="text-amber-500 mt-0.5" />
                                       <div>
                                           <p className="text-sm font-bold text-amber-800">Adherence Alert</p>
                                           <p className="text-sm text-amber-700">Patient adherence is below 80%. Consider additional reminders or follow-up.</p>
                                       </div>
                                   </div>
                               </div>
                             )}
                         </div>
                     </Card>
                 </div>
             </div>
        )}
    </div>
  );
};

export default PatientDetailsPage;