import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { RiskRetentionOverview, HighRiskCustomer } from '../types';
import { 
  ShieldAlert, 
  Filter, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  UserX, 
  Info,
  ChevronRight
} from 'lucide-react';

export const RiskRetentionView: React.FC = () => {
  const [data, setData] = useState<RiskRetentionOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [clusterFilter, setClusterFilter] = useState<string>('ALL');
  const [contractFilter, setContractFilter] = useState<string>('ALL');
  const [internetFilter, setInternetFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchRiskRetention();
  }, [riskFilter, clusterFilter, contractFilter, internetFilter]);

  const fetchRiskRetention = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getRiskRetention(riskFilter, clusterFilter, contractFilter, internetFilter);
      setData(res);
    } catch (err) {
      console.error("Failed to load risk retention overview:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-custom">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Synthesizing Retention Action Priorities...</span>
        </div>
      </div>
    );
  }

  const { total_customers, low_risk_count, medium_risk_count, high_risk_count, filtered_count, top_high_risk_customers, segment_summary } = data;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-charcoal font-sans">High-Risk Customer Identification & Retention Engine</h2>
          <p className="text-xs text-slate-custom mt-1">
            Business action portal translating predicted probabilities into prioritized customer retention strategies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/export/predictions"
            download
            className="px-4 py-2 bg-charcoal text-white rounded text-xs font-semibold hover:bg-graphite transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-gold" />
            Export Predictions CSV
          </a>
          <a
            href="/api/export/cluster-profiles"
            download
            className="px-4 py-2 bg-ivory text-charcoal border border-stone-custom/40 rounded text-xs font-semibold hover:bg-stone-custom/20 transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-slate-custom" />
            Export Cluster Profiles
          </a>
        </div>
      </div>

      {/* Interactive Global Filters Bar */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-4 shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-charcoal uppercase tracking-wider text-[10px]">
          <Filter className="w-3.5 h-3.5 text-gold" />
          Filter Action Portal:
        </div>

        <div>
          <label className="text-slate-custom mr-2">Risk Level:</label>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-ivory border border-stone-custom/40 rounded px-2.5 py-1 text-charcoal font-medium"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk (&gt;67%)</option>
            <option value="MEDIUM">Medium Risk (34-66%)</option>
            <option value="LOW">Low Risk (&lt;33%)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-custom mr-2">Cluster Segment:</label>
          <select
            value={clusterFilter}
            onChange={(e) => setClusterFilter(e.target.value)}
            className="bg-ivory border border-stone-custom/40 rounded px-2.5 py-1 text-charcoal font-medium"
          >
            <option value="ALL">All Segments</option>
            <option value="0">Segment 1</option>
            <option value="1">Segment 2</option>
            <option value="2">Segment 3</option>
            <option value="3">Segment 4</option>
          </select>
        </div>

        <div>
          <label className="text-slate-custom mr-2">Contract:</label>
          <select
            value={contractFilter}
            onChange={(e) => setContractFilter(e.target.value)}
            className="bg-ivory border border-stone-custom/40 rounded px-2.5 py-1 text-charcoal font-medium"
          >
            <option value="ALL">All Contracts</option>
            <option value="Month-to-month">Month-to-month</option>
            <option value="One year">One year</option>
            <option value="Two year">Two year</option>
          </select>
        </div>

        <div>
          <label className="text-slate-custom mr-2">Internet Service:</label>
          <select
            value={internetFilter}
            onChange={(e) => setInternetFilter(e.target.value)}
            className="bg-ivory border border-stone-custom/40 rounded px-2.5 py-1 text-charcoal font-medium"
          >
            <option value="ALL">All Services</option>
            <option value="Fiber optic">Fiber optic</option>
            <option value="DSL">DSL</option>
            <option value="No">No Internet</option>
          </select>
        </div>

        <span className="ml-auto font-mono font-semibold text-slate-custom text-[11px]">
          Matching: <strong>{filtered_count}</strong> / {total_customers} Customers
        </span>
      </div>

      {/* Risk Categorization Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-rose-50/70 border border-rose-200 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-rose-900 font-bold uppercase text-[11px]">
            <span>High Risk Threshold (&gt;67%)</span>
            <AlertTriangle className="w-4 h-4 text-rose-700" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-900">{high_risk_count.toLocaleString()}</p>
          <p className="text-[11px] text-rose-700">Urgent proactive intervention required</p>
        </div>

        <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-amber-900 font-bold uppercase text-[11px]">
            <span>Medium Risk (34% - 66%)</span>
            <ShieldAlert className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-900">{medium_risk_count.toLocaleString()}</p>
          <p className="text-[11px] text-amber-700">Account health monitoring & feature recommendations</p>
        </div>

        <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-emerald-900 font-bold uppercase text-[11px]">
            <span>Low Risk (&lt;33%)</span>
            <CheckCircle className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-900">{low_risk_count.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-700">Stable accounts & loyalty program candidates</p>
        </div>
      </div>

      {/* Segment Retention Priorities Table */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-charcoal">Segment Retention Priority Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-custom/30 bg-ivory text-slate-custom uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-2.5 px-3">Segment ID</th>
                <th className="py-2.5 px-3 text-right">Total Customers</th>
                <th className="py-2.5 px-3 text-right">High-Risk Count</th>
                <th className="py-2.5 px-3 text-right">Observed Churn</th>
                <th className="py-2.5 px-3 text-right">Avg Churn Prob</th>
                <th className="py-2.5 px-3 text-center">Retention Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-custom/20 font-mono">
              {segment_summary.map((s) => (
                <tr key={s.cluster_id} className="hover:bg-ivory/50">
                  <td className="py-3 px-3 font-bold text-charcoal">Segment {s.cluster_id + 1}</td>
                  <td className="py-3 px-3 text-right">{s.total_customers}</td>
                  <td className="py-3 px-3 text-right text-rose-700 font-bold">{s.high_risk_count}</td>
                  <td className="py-3 px-3 text-right">{s.observed_churn_rate}%</td>
                  <td className="py-3 px-3 text-right text-gold-muted font-bold">{s.avg_churn_probability}%</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      s.retention_priority === 'URGENT'
                        ? 'bg-rose-700 text-white'
                        : s.retention_priority === 'HIGH'
                        ? 'bg-amber-600 text-white'
                        : 'bg-charcoal text-white'
                    }`}>
                      {s.retention_priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top High-Risk Customer List Table */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-custom/20">
          <div>
            <h3 className="text-sm font-bold text-charcoal">Priority Action Customer Queue</h3>
            <p className="text-xs text-slate-custom">Sorted by highest predicted churn probability requiring immediate retention outreach</p>
          </div>
          <span className="text-xs text-slate-custom font-mono">Top {top_high_risk_customers.length} Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-custom/30 bg-ivory text-slate-custom uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-3">Customer ID</th>
                <th className="py-3 px-3 text-right">Churn Risk</th>
                <th className="py-3 px-3 text-center">Risk Level</th>
                <th className="py-3 px-3 text-right">Tenure</th>
                <th className="py-3 px-3">Contract</th>
                <th className="py-3 px-3 text-right">Monthly</th>
                <th className="py-3 px-3">Cluster</th>
                <th className="py-3 px-3">Rule-Based Retention Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-custom/20 font-mono">
              {top_high_risk_customers.map((c) => (
                <tr key={c.customer_id} className="hover:bg-ivory/50">
                  <td className="py-3 px-3 font-bold text-charcoal">{c.customer_id}</td>
                  <td className="py-3 px-3 text-right font-bold text-rose-700">{c.churn_probability}%</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.risk_level === 'HIGH' ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {c.risk_level}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">{c.tenure} mo</td>
                  <td className="py-3 px-3 font-sans">{c.contract}</td>
                  <td className="py-3 px-3 text-right">${c.monthly_charges}</td>
                  <td className="py-3 px-3 font-sans font-semibold">Segment {c.cluster_id + 1}</td>
                  <td className="py-3 px-3 font-sans text-slate-custom">{c.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
