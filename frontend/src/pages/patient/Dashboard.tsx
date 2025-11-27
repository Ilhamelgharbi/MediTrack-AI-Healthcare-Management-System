// src/pages/patient/Dashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DashboardLoadingModal, DashboardErrorModal, StatCard } from '../../components/common';
import {
  Pill, Clock, CheckCircle, XCircle
} from 'lucide-react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { medicationService } from '../../services/medications.service';
import { patientService } from '../../services/patient.service';
import type { PatientMedicationDetailed } from '../../types/medications.types';
import type { AdherenceDashboard } from '../../types/adherence.types';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medications, setMedications] = useState<PatientMedicationDetailed[]>([]);
  const [dashboard, setDashboard] = useState<AdherenceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const patientId = user!.id;
      const medicationData = await medicationService.getPatientMedications(patientId, {
        limit: 100,
        include_inactive: true
      });

      setMedications(medicationData);

      // Fetch real adherence dashboard data
      const dashboardData = await patientService.getAdherenceDashboard();
      setDashboard(dashboardData);
    } catch (err: unknown) {
      console.error('Error fetching dashboard data:', err);
      const message = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Work';
  };

  if (loading) {
    return <DashboardLoadingModal />;
  }

  if (error) {
    return <DashboardErrorModal error={error} onRetry={fetchDashboardData} />;
  }

  const adherenceScore = dashboard?.weekly_stats.adherence_score || 0;
  const activeMeds = medications.filter(m => m.status === 'active').length;
  const pendingMeds = medications.filter(m => m.status === 'pending').length;
  const stoppedMeds = medications.filter(m => m.status === 'stopped').length;

  // Stats for the overview
  const stats = [
    { title: 'Active Meds', value: activeMeds.toString(), icon: CheckCircle, color: 'emerald' },
    { title: 'Pending', value: pendingMeds.toString(), icon: Clock, color: 'amber' },
    { title: 'Stopped', value: stoppedMeds.toString(), icon: XCircle, color: 'slate' },
    { title: 'Total', value: medications.length.toString(), icon: Pill, color: 'blue' },
  ];

  // Active medications for preview
  const activeMedications = medications
    .filter(m => m.status === 'active')
    .map(m => ({
      id: m.id,
      medicationName: m.medication?.name || 'Unknown Medication',
      dosage: m.dosage,
      frequency: `${m.times_per_day}x daily`,
      todayTaken: 0, // TODO: Calculate from schedule data
      todayScheduled: m.times_per_day,
    }));

  // Weekly data for trends chart
  const weeklyData = dashboard?.chart_data.map(item => ({
    day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    adherence: item.score
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-heading">
          Welcome back, {user?.full_name?.split(' ')[0]}!
        </h1>
        <p className="text-slate-600">Here's your medication overview for today</p>
      </div>

      {/* VIEW: DASHBOARD OVERVIEW */}
      <div className="space-y-6 animate-fadeIn">
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

        {/* Next Dose Reminder */}
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500 p-3 rounded-lg">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Next Dose Reminder</h3>
                <p className="text-sm text-slate-600">
                  No upcoming doses scheduled
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Active Medications Preview */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Active Medications</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/patient/medications')}
              className="text-slate-600 hover:text-slate-900"
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {activeMedications.slice(0, 3).map((med) => (
              <div key={med.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Pill className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{med.medicationName}</p>
                    <p className="text-sm text-slate-600">{med.dosage} • {med.frequency}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {med.todayTaken}/{med.todayScheduled}
                  </p>
                  <p className="text-xs text-slate-500">today</p>
                </div>
              </div>
            ))}
            {activeMedications.length === 0 && (
              <p className="text-center text-slate-500 py-4">No active medications</p>
            )}
          </div>
        </Card>

        {/* Adherence Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Adherence Score */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Adherence Score</h3>
              <span className={`text-sm font-medium ${getScoreColor(adherenceScore)}`}>
                {getScoreLabel(adherenceScore)}
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">This Week</span>
                <span className="font-semibold text-slate-900">{adherenceScore.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${getScoreColor(adherenceScore).replace('text-', 'bg-')}`}
                  style={{ width: `${adherenceScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </Card>

          {/* Weekly Trends */}
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Weekly Trends</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="adherence"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};