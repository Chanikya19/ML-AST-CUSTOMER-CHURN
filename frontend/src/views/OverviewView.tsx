import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { ExecutiveOverview } from '../types';
import { KPICard } from '../components/KPICard';
import { 
  Users, 
  UserMinus, 
  TrendingUp, 
  UserCheck, 
  AlertTriangle, 
  PieChart as PieIcon, 
  Info,
  ArrowUpRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

export const OverviewView: React.FC = () => {
  const [data, setData] = useState<ExecutiveOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getOverview();
      setData(res);
    } catch (err) {
      console.error("Failed to load overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-custom">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Computing Executive Churn Analytics...</span>
        </div>
      </div>
    );
  }

  const { kpis, churn_distribution, churn_by_contract, risk_distribution, segment_overview, key_findings } = data;

  const riskChartData = [
    { name: 'Low Risk (0-33%)', value: risk_distribution['Low Risk (0-33%)'] || 0, fill: '#1E4620' },
    { name: 'Medium Risk (34-66%)', value: risk_distribution['Medium Risk (34-66%)'] || 0, fill: '#8A5B00' },
    { name: 'High Risk (67-100%)', value: risk_distribution['High Risk (67-100%)'] || 0, fill: '#6B1D1D' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Intro */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 flex items-center justify-between shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-charcoal tracking-tight font-sans">
            Executive Churn Intelligence Dashboard
          </h2>
          <p className="text-xs text-slate-custom mt-1 max-w-2xl">
            Real-time analytics engine synthesising supervised classification predictions, unsupervised K-Means customer segmentation, and business risk profiles.
          </p>
        </div>
        <button
          onClick={fetchOverview}
          className="px-4 py-2 bg-charcoal text-white rounded text-xs font-semibold hover:bg-graphite transition-all flex items-center gap-2"
        >
          Refresh Analytics
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <KPICard
          title="Total Customers"
          value={kpis.total_customers}
          subtitle="Processed dataset records"
          icon={Users}
        />
        <KPICard
          title="Churned Customers"
          value={kpis.churned_customers}
          subtitle="Observed attrition count"
          icon={UserMinus}
        />
        <KPICard
          title="Churn Rate"
          value={`${kpis.churn_rate}%`}
          subtitle="Baseline attrition"
          icon={TrendingUp}
          accent
        />
        <KPICard
          title="Active Customers"
          value={kpis.active_customers}
          subtitle="Retained accounts"
          icon={UserCheck}
        />
        <KPICard
          title="High-Risk Group"
          value={kpis.highest_risk_customers}
          subtitle=">67% churn probability"
          icon={AlertTriangle}
        />
        <KPICard
          title="Customer Segments"
          value={kpis.number_of_segments}
          subtitle="K-Means Clusters"
          icon={PieIcon}
        />
      </div>

      {/* Analytical Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn Distribution Donut */}
        <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-custom/20">
            <div>
              <h3 className="text-sm font-bold text-charcoal">Churn Distribution</h3>
              <p className="text-xs text-slate-custom">Active vs Churned customer proportions</p>
            </div>
            <span className="text-[11px] font-mono text-gold font-semibold uppercase">Distribution</span>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={churn_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {churn_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#171717', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn Rate by Contract Type */}
        <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-custom/20">
            <div>
              <h3 className="text-sm font-bold text-charcoal">Churn Rate by Contract Type</h3>
              <p className="text-xs text-slate-custom">Observed attrition across subscription contracts</p>
            </div>
            <span className="text-[11px] font-mono text-gold font-semibold uppercase">Contract Breakdown</span>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churn_by_contract}>
                <XAxis dataKey="contract" tick={{ fontSize: 11, fill: '#62666B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#62666B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', color: '#fff', borderRadius: '4px', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="active" name="Active Customers" fill="#171717" radius={[2, 2, 0, 0]} />
                <Bar dataKey="churned" name="Churned Customers" fill="#B89B5E" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Customer Risk & Segment Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between pb-4 border-b border-stone-custom/20">
            <div>
              <h3 className="text-sm font-bold text-charcoal">Model Predicted Risk Breakdown</h3>
              <p className="text-xs text-slate-custom">Low / Medium / High Risk Proportions</p>
            </div>
          </div>
          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskChartData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', color: '#fff', borderRadius: '4px', fontSize: '12px' }} />
                <Bar dataKey="value" name="Customers" radius={[0, 4, 4, 0]}>
                  {riskChartData.map((entry, index) => (
                    <Cell key={`risk-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Segment Overview Table */}
        <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-stone-custom/20">
            <div>
              <h3 className="text-sm font-bold text-charcoal">Customer Segment Profiles Summary</h3>
              <p className="text-xs text-slate-custom">K-Means Cluster sizes and churn probabilities</p>
            </div>
            <span className="text-[11px] font-mono text-gold font-semibold uppercase">Cluster Insights</span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-custom/30 bg-ivory text-slate-custom uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Cluster ID</th>
                  <th className="py-2.5 px-3">Segment Name</th>
                  <th className="py-2.5 px-3 text-right">Customers</th>
                  <th className="py-2.5 px-3 text-right">% Total</th>
                  <th className="py-2.5 px-3 text-right">Avg Churn Prob</th>
                  <th className="py-2.5 px-3 text-right">Observed Churn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-custom/20">
                {segment_overview.map((seg) => (
                  <tr key={seg.cluster_id} className="hover:bg-ivory/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-charcoal">
                      Segment {seg.cluster_id + 1}
                    </td>
                    <td className="py-3 px-3 font-medium text-charcoal">{seg.segment_name}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold">{seg.customer_count.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-mono">{seg.percentage_of_total}%</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-gold-muted">
                      {seg.avg_churn_probability}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-rose-700">
                      {seg.observed_churn_rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Data-Derived Key Findings Section */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-4 border-b border-stone-custom/20">
          <Info className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-bold text-charcoal">Empirical Data-Derived Findings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {key_findings.map((item, idx) => (
            <div key={idx} className="p-4 rounded border border-stone-custom/30 bg-ivory/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal uppercase tracking-wider">{item.title}</span>
                <ArrowUpRight className="w-4 h-4 text-gold" />
              </div>
              <p className="text-xs text-slate-custom leading-relaxed">
                {item.insight}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
