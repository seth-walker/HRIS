import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { importExportService } from '../services/import-export.service';
import { employeeService } from '../services/employee.service';
import { teamService } from '../services/team.service';
import { FiDownload, FiUpload, FiFileText, FiFile, FiFilter, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import { RoleName } from '../types/index';

const ImportExport: React.FC = () => {
  const { user } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: any[] } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Export filter states
  const [exportFilters, setExportFilters] = useState({
    department: '',
    status: '',
    teamId: '',
    managerId: '',
    title: '',
  });

  const canImportExport = user?.role.name === RoleName.ADMIN || user?.role.name === RoleName.HR;

  // Fetch all teams for filter dropdown
  const { data: allTeams } = useQuery({
    queryKey: ['teams-all'],
    queryFn: () => teamService.getAll(''),
  });

  // Fetch all managers for filter dropdown
  const { data: allManagers } = useQuery({
    queryKey: ['managers-all'],
    queryFn: () => employeeService.getAll({}),
    select: (data) => {
      // Filter to only employees who have direct reports
      const managersSet = new Set<string>();
      data.forEach(emp => {
        if (emp.managerId) managersSet.add(emp.managerId);
      });
      return data.filter(emp => managersSet.has(emp.id));
    },
  });

  // Get unique departments from all employees for filter dropdown
  const departments = React.useMemo(() => {
    if (!allManagers) return [];
    const depts = new Set<string>();
    allManagers.forEach(emp => {
      if (emp.department) depts.add(emp.department);
    });
    return Array.from(depts).sort();
  }, [allManagers]);

  // Count active filters
  const activeFilterCount = [
    exportFilters.department,
    exportFilters.status,
    exportFilters.teamId,
    exportFilters.managerId,
    exportFilters.title,
  ].filter(Boolean).length;

  // Helper to clear all filters
  const clearExportFilters = () => {
    setExportFilters({
      department: '',
      status: '',
      teamId: '',
      managerId: '',
      title: '',
    });
  };

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
      const filters: any = {};
      if (exportFilters.department) filters.department = exportFilters.department;
      if (exportFilters.status) filters.status = exportFilters.status;
      if (exportFilters.teamId) filters.teamId = exportFilters.teamId;
      if (exportFilters.managerId) filters.managerId = exportFilters.managerId;
      if (exportFilters.title) filters.title = exportFilters.title;

      await importExportService.exportEmployeesExcel(filters);
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
      const filters: any = {};
      if (exportFilters.department) filters.department = exportFilters.department;
      if (exportFilters.status) filters.status = exportFilters.status;
      if (exportFilters.teamId) filters.teamId = exportFilters.teamId;
      if (exportFilters.managerId) filters.managerId = exportFilters.managerId;
      if (exportFilters.title) filters.title = exportFilters.title;

      await importExportService.exportEmployeesPDF(filters);
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

          {/* Export Filters */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <FiFilter className="h-4 w-4" />
                <span>Export Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
                {showFilters ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearExportFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              )}
            </div>

            {showFilters && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {/* Department Filter */}
                  <div>
                    <label htmlFor="export-department" className="block text-xs font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      id="export-department"
                      value={exportFilters.department}
                      onChange={(e) => setExportFilters({ ...exportFilters, department: e.target.value })}
                      className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label htmlFor="export-status" className="block text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="export-status"
                      value={exportFilters.status}
                      onChange={(e) => setExportFilters({ ...exportFilters, status: e.target.value })}
                      className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>

                  {/* Team Filter */}
                  <div>
                    <label htmlFor="export-team" className="block text-xs font-medium text-gray-700 mb-1">
                      Team
                    </label>
                    <select
                      id="export-team"
                      value={exportFilters.teamId}
                      onChange={(e) => setExportFilters({ ...exportFilters, teamId: e.target.value })}
                      className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Teams</option>
                      {allTeams?.map((team) => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Manager Filter */}
                  <div>
                    <label htmlFor="export-manager" className="block text-xs font-medium text-gray-700 mb-1">
                      Manager
                    </label>
                    <select
                      id="export-manager"
                      value={exportFilters.managerId}
                      onChange={(e) => setExportFilters({ ...exportFilters, managerId: e.target.value })}
                      className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Managers</option>
                      {allManagers?.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.firstName} {manager.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title Filter */}
                  <div>
                    <label htmlFor="export-title" className="block text-xs font-medium text-gray-700 mb-1">
                      Title (contains)
                    </label>
                    <input
                      id="export-title"
                      type="text"
                      value={exportFilters.title}
                      onChange={(e) => setExportFilters({ ...exportFilters, title: e.target.value })}
                      placeholder="e.g. Engineer"
                      className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Active Filters Display */}
                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-200">
                    {exportFilters.department && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {exportFilters.department}
                        <button
                          onClick={() => setExportFilters({ ...exportFilters, department: '' })}
                          className="ml-1 hover:text-blue-900"
                        >
                          <FiX className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {exportFilters.status && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {exportFilters.status}
                        <button
                          onClick={() => setExportFilters({ ...exportFilters, status: '' })}
                          className="ml-1 hover:text-blue-900"
                        >
                          <FiX className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {exportFilters.teamId && allTeams && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {allTeams.find(t => t.id === exportFilters.teamId)?.name}
                        <button
                          onClick={() => setExportFilters({ ...exportFilters, teamId: '' })}
                          className="ml-1 hover:text-blue-900"
                        >
                          <FiX className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {exportFilters.managerId && allManagers && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {allManagers.find(m => m.id === exportFilters.managerId)?.firstName} {allManagers.find(m => m.id === exportFilters.managerId)?.lastName}
                        <button
                          onClick={() => setExportFilters({ ...exportFilters, managerId: '' })}
                          className="ml-1 hover:text-blue-900"
                        >
                          <FiX className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {exportFilters.title && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Title: {exportFilters.title}
                        <button
                          onClick={() => setExportFilters({ ...exportFilters, title: '' })}
                          className="ml-1 hover:text-blue-900"
                        >
                          <FiX className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
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
              <li>All employee exports respect your filter settings above</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
