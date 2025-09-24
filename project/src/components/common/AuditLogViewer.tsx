import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { Clock, User, FileText, Filter, X } from 'lucide-react';

interface AuditLogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ isOpen, onClose }) => {
  const { auditEntries } = useData();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'my-actions'>('all');
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredEntries = auditEntries
    .filter(entry => filter === 'all' || entry.user === user?.username)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const selectedAuditEntry = selectedEntry 
    ? auditEntries.find(entry => entry.id === selectedEntry)
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex">
        {/* Main Panel */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Audit Log</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'my-actions')}
                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="all">All Actions</option>
                    <option value="my-actions">My Actions</option>
                  </select>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No audit entries found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`border rounded-xl p-4 cursor-pointer transition-colors ${
                      selectedEntry === entry.id 
                        ? 'border-teal-300 bg-teal-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedEntry(entry.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{entry.user}</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {entry.role}
                            </span>
                          </div>
                          {entry.train_id && (
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                              {entry.train_id}
                            </span>
                          )}
                        </div>
                        
                        <p className="font-medium text-gray-900 mb-1">{entry.action}</p>
                        <p className="text-sm text-gray-600 mb-2">{entry.reason}</p>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                        </div>
                      </div>
                      
                      {(entry.before_snapshot || entry.after_snapshot) && (
                        <div className="ml-4">
                          <span className="text-xs text-teal-600 font-medium">
                            Has Details
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedAuditEntry && (
          <div className="w-96 border-l border-gray-200 bg-gray-50">
            <div className="p-6 border-b border-gray-200">
              <h4 className="font-semibold text-gray-900">Action Details</h4>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Basic Information</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">User:</span>
                    <span className="text-gray-900">{selectedAuditEntry.user}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="text-gray-900">{selectedAuditEntry.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timestamp:</span>
                    <span className="text-gray-900">
                      {format(new Date(selectedAuditEntry.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                    </span>
                  </div>
                  {selectedAuditEntry.train_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Train ID:</span>
                      <span className="text-gray-900">{selectedAuditEntry.train_id}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Action</h5>
                <p className="text-sm text-gray-900 mb-2">{selectedAuditEntry.action}</p>
                <p className="text-sm text-gray-600">{selectedAuditEntry.reason}</p>
              </div>

              {selectedAuditEntry.before_snapshot && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Before State</h5>
                  <div className="bg-white rounded-lg p-3 text-xs">
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {JSON.stringify(selectedAuditEntry.before_snapshot, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {selectedAuditEntry.after_snapshot && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">After State</h5>
                  <div className="bg-white rounded-lg p-3 text-xs">
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {JSON.stringify(selectedAuditEntry.after_snapshot, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogViewer;