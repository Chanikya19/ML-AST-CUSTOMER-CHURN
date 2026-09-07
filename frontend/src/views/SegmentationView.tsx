import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { KMeansSegmentationResponse } from '../types';
import { 
  PieChart as PieIcon, 
  Sparkles, 
  Compass, 
  Info,
  Download
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ScatterChart, 
  Scatter, 
  ZAxis, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

export const SegmentationView: React.FC = () => {
  const [data, setData] = useState<KMeansSegmentationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [nClusters, setNClusters] = useState<number>(4);

  useEffect(() => {
    fetchSegmentation(nClusters);
  }, []);

  const fetchSegmentation = async (k: number) => {
    try {
      setLoading(true);
      const res = await apiClient.runKMeans(k);
      setData(res);
      setNClusters(k);
    } catch (err) {
      console.error("Failed to run segmentation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKChange = (newK: number) => {
    fetchSegmentation(newK);
  };

  if (loading || !data) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-custom">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Running K-Means Clustering & PCA 2D Projection...</span>
        </div>
      </div>
    );
  }

  const { elbow_silhouette, cluster_profiles, pca_points, explained_variance_ratio, recommended_k } = data;

  const clusterColors = ['#171717', '#B89B5E', '#5E6268', '#8A5B00', '#1E3A5F', '#6B1D1D', '#1E4620', '#8F7848'];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-charcoal font-sans">K-Means Customer Segmentation & PCA Map</h2>
          <p className="text-xs text-slate-custom mt-1">
            Grouping customers with similar service, financial, and tenure characteristics into distinct behavioral clusters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-ivory px-3 py-1.5 rounded border border-stone-custom/40 text-xs">
            <span className="text-slate-custom font-medium">Cluster Count (K):</span>
            <select
              value={nClusters}
              onChange={(e) => handleKChange(parseInt(e.target.value))}
              className="bg-white font-bold font-mono text-charcoal border border-stone-custom/40 rounded px-2 py-0.5"
            >
              {[2, 3, 4, 5, 6, 7, 8].map(k => (
                <option key={k} value={k}>K = {k}</option>
              ))}
            </select>
          </div>

          <span className="text-[11px] bg-gold/15 text-gold font-mono px-2.5 py-1 rounded font-bold">
            Recommended K = {recommended_k}
          </span>
        </div>
      </div>

      {/* Elbow Method & Silhouette Score Curves Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Elbow WSS Curve */}
        <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs">
          <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Elbow Method (Sum of Squared Errors)</h3>
          <p className="text-[11px] text-slate-custom mb-4">WSS inertia reduction across K values (2-8)</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={elbow_silhouette}>
                <XAxis dataKey="k" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', color: '#fff', borderRadius: '4px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="wss" name="WSS Inertia" stroke="#171717" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Silhouette Score Curve */}
        <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs">
          <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Silhouette Coefficient Analysis</h3>
          <p className="text-[11px] text-slate-custom mb-4">Cluster cohesion and separation validation</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={elbow_silhouette}>
                <XAxis dataKey="k" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 0.5]} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', color: '#fff', borderRadius: '4px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="silhouette_score" name="Silhouette Score" stroke="#B89B5E" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PCA 2D Cluster Visualization */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-custom/20">
          <div>
            <h3 className="text-sm font-bold text-charcoal">2D PCA Customer Segment Scatter Projection</h3>
            <p className="text-xs text-slate-custom">
              Dimensionality reduction mapping high-dimensional feature space into PC1 ({explained_variance_ratio[0]}% var) and PC2 ({explained_variance_ratio[1]}% var)
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-gold">PC1 vs PC2 Map</span>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis dataKey="pc1" name="PC1" type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="pc2" name="PC2" type="number" tick={{ fontSize: 10 }} />
              <ZAxis dataKey="churn_prob" range={[40, 200]} name="Churn Prob %" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (!payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-charcoal text-white p-3 rounded text-xs space-y-1 shadow-lg border border-charcoal-50">
                      <div className="font-mono font-bold text-gold">{d.customer_id}</div>
                      <div>Segment {d.cluster_id + 1}</div>
                      <div>Tenure: <strong>{d.tenure} months</strong></div>
                      <div>Monthly: <strong>${d.monthly_charges}</strong></div>
                      <div>Churn Prob: <strong className="text-gold">{d.churn_prob}%</strong></div>
                      <div>Contract: <strong>{d.contract}</strong></div>
                    </div>
                  );
                }}
              />
              <Scatter data={pca_points} fill="#B89B5E" opacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cluster Profiles Table & Strategic Interpretation */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-custom/20">
          <h3 className="text-sm font-bold text-charcoal">Cluster Behavioral Profiles & Recommended Strategies</h3>
          <span className="text-xs text-slate-custom font-mono">{cluster_profiles.length} Segments Identified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-custom/30 bg-ivory text-slate-custom uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-3">Segment ID</th>
                <th className="py-3 px-3">Segment Name</th>
                <th className="py-3 px-3 text-right">Customers</th>
                <th className="py-3 px-3 text-right">Avg Tenure</th>
                <th className="py-3 px-3 text-right">Avg Monthly</th>
                <th className="py-3 px-3 text-right">Avg Total</th>
                <th className="py-3 px-3 text-right">Observed Churn</th>
                <th className="py-3 px-3 text-right">Avg Risk Prob</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-custom/20 font-mono">
              {cluster_profiles.map((p) => (
                <tr key={p.cluster_id} className="hover:bg-ivory/50">
                  <td className="py-3 px-3 font-bold text-charcoal">Segment {p.cluster_id + 1}</td>
                  <td className="py-3 px-3 font-sans font-semibold text-charcoal">{p.segment_name}</td>
                  <td className="py-3 px-3 text-right">{p.customer_count} ({p.percentage_of_total}%)</td>
                  <td className="py-3 px-3 text-right">{p.avg_tenure} mo</td>
                  <td className="py-3 px-3 text-right">${p.avg_monthly_charges}</td>
                  <td className="py-3 px-3 text-right">${p.avg_total_charges}</td>
                  <td className="py-3 px-3 text-right text-rose-700 font-bold">{p.observed_churn_rate}%</td>
                  <td className="py-3 px-3 text-right text-gold-muted font-bold">{p.avg_churn_probability}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detailed Segment Strategic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {cluster_profiles.map((p) => (
            <div key={p.cluster_id} className="p-4 bg-ivory/40 border border-stone-custom/30 rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal">{p.segment_name}</span>
                <span className="text-[10px] font-mono bg-charcoal text-white px-2 py-0.5 rounded">
                  {p.customer_count} Customers
                </span>
              </div>
              <ul className="text-xs text-slate-custom space-y-1 list-disc list-inside">
                {p.characteristics.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
              <div className="pt-2 border-t border-stone-custom/20 text-xs">
                <strong className="text-gold uppercase text-[10px]">Strategic Retention Recommendation:</strong>
                <p className="text-charcoal mt-0.5">{p.recommended_strategy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
