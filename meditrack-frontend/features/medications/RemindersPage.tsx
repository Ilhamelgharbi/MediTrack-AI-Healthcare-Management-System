import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Bell, CheckCircle, XCircle, Clock, Calendar, Settings, 
  History, ChevronRight, Smartphone, Mail, MessageSquare, 
  Filter, Search, Check, X
} from 'lucide-react';

interface Reminder {
  id: string;
  medicationName: string;
  dosage: string;
  time: string;
  status: 'upcoming' | 'taken' | 'skipped' | 'missed';
  date: string;
  type: 'morning' | 'afternoon' | 'evening';
}

const RemindersPage = () => {
  const [view, setView] = useState<'today' | 'history' | 'settings'>('today');
  const [filter, setFilter] = useState('all');
  
  // Mock Data
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', medicationName: 'Amoxicillin', dosage: '500mg', time: '08:00 AM', status: 'taken', date: 'Today', type: 'morning' },
    { id: '2', medicationName: 'Lisinopril', dosage: '10mg', time: '09:00 AM', status: 'skipped', date: 'Today', type: 'morning' },
    { id: '3', medicationName: 'Metformin', dosage: '1000mg', time: '01:00 PM', status: 'upcoming', date: 'Today', type: 'afternoon' },
    { id: '4', medicationName: 'Amoxicillin', dosage: '500mg', time: '08:00 PM', status: 'upcoming', date: 'Today', type: 'evening' },
  ]);

  const [history, setHistory] = useState<Reminder[]>([
    { id: '10', medicationName: 'Amoxicillin', dosage: '500mg', time: '08:00 PM', status: 'taken', date: 'Yesterday', type: 'evening' },
    { id: '11', medicationName: 'Metformin', dosage: '1000mg', time: '01:00 PM', status: 'taken', date: 'Yesterday', type: 'afternoon' },
    { id: '12', medicationName: 'Lisinopril', dosage: '10mg', time: '09:00 AM', status: 'taken', date: 'Yesterday', type: 'morning' },
    { id: '13', medicationName: 'Amoxicillin', dosage: '500mg', time: '08:00 AM', status: 'missed', date: 'Yesterday', type: 'morning' },
  ]);

  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
    reminderTime: '15' // minutes before
  });

  const handleAction = (id: string, action: 'taken' | 'skipped') => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, status: action } : r
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'skipped': return 'bg-red-100 text-red-700 border-red-200';
      case 'missed': return 'bg-red-100 text-red-700 border-red-200';
      case 'upcoming': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken': return <CheckCircle size={16} />;
      case 'skipped': return <XCircle size={16} />;
      case 'missed': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reminders</h1>
          <p className="text-slate-500">Stay on track with your medication schedule</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button 
            onClick={() => setView('today')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'today' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Clock size={16} /> Today
          </button>
          <button 
            onClick={() => setView('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'history' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <History size={16} /> History
          </button>
          <button 
            onClick={() => setView('settings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Settings size={16} /> Settings
          </button>
        </div>
      </div>

      {/* VIEW: TODAY'S REMINDERS */}
      {view === 'today' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {['morning', 'afternoon', 'evening'].map((timeOfDay) => {
              const timeReminders = reminders.filter(r => r.type === timeOfDay);
              if (timeReminders.length === 0) return null;

              return (
                <div key={timeOfDay}>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">{timeOfDay}</h3>
                  <div className="space-y-3">
                    {timeReminders.map((reminder) => (
                      <div key={reminder.id} className={`relative pl-6 before:absolute before:left-2.5 before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-200 last:before:bottom-auto last:before:h-1/2 first:before:top-1/2 first:before:h-1/2`}>
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10
                          ${reminder.status === 'taken' ? 'bg-emerald-500' : 
                            reminder.status === 'skipped' ? 'bg-red-500' :
                            reminder.status === 'missed' ? 'bg-red-500' : 'bg-yellow-500'}
                        `}></div>
                        
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <Clock size={20} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-900">{reminder.medicationName}</h4>
                                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{reminder.dosage}</span>
                                </div>
                                <p className="text-sm text-slate-500 font-medium">{reminder.time}</p>
                              </div>
                            </div>
                            
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border flex items-center gap-1.5 ${getStatusColor(reminder.status)}`}>
                              {getStatusIcon(reminder.status)}
                              {reminder.status}
                            </div>
                          </div>

                          {reminder.status === 'upcoming' && (
                            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-50">
                              <button 
                                onClick={() => handleAction(reminder.id, 'taken')}
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                              >
                                <Check size={16} /> Take Dose
                              </button>
                              <button 
                                onClick={() => handleAction(reminder.id, 'skipped')}
                                className="flex-1 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                              >
                                <X size={16} /> Skip
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <Card title="Daily Progress">
              <div className="flex items-center justify-center py-6">
                <div className="relative w-40 h-40">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                      <circle 
                          cx="80" 
                          cy="80" 
                          r="70" 
                          stroke="#2A7EF0" 
                          strokeWidth="10" 
                          fill="transparent" 
                          strokeDasharray="440" 
                          strokeDashoffset={440 - (440 * 0.75)} 
                          strokeLinecap="round" 
                      />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-slate-900">75%</span>
                      <span className="text-xs text-slate-500 uppercase">Completed</span>
                   </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-emerald-50">
                   <p className="text-lg font-bold text-emerald-700">3</p>
                   <p className="text-[10px] text-emerald-600 font-bold uppercase">Taken</p>
                </div>
                <div className="p-2 rounded-lg bg-red-50">
                   <p className="text-lg font-bold text-red-600">1</p>
                   <p className="text-[10px] text-red-500 font-bold uppercase">Skipped</p>
                </div>
                <div className="p-2 rounded-lg bg-yellow-50">
                   <p className="text-lg font-bold text-yellow-700">2</p>
                   <p className="text-[10px] text-yellow-600 font-bold uppercase">Left</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* VIEW: HISTORY */}
      {view === 'history' && (
        <Card className="animate-fadeIn">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                      type="text" 
                      placeholder="Search medication..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
              </div>
              <div className="flex gap-2">
                 <select 
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none"
                    onChange={(e) => setFilter(e.target.value)}
                 >
                    <option value="all">All Status</option>
                    <option value="taken">Taken</option>
                    <option value="skipped">Skipped</option>
                    <option value="missed">Missed</option>
                 </select>
                 <input type="date" className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none" />
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Medication</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {history
                      .filter(h => filter === 'all' || h.status === filter)
                      .map(record => (
                        <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                           <td className="py-3 px-4">
                              <div className="font-medium text-slate-900">{record.medicationName}</div>
                              <div className="text-xs text-slate-500">{record.dosage}</div>
                           </td>
                           <td className="py-3 px-4 text-sm text-slate-600">
                              <div>{record.date}</div>
                              <div className="text-xs text-slate-400">{record.time}</div>
                           </td>
                           <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${getStatusColor(record.status)}`}>
                                 {getStatusIcon(record.status)}
                                 {record.status}
                              </span>
                           </td>
                           <td className="py-3 px-4 text-right">
                              <button className="text-slate-400 hover:text-slate-600">
                                 <ChevronRight size={18} />
                              </button>
                           </td>
                        </tr>
                   ))}
                </tbody>
              </table>
           </div>
        </Card>
      )}

      {/* VIEW: SETTINGS */}
      {view === 'settings' && (
        <div className="max-w-2xl mx-auto animate-fadeIn space-y-6">
           <Card title="Notification Channels" subtitle="Manage how you want to receive reminders">
              <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                              <Bell size={20} />
                          </div>
                          <div>
                              <p className="font-bold text-slate-900">Push Notifications</p>
                              <p className="text-xs text-slate-500">Receive alerts on your device</p>
                          </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={notifications.push}
                            onChange={() => setNotifications({...notifications, push: !notifications.push})}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600">
                              <Mail size={20} />
                          </div>
                          <div>
                              <p className="font-bold text-slate-900">Email Notifications</p>
                              <p className="text-xs text-slate-500">Receive summaries and alerts via email</p>
                          </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={notifications.email}
                            onChange={() => setNotifications({...notifications, email: !notifications.email})}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm text-violet-600">
                              <Smartphone size={20} />
                          </div>
                          <div>
                              <p className="font-bold text-slate-900">SMS / WhatsApp</p>
                              <p className="text-xs text-slate-500">Get reminders via text message</p>
                          </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={notifications.sms}
                            onChange={() => setNotifications({...notifications, sms: !notifications.sms})}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                  </div>
              </div>
           </Card>

           <Card title="Preferences">
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Reminder Timing</label>
                    <select 
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        value={notifications.reminderTime}
                        onChange={(e) => setNotifications({...notifications, reminderTime: e.target.value})}
                    >
                        <option value="0">At exact time</option>
                        <option value="5">5 minutes before</option>
                        <option value="15">15 minutes before</option>
                        <option value="30">30 minutes before</option>
                    </select>
                 </div>
                 <Button fullWidth>Save Preferences</Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};

export default RemindersPage;