import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../Layout';
import ExportModal from '../common/ExportModal';
import ImportModal from '../common/ImportModal';
import AuditLogViewer from '../common/AuditLogViewer';
import StablingVisual from '../common/StablingVisual';
import {
  Play,
  Settings,
  AlertTriangle,
  Download,
  Upload,
  FileText,
  BarChart3,
  MapPin,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

const DepotSupervisorDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    inductionPlan,
    conflicts,
    jobCards,
    fitnessCertificates,
    mileageData,
    auditEntries,
    runScheduler,
    addAuditEntry
  } = useData();
  
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showStablingVisual, setShowStablingVisual] = useState(false);
  const [exportType, setExportType] = useState<'induction-plan' | 'audit-report'>('induction-plan');
  const [selectedTrain, setSelectedTrain] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState('');
  const [schedulerWeights, setSchedulerWeights] = useState({
    mileage: 0.3,
    jobCards: 0.4,
    branding: 0.2,
    cleaning: 0.1
  });

  useEffect(() => {
    // Run scheduler on component mount
    if (inductionPlan.length === 0) {
      runScheduler(schedulerWeights);
    }
  }, [inductionPlan.length, runScheduler, schedulerWeights]);

  const handleRunScheduler = () => {
    runScheduler(schedulerWeights);
    addAuditEntry({
      user: user?.username || '',
      role: user?.role || 'depot-supervisor',
      timestamp: new Date().toISOString(),
      action: 'Run Scheduler',
      reason: 'Manual scheduler execution'
    });
  };

  const handleImportData = (data: any[]) => {
    // This would integrate with the data context to import job cards or other data
    console.log('Importing data:', data);
    addAuditEntry({
      user: user?.username || '',
      role: user?.role || 'depot-supervisor',
      timestamp: new Date().toISOString(),
      action: 'Import Data',
      reason: `Imported ${data.length} records`
    });
  };

  const handleOverride = () => {
    if (selectedTrain && overrideReason) {
      addAuditEntry({
        user: user?.username || '',
        role: user?.role || 'depot-supervisor',
        timestamp: new Date().toISOString(),
        action: 'Manual Override',
        reason: overrideReason,
        train_id: selectedTrain
      });
      setShowOverrideModal(false);
      setSelectedTrain('');
      setOverrideReason('');
    }
  };

  const getFleetStats = () => {
    const totalTrains = 25;
    const serviceTrains = inductionPlan.filter(p => p.recommended_action === 'Service').length;
    const standbyTrains = inductionPlan.filter(p => p.recommended_action === 'Standby').length;
    const iblTrains = inductionPlan.filter(p => p.recommended_action === 'IBL').length;
    
    return {
      availability: Math.round(((serviceTrains + standbyTrains) / totalTrains) * 100),
      service: serviceTrains,
      standby: standbyTrains,
      ibl: iblTrains,
      total: totalTrains
    };
  };

  const fleetStats = getFleetStats();

  return (
    <Layout title="Depot Supervisor Dashboard">
      <div className="space-y-6">
        {/* KPI Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fleet Availability</p>
                <p className="text-3xl font-bold text-teal-600">{fleetStats.availability}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-teal-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Service Ready</p>
                <p className="text-3xl font-bold text-green-600">{fleetStats.service}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Standby</p>
                <p className="text-3xl font-bold text-yellow-600">{fleetStats.standby}</p>
              </div>
              <Settings className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">IBL/Blocked</p>
                <p className="text-3xl font-bold text-red-600">{fleetStats.ibl}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Induction Plan */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Tomorrow's Induction Plan</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowWhatIf(true)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    What-If
                  </button>
                  <button
                    onClick={handleRunScheduler}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Scheduler
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reasons</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shunt Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inductionPlan.map((plan) => (
                    <tr key={plan.train_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {plan.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {plan.train_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          plan.recommended_action === 'Service' ? 'bg-green-100 text-green-800' :
                          plan.recommended_action === 'Standby' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {plan.recommended_action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        {plan.reasons.join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{plan.shunt_cost}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          plan.predicted_risk === 'Low' ? 'bg-green-100 text-green-800' :
                          plan.predicted_risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {plan.predicted_risk}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedTrain(plan.train_id);
                            setShowOverrideModal(true);
                          }}
                          className="text-teal-600 hover:text-teal-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conflict Alerts Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                Conflict Alerts
              </h3>
            </div>
            
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {conflicts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No conflicts detected</p>
              ) : (
                conflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className={`p-4 rounded-xl border-l-4 ${
                      conflict.severity === 'High' ? 'bg-red-50 border-red-400' :
                      conflict.severity === 'Medium' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{conflict.train_id}</p>
                        <p className="text-sm text-gray-600 mt-1">{conflict.description}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        conflict.severity === 'High' ? 'bg-red-100 text-red-800' :
                        conflict.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {conflict.severity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition-colors shadow-lg">
            <Upload className="w-5 h-5 mr-2" />
            Import Data
          </button>
          <button 
            onClick={() => {
              setExportType('induction-plan');
              setShowExportModal(true);
            }}
            className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-2xl hover:bg-teal-700 transition-colors shadow-lg">
            <Download className="w-5 h-5 mr-2" />
            Export Plan
          </button>
          <button 
            onClick={() => {
              setExportType('audit-report');
              setShowExportModal(true);
            }}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg">
            <FileText className="w-5 h-5 mr-2" />
            Export Audit
          </button>
          <button 
            onClick={() => setShowAuditLog(true)}
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-colors shadow-lg">
            <FileText className="w-5 h-5 mr-2" />
            View Audit Log
          </button>
        </div>

        {/* Stabling Visual */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Depot Layout</h3>
            <button
              onClick={() => setShowStablingVisual(!showStablingVisual)}
              className="text-teal-600 hover:text-teal-700 transition-colors"
            >
              {showStablingVisual ? 'Hide' : 'Show'} Layout
            </button>
          </div>
          {showStablingVisual && <StablingVisual />}
        </div>

        {/* Override Modal */}
        {showOverrideModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Override - {selectedTrain}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Override Reason
                  </label>
                  <textarea
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                    rows={4}
                    placeholder="Enter reason for manual override..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowOverrideModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOverride}
                    disabled={!overrideReason}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
                  >
                    Override
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* What-If Panel */}
        {showWhatIf && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What-If Simulation</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mileage Weight: {schedulerWeights.mileage}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={schedulerWeights.mileage}
                    onChange={(e) => setSchedulerWeights(prev => ({ ...prev, mileage: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Cards Weight: {schedulerWeights.jobCards}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={schedulerWeights.jobCards}
                    onChange={(e) => setSchedulerWeights(prev => ({ ...prev, jobCards: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowWhatIf(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      runScheduler(schedulerWeights);
                      setShowWhatIf(false);
                    }}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          data={exportType === 'induction-plan' ? inductionPlan : auditEntries}
          title={exportType === 'induction-plan' ? 'Induction Plan' : 'Audit Report'}
          type={exportType}
        />

        {/* Import Modal */}
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportData}
          title="Import Data"
          expectedColumns={['Train_ID', 'Job_Card_ID', 'Job_Category', 'Issue_Date', 'Target_Completion_Date']}
          dataType="job-cards"
        />

        {/* Audit Log Viewer */}
        <AuditLogViewer
          isOpen={showAuditLog}
          onClose={() => setShowAuditLog(false)}
        />
      </div>
    </Layout>
  );
};

export default DepotSupervisorDashboard;