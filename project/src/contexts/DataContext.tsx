import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  JobCard,
  FitnessCertificate,
  BrandingWindow,
  CleaningData,
  MileageData,
  StablingGeometry,
  InductionPlan,
  AuditEntry,
  Conflict
} from '../types';

interface DataContextType {
  // Data states
  jobCards: JobCard[];
  fitnessCertificates: FitnessCertificate[];
  brandingWindows: BrandingWindow[];
  cleaningData: CleaningData[];
  mileageData: MileageData[];
  stablingGeometry: StablingGeometry[];
  inductionPlan: InductionPlan[];
  auditEntries: AuditEntry[];
  conflicts: Conflict[];
  
  // Actions
  addJobCard: (jobCard: Omit<JobCard, 'id'>) => string;
  updateJobCard: (id: string, updates: Partial<JobCard>) => void;
  closeJobCard: (id: string) => void;
  addFitnessCertificate: (cert: Omit<FitnessCertificate, 'id'>) => void;
  addBrandingWindow: (window: Omit<BrandingWindow, 'id'>) => void;
  addCleaningData: (data: Omit<CleaningData, 'id'>) => void;
  updateMileageData: (data: Omit<MileageData, 'id'>) => void;
  addStablingGeometry: (geometry: Omit<StablingGeometry, 'id'>) => void;
  runScheduler: (weights?: any) => void;
  addAuditEntry: (entry: Omit<AuditEntry, 'id'>) => void;
  getNextJobCardId: () => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data
const initialJobCards: JobCard[] = [
  {
    id: '1',
    train_id: 'T001',
    job_card_id: 'JOB2001',
    job_category: 'Preventive',
    priority: 'High',
    issue_date: '2025-01-10',
    completion_date: '2025-01-20',
    due_date: '2025-01-17',
    status: 'Open',
    blocking_induction: true,
    created_by: 'user1'
  },
  {
    id: '2',
    train_id: 'T003',
    job_card_id: 'JOB2002',
    job_category: 'Brake',
    priority: 'Medium',
    issue_date: '2025-01-12',
    completion_date: '2025-01-22',
    due_date: '2025-01-19',
    status: 'Open',
    blocking_induction: true,
    created_by: 'user1'
  }
];

const initialFitnessCertificates: FitnessCertificate[] = [
  {
    id: '1',
    fit_id: 'FIT001',
    train_id: 'T001',
    dept: 'RollingStock',
    valid_from: '2025-01-01',
    valid_to: '2025-12-31',
    remarks: 'All systems operational',
    created_date: '2025-01-01'
  }
];

const initialMileageData: MileageData[] = [
  {
    id: '1',
    train_id: 'T001',
    daily_km: 180,
    km_after_last_maintenance: 2500,
    date: '2025-01-15'
  },
  {
    id: '2',
    train_id: 'T002',
    daily_km: 165,
    km_after_last_maintenance: 1200,
    date: '2025-01-15'
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobCards, setJobCards] = useState<JobCard[]>(initialJobCards);
  const [fitnessCertificates, setFitnessCertificates] = useState<FitnessCertificate[]>(initialFitnessCertificates);
  const [brandingWindows, setBrandingWindows] = useState<BrandingWindow[]>([]);
  const [cleaningData, setCleaningData] = useState<CleaningData[]>([]);
  const [mileageData, setMileageData] = useState<MileageData[]>(initialMileageData);
  const [stablingGeometry, setStablingGeometry] = useState<StablingGeometry[]>([]);
  const [inductionPlan, setInductionPlan] = useState<InductionPlan[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  const getNextJobCardId = useCallback(() => {
    const existingIds = jobCards.map(jc => parseInt(jc.job_card_id.replace('JOB', '')));
    const maxId = Math.max(...existingIds, 2000);
    return `JOB${maxId + 1}`;
  }, [jobCards]);

  const addJobCard = useCallback((jobCard: Omit<JobCard, 'id'>) => {
    const id = `jc_${Date.now()}`;
    const newJobCard: JobCard = {
      ...jobCard,
      id,
      blocking_induction: jobCard.status === 'Open'
    };
    setJobCards(prev => [...prev, newJobCard]);
    return id;
  }, []);

  const updateJobCard = useCallback((id: string, updates: Partial<JobCard>) => {
    setJobCards(prev => prev.map(jc => 
      jc.id === id 
        ? { ...jc, ...updates, blocking_induction: (updates.status || jc.status) === 'Open' }
        : jc
    ));
  }, []);

  const closeJobCard = useCallback((id: string) => {
    updateJobCard(id, { status: 'Closed' });
  }, [updateJobCard]);

  const addFitnessCertificate = useCallback((cert: Omit<FitnessCertificate, 'id'>) => {
    const newCert: FitnessCertificate = {
      ...cert,
      id: `fc_${Date.now()}`
    };
    setFitnessCertificates(prev => [...prev, newCert]);
  }, []);

  const addBrandingWindow = useCallback((window: Omit<BrandingWindow, 'id'>) => {
    const newWindow: BrandingWindow = {
      ...window,
      id: `bw_${Date.now()}`
    };
    setBrandingWindows(prev => [...prev, newWindow]);
  }, []);

  const addCleaningData = useCallback((data: Omit<CleaningData, 'id'>) => {
    const newData: CleaningData = {
      ...data,
      id: `cd_${Date.now()}`
    };
    setCleaningData(prev => [...prev, newData]);
  }, []);

  const updateMileageData = useCallback((data: Omit<MileageData, 'id'>) => {
    const newData: MileageData = {
      ...data,
      id: `md_${Date.now()}`
    };
    setMileageData(prev => {
      const existing = prev.find(m => m.train_id === data.train_id);
      if (existing) {
        return prev.map(m => m.train_id === data.train_id ? { ...newData, id: existing.id } : m);
      }
      return [...prev, newData];
    });
  }, []);

  const addStablingGeometry = useCallback((geometry: Omit<StablingGeometry, 'id'>) => {
    const newGeometry: StablingGeometry = {
      ...geometry,
      id: `sg_${Date.now()}`
    };
    setStablingGeometry(prev => [...prev, newGeometry]);
  }, []);

  const runScheduler = useCallback((weights = {}) => {
    // Mock scheduler logic
    const trainIds = Array.from({length: 25}, (_, i) => `T${(i + 1).toString().padStart(3, '0')}`);
    
    const newPlan: InductionPlan[] = trainIds.map((trainId, index) => {
      const hasOpenJob = jobCards.some(jc => jc.train_id === trainId && jc.status === 'Open');
      const hasValidCert = fitnessCertificates.some(fc => fc.train_id === trainId && fc.status === 'Valid');
      
      let action: 'Service' | 'Standby' | 'IBL' = 'Service';
      const reasons: string[] = [];
      let risk: 'Low' | 'Medium' | 'High' = 'Low';
      
      if (hasOpenJob) {
        action = 'IBL';
        reasons.push('Open job card blocking induction');
        risk = 'High';
      } else if (!hasValidCert) {
        action = 'Standby';
        reasons.push('Missing valid fitness certificate');
        risk = 'Medium';
      } else {
        reasons.push('All checks passed');
      }

      return {
        rank: index + 1,
        train_id: trainId,
        recommended_action: action,
        reasons,
        shunt_cost: Math.floor(Math.random() * 500) + 100,
        predicted_risk: risk
      };
    }).sort((a, b) => {
      // Sort by action priority: Service first, then Standby, then IBL
      const actionPriority = { Service: 1, Standby: 2, IBL: 3 };
      return actionPriority[a.recommended_action] - actionPriority[b.recommended_action];
    }).map((item, index) => ({ ...item, rank: index + 1 }));

    setInductionPlan(newPlan);
    
    // Generate conflicts
    const newConflicts: Conflict[] = [];
    jobCards.filter(jc => jc.status === 'Open').forEach(jc => {
      newConflicts.push({
        id: `conflict_${jc.id}`,
        type: 'open_job_card',
        train_id: jc.train_id,
        severity: 'High',
        description: `Open job card ${jc.job_card_id} blocking induction`,
        related_id: jc.id
      });
    });
    
    trainIds.forEach(trainId => {
      const hasValidCert = fitnessCertificates.some(fc => fc.train_id === trainId && fc.status === 'Valid');
      if (!hasValidCert) {
        newConflicts.push({
          id: `conflict_cert_${trainId}`,
          type: 'missing_certificate',
          train_id: trainId,
          severity: 'Medium',
          description: `Missing or expired fitness certificate for ${trainId}`
        });
      }
    });
    
    setConflicts(newConflicts);
  }, [jobCards, fitnessCertificates]);

  const addAuditEntry = useCallback((entry: Omit<AuditEntry, 'id'>) => {
    const newEntry: AuditEntry = {
      ...entry,
      id: `audit_${Date.now()}`
    };
    setAuditEntries(prev => [...prev, newEntry]);
  }, []);

  // Initialize with some sample data for better demo experience
  React.useEffect(() => {
    // Add some sample branding windows
    if (brandingWindows.length === 0) {
      const sampleBrandingWindows = [
        {
          brand_name: 'Metro Express',
          train_id: 'T005',
          start_datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          end_datetime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          required_hours: 8,
          exposure_hours_completed: 6
        }
      ];
      
      sampleBrandingWindows.forEach(window => {
        addBrandingWindow(window);
      });
    }

    // Add some sample cleaning data
    if (cleaningData.length === 0) {
      const sampleCleaningData = [
        {
          train_id: 'T002',
          cleaning_type: 'Regular' as const,
          track_name: 'L1' as const,
          issue_date: '2025-01-14',
          completion_date: '2025-01-15',
          submitted_at: new Date().toISOString()
        },
        {
          train_id: 'T004',
          cleaning_type: 'Deep' as const,
          track_name: 'M1' as const,
          issue_date: '2025-01-13',
          completion_date: '2025-01-14',
          submitted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      sampleCleaningData.forEach(data => {
        addCleaningData(data);
      });
    }

    // Add some sample stabling geometry
    if (stablingGeometry.length === 0) {
      const sampleStablingGeometry = [
        {
          train_id: 'T001',
          track_name: 'S1',
          slot_position: 1 as 1 | 2,
          status: 'Occupied' as const,
          submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          train_id: 'T003',
          track_name: 'S2',
          slot_position: 1 as 1 | 2,
          status: 'Occupied' as const,
          submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          train_id: 'T005',
          track_name: 'L1',
          slot_position: 2 as 1 | 2,
          status: 'Occupied' as const,
          submitted_at: new Date().toISOString()
        },
        {
          train_id: 'T007',
          track_name: 'S3',
          slot_position: 1 as 1 | 2,
          status: 'Empty' as const,
          submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          train_id: 'T009',
          track_name: 'L2',
          slot_position: 2 as 1 | 2,
          status: 'Occupied' as const,
          submitted_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      sampleStablingGeometry.forEach(geometry => {
        addStablingGeometry(geometry);
      });
    }
  }, [addBrandingWindow, addCleaningData, addStablingGeometry, brandingWindows.length, cleaningData.length, stablingGeometry.length]);

  return (
    <DataContext.Provider value={{
      jobCards,
      fitnessCertificates,
      brandingWindows,
      cleaningData,
      mileageData,
      stablingGeometry,
      inductionPlan,
      auditEntries,
      conflicts,
      addJobCard,
      updateJobCard,
      closeJobCard,
      addFitnessCertificate,
      addBrandingWindow,
      addCleaningData,
      updateMileageData,
      addStablingGeometry,
      runScheduler,
      addAuditEntry,
      getNextJobCardId
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};