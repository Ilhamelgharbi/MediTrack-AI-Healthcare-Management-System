import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { 
  User, Pill, Activity, ChevronLeft, Edit2, Save, Plus, 
  Trash2, Clock, AlertTriangle, CheckCircle, Calendar, 
  FileText, Heart, Scissors, Stethoscope
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const PatientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'medications' | 'analytics'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Mock Data for specific patient
  const [patient, setPatient] = useState({
      id: 1,
      name: 'Sarah Connor',
      age: 42,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      weight: '65',
      height: '170',
      bloodType: 'O-',
      allergies: 'Penicillin',
      surgeries: 'Appendectomy (2010)',
      chronicDiseases: 'Hypertension',
      notes: 'Patient is responsive to treatment but struggles with morning adherence.'
  });

  const [medications, setMedications] = useState([
      { id: '1', name: 'Lisinopril', dosage: '10mg', frequency: 'Once Daily', adherence: 95, status: 'Active', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200', instructions: 'Take in the morning' },
      { id: '2', name: 'Metformin', dosage: '500mg', frequency: 'Twice Daily', adherence: 88, status: 'Active', img: '', instructions: 'Take with food' }
  ]);

  const adherenceData = [
    { day: 'Mon', score: 90, missed: 0 },
    { day: 'Tue', score: 100, missed: 0 },
    { day: 'Wed', score: 80, missed: 1 },
    { day: 'Thu', score: 100, missed: 0 },
    { day: 'Fri', score: 70, missed: 1 },
    { day: 'Sat', score: 100, missed: 0 },
    { day: 'Sun', score: 100, missed: 0 },
  ];

  const handleSaveProfile = () => {
      setIsEditingProfile(false);
      // API Call would go here
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-10">
        {/* Top Nav */}
        <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4">
            <ChevronLeft size={18} /> Back to Patients
        </button>

        {/* Patient Header Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden flex-shrink-0">
                <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900">{patient.name}</h1>
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold border border-emerald-200">Stable Condition</span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500 text-sm">
                    <span className="flex items-center gap-1"><User size={14} /> {patient.age} yrs</span>
                    <span className="flex items-center gap-1"><Activity size={14} /> {patient.weight}kg • {patient.height}cm</span>
                    <span className="flex items-center gap-1"><Heart size={14} /> {patient.bloodType}</span>
                </div>
            </div>
            <div className="flex gap-3">
                <Button variant="secondary" icon={<FileText size={18}/>}>Reports</Button>
                <Button icon={<Pill size={18}/>}>Prescribe</Button>
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
        
        {/* TAB 1: CLINICAL PROFILE */}
        {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                {/* Vitals & Stats */}
                <div className="space-y-6">
                     <Card title="Vitals & Attributes">
                         <div className="space-y-4">
                             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                 <span className="text-slate-500 text-sm">Weight</span>
                                 {isEditingProfile ? (
                                     <input className="w-20 p-1 text-right border rounded bg-white" defaultValue={patient.weight} />
                                 ) : (
                                     <span className="font-bold text-slate-900">{patient.weight} kg</span>
                                 )}
                             </div>
                             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                 <span className="text-slate-500 text-sm">Height</span>
                                 {isEditingProfile ? (
                                     <input className="w-20 p-1 text-right border rounded bg-white" defaultValue={patient.height} />
                                 ) : (
                                     <span className="font-bold text-slate-900">{patient.height} cm</span>
                                 )}
                             </div>
                             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                 <span className="text-slate-500 text-sm">Blood Type</span>
                                 <span className="font-bold text-slate-900">{patient.bloodType}</span>
                             </div>
                         </div>
                     </Card>
                </div>

                {/* History & Notes */}
                <div className="lg:col-span-2 space-y-6">
                    <Card 
                        title="Medical History" 
                        action={
                            <Button 
                                variant="ghost" 
                                className="h-8 text-sm"
                                onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
                            >
                                {isEditingProfile ? <Save size={16} className="mr-2"/> : <Edit2 size={16} className="mr-2"/>}
                                {isEditingProfile ? 'Save Changes' : 'Edit Info'}
                            </Button>
                        }
                    >
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <AlertTriangle size={14} className="text-amber-500"/> Allergies
                                    </h4>
                                    {isEditingProfile ? (
                                        <Input defaultValue={patient.allergies} />
                                    ) : (
                                        <div className="p-3 bg-amber-50 text-amber-800 rounded-lg border border-amber-100 text-sm font-medium">
                                            {patient.allergies}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Stethoscope size={14} className="text-blue-500"/> Chronic Diseases
                                    </h4>
                                    {isEditingProfile ? (
                                        <Input defaultValue={patient.chronicDiseases} />
                                    ) : (
                                        <div className="p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 text-sm font-medium">
                                            {patient.chronicDiseases}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Scissors size={14} className="text-slate-500"/> Past Surgeries
                                    </h4>
                                    {isEditingProfile ? (
                                        <Input defaultValue={patient.surgeries} />
                                    ) : (
                                        <div className="p-3 bg-slate-50 text-slate-700 rounded-lg border border-slate-100 text-sm font-medium">
                                            {patient.surgeries}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Clinical Notes</h4>
                                {isEditingProfile ? (
                                    <textarea className="w-full border border-slate-200 rounded-lg p-3 text-sm" rows={4} defaultValue={patient.notes}></textarea>
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 italic leading-relaxed">
                                        "{patient.notes}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        )}

        {/* TAB 2: MEDICATION MANAGEMENT */}
        {activeTab === 'medications' && (
            <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Current Prescriptions</h3>
                    <Button icon={<Plus size={18}/>}>Add Medication</Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {medications.map((med) => (
                        <div key={med.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0">
                                {med.img ? <img src={med.img} alt={med.name} className="w-full h-full object-cover rounded-lg" /> : <Pill size={32}/>}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-lg font-bold text-slate-900">{med.name}</h4>
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase">{med.dosage}</span>
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded uppercase border border-emerald-200">Active</span>
                                </div>
                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500"/> {med.frequency}</span>
                                    <span className="flex items-center gap-1.5"><FileText size={14} className="text-slate-400"/> {med.instructions}</span>
                                    <span className="flex items-center gap-1.5"><Activity size={14} className={med.adherence > 90 ? 'text-emerald-500' : 'text-amber-500'}/> {med.adherence}% Adherence</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                                <Button variant="secondary" className="flex-1 md:flex-none text-xs h-9">Edit Schedule</Button>
                                <Button variant="ghost" className="text-red-500 hover:bg-red-50 h-9 w-9 p-0"><Trash2 size={18}/></Button>
                            </div>
                        </div>
                    ))}
                </div>
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

                 <Card title="Missed Doses Analysis" subtitle="Frequency by day">
                    <div className="h-64 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={adherenceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="missed" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                 </Card>

                 <div className="lg:col-span-2">
                     <Card title="Doctor's Notes & Effectiveness" subtitle="Clinical observations on adherence">
                         <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                             <div className="flex items-start gap-3">
                                 <AlertTriangle size={18} className="text-amber-500 mt-0.5" />
                                 <div>
                                     <p className="text-sm font-bold text-slate-800">Mid-week Adherence Drop</p>
                                     <p className="text-sm text-slate-600">Patient tends to miss evening doses on Wednesdays and Fridays. Consider adjusting schedule or sending extra reminders.</p>
                                 </div>
                             </div>
                         </div>
                     </Card>
                 </div>
             </div>
        )}
    </div>
  );
};

export default PatientDetailsPage;