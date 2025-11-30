import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  CheckCircle, Clock, XCircle, Loader,
  TrendingUp, Activity, BarChart3,
  Target, Zap, Star, AlertCircle, ArrowLeft,
  Pill, Filter
} from 'lucide-react';
import { adherenceService } from '../../services/adherence.service';
import type { AdherenceStats, AdherenceChartData, MedicationLog } from '../../services/adherence.service';
import { patientService } from '../../services/patient.service';
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

interface MedicationAdherenceCardProps {
  medication: PatientMedication;
  patientId: number;
  selectedPeriod: 'daily' | 'weekly' | 'monthly' | 'overall';
  getAdherenceBgColor: (score: number) => string;
  getAdherenceColor: (score: number) => string;
}

const MedicationAdherenceCard = ({
  medication,
  patientId,
  selectedPeriod,
  getAdherenceBgColor,
  getAdherenceColor
}: MedicationAdherenceCardProps) => {
  const [stats, setStats] = useState<AdherenceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicationStats();
  }, [medication.id, selectedPeriod]);

  const fetchMedicationStats = async () => {
    try {
      setLoading(true);
      const medStats = await adherenceService.getPatientAdherenceStats(
        patientId,
        selectedPeriod,
        medication.id
      );
      setStats(medStats);
    } catch (err) {
      console.error('Error fetching medication stats:', err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-center">
          <Loader className="animate-spin w-4 h-4 text-gray-400" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{medication.medication?.name}</h3>
          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
            No data
          </span>
        </div>
        <p className="text-sm text-gray-600">{medication.dosage}</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{medication.medication?.name}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getAdherenceBgColor(stats.adherence_score)} ${getAdherenceColor(stats.adherence_score)}`}>
          {stats.adherence_score.toFixed(1)}%
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{medication.dosage}</p>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>Taken: {stats.total_taken}/{stats.total_scheduled}</span>
        <span>Streak: {stats.current_streak} days</span>
      </div>
    </div>
  );
};

export const PatientAdherenceDetails = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<any>(null);
  const [medications, setMedications] = useState<PatientMedication[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'overall'>('weekly');
  const [selectedMedication, setSelectedMedication] = useState<number | null>(null);
  const [stats, setStats] = useState<AdherenceStats | null>(null);
  const [chartData, setChartData] = useState<AdherenceChartData[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      fetchAdherenceData();
    }
  }, [patientId, selectedPeriod, selectedMedication]);

  const fetchPatientData = async () => {
    try {
      const patientIdNum = parseInt(patientId!);
      const [patientData, medicationsData] = await Promise.all([
        patientService.getPatientById(patientIdNum),
        medicationService.getPatientMedications(patientIdNum)
      ]);
      setPatient(patientData);
      setMedications(medicationsData);
    } catch (err: any) {
      console.error('Error fetching patient data:', err);
      setError('Failed to load patient data');
    }
  };

  const fetchAdherenceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const patientIdNum = parseInt(patientId!);
      const [statsData, chartDataResult, logsData] = await Promise.all([
        adherenceService.getPatientAdherenceStats(patientIdNum, selectedPeriod, selectedMedication || undefined),
        adherenceService.getChartData(14),
        adherenceService.getPatientLogs(patientIdNum, {
          patient_medication_id: selectedMedication || undefined,
          limit: 50
        })
      ]);

      setStats(statsData);
      setChartData(chartDataResult);
      setLogs(logsData);
    } catch (err: any) {
      console.error('Error fetching adherence data:', err);
      setError('Failed to load adherence data');
    } finally {
      setLoading(false);
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

  if (loading && !patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Data</h3>
            <p className="text-gray-600 mb-6">{error || 'Patient not found'}</p>
            <Button onClick={() => navigate('/admin/adherence')} className="bg-primary-600 hover:bg-primary-700">
              Back to Adherence Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/adherence')}
              leftIcon={<ArrowLeft size={16} />}
            >
              Back to Adherence Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{patient.user?.full_name}</h1>
              <p className="text-lg text-gray-600">Detailed Adherence Analysis</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Adherence Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="overall">Overall</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medication Filter</label>
              <select
                value={selectedMedication || ''}
                onChange={(e) => setSelectedMedication(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Medications</option>
                {medications.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.medication?.name} - {med.dosage}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button onClick={fetchAdherenceData} disabled={loading} className="w-full">
                {loading ? <Loader className="animate-spin w-4 h-4 mr-2" /> : null}
                Refresh Data
              </Button>
            </div>
          </div>
        </Card>

        {/* Adherence Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <Card variant="elevated" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-bl-3xl opacity-50"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-green-100">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">On-Time Score</p>
                  <h3 className="text-3xl font-bold text-green-600">{stats.on_time_score.toFixed(1)}%</h3>
                  <p className="text-xs text-gray-500">Taken on schedule</p>
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-bl-3xl opacity-50"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-purple-100">
                    <Target className="w-5 h-5 text-purple-600" />
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
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart Data */}
          {chartData.length > 0 && (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">14-Day Adherence Trend</h2>
              </div>

              <div className="space-y-4">
                {chartData.slice(-14).map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-medium text-gray-600">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                          <span className={`text-sm font-bold ${getAdherenceColor(item.score)}`}>
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

          {/* Medication Breakdown */}
          {medications.length > 0 && (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <Pill className="w-5 h-5 text-teal-600" />
                <h2 className="text-xl font-bold text-gray-900">Medication Breakdown</h2>
              </div>

              <div className="space-y-4">
                {medications.map((medication) => (
                  <MedicationAdherenceCard
                    key={medication.id}
                    medication={medication}
                    patientId={parseInt(patientId!)}
                    selectedPeriod={selectedPeriod}
                    getAdherenceBgColor={getAdherenceBgColor}
                    getAdherenceColor={getAdherenceColor}
                  />
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Recent Logs */}
        {logs.length > 0 && (
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-bold text-gray-900">Recent Medication Logs ({logs.length})</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Medication</th>
                    <th className="px-4 py-2 text-left">Scheduled Time</th>
                    <th className="px-4 py-2 text-left">Actual Time</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">On Time</th>
                    <th className="px-4 py-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-200">
                      <td className="px-4 py-2 font-medium">
                        {log.medication_name || 'Unknown'}
                        {log.medication_form && <span className="text-gray-500"> ({log.medication_form})</span>}
                      </td>
                      <td className="px-4 py-2">{new Date(log.scheduled_time).toLocaleString()}</td>
                      <td className="px-4 py-2">
                        {log.actual_time ? new Date(log.actual_time).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.status === 'taken' ? 'bg-green-100 text-green-800' :
                          log.status === 'skipped' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {log.on_time ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </td>
                      <td className="px-4 py-2 max-w-xs truncate">{log.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};