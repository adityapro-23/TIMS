export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export type UserRole = 
  | 'depot-supervisor'
  | 'fitness-cert-manager'
  | 'job-cards-manager'
  | 'branding-manager'
  | 'cleaning-data-manager'
  | 'mileage-manager'
  | 'stabling-geometry-manager'
  | 'admin';

export interface JobCard {
  id: string;
  train_id: string;
  job_card_id: string;
  job_category: 'Preventive' | 'Brake' | 'HVAC' | 'Electrical' | 'Bogie' | 'Cleaning' | 'Software';
  priority: 'Low' | 'Medium' | 'High';
  issue_date: string;
  completion_date: string;
  due_date: string;
  status: 'Open' | 'Closed';
  blocking_induction: boolean;
  created_by: string;
}

export interface FitnessCertificate {
  id: string;
  fit_id: string;
  train_id: string;
  dept: 'RollingStock' | 'Signalling' | 'Telecom';
  valid_from: string;
  valid_to: string;
  remarks: string;
  created_date: string;
}

export interface BrandingWindow {
  id: string;
  brand_name: string;
  train_id: string;
  start_datetime: string;
  end_datetime: string;
  required_hours: number;
  exposure_hours_completed: number;
}

export interface CleaningData {
  id: string;
  train_id: string;
  cleaning_type: 'Regular' | 'Deep';
  track_name: 'L1' | 'L2' | 'M1' | 'M2';
  issue_date: string;
  completion_date: string;
  submitted_at: string;
}

export interface MileageData {
  id: string;
  train_id: string;
  daily_km: number;
  km_after_last_maintenance: number;
  date: string;
}

export interface StablingGeometry {
  id: string;
  train_id: string;
  track_name: string;
  slot_position: 1 | 2;
  status: 'Empty' | 'Occupied';
  submitted_at: string;
}

export interface InductionPlan {
  rank: number;
  train_id: string;
  recommended_action: 'Service' | 'Standby' | 'IBL';
  reasons: string[];
  shunt_cost: number;
  predicted_risk: 'Low' | 'Medium' | 'High';
}

export interface AuditEntry {
  id: string;
  user: string;
  role: UserRole;
  timestamp: string;
  action: string;
  reason: string;
  train_id?: string;
  before_snapshot?: any;
  after_snapshot?: any;
}

export interface Conflict {
  id: string;
  type: 'missing_certificate' | 'open_job_card' | 'cleaning_not_scheduled' | 'branding_sla_breach';
  train_id: string;
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  related_id?: string;
}