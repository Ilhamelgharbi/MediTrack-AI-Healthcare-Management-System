import React, { useState, useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
import type { MedicationListProps } from './types';
import { PatientMedicationCard } from './PatientMedicationCard';
import { MedicationSearchFilter } from './MedicationSearchFilter';
import { MedicationLoadingState } from './MedicationLoadingState';
import { MedicationEmptyState } from './MedicationEmptyState';
import { MedicationDashboardStats } from './MedicationDashboardStats';
import type { PatientMedicationDetailed } from '../../types/medications.types';

interface PatientMedicationListProps extends Omit<MedicationListProps, 'onEdit' | 'onDelete'> {
  onActivate?: (medication: PatientMedicationDetailed) => void;
}

export const PatientMedicationList: React.FC<PatientMedicationListProps> = ({
  medications,
  onView,
  onActivate,
  loading = false,
  showActions = true,
  compact = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'stopped'>('all');

  const filteredMedications = useMemo(() => {
    return medications.filter(med => {
      const matchesSearch = med.medication?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           med.dosage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           false;
      const matchesStatus = statusFilter === 'all' || med.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [medications, searchTerm, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: medications.length,
      active: medications.filter(m => m.status === 'active').length,
      pending: medications.filter(m => m.status === 'pending').length,
      stopped: medications.filter(m => m.status === 'stopped').length,
    };
  }, [medications]);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status as 'all' | 'active' | 'pending' | 'stopped');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Statistics */}
      <MedicationDashboardStats
        total={statusCounts.all}
        active={statusCounts.active}
        pending={statusCounts.pending}
        stopped={statusCounts.stopped}
      />

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <MedicationSearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          placeholder="Search by name or dosage..."
        />
      </div>

      {/* Loading State */}
      {loading && (
        <MedicationLoadingState />
      )}

      {/* Medications Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedications.map((medication) => (
            <PatientMedicationCard
              key={medication.id}
              medication={medication}
              onView={onView}
              onActivate={onActivate}
              showActions={showActions}
              compact={compact}
              className="h-full"
            />
          ))}

          {filteredMedications.length === 0 && (
            <div className="col-span-full">
              <MedicationEmptyState
                title={statusFilter === 'pending' ? 'No pending medications' : statusFilter === 'active' ? 'No active medications' : statusFilter === 'stopped' ? 'No stopped medications' : 'No medications found'}
                message={searchTerm ? 'Try adjusting your search terms' : 'Your medications will appear here once prescribed'}
                icon={CheckCircle}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};