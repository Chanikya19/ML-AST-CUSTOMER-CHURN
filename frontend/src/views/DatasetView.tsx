import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { DatasetProfile } from '../types';
import { 
  Upload, 
  RotateCcw, 
  Search, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle,
  Database,
  Hash,
  Layers,
  HelpCircle
} from 'lucide-react';

export const DatasetView: React.FC = () => {
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const pageSize = 15;

  useEffect(() => {
    fetchDataset();
  }, []);

  const fetchDataset = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getDataset();
      setProfile(res.profile);
      setRecords(res.sample_data);
    } catch (err) {
      console.error("Failed to load dataset:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadMessage("Validating and processing CSV file...");
      const res = await apiClient.uploadDataset(file);
      setUploadMessage(res.message);
      fetchDataset();
    } catch (err: any) {
      setUploadMessage(err.response?.data?.detail || "Failed to upload dataset.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await apiClient.resetDataset();
      setUploadMessage("Reset to default IBM Telco Customer Churn dataset.");
      fetchDataset();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => {
    if (!searchTerm) return true;
    return Object.values(r).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading || !profile) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-custom">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading Dataset Profile & Data Inspector...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Action Header */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-gold/15 text-gold font-mono text-[10px] uppercase font-bold rounded">
              Active Dataset
            </span>
            <h2 className="text-lg font-bold text-charcoal font-sans">{profile.name}</h2>
          </div>
          <p className="text-xs text-slate-custom mt-1">
            <strong>Dataset Source:</strong> {profile.source}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="flex-1 md:flex-initial px-4 py-2 bg-charcoal text-white rounded text-xs font-semibold hover:bg-graphite transition-all cursor-pointer flex items-center justify-center gap-2">
            <Upload className="w-3.5 h-3.5 text-gold" />
            {uploading ? 'Uploading...' : 'Upload Custom CSV'}
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleReset}
            className="px-4 py-2 bg-ivory text-charcoal border border-stone-custom/40 rounded text-xs font-semibold hover:bg-stone-custom/20 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-custom" />
            Reset Default
          </button>
        </div>
      </div>

      {uploadMessage && (
        <div className="p-4 bg-charcoal text-white rounded-lg text-xs flex items-center justify-between">
          <span>{uploadMessage}</span>
          <button onClick={() => setUploadMessage(null)} className="text-stone-custom hover:text-white">✕</button>
        </div>
      )}

      {/* Dataset Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-stone-custom/30 rounded-lg shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-custom text-[11px] font-semibold uppercase tracking-wider">
            <span>Total Rows</span>
            <Database className="w-4 h-4 text-gold" />
          </div>
          <p className="text-2xl font-bold font-mono text-charcoal">{profile.total_rows.toLocaleString()}</p>
          <p className="text-[11px] text-slate-custom">Customer instances</p>
        </div>

        <div className="p-5 bg-white border border-stone-custom/30 rounded-lg shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-custom text-[11px] font-semibold uppercase tracking-wider">
            <span>Total Columns</span>
            <Hash className="w-4 h-4 text-gold" />
          </div>
          <p className="text-2xl font-bold font-mono text-charcoal">{profile.total_columns}</p>
          <p className="text-[11px] text-slate-custom">
            {profile.numerical_features.length} Num, {profile.categorical_features.length} Cat
          </p>
        </div>

        <div className="p-5 bg-white border border-stone-custom/30 rounded-lg shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-custom text-[11px] font-semibold uppercase tracking-wider">
            <span>Missing Values</span>
            <HelpCircle className="w-4 h-4 text-gold" />
          </div>
          <p className="text-2xl font-bold font-mono text-charcoal">
            {Object.keys(profile.missing_values).length === 0 ? '0' : Object.values(profile.missing_values).reduce((a,b)=>a+b, 0)}
          </p>
          <p className="text-[11px] text-slate-custom">Across all columns</p>
        </div>

        <div className="p-5 bg-white border border-stone-custom/30 rounded-lg shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-custom text-[11px] font-semibold uppercase tracking-wider">
            <span>Target Distribution</span>
            <Layers className="w-4 h-4 text-gold" />
          </div>
          <p className="text-2xl font-bold font-mono text-gold-muted">{profile.target_churn_rate}% Churn</p>
          <p className="text-[11px] text-slate-custom">Target variable: {profile.target_variable}</p>
        </div>
      </div>

      {/* Dataset Records Inspector Table */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-stone-custom/20">
          <div>
            <h3 className="text-sm font-bold text-charcoal">Dataset Records Inspector</h3>
            <p className="text-xs text-slate-custom">Previewing raw customer attributes and features</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-custom absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search customer ID or values..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-ivory border border-stone-custom/40 rounded text-xs text-charcoal focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-custom/30 bg-ivory text-slate-custom uppercase text-[10px] tracking-wider font-semibold">
                {profile.features_list.slice(0, 10).map((col) => (
                  <th key={col} className="py-2.5 px-3 whitespace-nowrap">{col}</th>
                ))}
                <th className="py-2.5 px-3 whitespace-nowrap text-right text-gold">Target ({profile.target_variable})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-custom/20">
              {paginatedRecords.map((row, idx) => (
                <tr key={idx} className="hover:bg-ivory/50 transition-colors">
                  {profile.features_list.slice(0, 10).map((col) => (
                    <td key={col} className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-charcoal">
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono font-bold text-gold-muted">
                    {String(row[profile.target_variable] ?? '')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-custom/20 text-xs text-slate-custom">
          <span>
            Showing {Math.min(filteredRecords.length, (currentPage - 1) * pageSize + 1)} - {Math.min(filteredRecords.length, currentPage * pageSize)} of {filteredRecords.length} records
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-ivory border border-stone-custom/40 rounded text-xs disabled:opacity-40 hover:bg-stone-custom/20"
            >
              Previous
            </button>
            <span className="font-mono text-charcoal">Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-ivory border border-stone-custom/40 rounded text-xs disabled:opacity-40 hover:bg-stone-custom/20"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
