// src/pages/patient/Adherence.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  TrendingUp, Award, CheckCircle, Clock, XCircle,
  Plus, Loader, Calendar, BarChart3, Activity, Zap,
  Pill, Timer, Star, AlertCircle, X, Search, Edit, Trash2
} from 'lucide-react';
import { adherenceService } from '../../services/adherence.service';
import type { AdherenceDashboard } from '../../services/adherence.service';
import { medicationService } from '../../services/medications.service';

interface PatientMedication {
  id: number;
  medication_id: number;
  dosage: string;
  instructions?: string;
  medication?: {
    id: number;
    name: string;
    form: string;
  };
}

export const PatientAdherence = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<AdherenceDashboard | null>(null);
  const [medications, setMedications] = useState<PatientMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'overall'>('weekly');
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<PatientMedication | null>(null);
  const [loggingDose, setLoggingDose] = useState(false);

  // New state for full logs history
  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    status: 'taken' as 'taken' | 'skipped' | 'missed',
    notes: ''
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'taken' | 'skipped' | 'missed'>('all');
  const [medicationFilter, setMedicationFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [medicationStats, setMedicationStats] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard data, medications, and all logs in parallel
      const [dashboardData, medicationsData, logsData] = await Promise.all([
        adherenceService.getDashboard(),
        medicationService.getPatientMedications(user.id),
        adherenceService.getLogs({ limit: 100 })
      ]);

      setDashboard(dashboardData);
      setMedications(medicationsData);
      setAllLogs(logsData);

      // Fetch medication-specific stats
      const medStats = [];
      for (const medication of medicationsData) {
        try {
          const stats = await adherenceService.getStats('weekly', medication.id);
          medStats.push({
            medication: medication,
            stats: stats
          });
        } catch (err) {
          console.warn(`Could not fetch stats for medication ${medication.id}:`, err);
        }
      }
      setMedicationStats(medStats);
    } catch (err: any) {
      console.error('Error fetching adherence data:', err);
      setError(err.message || 'Failed to load adherence data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStats = () => {
    if (!dashboard) return null;

    switch (selectedPeriod) {
      case 'daily': return dashboard.daily_stats;
      case 'weekly': return dashboard.weekly_stats;
      case 'monthly': return dashboard.overall_stats;
      case 'overall': return dashboard.overall_stats;
      default: return dashboard.weekly_stats;
    }
  };

  const getAdherenceColor = (score: number) => {
    if (score >= 90) return 'text-secondary-600';
    if (score >= 75) return 'text-primary-600';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getAdherenceBgColor = (score: number) => {
    if (score >= 90) return 'bg-secondary-50 border-secondary-200';
    if (score >= 75) return 'bg-primary-50 border-primary-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getAdherenceIcon = (score: number) => {
    if (score >= 90) return <Star className="w-5 h-5 text-secondary-600" />;
    if (score >= 75) return <TrendingUp className="w-5 h-5 text-primary-600" />;
    if (score >= 60) return <Activity className="w-5 h-5 text-warning" />;
    return <AlertCircle className="w-5 h-5 text-error" />;
  };

  const getAdherenceLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Attention';
  };

  const handleLogDose = async (medication: PatientMedication, status: 'taken' | 'skipped' | 'missed', notes?: string) => {
    try {
      setLoggingDose(true);

      const logData = {
        patient_medication_id: medication.id,
        scheduled_time: new Date().toISOString(),
        status,
        actual_time: status === 'taken' ? new Date().toISOString() : undefined,
        notes,
        skipped_reason: status === 'skipped' ? notes : undefined,
      };

      await adherenceService.logDose(logData);

      // Refresh data
      await fetchData();
      setShowLogModal(false);
      setSelectedMedication(null);
    } catch (err: any) {
      console.error('Error logging dose:', err);
      setError('Failed to log medication dose');
    } finally {
      setLoggingDose(false);
    }
  };

  const handleEditLog = async () => {
    if (!selectedLog) return;
    try {
      setLoggingDose(true);
      const data = {
        actual_time: editForm.status === 'taken' ? new Date().toISOString() : undefined,
        status: editForm.status,
        notes: editForm.notes || undefined
      };
      await adherenceService.updateLog(selectedLog.id, data);
      setShowEditModal(false);
      setSelectedLog(null);
      await fetchData();
    } catch (err: any) {
      console.error('Error updating log:', err);
      setError('Failed to update log');
    } finally {
      setLoggingDose(false);
    }
  };

  const handleDeleteLog = async () => {
    if (!selectedLog) return;
    try {
      setLoggingDose(true);
      await adherenceService.deleteLog(selectedLog.id);
      setShowDeleteModal(false);
      setSelectedLog(null);
      await fetchData();
    } catch (err: any) {
      console.error('Error deleting log:', err);
      setError('Failed to delete log');
    } finally {
      setLoggingDose(false);
    }
  };

  const openEditModal = (log: any) => {
    setSelectedLog(log);
    setEditForm({
      status: log.status,
      notes: log.notes || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (log: any) => {
    setSelectedLog(log);
    setShowDeleteModal(true);
  };

  // Filter logs
  const filteredLogs = allLogs.filter((log) => {
    const matchesSearch = log.medication_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.dosage?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesMedication = medicationFilter === 'all' || log.patient_medication_id.toString() === medicationFilter;
    return matchesSearch && matchesStatus && matchesMedication;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="animate-spin text-primary-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading your adherence data...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Data</h3>
            <p className="text-gray-600 mb-6">{error || 'Failed to load adherence data'}</p>
            <Button onClick={fetchData} className="bg-primary-600 hover:bg-primary-700">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getCurrentStats();
  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Medication Adherence</h1>
        <p className="text-lg text-gray-600">Track your medication compliance and stay on top of your health</p>
      </div>

      {/* Period Selector */}
      <div className="flex justify-center">
        <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200 inline-flex">
          {[
            { key: 'daily', label: 'Today', icon: Calendar },
            { key: 'weekly', label: 'This Week', icon: BarChart3 },
            { key: 'monthly', label: 'This Month', icon: Activity },
            { key: 'overall', label: 'Overall', icon: TrendingUp },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedPeriod(key as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedPeriod === key
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Adherence Score */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-bl-3xl opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getAdherenceBgColor(stats.adherence_score)}`}>
                {getAdherenceIcon(stats.adherence_score)}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Adherence Score</p>
              <div className="flex items-baseline gap-2">
                <h3 className={`text-3xl font-bold ${getAdherenceColor(stats.adherence_score)}`}>
                  {stats.adherence_score.toFixed(1)}%
                </h3>
                <span className="text-sm text-gray-500">
                  {stats.total_taken}/{stats.total_scheduled}
                </span>
              </div>
              <p className="text-xs text-gray-500">{getAdherenceLabel(stats.adherence_score)}</p>
            </div>
          </div>
        </Card>

        {/* Current Streak */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-bl-3xl opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-100">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <h3 className="text-3xl font-bold text-orange-600">{stats.current_streak}</h3>
              <p className="text-xs text-gray-500">
                {stats.current_streak === 1 ? 'day' : 'days'} in a row
              </p>
            </div>
          </div>
        </Card>

        {/* On-Time Score */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-bl-3xl opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100">
                <Timer className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
              <h3 className="text-3xl font-bold text-green-600">{stats.on_time_score.toFixed(1)}%</h3>
              <p className="text-xs text-gray-500">Taken on schedule</p>
            </div>
          </div>
        </Card>

        {/* Best Streak */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-bl-3xl opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Best Streak</p>
              <h3 className="text-3xl font-bold text-purple-600">{stats.longest_streak}</h3>
              <p className="text-xs text-gray-500">
                {stats.longest_streak === 1 ? 'day' : 'days'} record
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card variant="elevated" className="sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Pill className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                <p className="text-sm text-gray-600">Log your medications</p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => setShowLogModal(true)}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Log Medication Dose
              </Button>

              {medications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Today's Medications</h3>
                  {medications.slice(0, 3).map((medication) => (
                    <div key={medication.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{medication.medication?.name}</p>
                        <p className="text-sm text-gray-600">{medication.dosage}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLogDose(medication, 'taken')}
                          disabled={loggingDose}
                          className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                          title="Mark as taken"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleLogDose(medication, 'skipped')}
                          disabled={loggingDose}
                          className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                          title="Mark as skipped"
                        >
                          <Clock className="w-4 h-4 text-yellow-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Charts and Trends */}
        <div className="lg:col-span-2 space-y-6">
          {/* 7-Day Trend Chart */}
          {dashboard.chart_data && dashboard.chart_data.length > 0 && (
            <Card variant="elevated">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">7-Day Adherence Trend</h2>
                  <p className="text-sm text-gray-600">Your daily adherence scores</p>
                </div>
              </div>

              <div className="space-y-4">
                {dashboard.chart_data.slice(-7).map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-medium text-gray-600">
                      {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              item.score >= 90 ? 'bg-secondary-500' :
                              item.score >= 75 ? 'bg-primary-500' :
                              item.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.score}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-right">
                          <span className={`text-sm font-bold ${
                            item.score >= 90 ? 'text-secondary-600' :
                            item.score >= 75 ? 'text-primary-600' :
                            item.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {item.score.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Activity */}
          {dashboard.recent_logs && dashboard.recent_logs.length > 0 && (
            <Card variant="elevated">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                  <p className="text-sm text-gray-600">Your latest medication logs</p>
                </div>
              </div>

              <div className="space-y-3">
                {dashboard.recent_logs.slice(0, 5).map((log) => {
                  const statusConfigs = {
                    taken: { icon: <CheckCircle size={16} />, color: 'text-green-600', bg: 'bg-green-50', label: 'Taken' },
                    skipped: { icon: <Clock size={16} />, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Skipped' },
                    missed: { icon: <XCircle size={16} />, color: 'text-red-600', bg: 'bg-red-50', label: 'Missed' },
                  };
                  const statusConfig = statusConfigs[log.status as keyof typeof statusConfigs] || {
                    icon: <Clock size={16} />, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Unknown'
                  };

                  return (
                    <div key={log.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                      <div className={`p-3 rounded-xl ${statusConfig.bg}`}>
                        <div className={statusConfig.color}>{statusConfig.icon}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Medication Dose</p>
                            <p className="text-sm text-gray-600">
                              {new Date(log.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(log.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Medication-Specific Adherence */}
      {medicationStats.length > 0 && (
        <Card variant="elevated">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Pill className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Adherence by Medicine</h2>
              <p className="text-sm text-gray-600">Your adherence performance for each medication</p>
            </div>
          </div>

          <div className="space-y-4">
            {medicationStats.map(({ medication, stats }) => (
              <div key={medication.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Pill className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{medication.medication?.name}</h3>
                    <p className="text-sm text-gray-600">{medication.dosage} • {medication.times_per_day}x daily</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className={`text-lg font-bold ${getAdherenceColor(stats.adherence_score)}`}>
                        {stats.adherence_score.toFixed(1)}%
                      </div>
                      <p className="text-xs text-gray-500">
                        {stats.total_taken}/{stats.total_scheduled} taken
                      </p>
                    </div>
                    <div className="w-20">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            stats.adherence_score >= 90 ? 'bg-secondary-500' :
                            stats.adherence_score >= 75 ? 'bg-primary-500' :
                            stats.adherence_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${stats.adherence_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Medication Logs History */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Medication Logs History</h2>
              <p className="text-sm text-gray-600">Complete history of your medication doses</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search medications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="taken">Taken</option>
            <option value="skipped">Skipped</option>
            <option value="missed">Missed</option>
          </select>
          <select
            value={medicationFilter}
            onChange={(e) => setMedicationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Medications</option>
            {medications.map((med) => (
              <option key={med.id} value={med.id.toString()}>{med.medication?.name} - {med.dosage}</option>
            ))}
          </select>
        </div>

        {/* Logs Table */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600 mb-2">No medication logs found</p>
            <p className="text-sm text-gray-500">
              {allLogs.length === 0 ? 'Start by logging your first dose' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => {
                  const statusConfigs = {
                    taken: { icon: <CheckCircle size={16} />, color: 'text-green-600', bg: 'bg-green-50', label: 'Taken' },
                    skipped: { icon: <Clock size={16} />, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Skipped' },
                    missed: { icon: <XCircle size={16} />, color: 'text-red-600', bg: 'bg-red-50', label: 'Missed' },
                  };
                  const statusConfig = statusConfigs[log.status as keyof typeof statusConfigs] || {
                    icon: <Clock size={16} />, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Unknown'
                  };

                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.medication_name}</p>
                          <p className="text-xs text-gray-500">{log.dosage}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.scheduled_time).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.actual_time ? new Date(log.actual_time).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {log.notes || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(log)}
                            className="text-primary-600 hover:text-primary-800 p-1 rounded"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(log)}
                            className="text-red-600 hover:text-red-800 p-1 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Log Medication Dose</h3>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Medication</label>
                <div className="space-y-2">
                  {medications.map((medication) => (
                    <button
                      key={medication.id}
                      onClick={() => setSelectedMedication(medication)}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        selectedMedication?.id === medication.id
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-200'
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{medication.medication?.name}</p>
                        <p className="text-sm text-gray-600">{medication.dosage}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedMedication && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Action</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleLogDose(selectedMedication, 'taken')}
                        disabled={loggingDose}
                        className="flex items-center justify-center gap-2 p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-all disabled:opacity-50"
                      >
                        {loggingDose ? <Loader className="animate-spin w-5 h-5" /> : <CheckCircle className="w-5 h-5 text-green-600" />}
                        <span className="font-medium text-green-700">Mark Taken</span>
                      </button>
                      <button
                        onClick={() => handleLogDose(selectedMedication, 'skipped')}
                        disabled={loggingDose}
                        className="flex items-center justify-center gap-2 p-4 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 rounded-xl transition-all disabled:opacity-50"
                      >
                        {loggingDose ? <Loader className="animate-spin w-5 h-5" /> : <Clock className="w-5 h-5 text-yellow-600" />}
                        <span className="font-medium text-yellow-700">Mark Skipped</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Log Modal */}
      {showEditModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Edit Dose Log</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="taken">Taken</option>
                  <option value="skipped">Skipped</option>
                  <option value="missed">Missed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Notes (optional)</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditLog}
                disabled={loggingDose}
                className="flex-1"
              >
                {loggingDose ? <Loader className="animate-spin w-4 h-4 mr-2" /> : null}
                Update Log
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Delete Dose Log</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 mb-2">Are you sure you want to delete this dose log?</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-900"><strong>{selectedLog.medication_name}</strong></p>
                    <p className="text-xs text-gray-500">
                      Scheduled: {new Date(selectedLog.scheduled_time).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Status: {selectedLog.status}</p>
                  </div>
                  <p className="text-sm text-red-600 mt-3">This action cannot be undone.</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteLog}
                disabled={loggingDose}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {loggingDose ? <Loader className="animate-spin w-4 h-4 mr-2" /> : null}
                Delete Log
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};