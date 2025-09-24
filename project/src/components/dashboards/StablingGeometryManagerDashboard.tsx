import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Layout from '../Layout';
import StablingVisual from '../common/StablingVisual';
import { Plus, Calendar, Eye, MapPin, Square } from 'lucide-react';
import { format } from 'date-fns';

const StablingGeometryManagerDashboard: React.FC = () => {
  const { stablingGeometry, addStablingGeometry } = useData();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    train_id: 'T001',
    track_name: 'S1',
    slot_position: 1 as 1 | 2,
    status: 'Empty' as const
  });

  const trainOptions = Array.from({length: 25}, (_, i) => `T${(i + 1).toString().padStart(3, '0')}`);
  const trackOptions = [
    ...Array.from({length: 20}, (_, i) => `S${i + 1}`),
    ...Array.from({length: 6}, (_, i) => `L${i + 1}`)
  ];

  // Group stabling data by submission date
  const stablingByDate = stablingGeometry.reduce((acc, data) => {
    const date = data.submitted_at.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(data);
    return acc;
  }, {} as Record<string, typeof stablingGeometry>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addStablingGeometry({
      train_id: formData.train_id,
      track_name: formData.track_name,
      slot_position: formData.slot_position,
      status: formData.status,
      submitted_at: new Date().toISOString()
    });

    setShowCreateForm(false);
    setFormData({
      train_id: 'T001',
      track_name: 'S1',
      slot_position: 1,
      status: 'Empty'
    });
  };

  const getStats = () => {
    const total = stablingGeometry.length;
    const occupied = stablingGeometry.filter(sg => sg.status === 'Occupied').length;
    const empty = stablingGeometry.filter(sg => sg.status === 'Empty').length;
    const today = new Date().toISOString().split('T')[0];
    const todayCount = stablingGeometry.filter(sg => sg.submitted_at.startsWith(today)).length;

    return { total, occupied, empty, todayCount };
  };

  const stats = getStats();

  return (
    <Layout title="Stabling Geometry Manager">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MapPin className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupied Slots</p>
                <p className="text-3xl font-bold text-red-600">{stats.occupied}</p>
              </div>
              <Square className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Empty Slots</p>
                <p className="text-3xl font-bold text-green-600">{stats.empty}</p>
              </div>
              <Square className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Updates</p>
                <p className="text-3xl font-bold text-teal-600">{stats.todayCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Depot Layout */}
        <StablingVisual />

        {/* Submission History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Stabling Submissions</h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit Stabling Entry
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {Object.entries(stablingByDate)
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
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Train ID</p>
                              <p className="text-sm text-gray-900">{entry.train_id}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Track Name</p>
                              <p className="text-sm text-gray-900">{entry.track_name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Slot Position</p>
                              <p className="text-sm text-gray-900">Position {entry.slot_position}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Status</p>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                entry.status === 'Occupied' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {entry.status}
                              </span>
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
            
            {Object.keys(stablingByDate).length === 0 && (
              <div className="text-center py-12">
                <MapPin className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No stabling data found</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Stabling Entry Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Submit Stabling Entry</h3>
              
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
                    Track Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.track_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, track_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    {trackOptions.map(track => (
                      <option key={track} value={track}>{track}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slot Position <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.slot_position}
                    onChange={(e) => setFormData(prev => ({ ...prev, slot_position: parseInt(e.target.value) as 1 | 2 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value={1}>Position 1</option>
                    <option value={2}>Position 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value="Empty">Empty</option>
                    <option value="Occupied">Occupied</option>
                  </select>
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

export default StablingGeometryManagerDashboard;