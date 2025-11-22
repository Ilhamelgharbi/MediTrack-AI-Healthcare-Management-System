import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { 
  Edit2, Mail, Smartphone, Ruler, Weight, Calendar, Droplet, 
  AlertCircle, FileText, Upload, Activity, Heart, Scissors, 
  Stethoscope, Plus, X, Save, ShieldCheck, Download, Brain,
  Database, ScanLine, Trash2, Eye, Search, CheckCircle, FileCheck,
  Image as ImageIcon, Sparkles, FileCode, User
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);

  // --- PATIENT STATE ---
  const [patientProfile, setPatientProfile] = useState({
    age: '32',
    weight: '75',
    height: '180',
    bloodType: 'A+',
    allergies: 'Penicillin, Peanuts',
    conditions: 'Mild Asthma',
    heartConditions: 'None',
    surgeries: 'ACL Reconstruction (2018)',
    chronicDiseases: 'None'
  });

  const [patientReports, setPatientReports] = useState([
      { id: 1, name: 'Blood_Work_Oct2023.pdf', date: 'Oct 24, 2023', type: 'Lab Result', size: '1.2 MB' },
      { id: 2, name: 'Cardiology_Report.pdf', date: 'Sep 10, 2023', type: 'Specialist', size: '850 KB' },
      { id: 3, name: 'Annual_Physical.pdf', date: 'Jan 15, 2023', type: 'General', size: '2.4 MB' }
  ]);

  // --- DOCTOR / ADMIN STATE ---
  const [activeDocTab, setActiveDocTab] = useState<'profile' | 'rag' | 'ocr'>('rag');
  
  const [doctorProfile, setDoctorProfile] = useState({
    specialty: 'Cardiology',
    license: 'MD-592031',
    hospital: 'General City Hospital',
    bio: 'Senior Cardiologist with 15+ years of experience in interventional cardiology and heart failure management.'
  });

  const [ragDocuments, setRagDocuments] = useState([
    { id: 1, name: 'AHA_Hypertension_Guidelines_2023.pdf', type: 'Clinical Guideline', date: '2023-11-15', status: 'Indexed', size: '4.5 MB' },
    { id: 2, name: 'Hospital_Drug_Formulary_v4.csv', type: 'Database', date: '2023-12-01', status: 'Indexed', size: '1.2 MB' },
    { id: 3, name: 'Internal_Cardio_Protocols.docx', type: 'Protocol', date: '2024-01-10', status: 'Processing', size: '800 KB' },
  ]);

  const [ocrScans, setOcrScans] = useState([
    { id: 1, name: 'Patient_JohnDoe_LabResults.jpg', type: 'Image', date: 'Today, 10:30 AM', summary: 'High LDL cholesterol (160 mg/dL). Glucose elevated.', status: 'Analyzed' },
    { id: 2, name: 'Referral_Letter_Smith.pdf', type: 'PDF', date: 'Yesterday', summary: 'Referral for suspected arrhythmia. ECG attached.', status: 'Analyzed' },
    { id: 3, name: 'Unknown_Prescription_Scan.png', type: 'Image', date: '2 days ago', summary: 'Pending analysis...', status: 'Pending' },
  ]);


  // --- HANDLERS ---
  const handlePatientSave = (e: React.FormEvent) => {
      e.preventDefault();
      setIsEditOpen(false);
  };

  const handleDeleteDoc = (id: number, list: 'rag' | 'ocr') => {
    if(list === 'rag') {
      setRagDocuments(prev => prev.filter(d => d.id !== id));
    } else {
      setOcrScans(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleAnalyzeScan = (id: number) => {
    // Mock AI Analysis
    setOcrScans(prev => prev.map(doc => {
      if (doc.id === id) {
        return { ...doc, status: 'Analyzed', summary: 'AI Analysis: Handwritten text extracted. Prescribed Amoxicillin 500mg.' };
      }
      return doc;
    }));
  };

  // ============================================================================================
  // 👨‍⚕️ DOCTOR / ADMIN VIEW
  // ============================================================================================
  if (user?.role === 'admin') {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeIn">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-md border-4 border-white ring-1 ring-slate-100">
            {user?.avatar || 'DR'}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900">{user?.fullName}</h1>
            <p className="text-blue-600 font-medium">{doctorProfile.specialty} • {doctorProfile.hospital}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500 text-sm mt-3">
              <span className="flex items-center gap-1"><Mail size={14} /> {user?.email}</span>
              <span className="flex items-center gap-1"><ShieldCheck size={14} /> Admin Privileges</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> Member since 2021</span>
            </div>
          </div>
          <Button onClick={() => setActiveDocTab('profile')} variant="secondary" icon={<Edit2 size={16}/>}>Edit Profile</Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-1">
          {[
            { id: 'rag', label: 'RAG Knowledge Base', icon: Database },
            { id: 'ocr', label: 'OCR / Scan Documents', icon: ScanLine },
            { id: 'profile', label: 'Profile Settings', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDocTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium text-sm transition-colors border-b-2 whitespace-nowrap
                  ${activeDocTab === tab.id 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }
                `}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* TAB: RAG DOCUMENTS */}
        {activeDocTab === 'rag' && (
          <div className="space-y-6 animate-fadeIn">
             <div className="flex flex-col md:flex-row justify-between gap-4">
               <div>
                 <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                   <Brain className="text-purple-500" size={24} />
                   AI Knowledge Base
                 </h2>
                 <p className="text-slate-500 text-sm mt-1 max-w-2xl">
                   Upload medical guidelines, research papers, and protocols here. 
                   The <span className="font-semibold text-purple-600">AI Chatbot</span> uses these documents to provide accurate, grounded answers during clinical support.
                 </p>
               </div>
               <Button icon={<Upload size={18} />}>Upload Document</Button>
             </div>

             <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Document Name</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Upload Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ragDocuments.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                  <FileText size={20} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                                  <p className="text-xs text-slate-500">{doc.size}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                               <FileCode size={12} /> {doc.type}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{doc.date}</td>
                          <td className="px-6 py-4">
                             {doc.status === 'Indexed' ? (
                               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                                 <CheckCircle size={12} /> Indexed
                               </span>
                             ) : (
                               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                                 <Activity size={12} className="animate-spin" /> Processing
                               </span>
                             )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Download">
                                <Download size={18} />
                              </button>
                              <button onClick={() => handleDeleteDoc(doc.id, 'rag')} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </Card>
          </div>
        )}

        {/* TAB: OCR SCANS */}
        {activeDocTab === 'ocr' && (
           <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <ScanLine className="text-blue-500" size={24} />
                    Patient Scans & OCR
                  </h2>
                  <p className="text-slate-500 text-sm mt-1 max-w-2xl">
                    Upload prescriptions, lab reports, and imaging. 
                    The AI will <span className="font-semibold text-blue-600">scan, extract text (OCR), and summarize</span> the findings for you.
                  </p>
                </div>
                <Button icon={<Upload size={18} />}>Upload Scan</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Add New Card */}
                 <div className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer min-h-[240px]">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Plus size={32} />
                    </div>
                    <p className="font-bold">Upload New Scan</p>
                    <p className="text-xs mt-2">Drag & drop or click to browse</p>
                 </div>

                 {/* Scan Cards */}
                 {ocrScans.map((doc) => (
                   <Card key={doc.id} className="flex flex-col h-full border hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                               {doc.type === 'Image' ? <ImageIcon size={20}/> : <FileText size={20}/>}
                            </div>
                            <div>
                               <h4 className="font-bold text-slate-900 text-sm truncate max-w-[150px]" title={doc.name}>{doc.name}</h4>
                               <p className="text-xs text-slate-500">{doc.date}</p>
                            </div>
                         </div>
                         <div className={`w-2 h-2 rounded-full ${doc.status === 'Analyzed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      </div>

                      <div className="flex-1 bg-slate-50 rounded-lg p-3 mb-4 border border-slate-100">
                         <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase">
                            <Sparkles size={12} className="text-blue-500" /> AI Summary
                         </div>
                         <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
                            {doc.summary}
                         </p>
                      </div>

                      <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                         <button className="flex-1 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2">
                            <Eye size={14} /> View
                         </button>
                         {doc.status === 'Pending' ? (
                            <button 
                                onClick={() => handleAnalyzeScan(doc.id)}
                                className="flex-1 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center justify-center gap-2"
                            >
                                <ScanLine size={14} /> Run OCR
                            </button>
                         ) : (
                            <button 
                              onClick={() => handleDeleteDoc(doc.id, 'ocr')}
                              className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg border border-transparent hover:border-red-100"
                            >
                              <Trash2 size={16} />
                            </button>
                         )}
                      </div>
                   </Card>
                 ))}
              </div>
           </div>
        )}

        {/* TAB: PROFILE SETTINGS */}
        {activeDocTab === 'profile' && (
           <div className="max-w-2xl mx-auto animate-fadeIn">
              <Card title="Doctor Profile Details">
                 <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <Input label="Full Name" defaultValue={user?.fullName} />
                       <Input label="Specialty" value={doctorProfile.specialty} onChange={(e) => setDoctorProfile({...doctorProfile, specialty: e.target.value})} />
                       <Input label="License Number" value={doctorProfile.license} onChange={(e) => setDoctorProfile({...doctorProfile, license: e.target.value})} />
                       <Input label="Hospital / Clinic" value={doctorProfile.hospital} onChange={(e) => setDoctorProfile({...doctorProfile, hospital: e.target.value})} />
                       <Input label="Phone" defaultValue={user?.phone} />
                       <Input label="Email" defaultValue={user?.email} disabled className="bg-slate-50" />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-2">Professional Bio</label>
                       <textarea 
                          className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none" 
                          rows={4}
                          value={doctorProfile.bio}
                          onChange={(e) => setDoctorProfile({...doctorProfile, bio: e.target.value})}
                       />
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                       <Button icon={<Save size={18}/>}>Save Changes</Button>
                    </div>
                 </div>
              </Card>
           </div>
        )}
      </div>
    );
  }

  // ============================================================================================
  // 🏥 PATIENT VIEW (Original Layout)
  // ============================================================================================
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-10">
      {/* Header Section */}
      <div className="relative mb-20">
        <div className="h-40 bg-gradient-to-r from-[#2A7EF0] to-blue-400 rounded-2xl shadow-sm"></div>
        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center text-4xl font-bold text-[#2A7EF0] relative">
            {user?.avatar}
            <button className="absolute bottom-0 right-0 p-2 bg-slate-100 rounded-full border border-white shadow-sm hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors">
                <Edit2 size={16} />
            </button>
          </div>
          <div className="mb-3">
            <h1 className="text-3xl font-bold text-slate-900">{user?.fullName}</h1>
            <div className="flex items-center gap-4 text-slate-500 text-sm mt-1">
                <span className="flex items-center gap-1"><Mail size={14}/> {user?.email}</span>
                <span className="flex items-center gap-1 capitalize"><ShieldCheck size={14}/> {user?.role}</span>
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4">
            <Button 
                variant="secondary" 
                className="bg-white/90 backdrop-blur-sm border-none shadow-sm" 
                icon={<Edit2 size={16}/>}
                onClick={() => setIsEditOpen(true)}
            >
                Edit Profile
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Vitals & Personal Info */}
        <div className="space-y-6">
             <Card title="Personal Vitals">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <Calendar size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Age</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900">{patientProfile.age} <span className="text-xs font-normal text-slate-500">yrs</span></p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <Weight size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Weight</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900">{patientProfile.weight} <span className="text-xs font-normal text-slate-500">kg</span></p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <Ruler size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Height</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900">{patientProfile.height} <span className="text-xs font-normal text-slate-500">cm</span></p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <Droplet size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Blood</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900">{patientProfile.bloodType}</p>
                    </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-3">
                        <Brain size={20} className="text-blue-600 mt-1" />
                        <div>
                            <h4 className="text-sm font-bold text-blue-900">RAG Context Active</h4>
                            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                This data helps your AI Assistant provide personalized medical advice and accurate health monitoring.
                            </p>
                        </div>
                    </div>
                </div>
             </Card>

             <Card title="Contact Information">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <Mail size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Email Address</p>
                            <p className="text-sm font-semibold text-slate-900">{user?.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <Smartphone size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Phone Number</p>
                            <p className="text-sm font-semibold text-slate-900">{user?.phone || '+1 (555) 000-0000'}</p>
                        </div>
                    </div>
                 </div>
             </Card>
        </div>

        {/* RIGHT COLUMN: Medical History & Reports */}
        <div className="lg:col-span-2 space-y-6">
             {/* Medical History */}
             <Card 
                title="Medical History" 
                action={
                    <Button variant="ghost" className="text-blue-600 text-sm h-8" onClick={() => setIsEditOpen(true)}>
                        <Edit2 size={14} className="mr-2"/> Update
                    </Button>
                }
            >
                <div className="space-y-6">
                    {/* Allergies */}
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                            <AlertCircle size={16} className="text-amber-500" />
                            Allergies
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {patientProfile.allergies.split(',').map((allergy, i) => (
                                <span key={i} className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium border border-amber-100">
                                    {allergy.trim()}
                                </span>
                            ))}
                            <button className="w-8 h-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="w-full h-px bg-slate-100"></div>

                    {/* Conditions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                                <Heart size={16} className="text-red-500" />
                                Heart Conditions
                            </h4>
                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {patientProfile.heartConditions}
                            </p>
                        </div>
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                                <Activity size={16} className="text-blue-500" />
                                Asthma / Respiratory
                            </h4>
                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {patientProfile.conditions}
                            </p>
                        </div>
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                                <Scissors size={16} className="text-slate-500" />
                                Surgeries
                            </h4>
                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {patientProfile.surgeries}
                            </p>
                        </div>
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                                <Stethoscope size={16} className="text-emerald-500" />
                                Chronic Diseases
                            </h4>
                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {patientProfile.chronicDiseases}
                            </p>
                        </div>
                    </div>
                </div>
             </Card>

             {/* Medical Reports */}
             <Card 
                title="Medical Reports" 
                subtitle="Upload new reports to update your AI health context"
                action={
                    <Button icon={<Upload size={16} />} className="h-9 text-sm px-4">
                        Upload Report
                    </Button>
                }
             >
                 <div className="space-y-3">
                     {patientReports.map((report) => (
                         <div key={report.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50 transition-all group">
                             <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                                     <FileText size={20} />
                                 </div>
                                 <div>
                                     <p className="font-bold text-slate-900 text-sm">{report.name}</p>
                                     <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                         <span>{report.date}</span>
                                         <span>•</span>
                                         <span>{report.type}</span>
                                         <span>•</span>
                                         <span>{report.size}</span>
                                     </div>
                                 </div>
                             </div>
                             <div className="flex items-center gap-2">
                                 <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors">
                                     <Download size={18} />
                                 </button>
                                 <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors">
                                     <X size={18} />
                                 </button>
                             </div>
                         </div>
                     ))}
                 </div>
             </Card>
        </div>
      </div>

      {/* Edit Modal (Patient) */}
      {isEditOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
             <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                 <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
                    <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20}/></button>
                 </div>

                 <div className="p-6 overflow-y-auto space-y-6">
                     {/* Section: Vitals */}
                     <div>
                         <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Vitals</h3>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             <Input 
                                label="Age" 
                                type="number"
                                defaultValue={patientProfile.age} 
                                onChange={(e) => setPatientProfile({...patientProfile, age: e.target.value})}
                             />
                             <Input 
                                label="Weight (kg)" 
                                defaultValue={patientProfile.weight} 
                                onChange={(e) => setPatientProfile({...patientProfile, weight: e.target.value})}
                             />
                             <Input 
                                label="Height (cm)" 
                                defaultValue={patientProfile.height} 
                                onChange={(e) => setPatientProfile({...patientProfile, height: e.target.value})}
                             />
                             <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-2">Blood Type</label>
                                 <select 
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-700 bg-white"
                                    defaultValue={patientProfile.bloodType}
                                    onChange={(e) => setPatientProfile({...patientProfile, bloodType: e.target.value})}
                                 >
                                     {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                         <option key={type} value={type}>{type}</option>
                                     ))}
                                 </select>
                             </div>
                         </div>
                     </div>

                     {/* Section: Medical History */}
                     <div>
                         <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Medical History</h3>
                         <div className="space-y-4">
                             <Input 
                                label="Allergies (comma separated)" 
                                defaultValue={patientProfile.allergies} 
                                onChange={(e) => setPatientProfile({...patientProfile, allergies: e.target.value})}
                             />
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <Input 
                                    label="Heart Conditions" 
                                    defaultValue={patientProfile.heartConditions} 
                                    onChange={(e) => setPatientProfile({...patientProfile, heartConditions: e.target.value})}
                                 />
                                 <Input 
                                    label="Asthma / Respiratory" 
                                    defaultValue={patientProfile.conditions} 
                                    onChange={(e) => setPatientProfile({...patientProfile, conditions: e.target.value})}
                                 />
                                 <Input 
                                    label="Surgeries" 
                                    defaultValue={patientProfile.surgeries} 
                                    onChange={(e) => setPatientProfile({...patientProfile, surgeries: e.target.value})}
                                 />
                                 <Input 
                                    label="Chronic Diseases" 
                                    defaultValue={patientProfile.chronicDiseases} 
                                    onChange={(e) => setPatientProfile({...patientProfile, chronicDiseases: e.target.value})}
                                 />
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                     <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                     <Button onClick={handlePatientSave} icon={<Save size={18}/>}>Save Changes</Button>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
};

export default ProfilePage;