import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Plus, Search, Filter, MoreHorizontal, ChevronRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { patientsAPI } from '../../services/patients';
import { PatientProfile } from '../../types';

const PatientsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientsAPI.getAllPatients();
      
      // Add mock data for adherence and active meds
      const patientsWithMockData = data.map(patient => ({
        ...patient,
        adherence: Math.floor(Math.random() * 40) + 45, // Random adherence 45-85%
        active_meds: [
          'Lisinopril 10mg',
          'Metformin 500mg',
          'Atorvastatin 20mg',
          'Amlodipine 5mg',
          'Omeprazole 20mg'
        ].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1) // 1-3 random meds
      }));
      
      setPatients(patientsWithMockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patients');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'stable': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'critical': return 'bg-red-50 text-red-700 border-red-100';
      case 'under_observation': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  // const getAdherenceColor = (adherence: number) => {
  //   if (adherence >= 80) return 'text-emerald-600'; // Green for high adherence
  //   if (adherence < 60) return 'text-red-600'; // Red for low adherence
  //   return 'text-amber-600'; // Yellow/Orange for medium adherence
  // };

  // const getAdherenceBarColor = (adherence: number) => {
  //   if (adherence >= 80) return 'bg-emerald-500'; // Green for high adherence
  //   if (adherence < 60) return 'bg-red-500'; // Red for low adherence
  //   return 'bg-amber-500'; // Yellow/Orange for medium adherence
  // };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'stable': return 'Stable';
      case 'critical': return 'Critical';
      case 'under_observation': return 'Under Observation';
      default: return status;
    }
  };

  const calculateAge = (dateOfBirth: string | undefined) => {
    if (!dateOfBirth) return 'N/A';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getPatientPhoto = (patient: PatientProfile) => {
    // Use user initials as fallback for avatar
    const initials = patient.user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.user?.full_name || patient.id}`;
  };

  // Filter patients based on search term and status filter
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = !searchTerm ||
      patient.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || patient.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patients Management</h1>
            <p className="text-slate-500">Loading patient records...</p>
          </div>
        </div>
        <Card className="p-8 text-center">
          <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading patients...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patients Management</h1>
            <p className="text-slate-500">Error loading patient records</p>
          </div>
        </div>
        <Card className="p-8 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchPatients}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Patients Management</h1>
            <p className="text-slate-500">View and manage patient records</p>
        </div>
        <Button icon={<Plus size={20} />}>Add Patient</Button>
      </div>

      <Card className="overflow-hidden p-0 border border-slate-200 shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-slate-50/50">
            <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search patients by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
                />
            </div>
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
            >
                <option value="">All Status</option>
                <option value="stable">Stable</option>
                <option value="under_observation">Under Observation</option>
                <option value="critical">Critical</option>
            </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Adherence</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Active Meds</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/patients/${patient.id}`)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img src={getPatientPhoto(patient)} alt={patient.user?.full_name} className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{patient.user?.full_name}</div>
                        <div className="text-sm text-slate-500">{patient.user?.email} • {calculateAge(patient.date_of_birth)} yrs</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(patient.status)}`}>
                      {patient.status === 'stable' ? <CheckCircle size={12} className="mr-1.5"/> : <AlertCircle size={12} className="mr-1.5"/>}
                      {getStatusDisplay(patient.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${patient.adherence > 80 ? 'bg-emerald-500' : patient.adherence > 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                style={{width: `${patient.adherence}%`}}
                            ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{patient.adherence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{(patient.active_meds || []).length} meds</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-blue-100 rounded-full text-slate-400 hover:text-blue-600 transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/patients/${patient.id}`); }}>
                        <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-sm text-slate-500">
            <span>Showing {filteredPatients.length} of {patients.length} patients</span>
            <div className="flex gap-2">
                <Button variant="secondary" className="py-1.5 px-3 text-xs" disabled>Previous</Button>
                <Button variant="secondary" className="py-1.5 px-3 text-xs" disabled>Next</Button>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default PatientsPage;