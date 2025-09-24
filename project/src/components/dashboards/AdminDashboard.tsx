import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Layout from '../Layout';
import AuditLogViewer from '../common/AuditLogViewer';
import {
  Users,
  Settings,
  Shield,
  Database,
  FileText,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    jobCards, 
    fitnessCertificates, 
    auditEntries, 
    conflicts,
    mileageData,
    brandingWindows,
    cleaningData,
    stablingGeometry
  } = useData();
  
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const roles = [
    { value: 'depot-supervisor', label: 'Depot Supervisor', icon: Shield },
    { value: 'fitness-cert-manager', label: 'Fitness Cert Manager', icon: CheckCircle },
    { value: 'job-cards-manager', label: 'Job Cards Manager', icon: FileText },
    { value: 'branding-manager', label: 'Branding Manager', icon: Activity },
    { value: 'cleaning-data-manager', label: 'Cleaning Data Manager', icon: Settings },
    { value: 'mileage-manager', label: 'Mileage Manager', icon: BarChart3 },
    { value: 'stabling-geometry-manager', label: 'Stabling Geometry Manager', icon: Database },
  ];

  const getSystemStats = () => {
    return {
      totalUsers: 8, // Mock data
      activeUsers: 6,
      totalJobCards: jobCards.length,
      openJobCards: jobCards.filter(jc => jc.status === 'Open').length,
      validCertificates: fitnessCertificates.filter(fc => fc.status === 'Valid').length,
      totalAuditEntries: auditEntries.length,
      highPriorityConflicts: conflicts.filter(c => c.severity === 'High').length,
      dataIngestionErrors: 0 // Mock data
    };
  };

  const getRecentActivity = () => {
    return auditEntries
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  };

  const stats = getSystemStats();
  const recentActivity = getRecentActivity();

  const handleRoleImpersonation = (role: string) => {
    // In a real app, this would switch the user's view to that role
    console.log(`Impersonating role: ${role}`);
    setSelectedRole(role);
  };

  return (
    <Layout title="System Administration">
      <div className="space-y-6">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Job Cards</p>
                <p className="text-3xl font-bold text-red-600">{stats.openJobCards}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Audit Entries</p>
                <p className="text-3xl font-bold text-teal-600">{stats.totalAuditEntries}</p>
              </div>
              <FileText className="w-8 h-8 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Role Management */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Role Management</h3>
              <p className="text-sm text-gray-600 mt-1">Manage user roles and permissions</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {roles.map((role) => {
                  const IconComponent = role.icon;
                  return (
                    <div
                      key={role.value}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-teal-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{role.label}</p>
                          <p className="text-sm text-gray-600">2 active users</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRoleImpersonation(role.value)}
                        className="px-3 py-2 text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        Preview
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button
                  onClick={() => setShowAuditLog(true)}
                  className="text-sm text-teal-600 hover:text-teal-700 transition-colors"
                >
                  View All
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                ) : (
                  recentActivity.map((entry) => (
                    <div key={entry.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {entry.user} ({entry.role})
                        </p>
                        <p className="text-sm text-gray-600">{entry.action}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(entry.timestamp), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Data Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Data Overview</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{jobCards.length}</p>
                <p className="text-sm text-gray-600">Job Cards</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{fitnessCertificates.length}</p>
                <p className="text-sm text-gray-600">Certificates</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{mileageData.length}</p>
                <p className="text-sm text-gray-600">Mileage Records</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Database className="w-8 h-8 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stablingGeometry.length}</p>
                <p className="text-sm text-gray-600">Stabling Records</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-xl hover:border-teal-300 transition-colors text-left">
                <Settings className="w-6 h-6 text-gray-600 mb-2" />
                <h4 className="font-medium text-gray-900">General Settings</h4>
                <p className="text-sm text-gray-600">Configure system parameters</p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-xl hover:border-teal-300 transition-colors text-left">
                <Database className="w-6 h-6 text-gray-600 mb-2" />
                <h4 className="font-medium text-gray-900">Data Management</h4>
                <p className="text-sm text-gray-600">Import/export data</p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-xl hover:border-teal-300 transition-colors text-left">
                <Shield className="w-6 h-6 text-gray-600 mb-2" />
                <h4 className="font-medium text-gray-900">Security Settings</h4>
                <p className="text-sm text-gray-600">Manage permissions</p>
              </button>
            </div>
          </div>
        </div>

        {/* Audit Log Viewer */}
        <AuditLogViewer
          isOpen={showAuditLog}
          onClose={() => setShowAuditLog(false)}
        />
      </div>
    </Layout>
  );
};

export default AdminDashboard;