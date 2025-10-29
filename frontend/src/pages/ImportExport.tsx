import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { importExportService } from '../services/import-export.service';
import { FiDownload, FiUpload, FiFileText, FiFile } from 'react-icons/fi';
import { RoleName } from '../types/index';

const ImportExport: React.FC = () => {
  const { user } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: any[] } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const canImportExport = user?.role.name === RoleName.ADMIN || user?.role.name === RoleName.HR;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImportCSV = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await importExportService.importCSVFile(selectedFile);
      setImportResult(result);
      setSelectedFile(null);
    } catch (error: any) {
      alert('Import failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await importExportService.downloadCSVTemplate();
    } catch (error: any) {
      alert('Download failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleExportEmployeesExcel = async () => {
    try {
      await importExportService.exportEmployeesExcel();
    } catch (error: any) {
      alert('Export failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleExportTeamsExcel = async () => {
    try {
      await importExportService.exportTeamsExcel();
    } catch (error: any) {
      alert('Export failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleExportEmployeesPDF = async () => {
    try {
      await importExportService.exportEmployeesPDF();
    } catch (error: any) {
      alert('Export failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleExportOrgChartPDF = async () => {
    try {
      await importExportService.exportOrgChartPDF();
    } catch (error: any) {
      alert('Export failed: ' + (error.response?.data?.message || error.message));
    }
  };

  if (!canImportExport) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800">Access Restricted</h2>
          <p className="mt-2 text-yellow-700">
            You do not have permission to access import/export features. Please contact an
            administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Import & Export</h1>
          <p className="mt-2 text-sm text-gray-700">
            Import employee data from CSV files or export data in various formats.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Import Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FiUpload className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Import Data</h2>
          </div>

          <div className="space-y-4">
            <div>
              <button
                onClick={handleDownloadTemplate}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiDownload className="mr-2" />
                Download CSV Template
              </button>
              <p className="mt-2 text-xs text-gray-500">
                Download a template file to see the required format for importing employees.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <button
              onClick={handleImportCSV}
              disabled={!selectedFile || isImporting}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Importing...' : 'Import Employees'}
            </button>

            {importResult && (
              <div className={`p-4 rounded-md ${importResult.errors.length > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Import Results</h3>
                <p className="text-sm text-gray-700">
                  Successfully imported: <strong>{importResult.success}</strong> employees
                </p>
                {importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-red-600">
                      Errors: <strong>{importResult.errors.length}</strong>
                    </p>
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 cursor-pointer">
                        View errors
                      </summary>
                      <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                        {JSON.stringify(importResult.errors, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FiDownload className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Export Data</h2>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Employee Data</h3>
              <div className="space-y-2">
                <button
                  onClick={handleExportEmployeesExcel}
                  className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <span className="flex items-center">
                    <FiFile className="mr-2 text-green-600" />
                    Export to Excel
                  </span>
                  <span className="text-xs text-gray-500">.xlsx</span>
                </button>
                <button
                  onClick={handleExportEmployeesPDF}
                  className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <span className="flex items-center">
                    <FiFileText className="mr-2 text-red-600" />
                    Export to PDF
                  </span>
                  <span className="text-xs text-gray-500">.pdf</span>
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Team Data</h3>
              <button
                onClick={handleExportTeamsExcel}
                className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <span className="flex items-center">
                  <FiFile className="mr-2 text-green-600" />
                  Export Teams to Excel
                </span>
                <span className="text-xs text-gray-500">.xlsx</span>
              </button>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Org Chart</h3>
              <button
                onClick={handleExportOrgChartPDF}
                className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <span className="flex items-center">
                  <FiFileText className="mr-2 text-red-600" />
                  Export Org Chart to PDF
                </span>
                <span className="text-xs text-gray-500">.pdf</span>
              </button>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Export Tips</h4>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Excel files are best for data analysis and further processing</li>
              <li>PDF files are ideal for printing and sharing reports</li>
              <li>All exports respect your current filter settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
