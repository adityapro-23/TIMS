import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, FileText } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
  title: string;
  expectedColumns: string[];
  dataType: string;
}

const ImportModal: React.FC<ImportModalProps> = ({ 
  isOpen, 
  onClose, 
  onImport, 
  title, 
  expectedColumns, 
  dataType 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);
    setPreview([]);

    if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
      parseCSV(selectedFile);
    } else if (selectedFile.type.includes('sheet') || selectedFile.name.endsWith('.xlsx')) {
      setErrors(['Excel files not supported in this demo. Please convert to CSV format.']);
    } else {
      setErrors(['Unsupported file format. Please upload CSV files only.']);
    }
  };

  const parseCSV = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          setErrors(['File is empty']);
          setIsProcessing(false);
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });
          row._rowIndex = index + 2; // +2 because we start from line 2 (after header)
          return row;
        });

        // Validate columns
        const missingColumns = expectedColumns.filter(col => !headers.includes(col));
        const newErrors: string[] = [];

        if (missingColumns.length > 0) {
          newErrors.push(`Missing required columns: ${missingColumns.join(', ')}`);
        }

        // Validate data based on type
        if (dataType === 'job-cards') {
          data.forEach((row, index) => {
            if (!row.Train_ID || !row.Train_ID.match(/^T\d{3}$/)) {
              newErrors.push(`Row ${row._rowIndex}: Invalid Train_ID format (should be T001-T025)`);
            }
            if (!row.Job_Category) {
              newErrors.push(`Row ${row._rowIndex}: Job_Category is required`);
            }
          });
        } else if (dataType === 'fitness-certificates') {
          data.forEach((row, index) => {
            if (!row.Train_ID || !row.Train_ID.match(/^T\d{3}$/)) {
              newErrors.push(`Row ${row._rowIndex}: Invalid Train_ID format (should be T001-T025)`);
            }
            if (!['RollingStock', 'Signalling', 'Telecom'].includes(row.Dept)) {
              newErrors.push(`Row ${row._rowIndex}: Invalid Department (should be RollingStock, Signalling, or Telecom)`);
            }
          });
        }

        setErrors(newErrors);
        setPreview(data.slice(0, 5)); // Show first 5 rows as preview
        setIsProcessing(false);
      } catch (error) {
        setErrors(['Error parsing CSV file']);
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    if (errors.length === 0 && file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });
          return row;
        });
        
        onImport(data);
        onClose();
        setFile(null);
        setPreview([]);
        setErrors([]);
      };
      reader.readAsText(file);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select CSV File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                {file ? file.name : 'Click to select a CSV file or drag and drop'}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
              >
                Choose File
              </button>
              {file && (
                <button
                  onClick={reset}
                  className="ml-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Expected Format */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-medium text-blue-900 mb-2">Expected CSV Format</h4>
            <p className="text-sm text-blue-700 mb-2">Required columns:</p>
            <div className="flex flex-wrap gap-2">
              {expectedColumns.map(col => (
                <span key={col} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg">
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <h4 className="font-medium text-red-900">Validation Errors</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success */}
          {file && errors.length === 0 && !isProcessing && (
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-900">File validated successfully</span>
              </div>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Data Preview (first 5 rows)</h4>
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).filter(key => key !== '_rowIndex').map(key => (
                        <th key={key} className="px-4 py-2 text-left font-medium text-gray-700">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {preview.map((row, index) => (
                      <tr key={index}>
                        {Object.entries(row).filter(([key]) => key !== '_rowIndex').map(([key, value]) => (
                          <td key={key} className="px-4 py-2 text-gray-900">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || errors.length > 0 || isProcessing}
              className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Import Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;