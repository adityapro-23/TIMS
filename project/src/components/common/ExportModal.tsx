import React, { useState } from 'react';
import { Download, FileText, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  title: string;
  type: 'induction-plan' | 'audit-report';
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, data, title, type }) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const exportToCSV = () => {
    if (data.length === 0) return;

    let headers: string[];
    let csvData: any[];
    
    if (type === 'induction-plan') {
      headers = ['Rank', 'Train_ID', 'Recommended_Action', 'Reasons', 'Shunt_Cost', 'Predicted_Risk'];
      csvData = data.map(item => ({
        Rank: item.rank,
        Train_ID: item.train_id,
        Recommended_Action: item.recommended_action,
        Reasons: Array.isArray(item.reasons) ? item.reasons.join('; ') : item.reasons,
        Shunt_Cost: item.shunt_cost,
        Predicted_Risk: item.predicted_risk
      }));
    } else if (type === 'audit-report') {
      headers = ['Timestamp', 'User', 'Role', 'Action', 'Reason', 'Train_ID'];
      csvData = data.map(item => ({
        Timestamp: item.timestamp,
        User: item.user,
        Role: item.role,
        Action: item.action,
        Reason: item.reason,
        Train_ID: item.train_id || ''
      }));
    } else {
      headers = data.length > 0 ? Object.keys(data[0]) : [];
      csvData = data;
    }
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text(title, 20, 30);
      
      // Add timestamp
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45);
      
      let yPosition = 60;
      
      if (type === 'induction-plan') {
        // Add induction plan data
        pdf.setFontSize(14);
        pdf.text('Tomorrow\'s Induction Plan', 20, yPosition);
        yPosition += 20;
        
        data.forEach((item, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 30;
          }
          
          pdf.setFontSize(10);
          pdf.text(`${item.rank}. ${item.train_id} - ${item.recommended_action}`, 20, yPosition);
          yPosition += 8;
          pdf.text(`   Reasons: ${item.reasons.join(', ')}`, 25, yPosition);
          yPosition += 8;
          pdf.text(`   Shunt Cost: ₹${item.shunt_cost} | Risk: ${item.predicted_risk}`, 25, yPosition);
          yPosition += 15;
        });
      } else if (type === 'audit-report') {
        // Add audit report data
        pdf.setFontSize(14);
        pdf.text('Audit Report', 20, yPosition);
        yPosition += 20;
        
        data.forEach((item, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 30;
          }
          
          pdf.setFontSize(10);
          pdf.text(`${new Date(item.timestamp).toLocaleString()}`, 20, yPosition);
          yPosition += 8;
          pdf.text(`User: ${item.user} (${item.role})`, 25, yPosition);
          yPosition += 8;
          pdf.text(`Action: ${item.action}`, 25, yPosition);
          yPosition += 8;
          pdf.text(`Reason: ${item.reason}`, 25, yPosition);
          if (item.train_id) {
            yPosition += 8;
            pdf.text(`Train ID: ${item.train_id}`, 25, yPosition);
          }
          yPosition += 15;
        });
      }
      
      pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
    } else {
      exportToPDF();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Export {title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
                  className="mr-3 text-teal-600 focus:ring-teal-500"
                />
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                CSV File
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
                  className="mr-3 text-teal-600 focus:ring-teal-500"
                />
                <Download className="w-4 h-4 mr-2 text-gray-500" />
                PDF Report
              </label>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600">
              {data.length} records will be exported
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;