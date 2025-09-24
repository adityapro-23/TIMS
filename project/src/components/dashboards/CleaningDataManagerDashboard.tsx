import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Layout from '../Layout';
import { Plus, Calendar, Eye, Droplets, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const CleaningDataManagerDashboard: React.FC = () => {
  const { cleaningData, addCleaningData } = useData();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    train_id: 'T001',
    cleaning_type: 'Regular' as const,
    track_name: 'L1' as const,
    issue_date: new Date().toISOString().split('T')[0],
    completion_date: new Date().toISOString().split('T')[0]
  });

  const trainOptions = Array.from({length: 25}, (_, i) => `T${(i + 1).toString().padStart(3, '0')}`);

  // Group cleaning data by submission date
  const cleaningByDate = cleaningData.reduce((acc, data) => {
    const date = data.submitted_at.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(data);
    return acc;
  }, {} as Record<string, typeof cleaningData>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addCleaningData({
      train_id: formData.train_id,
      cleaning_type: formData.cleaning_type,
      track_name: formData.track_name,
      issue_date: formData.issue_date,
      completion_date: formData.completion_date,
      submitted_at: new Date().toISOString()
    });

    setShowCreateForm(false);
    setFormData({
      train_id: 'T001',
      cleaning_type: 'Regular',
      track_name: 'L1',
      issue_date: new Date().toISOString().split('T')[0],
      completion_date: new Date().toISOString().split('T')[0]
    });
  };

  const getStats = () => {
    const total = cleaningData.length;
    const regular = cleaningData.filter(cd => cd.cleaning_type === 'Regular').length;
    const deep = cleaningData.filter(cd => cd.cleaning_type === 'Deep').length;
    const today = new Date().toISOString().split('T')[0];
    const todayCount = cleaningData.filter(cd => cd.submitted_at.startsWith(today)).length;

    return { total, regular, deep, todayCount };
  };

  const stats = getStats();

  return (
    <Layout title="Cleaning Data Manager">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Droplets className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Regular Cleaning</p>
                <p className="text-3xl font-bold text-blue-600">{stats.regular}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deep Cleaning</p>
                <p className="text-3xl font-bold text-purple-600">{stats.deep}</p>
              </div>
              <Droplets className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Entries</p>
                <p className="text-3xl font-bold text-teal-600">{stats.todayCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Cleaning Data Submissions</h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Cleaning Entry
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {Object.entries(cleaningByDate)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, entries]) => (
                <div key={date} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {format(new Date(date), 'MMMM dd, yyyy')}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({entries.length} entr{entries.length !== 1 ? 'ies' : 'y'})
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedDate(selectedDate === date ? null : date)}
                      className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{selectedDate === date ? 'Hide' : 'View'} Details</span>
                    </button>
                  </div>

                  {selectedDate === date && (
                    <div className="mt-4 space-y-4">
                      {entries.map((entry) => (
                        <div key={entry.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Train ID</p>
                              <p className="text-sm text-gray-900">{entry.train_id}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Cleaning Type</p>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                entry.cleaning_type === 'Deep' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {entry.cleaning_type}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Track Name</p>
                              <p className="text-sm text-gray-900">{entry.track_name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Issue Date</p>
                              <p className="text-sm text-gray-900">{format(new Date(entry.issue_date), 'MMM dd, yyyy')}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Completion Date</p>
                              <p className="text-sm text-gray-900">{format(new Date(entry.completion_date), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              Submitted at: {format(new Date(entry.submitted_at), 'MMM dd, yyyy HH:mm:ss')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            
            {Object.keys(cleaningByDate).length === 0 && (
              <div className="text-center py-12">
                <Droplets className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No cleaning data found</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Cleaning Entry Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">New Cleaning Entry</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    Cleaning Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.cleaning_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, cleaning_type: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value="Regular">Regular</option>
                    <option value="Deep">Deep</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Track Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.track_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, track_name: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="M1">M1</option>
                    <option value="M2">M2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, completion_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                    Submit Entry
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

export default CleaningDataManagerDashboard;