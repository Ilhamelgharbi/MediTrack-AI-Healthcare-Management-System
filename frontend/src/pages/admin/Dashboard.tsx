// src/pages/admin/Dashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DashboardLoadingModal, DashboardErrorModal, StatCard } from '../../components/common';
import {
  Users, UserCheck, AlertTriangle, Pill, Activity
} from 'lucide-react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { patientsAPI } from '../../services/patient.service';

interface AdminDashboardData {
  total_patients: number;
  active_patients: number;
  critical_patients: number;
  total_medications: number;
  recent_activities: Array<{
    id: number;
    type: 'medication_assigned' | 'medication_stopped' | 'patient_admitted' | 'patient_discharged';
    description: string;
    timestamp: string;
  }>;
  patient_trends: Array<{
    date: string;
    new_patients: number;
    active_patients: number;
  }>;
  medication_stats: {
    total_assigned: number;
    active_medications: number;
    adherence_rate: number;
  };
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch patients data
      const patients = await patientsAPI.getAllPatients();

      // Mock admin dashboard data - replace with actual API calls later
      const mockDashboard: AdminDashboardData = {
        total_patients: patients.length,
        active_patients: patients.filter(p => p.status === 'stable').length,
        critical_patients: patients.filter(p => p.status === 'critical').length,
        total_medications: 0, // TODO: Fetch from medications API
        recent_activities: [
          { id: 1, type: 'medication_assigned', description: 'Lisinopril assigned to John Doe', timestamp: '2024-11-26T10:30:00' },
          { id: 2, type: 'patient_admitted', description: 'Jane Smith admitted to care', timestamp: '2024-11-26T09:15:00' },
          { id: 3, type: 'medication_stopped', description: 'Metformin stopped for Bob Johnson', timestamp: '2024-11-25T16:45:00' },
          { id: 4, type: 'patient_discharged', description: 'Alice Brown discharged', timestamp: '2024-11-25T14:20:00' },
        ],
        patient_trends: [
          { date: '2024-11-20', new_patients: 2, active_patients: 45 },
          { date: '2024-11-21', new_patients: 1, active_patients: 46 },
          { date: '2024-11-22', new_patients: 3, active_patients: 48 },
          { date: '2024-11-23', new_patients: 0, active_patients: 48 },
          { date: '2024-11-24', new_patients: 2, active_patients: 50 },
          { date: '2024-11-25', new_patients: 1, active_patients: 51 },
          { date: '2024-11-26', new_patients: 2, active_patients: 53 },
        ],
        medication_stats: {
          total_assigned: 127,
          active_medications: 89,
          adherence_rate: 84
        }
      };

      setDashboard(mockDashboard);
    } catch (err: unknown) {
      console.error('Error fetching dashboard data:', err);
      const message = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  if (loading) {
    return <DashboardLoadingModal />;
  }

  if (error) {
    return <DashboardErrorModal error={error} onRetry={fetchDashboardData} />;
  }

  // Admin stats
  const stats = [
    { title: 'Total Patients', value: dashboard?.total_patients.toString() || '0', icon: Users, color: 'blue' },
    { title: 'Active Patients', value: dashboard?.active_patients.toString() || '0', icon: UserCheck, color: 'emerald' },
    { title: 'Critical Cases', value: dashboard?.critical_patients.toString() || '0', icon: AlertTriangle, color: 'red' },
    { title: 'Total Medications', value: dashboard?.medication_stats.total_assigned.toString() || '0', icon: Pill, color: 'purple' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-heading">
          Admin Dashboard
        </h1>
        <p className="text-slate-600">Monitor patient care and system performance</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Trends */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Patient Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard?.patient_trends || []}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="active_patients"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  name="Active Patients"
                />
                <Line
                  type="monotone"
                  dataKey="new_patients"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  name="New Patients"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Medication Adherence */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Medication Adherence</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Overall Adherence Rate</span>
              <span className="font-semibold text-slate-900">{dashboard?.medication_stats.adherence_rate || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${dashboard?.medication_stats.adherence_rate || 0}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{dashboard?.medication_stats.active_medications || 0}</div>
                <div className="text-sm text-slate-600">Active Medications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{dashboard?.medication_stats.total_assigned || 0}</div>
                <div className="text-sm text-slate-600">Total Assigned</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/patients')}
            className="text-slate-600 hover:text-slate-900"
          >
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {dashboard?.recent_activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className={`p-2 rounded-lg ${
                activity.type === 'medication_assigned' ? 'bg-blue-100' :
                activity.type === 'medication_stopped' ? 'bg-red-100' :
                activity.type === 'patient_admitted' ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                <Activity className={`${
                  activity.type === 'medication_assigned' ? 'text-blue-600' :
                  activity.type === 'medication_stopped' ? 'text-red-600' :
                  activity.type === 'patient_admitted' ? 'text-green-600' : 'text-yellow-600'
                }`} size={16} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{activity.description}</p>
                <p className="text-sm text-slate-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;