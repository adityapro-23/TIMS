import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Layout from '../Layout';
import { Plus, AlertTriangle, Clock, Calendar, Palette, TrendingUp } from 'lucide-react';
import { format, differenceInHours, parseISO } from 'date-fns';

const BrandingManagerDashboard: React.FC = () => {
  const { brandingWindows, addBrandingWindow } = useData();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    brand_name: '',
    train_id: 'T001',
    start_datetime: '',
    end_datetime: '',
    required_hours: '',
    exposure_hours_completed: ''
  });

  const trainOptions = Array.from({length: 25}, (_, i) => `T${(i + 1).toString().padStart(3, '0')}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addBrandingWindow({
      brand_name: formData.brand_name,
      train_id: formData.train_id,
      start_datetime: formData.start_datetime,
      end_datetime: formData.end_datetime,
      required_hours: parseInt(formData.required_hours),
      exposure_hours_completed: parseInt(formData.exposure_hours_completed)
    });

    setShowCreateForm(false);
    setFormData({
      brand_name: '',
      train_id: 'T001',
      start_datetime: '',
      end_datetime: '',
      required_hours: '',
      exposure_hours_completed: ''
    });
  };

  const getSLAStatus = (window: any) => {
    const now = new Date();
    const startTime = parseISO(window.start_datetime);
    const endTime = parseISO(window.end_datetime);
    const actualHours = differenceInHours(endTime, startTime);
    
    if (now > endTime) {
      return {
        status: actualHours >= window.required_hours ? 'completed' : 'breached',
        hoursRemaining: 0,
        actualHours
      };
    } else if (now >= startTime) {
      return {
        status: 'in-progress',
        hoursRemaining: differenceInHours(endTime, now),
        actualHours: differenceInHours(now, startTime)
      };
    } else {
      return {
        status: 'scheduled',
        hoursRemaining: differenceInHours(endTime, startTime),
        actualHours: 0
      };
    }
  };

  const getStats = () => {
    const total = brandingWindows.length;
    const atRisk = brandingWindows.filter(window => {
      const sla = getSLAStatus(window);
      return sla.status === 'in-progress' && sla.hoursRemaining < window.required_hours * 0.2;
    }).length;
    
    const breached = brandingWindows.filter(window => {
      const sla = getSLAStatus(window);
      return sla.status === 'breached';
    }).length;

    const totalExposureHours = brandingWindows.reduce((sum, window) => {
      const sla = getSLAStatus(window);
      return sum + sla.actualHours;
    }, 0);

    return { total, atRisk, breached, totalExposureHours };
  };

  const stats = getStats();

  return (
    <Layout title="Branding Manager">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Windows</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Palette className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At Risk</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.atRisk}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SLA Breached</p>
                <p className="text-3xl font-bold text-red-600">{stats.breached}</p>
              </div>
              <Clock className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exposure Hours</p>
                <p className="text-3xl font-bold text-teal-600">{Math.round(stats.totalExposureHours)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-teal-600" />
            </div>
          </div>
        </div>

        {/* SLA Alerts */}
        {stats.atRisk > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
              <h3 className="text-lg font-semibold text-yellow-900">SLA Risk Alert</h3>
              <span className="ml-2 px-3 py-1 bg-yellow-200 text-yellow-800 text-sm font-medium rounded-full">
                {stats.atRisk} windows at risk
              </span>
            </div>
            <p className="text-yellow-800">
              Some branding windows are at risk of breaching their SLA requirements. 
              Please review and take necessary action.
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Branding Windows</h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Branding Window
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exposure Hours Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLA Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {brandingWindows.map((window) => {
                  const slaStatus = getSLAStatus(window);
                  
                  return (
                    <tr key={window.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {window.brand_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {window.train_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {format(parseISO(window.start_datetime), 'MMM dd, HH:mm')}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            to {format(parseISO(window.end_datetime), 'MMM dd, HH:mm')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {window.required_hours}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className={`font-medium ${
                            slaStatus.actualHours >= window.required_hours 
                              ? 'text-green-600' 
                              : slaStatus.actualHours >= window.required_hours * 0.8 
                                ? 'text-yellow-600' 
                                : 'text-red-600'
                          }`}>
                            {Math.round(slaStatus.actualHours)}h
                          </span>
                          <span className="text-xs text-gray-400 ml-1">
                            / {window.required_hours}h
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {window.exposure_hours_completed}h
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            slaStatus.status === 'completed' ? 'bg-green-100 text-green-800' :
                            slaStatus.status === 'breached' ? 'bg-red-100 text-red-800' :
                            slaStatus.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {slaStatus.status === 'completed' ? 'Completed' :
                             slaStatus.status === 'breached' ? 'Breached' :
                             slaStatus.status === 'in-progress' ? 'In Progress' :
                             'Scheduled'}
                          </span>
                          {slaStatus.status === 'in-progress' && (
                            <span className="ml-2 text-xs text-gray-500">
                              {Math.round(slaStatus.hoursRemaining)}h left
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {brandingWindows.length === 0 && (
              <div className="text-center py-12">
                <Palette className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No branding windows found</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Branding Window Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Create Branding Window</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.brand_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Brand Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Train ID <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.train_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, train_id: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    {trainOptions.map(trainId => (
                      <option key={trainId} value={trainId}>{trainId}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_datetime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_datetime}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_datetime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Hours <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.required_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, required_hours: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="8"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Exposure Hours Completed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.exposure_hours_completed}
                    onChange={(e) => setFormData(prev => ({ ...prev, exposure_hours_completed: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
                  >
                    Create Window
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BrandingManagerDashboard;