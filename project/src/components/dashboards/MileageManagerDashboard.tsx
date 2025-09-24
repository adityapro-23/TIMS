import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Layout from '../Layout';
import { Plus, TrendingUp, Gauge, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';

const MileageManagerDashboard: React.FC = () => {
  const { mileageData, updateMileageData } = useData();
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState({
    train_id: 'T001',
    daily_km: '',
    km_after_last_maintenance: '',
    date: new Date().toISOString().split('T')[0]
  });

  const trainOptions = Array.from({length: 25}, (_, i) => `T${(i + 1).toString().padStart(3, '0')}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateMileageData({
      train_id: formData.train_id,
      daily_km: parseInt(formData.daily_km),
      km_after_last_maintenance: parseInt(formData.km_after_last_maintenance),
      date: formData.date
    });

    setShowUpdateForm(false);
    setFormData({
      train_id: 'T001',
      daily_km: '',
      km_after_last_maintenance: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const getOverallStats = () => {
    const avgDailyKm = mileageData.length > 0 
      ? Math.round(mileageData.reduce((sum, m) => sum + m.daily_km, 0) / mileageData.length)
      : 0;
    const trainsNearingService = mileageData.filter(m => m.km_after_last_maintenance > 4000).length;

    return {
      avgDailyKm,
      trainsNearingService,
      totalTrains: mileageData.length
    };
  };

  const stats = getOverallStats();

  // Simple sparkline data generator (mock)
  const generateSparklineData = () => {
    return Array.from({length: 7}, () => Math.floor(Math.random() * 50) + 150);
  };

  return (
    <Layout title="Mileage Manager">
      <div className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tracked Trains</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTrains}</p>
              </div>
              <Activity className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Daily KM</p>
                <p className="text-3xl font-bold text-blue-600">{stats.avgDailyKm}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Mileage</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.trainsNearingService}</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Daily KM</p>
                <p className="text-3xl font-bold text-teal-600">{stats.avgDailyKm}</p>
              </div>
              <Gauge className="w-8 h-8 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Train Performance Dashboard</h3>
              <button
                onClick={() => setShowUpdateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Update Mileage
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily KM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KM After Last Maintenance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mileageData.map((data) => {
                  const isHighMileage = data.km_after_last_maintenance > 4000;
                  const sparklineData = generateSparklineData();
                  
                  return (
                    <tr key={data.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {data.train_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.daily_km} km/day
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.km_after_last_maintenance.toLocaleString()} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(new Date(data.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center h-8">
                          <svg width="100" height="24" className="text-teal-600">
                            <polyline
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              points={sparklineData
                                .map((value, index) => `${(index * 100) / (sparklineData.length - 1)},${24 - (value - 150) * 0.4}`)
                                .join(' ')}
                            />
                          </svg>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {mileageData.length === 0 && (
              <div className="text-center py-12">
                <Gauge className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No mileage data found</p>
              </div>
            )}
          </div>
        </div>

        {/* Update Mileage Modal */}
        {showUpdateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Update Mileage Data</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Train ID
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

                    Daily KM
                  </label>
                  <input
                    type="number"
                    value={formData.daily_km}
                    onChange={(e) => setFormData(prev => ({ ...prev, daily_km: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="180"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    KM After Last Maintenance
                  </label>
                  <input
                    type="number"
                    value={formData.km_after_last_maintenance}
                    onChange={(e) => setFormData(prev => ({ ...prev, km_after_last_maintenance: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="2500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUpdateForm(false)}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
                  >
                    Update Data
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

export default MileageManagerDashboard;