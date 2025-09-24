import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Layout from '../Layout';
import { Plus, Calendar, Eye, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const FitnessCertManagerDashboard: React.FC = () => {
  const { fitnessCertificates, addFitnessCertificate } = useData();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fit_id: '',
    train_id: 'T001',
    dept: 'RollingStock' as const,
    valid_from: new Date().toISOString().split('T')[0],
    valid_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    remarks: ''
  });

  const trainOptions = Array.from({length: 25}, (_, i) => `T${(i + 1).toString().padStart(3, '0')}`);

  // Group certificates by creation date for the list view
  const certsByDate = fitnessCertificates.reduce((acc, cert) => {
    const date = cert.created_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(cert);
    return acc;
  }, {} as Record<string, typeof fitnessCertificates>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addFitnessCertificate({
      ...formData,
      created_date: new Date().toISOString().split('T')[0]
    });

    setShowCreateForm(false);
    setFormData({
      fit_id: '',
      train_id: 'T001',
      dept: 'RollingStock',
      valid_from: new Date().toISOString().split('T')[0],
      valid_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Valid',
      remarks: ''
    });
  };

  const getStatusStats = () => {
    return {
      total: fitnessCertificates.length,
      valid: fitnessCertificates.filter(fc => new Date(fc.valid_to) > new Date()).length,
      expired: fitnessCertificates.filter(fc => new Date(fc.valid_to) <= new Date()).length,
      suspended: 0 // Remove suspended since status field is removed
    };
  };

  const stats = getStatusStats();

  return (
    <Layout title="Fitness Certificate Manager">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Shield className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valid</p>
                <p className="text-3xl font-bold text-green-600">{stats.valid}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.suspended}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Certificate Forms</h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Certificate
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {Object.entries(certsByDate)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, certs]) => (
                <div key={date} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {format(new Date(date), 'MMMM dd, yyyy')}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({certs.length} certificate{certs.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedCert(selectedCert === date ? null : date)}
                      className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{selectedCert === date ? 'Hide' : 'View'} Details</span>
                    </button>
                  </div>

                  {selectedCert === date && (
                    <div className="mt-4 space-y-4">
                      {certs.map((cert) => (
                        <div key={cert.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Certificate ID</p>
                              <p className="text-sm text-gray-900">{cert.fit_id}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Train ID</p>
                              <p className="text-sm text-gray-900">{cert.train_id}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Department</p>
                              <p className="text-sm text-gray-900">{cert.dept}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Status</p>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                new Date(cert.valid_to) > new Date() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {new Date(cert.valid_to) > new Date() ? 'Valid' : 'Expired'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Valid From</p>
                              <p className="text-sm text-gray-900">
                                {format(new Date(cert.valid_from), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Valid To</p>
                              <p className="text-sm text-gray-900">
                                {format(new Date(cert.valid_to), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            {cert.remarks && (
                              <div className="md:col-span-2">
                                <p className="text-sm font-medium text-gray-700">Remarks</p>
                                <p className="text-sm text-gray-900">{cert.remarks}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            
            {Object.keys(certsByDate).length === 0 && (
              <div className="text-center py-12">
                <Shield className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No certificates found</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Certificate Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Create Fitness Certificate</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate ID
                  </label>
                  <input
                    type="text"
                    value={formData.fit_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, fit_id: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="FIT001"
                    required
                  />
                </div>

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
                    Department
                  </label>
                  <select
                    value={formData.dept}
                    onChange={(e) => setFormData(prev => ({ ...prev, dept: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value="RollingStock">RollingStock</option>
                    <option value="Signalling">Signalling</option>
                    <option value="Telecom">Telecom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid To
                  </label>
                  <input
                    type="date"
                    value={formData.valid_to}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_to: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                    rows={3}
                    placeholder="Additional remarks..."
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
                    Create Certificate
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

export default FitnessCertManagerDashboard;