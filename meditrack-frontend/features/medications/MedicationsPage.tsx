import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { 
  Pill, Clock, CheckCircle, AlertTriangle, Calendar, Plus, XCircle, 
  ChevronRight, Search, Filter, MoreHorizontal, Edit2, Trash2, Eye, 
  X, Save, Image as ImageIcon, FileText, LayoutGrid, Activity, CalendarDays,
  Bell, Timer, ArrowRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Types
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  sideEffects?: string;
  notes?: string;
  status: 'Active' | 'Inactive';
  stock: number;
  totalStock: number;
  nextRefill?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  color?: string; // for dashboard chart/ui matching
}

interface Schedule {
  id: string;
  medicationId: string;
  medicationName: string;
  frequencyType: 'once' | 'twice' | 'interval' | 'custom';
  frequencyLabel: string;
  times: string[];
  interval?: number;
  startDate: string;
  endDate?: string;
  reminders: boolean;
  isActive: boolean;
}

const MedicationsPage = () => {
  // View State
  const [view, setView] = useState<'overview' | 'list' | 'schedule'>('overview');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Mock Data: Medications
  const [medications, setMedications] = useState<Medication[]>([
    { 
      id: '1', 
      name: 'Amoxicillin', 
      dosage: '500mg', 
      frequency: 'Twice Daily', 
      instructions: 'Take with food', 
      sideEffects: 'Nausea, Rash',
      notes: 'Prescribed for sinus infection',
      status: 'Active', 
      nextRefill: 'Oct 15', 
      stock: 12, 
      totalStock: 30, 
      color: 'bg-blue-100 text-blue-600',
      imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=300&h=200',
      createdAt: '2023-10-01',
      updatedAt: '2023-10-01'
    },
    { 
      id: '2', 
      name: 'Lisinopril', 
      dosage: '10mg', 
      frequency: 'Once Daily', 
      instructions: 'Take in the morning', 
      sideEffects: 'Dizziness, Cough',
      status: 'Active', 
      nextRefill: 'Nov 01', 
      stock: 28, 
      totalStock: 30, 
      color: 'bg-emerald-100 text-emerald-600',
      createdAt: '2023-09-15',
      updatedAt: '2023-09-15'
    },
    { 
      id: '3', 
      name: 'Metformin', 
      dosage: '1000mg', 
      frequency: 'Twice Daily', 
      instructions: 'Take with meals', 
      status: 'Active', 
      nextRefill: 'Oct 20', 
      stock: 45, 
      totalStock: 60, 
      color: 'bg-purple-100 text-purple-600',
      createdAt: '2023-08-20',
      updatedAt: '2023-08-20'
    },
    { 
      id: '4', 
      name: 'Ibuprofen', 
      dosage: '400mg', 
      frequency: 'As needed', 
      instructions: 'Do not exceed 6 tablets/day', 
      status: 'Inactive', 
      stock: 50, 
      totalStock: 100, 
      color: 'bg-slate-100 text-slate-600',
      createdAt: '2023-05-10',
      updatedAt: '2023-06-01'
    },
  ]);

  // Mock Data: Schedules
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
        id: '1',
        medicationId: '1',
        medicationName: 'Amoxicillin 500mg',
        frequencyType: 'twice',
        frequencyLabel: 'Twice Daily',
        times: ['08:00', '20:00'],
        startDate: '2023-10-01',
        endDate: '2023-10-15',
        reminders: true,
        isActive: true
    },
    {
        id: '2',
        medicationId: '2',
        medicationName: 'Lisinopril 10mg',
        frequencyType: 'once',
        frequencyLabel: 'Once Daily',
        times: ['09:00'],
        startDate: '2023-09-15',
        reminders: true,
        isActive: true
    },
    {
        id: '3',
        medicationId: '3',
        medicationName: 'Metformin 1000mg',
        frequencyType: 'twice',
        frequencyLabel: 'Twice Daily',
        times: ['08:00', '19:00'],
        startDate: '2023-08-20',
        reminders: false,
        isActive: true
    }
  ]);

  const adherenceData = [
    { day: 'Mon', score: 100 },
    { day: 'Tue', score: 80 },
    { day: 'Wed', score: 100 },
    { day: 'Thu', score: 100 },
    { day: 'Fri', score: 60 },
    { day: 'Sat', score: 100 },
    { day: 'Sun', score: 100 },
  ];

  const stats = [
    { title: 'Total Meds', value: medications.length.toString(), icon: Pill, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active Schedules', value: schedules.filter(s => s.isActive).length.toString(), icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Missed Doses', value: '2', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Refill Warnings', value: medications.filter(m => m.stock < 15).length.toString(), icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  // Handlers
  const handleEdit = (med: Medication) => {
    setSelectedMed(med);
    setFormMode('edit');
    setIsFormOpen(true);
    setIsDetailsOpen(false);
  };

  const handleView = (med: Medication) => {
    setSelectedMed(med);
    setIsDetailsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this medication?')) {
      setMedications(prev => prev.filter(m => m.id !== id));
      setIsDetailsOpen(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, gather form data here
    setIsFormOpen(false);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
      e.preventDefault();
      // In a real app: update schedules and set Medication status to 'Active'
      setIsScheduleFormOpen(false);
  };

  const handleDeleteSchedule = (id: string) => {
      if(confirm("Delete this schedule? The associated medication may become inactive.")) {
          setSchedules(prev => prev.filter(s => s.id !== id));
      }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Medication Management</h1>
            <p className="text-slate-500">Track your prescriptions, adherence, and schedule</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg self-start md:self-auto overflow-x-auto max-w-full">
            <button 
                onClick={() => setView('overview')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${view === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <LayoutGrid size={16} />
                All Medications
            </button>
            <button 
                onClick={() => setView('schedule')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${view === 'schedule' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <CalendarDays size={16} />
                Schedule
            </button>
        </div>
      </div>

      {/* VIEW: DASHBOARD OVERVIEW */}
      {view === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
           {/* Statistics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                        <stat.icon size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.title}</p>
                        <h3 className="text-xl font-bold text-slate-900">{stat.value}</h3>
                    </div>
                </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
                {/* Upcoming Reminder */}
                <Card className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-none overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-3 opacity-90">
                                    <div className="p-1.5 bg-white/20 rounded-full animate-pulse">
                                        <Clock size={16} />
                                    </div>
                                    <span className="text-sm font-medium tracking-wide">UPCOMING DOSE</span>
                                </div>
                                <h2 className="text-3xl font-bold mb-2">Amoxicillin 500mg</h2>
                                <div className="flex items-center gap-3 opacity-90 text-sm">
                                    <span className="bg-white/20 px-2 py-1 rounded">Take with food</span>
                                    <span>•</span>
                                    <span>1 tablet</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold mb-1">30</div>
                                <p className="text-xs uppercase tracking-wider opacity-80 font-medium">Minutes Left</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 sm:gap-4">
                            <button className="flex-1 bg-white text-blue-600 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-50 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
                                <CheckCircle size={20} /> Take Now
                            </button>
                            <button className="flex-1 bg-blue-800/40 text-white border border-white/10 py-3.5 rounded-xl font-medium hover:bg-blue-800/60 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                                <XCircle size={20} /> Skip Dose
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Active Medications List */}
                <Card title="Active Medications" action={<Button variant="ghost" className="text-sm text-blue-600 px-2" onClick={() => setView('list')}>View All</Button>}>
                    <div className="space-y-4">
                        {medications.filter(m => m.status === 'Active').slice(0, 3).map((med) => (
                            <div key={med.id} onClick={() => handleView(med)} className="p-4 border border-slate-100 rounded-xl hover:border-blue-100 hover:bg-slate-50 transition-all group cursor-pointer bg-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${med.color || 'bg-slate-100 text-slate-500'}`}>
                                            <Pill size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg">{med.name}</h4>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mt-1">
                                                <span className="font-medium text-slate-700">{med.dosage}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span>{med.frequency}</span>
                                                <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="hidden sm:inline text-slate-400">{med.instructions}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
                {/* Adherence Score */}
                <Card title="Adherence Score">
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            {/* Background Circle */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                                <circle 
                                    cx="80" 
                                    cy="80" 
                                    r="70" 
                                    stroke="#10B981" 
                                    strokeWidth="10" 
                                    fill="transparent" 
                                    strokeDasharray="440" 
                                    strokeDashoffset={440 - (440 * 0.85)} 
                                    strokeLinecap="round" 
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-slate-900 tracking-tight">85%</span>
                                <span className="text-xs text-emerald-600 uppercase tracking-wide font-bold bg-emerald-50 px-2 py-1 rounded mt-2">Weekly</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 w-full mt-8 px-2">
                            <div className="flex flex-col items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <span className="text-xl font-bold text-emerald-700">14</span>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mt-1">Taken</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-red-50 rounded-xl border border-red-100">
                                <span className="text-xl font-bold text-red-600">2</span>
                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide mt-1">Skipped</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-amber-50 rounded-xl border border-amber-100">
                                <span className="text-xl font-bold text-amber-600">1</span>
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mt-1">Missed</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Weekly Chart */}
                <Card title="Weekly Trends" subtitle="Adherence over last 7 days">
                    <div className="h-56 w-full mt-2">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={adherenceData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="day" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 12, fill: '#94a3b8'}} 
                                    dy={10}
                                />
                                <Tooltip 
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    formatter={(value) => [`${value}%`, 'Adherence']}
                                    cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="score" 
                                    stroke="#10B981" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorScore)" 
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </AreaChart>
                         </ResponsiveContainer>
                    </div>
                </Card>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: MEDICATIONS LIST */}
      {view === 'list' && (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, dosage..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                     <Button variant="secondary" icon={<Filter size={18}/>}>Filter</Button>
                     <Button icon={<Plus size={18}/>} onClick={() => {
                        setFormMode('add');
                        setSelectedMed(null);
                        setIsFormOpen(true);
                     }}>Add Medication</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {medications.map((med) => (
                    <div key={med.id} className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all overflow-hidden group flex flex-col h-full">
                        {/* Card Image/Header */}
                        <div className="h-32 bg-slate-100 relative overflow-hidden">
                            {med.imageUrl ? (
                                <img src={med.imageUrl} alt={med.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                                    <Pill size={48} />
                                </div>
                            )}
                            <div className="absolute top-3 right-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md
                                    ${med.status === 'Active' ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/90 text-white'}
                                `}>
                                    {med.status}
                                </span>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{med.name}</h3>
                                <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                            
                            <div className="space-y-3 mb-6 flex-1">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Activity size={16} className="text-blue-500" />
                                    <span className="font-medium">{med.dosage}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Clock size={16} className="text-emerald-500" />
                                    <span>{med.frequency}</span>
                                </div>
                                {med.sideEffects && (
                                    <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                                        <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{med.sideEffects}</span>
                                    </div>
                                )}
                            </div>

                            {/* Card Actions */}
                            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                <button onClick={() => handleView(med)} className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5">
                                    <Eye size={14} /> View
                                </button>
                                <button onClick={() => handleEdit(med)} className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5">
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button onClick={() => handleDelete(med.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Add New Card (Placeholder) */}
                <button 
                    onClick={() => {
                        setFormMode('add');
                        setSelectedMed(null);
                        setIsFormOpen(true);
                    }}
                    className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all min-h-[300px]"
                >
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <Plus size={32} />
                    </div>
                    <span className="font-medium">Add New Medication</span>
                </button>
            </div>
        </div>
      )}
      
      {/* VIEW: SCHEDULES */}
      {view === 'schedule' && (
          <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                      <h2 className="text-lg font-bold text-slate-900">Active Schedules</h2>
                      <p className="text-sm text-slate-500">Manage your medication timing and reminders</p>
                  </div>
                  <Button icon={<Plus size={18}/>} onClick={() => {
                      setSelectedSchedule(null);
                      setIsScheduleFormOpen(true);
                  }}>Create Schedule</Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                  {schedules.map((schedule) => (
                      <div key={schedule.id} className="bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
                          {/* Schedule Info */}
                          <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-slate-900">{schedule.medicationName}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${schedule.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {schedule.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={16} className="text-blue-500" />
                                        <span>{schedule.frequencyLabel}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CalendarDays size={16} className="text-purple-500" />
                                        <span>Started {schedule.startDate}</span>
                                    </div>
                                    {schedule.reminders && (
                                        <div className="flex items-center gap-1.5">
                                            <Bell size={16} className="text-amber-500" />
                                            <span>Reminders On</span>
                                        </div>
                                    )}
                                </div>
                          </div>

                          {/* Timeline Viz */}
                          <div className="flex-1 bg-slate-50 rounded-lg p-3 flex items-center gap-2 min-h-[60px]">
                              <div className="text-xs font-bold text-slate-400 mr-2">TIMELINE</div>
                              <div className="flex-1 relative h-1 bg-slate-200 rounded-full">
                                  {/* Morning/Noon/Evening Markers */}
                                  <div className="absolute left-[25%] -top-1 w-0.5 h-3 bg-slate-300"></div>
                                  <div className="absolute left-[50%] -top-1 w-0.5 h-3 bg-slate-300"></div>
                                  <div className="absolute left-[75%] -top-1 w-0.5 h-3 bg-slate-300"></div>
                                  
                                  {/* Active Doses */}
                                  {schedule.times.map((time, i) => {
                                      // Simple approximation for position
                                      const hour = parseInt(time.split(':')[0]);
                                      const percent = (hour / 24) * 100;
                                      return (
                                          <div 
                                            key={i} 
                                            className="absolute -top-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center group cursor-pointer hover:scale-110 transition-transform z-10"
                                            style={{ left: `${percent}%` }}
                                          >
                                              <span className="absolute -bottom-6 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                  {time}
                                              </span>
                                          </div>
                                      )
                                  })}
                              </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                              <button className="p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors">
                                  <Edit2 size={18} />
                              </button>
                              <button onClick={() => handleDeleteSchedule(schedule.id)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                                  <Trash2 size={18} />
                              </button>
                          </div>
                      </div>
                  ))}
                  
                  {schedules.length === 0 && (
                      <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                          <CalendarDays size={48} className="mx-auto mb-4 text-slate-300" />
                          <p className="font-medium">No active schedules</p>
                          <p className="text-sm mb-4">Set up a schedule to get reminders</p>
                          <Button variant="secondary" onClick={() => setIsScheduleFormOpen(true)}>Create Schedule</Button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* MODAL: MEDICATION DETAILS */}
      {isDetailsOpen && selectedMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="h-48 relative bg-slate-100 flex-shrink-0">
                    {selectedMed.imageUrl ? (
                        <img src={selectedMed.imageUrl} alt={selectedMed.name} className="w-full h-full object-cover" />
                    ) : (
                         <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                            <Pill size={64} />
                        </div>
                    )}
                    <button 
                        onClick={() => setIsDetailsOpen(false)}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-6">
                        <h2 className="text-3xl font-bold text-white">{selectedMed.name}</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-white text-sm font-medium border border-white/10">{selectedMed.dosage}</span>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${selectedMed.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                                {selectedMed.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Instructions</h4>
                            <div className="flex items-start gap-3 mb-2">
                                <Clock size={18} className="text-blue-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-slate-900">{selectedMed.frequency}</p>
                                    <p className="text-sm text-slate-500">Every 12 hours</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <FileText size={18} className="text-blue-500 mt-0.5" />
                                <p className="text-sm text-slate-700">{selectedMed.instructions}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                             <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Inventory</h4>
                             <div className="flex justify-between items-end mb-2">
                                <span className="text-sm text-slate-600">Current Stock</span>
                                <span className="font-bold text-slate-900 text-lg">{selectedMed.stock} / {selectedMed.totalStock}</span>
                             </div>
                             <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                                 <div className={`h-full ${selectedMed.stock < 10 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${(selectedMed.stock / selectedMed.totalStock) * 100}%` }}></div>
                             </div>
                             <p className="text-xs text-slate-500">Next Refill: {selectedMed.nextRefill || 'Not scheduled'}</p>
                        </div>
                    </div>

                    {selectedMed.sideEffects && (
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <AlertTriangle size={16} className="text-amber-500" />
                                Potential Side Effects
                            </h4>
                            <p className="text-slate-600 text-sm bg-amber-50 border border-amber-100 p-3 rounded-lg">
                                {selectedMed.sideEffects}
                            </p>
                        </div>
                    )}
                    
                    {selectedMed.notes && (
                         <div className="mb-6">
                            <h4 className="text-sm font-bold text-slate-900 mb-2">Notes</h4>
                            <p className="text-slate-600 text-sm">{selectedMed.notes}</p>
                        </div>
                    )}
                    
                    <div className="flex justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
                        <span>Created: {selectedMed.createdAt}</span>
                        <span>Last Updated: {selectedMed.updatedAt}</span>
                    </div>
                </div>

                {/* Modal Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end">
                     <Button variant="danger" onClick={() => handleDelete(selectedMed.id)} icon={<Trash2 size={18}/>}>
                        Delete
                     </Button>
                     <Button onClick={() => handleEdit(selectedMed)} icon={<Edit2 size={18}/>}>
                        Edit Medication
                     </Button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT MEDICATION FORM */}
      {isFormOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                 <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">{formMode === 'add' ? 'Add New Medication' : 'Edit Medication'}</h2>
                    <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                 </div>
                 
                 <div className="p-6 overflow-y-auto space-y-5">
                    <div className="flex items-center justify-center">
                        <div className="w-32 h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                            {selectedMed?.imageUrl ? (
                                <img src={selectedMed.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <>
                                    <ImageIcon size={32} className="mb-2" />
                                    <span className="text-xs font-medium">Upload Image</span>
                                </>
                            )}
                        </div>
                    </div>

                    <Input label="Medication Name" placeholder="e.g. Amoxicillin" defaultValue={selectedMed?.name} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Dosage" placeholder="e.g. 500mg" defaultValue={selectedMed?.dosage} />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                            <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-700">
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <Input label="Frequency" placeholder="e.g. Twice Daily" defaultValue={selectedMed?.frequency} />
                         <Input label="Duration" placeholder="e.g. 7 days" defaultValue="Ongoing" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Instructions</label>
                        <textarea 
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-700 min-h-[80px]"
                            placeholder="e.g. Take with food, do not crush..."
                            defaultValue={selectedMed?.instructions}
                        ></textarea>
                    </div>

                    <Input label="Side Effects" placeholder="e.g. Dizziness, Nausea" defaultValue={selectedMed?.sideEffects} />
                 </div>

                 <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                     <Button variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                     <Button onClick={handleSave} icon={<Save size={18}/>}>
                        {formMode === 'add' ? 'Add Medication' : 'Save Changes'}
                     </Button>
                 </div>
            </div>
         </div>
      )}

      {/* MODAL: ADD/EDIT SCHEDULE FORM */}
      {isScheduleFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                 <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">{selectedSchedule ? 'Edit Schedule' : 'New Schedule'}</h2>
                    <button onClick={() => setIsScheduleFormOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                 </div>
                 
                 <div className="p-6 overflow-y-auto space-y-5">
                    {/* Medication Selector */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Medication</label>
                        <div className="relative">
                            <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-700 appearance-none">
                                <option value="" disabled selected={!selectedSchedule}>Select a medication...</option>
                                {medications.map(med => (
                                    <option key={med.id} value={med.id}>{med.name} ({med.dosage})</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <ChevronRight size={16} className="rotate-90" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Frequency & Times */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                             {['Once daily', 'Twice daily', 'Every 8 hours', 'Custom'].map(freq => (
                                 <label key={freq} className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-blue-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition-all">
                                     <input type="radio" name="frequency" className="text-blue-600 focus:ring-blue-500" />
                                     <span className="text-sm font-medium text-slate-700">{freq}</span>
                                 </label>
                             ))}
                        </div>

                        {/* Dynamic Time Inputs (Mock based on Twice Daily) */}
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                            <p className="text-xs font-bold text-slate-400 uppercase">Dose Times</p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500 mb-1 block">Dose 1</label>
                                    <input type="time" className="w-full p-2 border border-slate-200 rounded bg-white" defaultValue="08:00" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500 mb-1 block">Dose 2</label>
                                    <input type="time" className="w-full p-2 border border-slate-200 rounded bg-white" defaultValue="20:00" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                            <input type="date" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">End Date (Optional)</label>
                            <input type="date" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-700" />
                        </div>
                    </div>

                    {/* Reminder Toggle */}
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Bell size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">Reminders</p>
                                <p className="text-xs text-slate-500">Get notified when it's time</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                 </div>

                 <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                     <Button variant="secondary" onClick={() => setIsScheduleFormOpen(false)}>Cancel</Button>
                     <Button onClick={handleSaveSchedule} icon={<Save size={18}/>}>
                        Save Schedule
                     </Button>
                 </div>
            </div>
          </div>
      )}

    </div>
  );
};

export default MedicationsPage;