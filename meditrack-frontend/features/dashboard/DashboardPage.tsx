import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import { Calendar, Pill, FlaskConical, Users, TrendingUp, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

interface PatientAnalytics {
  totalPatients: number;
  activePatients: number;
  criticalPatients: number;
}

interface MedicationAnalytics {
  totalMedications: number;
  activePrescriptions: number;
  adherenceRate: number;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const [patientAnalytics, setPatientAnalytics] = useState<PatientAnalytics | null>(null);
  const [medicationAnalytics, setMedicationAnalytics] = useState<MedicationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data on mount
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminAnalytics();
    } else {
      // For patients, we could fetch their personal stats
      setLoading(false);
    }
  }, [user]);

  const fetchAdminAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - replace with actual API calls later
      setPatientAnalytics({
        totalPatients: 0,
        activePatients: 0,
        criticalPatients: 0
      });
      setMedicationAnalytics({
        totalMedications: 0,
        activePrescriptions: 0,
        adherenceRate: 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  // --- PATIENT DATA ---
  const patientStats = [
    { title: 'Appointments', value: '3', icon: <Calendar size={24} />, color: 'bg-blue-500', trend: '+2 this week' },
    { title: 'Prescriptions', value: '2 Active', icon: <Pill size={24} />, color: 'bg-emerald-500', trend: 'Refill soon' },
    { title: 'Lab Results', value: '1 New', icon: <FlaskConical size={24} />, color: 'bg-amber-500', trend: 'Reviewed' },
  ];

  const patientActivityData = [
    { name: 'Mon', visits: 40, active: 24 },
    { name: 'Tue', visits: 30, active: 13 },
    { name: 'Wed', visits: 20, active: 58 },
    { name: 'Thu', visits: 27, active: 39 },
    { name: 'Fri', visits: 18, active: 48 },
    { name: 'Sat', visits: 23, active: 38 },
    { name: 'Sun', visits: 34, active: 43 },
  ];

  // --- ADMIN / DOCTOR DATA (Real API data) ---
  const adminStats = patientAnalytics ? [
    { title: 'Total Patients', value: patientAnalytics.total_patients.toString(), icon: <Users size={24} />, color: 'bg-blue-500', trend: `${patientAnalytics.active_patients} active` },
    { title: 'Active Meds', value: medicationAnalytics?.active_medications.toString() || '0', icon: <Pill size={24} />, color: 'bg-emerald-500', trend: `${medicationAnalytics?.average_adherence_rate?.toFixed(1) || 0}% avg adherence` },
    { title: 'Recent Visits', value: patientAnalytics.recent_visits.toString(), icon: <Activity size={24} />, color: 'bg-violet-500', trend: 'Last 30 days' },
    { title: 'Upcoming Appts', value: patientAnalytics.upcoming_appointments.toString(), icon: <AlertTriangle size={24} />, color: 'bg-red-500', trend: 'Next 7 days' },
  ] : [
    { title: 'Total Patients', value: '1,284', icon: <Users size={24} />, color: 'bg-blue-500', trend: '+12 new' },
    { title: 'Active Meds', value: '3,402', icon: <Pill size={24} />, color: 'bg-emerald-500', trend: '98% filled' },
    { title: 'Avg Adherence', value: '87%', icon: <Activity size={24} />, color: 'bg-violet-500', trend: '+2.4%' },
    { title: 'High Risk Alerts', value: '14', icon: <AlertTriangle size={24} />, color: 'bg-red-500', trend: 'Needs Attention' },
  ];

  const diseaseData = [
    { name: 'Hypertension', value: 400 },
    { name: 'Diabetes T2', value: 300 },
    { name: 'Asthma', value: 300 },
    { name: 'Other', value: 200 },
  ];

  const adherenceTrendData = [
    { name: 'Week 1', rate: 82 },
    { name: 'Week 2', rate: 85 },
    { name: 'Week 3', rate: 84 },
    { name: 'Week 4', rate: 89 },
  ];

  const COLORS = ['#2A7EF0', '#10B981', '#F59E0B', '#6366F1'];

  const stats = user?.role === 'admin' ? adminStats : patientStats;

  if (loading && user?.role === 'admin') {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
          <p className="text-slate-500 mt-1">Loading analytics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-20"></div>
                  <div className="h-8 bg-slate-200 rounded w-16"></div>
                  <div className="h-3 bg-slate-200 rounded w-24"></div>
                </div>
                <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && user?.role === 'admin') {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
          <p className="text-slate-500 mt-1">Error loading analytics</p>
        </div>
        <Card className="p-8 text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchAdminAnalytics} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {user?.role === 'admin' ? 'Doctor Dashboard' : `Hello, ${user?.fullName.split(' ')[0]} 👋`}
        </h1>
        <p className="text-slate-500 mt-1">
          {user?.role === 'admin' ? 'Clinical overview and patient analytics' : 'Here is your health overview for today.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${user?.role === 'admin' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-transparent hover:border-l-[#2A7EF0]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                {stat.trend && (
                  <span className={`inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full bg-slate-100 ${stat.title.includes('Risk') ? 'text-red-600 bg-red-50' : 'text-slate-600'}`}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.color} text-white shadow-lg shadow-blue-100`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      {user?.role === 'admin' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Admin: Adherence Trends */}
          <Card title="Medication Adherence Stats" subtitle="Overall patient compliance trend">
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={adherenceTrendData}>
                  <defs>
                    <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorAdherence)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Admin: Disease Distribution */}
          <Card title="Patient Demographics" subtitle="Most common conditions">
             <div className="h-72 w-full mt-4 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={diseaseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {diseaseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </Card>
          
           {/* Admin: Recent Alerts */}
           <div className="lg:col-span-2">
             <Card title="Urgent Attention Needed" subtitle="Patients with low adherence or missed doses">
                <div className="space-y-3">
                    {[
                        { name: 'Ellen Ripley', issue: 'Missed 3 doses consecutively', med: 'Beta Blockers', time: '2 hours ago' },
                        { name: 'John Wick', issue: 'Adherence dropped below 50%', med: 'Pain Mgmt', time: '5 hours ago' },
                        { name: 'Sarah Connor', issue: 'Prescription Expired', med: 'Insulin', time: 'Yesterday' }
                    ].map((alert, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-full text-red-500 shadow-sm"><AlertTriangle size={20}/></div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{alert.name}</h4>
                                    <p className="text-sm text-red-700 font-medium">{alert.issue} • {alert.med}</p>
                                </div>
                            </div>
                            <button className="text-sm font-semibold text-red-600 hover:underline">View Patient</button>
                        </div>
                    ))}
                </div>
             </Card>
           </div>
        </div>
      ) : (
        /* Patient Views */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Health Activity" subtitle="Weekly overview of vital signs">
            <div className="h-64 w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={patientActivityData}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2A7EF0" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2A7EF0" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="visits" stroke="#2A7EF0" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Consultation History" subtitle="Monthly appointment distribution">
            <div className="h-64 w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patientActivityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="active" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </Card>
          
           {/* Recent Activity List for Patients */}
          <div className="lg:col-span-2">
            <Card title="Recent Updates">
                <div className="space-y-4">
                {[
                    { text: 'Blood test results uploaded', time: '2 hours ago', type: 'lab', color: 'text-blue-500 bg-blue-50' },
                    { text: 'Appointment confirmed with Dr. Smith', time: '5 hours ago', type: 'appointment', color: 'text-emerald-500 bg-emerald-50' },
                    { text: 'Prescription refill processed', time: 'Yesterday', type: 'rx', color: 'text-amber-500 bg-amber-50' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${item.type === 'lab' ? 'bg-blue-500' : item.type === 'appointment' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        <span className="text-sm font-medium text-slate-700">{item.text}</span>
                    </div>
                    <span className="text-xs text-slate-400">{item.time}</span>
                    </div>
                ))}
                </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;