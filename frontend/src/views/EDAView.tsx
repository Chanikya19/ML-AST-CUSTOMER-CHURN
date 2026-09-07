import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export const EDAView: React.FC = () => {
  const [edaData, setEdaData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchEDA();
  }, []);

  const fetchEDA = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getEDA();
      setEdaData(res);
    } catch (err) {
      console.error("Failed to load EDA data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !edaData) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-custom">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Rendering Exploratory Data Visualizations...</span>
        </div>
      </div>
    );
  }

  const { tenure_distribution, monthly_charges_distribution, total_charges_distribution, churn_by_payment_method, correlation_matrix } = edaData;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-charcoal font-sans">Exploratory Data Analysis (EDA)</h2>
          <p className="text-xs text-slate-custom mt-1">
            Uncovering tenure, billing, contract, and service usage patterns driving customer churn behaviour.
          </p>
        </div>
      </div>

      {/* Grid 1: Numerical Feature Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenure Distribution */}
        {tenure_distribution && (
          <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs">
            <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Customer Tenure Distribution</h3>
            <p className="text-[11px] text-slate-custom mb-4">Subscription duration in months</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tenure_distribution}>
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', color: '#fff', borderRadius: '4px', fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#171717" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Monthly Charges Distribution */}
        {monthly_charges_distribution && (
          <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs">
            <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Monthly Charges Distribution</h3>
            <p className="text-[11px] text-slate-custom mb-4">Monthly bill amount range ($ USD)</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly_charges_distribution}>
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', color: '#fff', borderRadius: '4px', fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#B89B5E" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Total Charges Distribution */}
        {total_charges_distribution && (
          <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs">
            <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Total Lifetime Charges</h3>
            <p className="text-[11px] text-slate-custom mb-4">Cumulative spend distribution ($ USD)</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={total_charges_distribution}>
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', color: '#fff', borderRadius: '4px', fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#62666B" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Grid 2: Churn by Payment Method */}
      {churn_by_payment_method && (
        <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs">
          <h3 className="text-sm font-bold text-charcoal mb-1">Churn Rate by Payment Method</h3>
          <p className="text-xs text-slate-custom mb-4">Comparing electronic check vs credit card/bank transfer churn rate</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churn_by_payment_method}>
                <XAxis dataKey="method" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', color: '#fff', borderRadius: '4px', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="active" name="Active" fill="#171717" radius={[2, 2, 0, 0]} />
                <Bar dataKey="churned" name="Churned" fill="#B89B5E" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Correlation Heatmap */}
      {correlation_matrix && (
        <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs">
          <h3 className="text-sm font-bold text-charcoal mb-1">Feature Correlation Matrix</h3>
          <p className="text-xs text-slate-custom mb-4">Pearson correlation coefficient matrix across top features</p>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-[10px] font-mono border-collapse">
              <thead>
                <tr className="border-b border-stone-custom/30 bg-ivory text-slate-custom">
                  <th className="p-2 text-left font-bold text-charcoal">Feature</th>
                  {correlation_matrix.features.map((f: string) => (
                    <th key={f} className="p-2 truncate max-w-[80px]" title={f}>{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlation_matrix.data.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-stone-custom/10">
                    <td className="p-2 text-left font-bold text-charcoal truncate max-w-[120px]">{row.feature}</td>
                    {correlation_matrix.features.map((f: string) => {
                      const val = row[f];
                      // Color mapping
                      let bg = 'bg-stone-100';
                      if (val > 0.4) bg = 'bg-amber-100 text-amber-900 font-bold';
                      else if (val < -0.4) bg = 'bg-blue-100 text-blue-900 font-bold';
                      else if (val === 1) bg = 'bg-gold/20 font-bold text-charcoal';

                      return (
                        <td key={f} className={`p-2 ${bg}`}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
