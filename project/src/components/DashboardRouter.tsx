import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import DepotSupervisorDashboard from './dashboards/DepotSupervisorDashboard';
import JobCardsManagerDashboard from './dashboards/JobCardsManagerDashboard';
import FitnessCertManagerDashboard from './dashboards/FitnessCertManagerDashboard';
import MileageManagerDashboard from './dashboards/MileageManagerDashboard';
import BrandingManagerDashboard from './dashboards/BrandingManagerDashboard';
import CleaningDataManagerDashboard from './dashboards/CleaningDataManagerDashboard';
import StablingGeometryManagerDashboard from './dashboards/StablingGeometryManagerDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import GenericDashboard from './dashboards/GenericDashboard';

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  switch (user.role) {
    case 'depot-supervisor':
      return <DepotSupervisorDashboard />;
    case 'job-cards-manager':
      return <JobCardsManagerDashboard />;
    case 'fitness-cert-manager':
      return <FitnessCertManagerDashboard />;
    case 'mileage-manager':
      return <MileageManagerDashboard />;
    case 'branding-manager':
      return <BrandingManagerDashboard />;
    case 'cleaning-data-manager':
      return <CleaningDataManagerDashboard />;
    case 'stabling-geometry-manager':
      return <StablingGeometryManagerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <GenericDashboard />;
  }
};

export default DashboardRouter;