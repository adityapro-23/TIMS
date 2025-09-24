import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Layout from '../Layout';
import {
  Plus,
  Calendar,
  MapPin,
  Palette,
  Droplets,
  Settings,
  Users,
  Shield
} from 'lucide-react';

const GenericDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addBrandingWindow, addCleaningData, addStablingGeometry } = useData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const getRoleConfig = () => {
    switch (user?.role) {
      case 'branding-manager':
        return {
          title: 'Branding Manager',
          icon: Palette,
          description: 'Manage train branding schedules and SLA compliance',
          forms: []
        };
      
      case 'cleaning-data-manager':
        return {
          title: 'Cleaning Data Manager',
          icon: Droplets,
          description: 'Manage train cleaning schedules and data',
          forms: []
        };
      
      case 'stabling-geometry-manager':
        return {
          title: 'Stabling Geometry Manager',
          icon: MapPin,
          description: 'Manage depot stabling positions and geometry',
          forms: []
        };
      
      case 'admin':
        return {
          title: 'Administrator',
          icon: Shield,
          description: 'System administration and user management',
          forms: []
        };
      
      default:
        return {
          title: 'Dashboard',
          icon: Settings,
          description: 'Welcome to your dashboard',
          forms: []
        };
    }
  };

  const config = getRoleConfig();
  const IconComponent = config.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = config.forms[0];
    if (form) {
      form.onSubmit(formData);
      setShowForm(false);
      setFormData({});
    }
  };

  const renderField = (field: any) => {
    const commonClasses = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500";
    
    switch (field.type) {
      case 'select':
        return (
          <select
            value={formData[field.key] || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
            className={commonClasses}
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'datetime-local':
        return (
          <input
            type="datetime-local"
            value={formData[field.key] || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
            className={commonClasses}
            required={field.required}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={formData[field.key] || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
            className={commonClasses}
            required={field.required}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={formData[field.key] || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
            className={commonClasses}
            required={field.required}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <Layout title={config.title}>
      <div className="space-y-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
              <p className="text-gray-600">{config.description}</p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        {config.forms.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                {config.forms.length > 0 && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {config.forms[0].name}
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {config.forms.map((form, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl p-4 hover:border-teal-300 transition-colors cursor-pointer"
                    onClick={() => setShowForm(true)}
                  >
                    <h4 className="font-medium text-gray-900 mb-2">{form.name}</h4>
                    <p className="text-sm text-gray-600">
                      {form.fields.length} fields to complete
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Admin Navigation */}
        {user?.role === 'admin' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Administration</h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 cursor-pointer hover:from-teal-100 hover:to-teal-200 transition-colors">
                  <Users className="w-8 h-8 text-teal-600 mb-2" />
                  <h4 className="font-medium text-gray-900">User Management</h4>
                  <p className="text-sm text-gray-600">Manage users and roles</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-colors">
                  <Settings className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-medium text-gray-900">System Settings</h4>
                  <p className="text-sm text-gray-600">Configure system parameters</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 cursor-pointer hover:from-purple-100 hover:to-purple-200 transition-colors">
                  <Calendar className="w-8 h-8 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Audit Logs</h4>
                  <p className="text-sm text-gray-600">View system activity</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 cursor-pointer hover:from-green-100 hover:to-green-200 transition-colors">
                  <MapPin className="w-8 h-8 text-green-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Data Import</h4>
                  <p className="text-sm text-gray-600">Import/export data</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && config.forms.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {config.forms[0].name}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {config.forms[0].fields.map((field: any) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({});
                    }}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
                  >
                    Submit
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

export default GenericDashboard;