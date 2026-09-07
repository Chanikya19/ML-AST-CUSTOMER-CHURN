import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { PreprocessingSummary } from '../types';
import { 
  ArrowDown, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  Trash2, 
  FileCode2, 
  Check 
} from 'lucide-react';

export const PreprocessingView: React.FC = () => {
  const [data, setData] = useState<PreprocessingSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPreprocessing();
  }, []);

  const fetchPreprocessing = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getPreprocessing();
      setData(res);
    } catch (err) {
      console.error("Failed to load preprocessing summary:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-custom">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Extracting Preprocessing Pipeline Specs...</span>
        </div>
      </div>
    );
  }

  const { raw_shape, processed_shape, missing_handled, categorical_encoded, removed_features, scaled_features } = data;

  const pipelineSteps = [
    { title: "Raw Dataset", desc: `${raw_shape[0]} Rows × ${raw_shape[1]} Columns loaded` },
    { title: "Data Validation", desc: "Data types checked & target variable verified" },
    { title: "Missing Value Handling", desc: `${missing_handled.length} features imputed (Median/Mode)` },
    { title: "Categorical Encoding", desc: `${categorical_encoded.length} categorical columns One-Hot Encoded` },
    { title: "Irrelevant Attribute Removal", desc: `${removed_features.length} non-predictive columns removed` },
    { title: "Feature Scaling", desc: `StandardScaler normalized numerical distributions` },
    { title: "Processed Dataset", desc: `Final feature matrix: ${processed_shape[0]} Rows × ${processed_shape[1]} Processed Features` },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-charcoal font-sans">Preprocessing Pipeline Workspace</h2>
          <p className="text-xs text-slate-custom mt-1">
            Automated feature transformation pipeline guaranteeing identical feature scaling and encoding between model training and live predictions.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-ivory border border-stone-custom/40 rounded text-xs font-mono text-charcoal font-semibold">
          Raw: {raw_shape[1]} cols ➔ Processed: {processed_shape[1]} features
        </div>
      </div>

      {/* Visual Workflow Flowchart */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs">
        <h3 className="text-sm font-bold text-charcoal mb-4">Pipeline Workflow Architecture</h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center">
          {pipelineSteps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="p-3 bg-ivory/60 border border-stone-custom/30 rounded text-center space-y-1 hover:border-gold transition-colors">
                <div className="w-5 h-5 rounded-full bg-gold text-charcoal font-bold text-[10px] flex items-center justify-center mx-auto">
                  {idx + 1}
                </div>
                <h4 className="text-[11px] font-bold text-charcoal font-sans leading-snug">{step.title}</h4>
                <p className="text-[10px] text-slate-custom leading-tight">{step.desc}</p>
              </div>
              {idx < pipelineSteps.length - 1 && (
                <div className="hidden md:flex justify-center text-gold">
                  ➜
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Detailed Operations Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Values & Removed Features */}
        <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-custom/20">
            <h3 className="text-sm font-bold text-charcoal">Imputation & Feature Removal Log</h3>
            <span className="text-xs text-gold font-mono font-semibold">Data Cleaning</span>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-charcoal mb-2">Missing Value Handling</h4>
              {missing_handled.length === 0 ? (
                <p className="text-xs text-slate-custom italic bg-ivory p-3 rounded">
                  No missing values detected. All features intact.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-custom/20 text-slate-custom text-[10px] uppercase font-semibold">
                        <th className="py-2">Feature</th>
                        <th className="py-2">Count</th>
                        <th className="py-2">Imputation Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-custom/10">
                      {missing_handled.map((m, i) => (
                        <tr key={i}>
                          <td className="py-2 font-mono font-semibold text-charcoal">{m.column}</td>
                          <td className="py-2 font-mono text-rose-700">{m.missing_count}</td>
                          <td className="py-2 text-slate-custom">{m.method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-charcoal mb-2">Removed Non-Predictive Features</h4>
              <div className="space-y-2">
                {removed_features.map((r, i) => (
                  <div key={i} className="p-3 bg-rose-50/50 border border-rose-200 rounded flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-rose-900">{r.column}</span>
                    <span className="text-rose-700 text-[11px]">{r.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Categorical Encoding & Scaling */}
        <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-custom/20">
            <h3 className="text-sm font-bold text-charcoal">Categorical Encoding & Feature Scaling</h3>
            <span className="text-xs text-gold font-mono font-semibold">StandardScaler</span>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-charcoal mb-2">Categorical Feature Transformations</h4>
            <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
              {categorical_encoded.map((c, i) => (
                <div key={i} className="p-2.5 bg-ivory/50 border border-stone-custom/20 rounded text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-charcoal">{c.original_column}</span>
                    <span className="text-[10px] font-mono bg-stone-custom/30 text-charcoal px-1.5 py-0.5 rounded">
                      {c.encoding_type} ({c.dummy_count} columns)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-custom font-mono truncate">
                    {c.generated_columns.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-charcoal mb-2">StandardScaler Feature Normalization</h4>
            <p className="text-xs text-slate-custom bg-ivory/70 p-3 rounded border border-stone-custom/20">
              All numerical columns (tenure, MonthlyCharges, TotalCharges) and dummy encoded variables transformed to zero mean and unit variance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
