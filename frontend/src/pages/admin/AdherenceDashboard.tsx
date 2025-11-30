import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  AlertTriangle, CheckCircle, Clock, XCircle, Loader, Search,
  Users, TrendingUp, Activity, Shield, Eye, BarChart3,
  User, Calendar, Target, Zap, Star, AlertCircle
} from 'lucide-react';
import { adherenceService } from '../../services/adherence.service';
import type { AdherenceDashboard } from '../../services/adherence.service';
import { patientService } from '../../services/patient.service';

interface PatientOverview {
  id: number;
  name: string;
  adherence_score: number;
  current_streak: number;
  total_medications: number;
  last_log_date?: string;
  risk_level: 'low' | 'medium' | 'high';
}

export const AdminAdherenceDashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientOverview[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOverview | null>(null);
  const [patientDashboard, setPatientDashboard] = useState<AdherenceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [patientLoading, setPatientLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'adherence' | 'risk'>('risk');

  useEffect(() => {
    fetchPatientsOverview();
  }, []);

  const fetchPatientsOverview = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all patients
      const patientsData = await patientService.getAllPatients();

      // Get adherence stats for each patient
      const patientsWithAdherence = await Promise.all(
        patientsData.map(async (patient) => {
          try {
            const stats = await adherenceService.getPatientAdherenceStats(patient.id, 'weekly');
            const riskLevel: 'low' | 'medium' | 'high' = stats.adherence_score >= 80 ? 'low' :
                             stats.adherence_score >= 60 ? 'medium' : 'high';

            return {
              id: patient.id,
              name: patient.user?.full_name || `Patient ${patient.id}`,
              adherence_score: stats.adherence_score,
              current_streak: stats.current_streak,
              total_medications: 0, // We'll need to get this from medications endpoint
              last_log_date: undefined, // We'll need to get this from logs
              risk_level: riskLevel,
            };
          } catch (err) {
            // If no adherence data, return default values
            return {
              id: patient.id,
              name: patient.user?.full_name || `Patient ${patient.id}`,
              adherence_score: 0,
              current_streak: 0,
              total_medications: 0,
              risk_level: 'high' as const,
            };
          }
        })
      );

      setPatients(patientsWithAdherence);
    } catch (err: any) {
      console.error('Error fetching patients overview:', err);
      setError(err.message || 'Failed to load patients data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (patient: PatientOverview) => {
    try {
      setPatientLoading(true);
      setSelectedPatient(patient);

      const dashboard = await adherenceService.getPatientDashboard(patient.id);
      setPatientDashboard(dashboard);
    } catch (err: any) {
      console.error('Error fetching patient details:', err);
      setError('Failed to load patient adherence details');
    } finally {
      setPatientLoading(false);
    }
  };

  const getRiskConfig = (risk: string) => {
    switch (risk) {
      case 'low':
        return {
          color: 'text-secondary-600',
          bg: 'bg-secondary-50 border-secondary-200',
          icon: <Shield className="w-5 h-5 text-secondary-600" />,
          label: 'Low Risk',
          description: 'Excellent adherence'
        };
      case 'medium':
        return {
          color: 'text-warning',
          bg: 'bg-yellow-50 border-yellow-200',
          icon: <AlertTriangle className="w-5 h-5 text-warning" />,
          label: 'Medium Risk',
          description: 'Needs attention'
        };
      case 'high':
        return {
          color: 'text-error',
          bg: 'bg-red-50 border-red-200',
          icon: <AlertCircle className="w-5 h-5 text-error" />,
          label: 'High Risk',
          description: 'Requires intervention'
        };
      default:
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-50 border-gray-200',
          icon: <Clock className="w-5 h-5 text-gray-600" />,
          label: 'Unknown',
          description: 'No data available'
        };
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
    if (score >= 90) return <Star className="w-4 h-4 text-secondary-600" />;
    if (score >= 75) return <TrendingUp className="w-4 h-4 text-primary-600" />;
    if (score >= 60) return <Activity className="w-4 h-4 text-warning" />;
    return <AlertCircle className="w-4 h-4 text-error" />;
  };

  const filteredAndSortedPatients = patients
    .filter(patient => patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'adherence':
          return b.adherence_score - a.adherence_score;
        case 'risk':
          const riskOrder = { high: 3, medium: 2, low: 1 };
          return riskOrder[b.risk_level] - riskOrder[a.risk_level];
        default:
          return 0;
      }
    });

  const riskSummary = {
    low: patients.filter(p => p.risk_level === 'low').length,
    medium: patients.filter(p => p.risk_level === 'medium').length,
    high: patients.filter(p => p.risk_level === 'high').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="animate-spin text-primary-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading patient adherence data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Data</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchPatientsOverview} className="bg-primary-600 hover:bg-primary-700">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Adherence Management</h1>
        <p className="text-lg text-gray-600">Monitor and support patient medication compliance</p>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-bl-3xl opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-green-100`}>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Low Risk Patients</p>
              <h3 className="text-3xl font-bold text-green-600">{riskSummary.low}</h3>
              <p className="text-xs text-gray-500">≥80% adherence</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-bl-3xl opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-yellow-100">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Medium Risk Patients</p>
              <h3 className="text-3xl font-bold text-yellow-600">{riskSummary.medium}</h3>
              <p className="text-xs text-gray-500">60-79% adherence</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-bl-3xl opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">High Risk Patients</p>
              <h3 className="text-3xl font-bold text-red-600">{riskSummary.high}</h3>
              <p className="text-xs text-gray-500">&lt;60% adherence</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Patients List */}
        <div className="xl:col-span-2">
          <Card variant="elevated">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Patient Overview</h2>
                  <p className="text-sm text-gray-600">Monitor adherence across all patients</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Sort Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="risk">Risk Level</option>
                    <option value="adherence">Adherence</option>
                    <option value="name">Name</option>
                  </select>
                </div>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredAndSortedPatients.map((patient) => {
                const riskConfig = getRiskConfig(patient.risk_level);
                return (
                  <div
                    key={patient.id}
                    onClick={() => fetchPatientDetails(patient)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedPatient?.id === patient.id
                        ? 'border-primary-300 bg-primary-50 shadow-md'
                        : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${riskConfig.bg}`}>
                          {riskConfig.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-gray-400" />
                              <span className={`text-sm font-medium ${getAdherenceColor(patient.adherence_score)}`}>
                                {patient.adherence_score.toFixed(1)}% adherence
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {patient.current_streak} day streak
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${riskConfig.bg} ${riskConfig.color} border`}>
                          {riskConfig.icon}
                          <span>{riskConfig.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{riskConfig.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Patient Details Panel */}
        <div className="xl:col-span-1">
          <Card variant="elevated" className="sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Patient Details</h2>
                <p className="text-sm text-gray-600">
                  {selectedPatient ? `Viewing ${selectedPatient.name}` : 'Select a patient'}
                </p>
              </div>
            </div>

            {selectedPatient && (
              <div className="mb-4">
                <Button
                  onClick={() => navigate(`/admin/adherence/${selectedPatient.id}`)}
                  className="w-full bg-primary-600 hover:bg-primary-700"
                >
                  View Detailed Adherence Analysis
                </Button>
              </div>
            )}

            {patientLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader className="animate-spin text-primary-600 mx-auto mb-4" size={32} />
                  <p className="text-sm text-gray-600">Loading patient data...</p>
                </div>
              </div>
            ) : selectedPatient && patientDashboard ? (
              <div className="space-y-6">
                {/* Patient Stats */}
                <div className="grid grid-cols-1 gap-4">
                  <div className={`p-4 rounded-xl ${getAdherenceBgColor(patientDashboard.weekly_stats.adherence_score)} border`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Weekly Adherence</span>
                      {getAdherenceIcon(patientDashboard.weekly_stats.adherence_score)}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-bold ${getAdherenceColor(patientDashboard.weekly_stats.adherence_score)}`}>
                        {patientDashboard.weekly_stats.adherence_score.toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500">
                        {patientDashboard.weekly_stats.total_taken}/{patientDashboard.weekly_stats.total_scheduled}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Current Streak</span>
                      <Zap className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-2xl font-bold text-orange-600">
                      {patientDashboard.weekly_stats.current_streak}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">days in a row</p>
                  </div>
                </div>

                {/* Recent Activity */}
                {patientDashboard.recent_logs && patientDashboard.recent_logs.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-4 h-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="space-y-3">
                      {patientDashboard.recent_logs.slice(0, 4).map((log) => {
                        const statusConfigs = {
                          taken: { icon: <CheckCircle size={16} />, color: 'text-green-600', bg: 'bg-green-50', label: 'Taken' },
                          skipped: { icon: <Clock size={16} />, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Skipped' },
                          missed: { icon: <XCircle size={16} />, color: 'text-red-600', bg: 'bg-red-50', label: 'Missed' },
                        };
                        const statusConfig = statusConfigs[log.status as keyof typeof statusConfigs] || {
                          icon: <Clock size={16} />, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Unknown'
                        };

                        return (
                          <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                            <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                              <div className={statusConfig.color}>{statusConfig.icon}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">Medication Dose</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <p className="text-xs text-gray-500">
                                  {new Date(log.scheduled_time).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 7-Day Trend */}
                {patientDashboard.chart_data && patientDashboard.chart_data.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-4 h-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">7-Day Trend</h3>
                    </div>
                    <div className="space-y-3">
                      {patientDashboard.chart_data.slice(-7).map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 w-12">
                            {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-1000 ${
                                    item.score >= 90 ? 'bg-secondary-500' :
                                    item.score >= 75 ? 'bg-primary-500' :
                                    item.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${item.score}%` }}
                                ></div>
                              </div>
                              <span className={`text-xs font-bold w-10 ${getAdherenceColor(item.score)}`}>
                                {item.score.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <User className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No patient selected</p>
                <p className="text-sm text-gray-400">Click on a patient from the list to view their adherence details</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};