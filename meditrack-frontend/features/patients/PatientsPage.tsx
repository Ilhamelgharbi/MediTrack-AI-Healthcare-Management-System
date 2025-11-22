import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Plus, Search, Filter, MoreHorizontal, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Patient Data with Enhanced Fields
  const patients = [
    { id: 1, name: 'Sarah Connor', age: 42, email: 'sarah@skynet.com', status: 'Stable', adherence: 95, activeMeds: 3, lastVisit: 'Oct 24, 2023', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: 2, name: 'John Wick', age: 55, email: 'john@continental.com', status: 'Needs Attention', adherence: 60, activeMeds: 5, lastVisit: 'Nov 12, 2023', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
    { id: 3, name: 'Ellen Ripley', age: 38, email: 'ripley@weyland.corp', status: 'Low Adherence', adherence: 45, activeMeds: 2, lastVisit: 'Aug 15, 2023', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ripley' },
    { id: 4, name: 'Tony Stark', age: 48, email: 'tony@stark.inc', status: 'Stable', adherence: 98, activeMeds: 8, lastVisit: 'Dec 01, 2023', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tony' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Stable': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Needs Attention': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Low Adherence': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
                    placeholder="Search patients by name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
                />
            </div>
            <Button variant="secondary" className="px-4 bg-white shadow-sm" icon={<Filter size={18} />}>Filter</Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Adherence</th>
                <th className="px-6 py-4">Active Meds</th>
                <th className="px-6 py-4">Last Visit</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => (
                <tr 
                    key={patient.id} 
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <img src={patient.photo} alt={patient.name} className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100" />
                        <div>
                            <span className="font-bold text-slate-900 block">{patient.name}</span>
                            <span className="text-xs text-slate-500">{patient.age} yrs • {patient.email}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(patient.status)}`}>
                      {patient.status === 'Stable' ? <CheckCircle size={12} className="mr-1.5"/> : <AlertCircle size={12} className="mr-1.5"/>}
                      {patient.status}
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
                     <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{patient.activeMeds} Meds</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{patient.lastVisit}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-blue-100 rounded-full text-slate-400 hover:text-blue-600 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-sm text-slate-500">
            <span>Showing {filteredPatients.length} patients</span>
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