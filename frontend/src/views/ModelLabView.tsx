import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { ModelEvalResult } from '../types';
import { 
  Cpu, 
  Play, 
  Award, 
  CheckCircle2, 
  BarChart2, 
  Info,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export const ModelLabView: React.FC = () => {
  const [results, setResults] = useState<ModelEvalResult[]>([]);
  const [bestModelName, setBestModelName] = useState<string>('');
  const [selectedCMModel, setSelectedCMModel] = useState<string>('Logistic Regression');
  const [loading, setLoading] = useState<boolean>(true);
  const [training, setTraining] = useState<boolean>(false);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getModelEvaluations();
      setResults(res.results);
      setBestModelName(res.best_model_name);
      if (res.results.length > 0) {
        setSelectedCMModel(res.best_model_name || res.results[0].model_name);
      }
    } catch (err) {
      console.error("Failed to load model evaluations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainModels = async () => {
    try {
      setTraining(true);
      const res = await apiClient.trainModels();
      setResults(res.model_results);
      setBestModelName(res.best_model.model_name);
      setSelectedCMModel(res.best_model.model_name);
    } catch (err) {
      console.error("Training error:", err);
    } finally {
      setTraining(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-custom">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Evaluating Supervised Machine Learning Classifiers...</span>
        </div>
      </div>
    );
  }

  const bestModelObj = results.find(r => r.model_name === bestModelName);
  const activeCMObj = results.find(r => r.model_name === selectedCMModel);

  const comparisonChartData = results.map(r => ({
    name: r.model_name,
    Accuracy: r.accuracy,
    Precision: r.precision,
    Recall: r.recall,
    'F1-Score': r.f1_score
  }));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-charcoal font-sans">Supervised Machine Learning Model Lab</h2>
          <p className="text-xs text-slate-custom mt-1">
            Training and benchmarking 6 supervised classification algorithms on identical 80/20 train/test stratified splits.
          </p>
        </div>

        <button
          onClick={handleTrainModels}
          disabled={training}
          className="px-5 py-2.5 bg-gold text-charcoal font-bold text-xs rounded hover:bg-gold-muted hover:text-white transition-all shadow-md flex items-center gap-2 uppercase tracking-wider"
        >
          <Play className="w-4 h-4 fill-current" />
          {training ? 'Training Pipeline...' : 'Re-Train & Benchmark Models'}
        </button>
      </div>

      {/* Best Model Card */}
      {bestModelObj && (
        <div className="bg-charcoal text-white border border-charcoal-50 rounded-lg p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gold">
              <Award className="w-5 h-5" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Optimal Production Classifier Selected
              </span>
            </div>
            <h3 className="text-xl font-bold font-sans">{bestModelObj.model_name}</h3>
            <p className="text-xs text-stone-custom/80 leading-relaxed max-w-2xl">
              {bestModelObj.selection_reason}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 bg-graphite p-4 rounded border border-charcoal-50 text-center font-mono text-xs w-full md:w-auto">
            <div>
              <span className="block text-[10px] text-gold uppercase">Accuracy</span>
              <span className="text-base font-bold">{bestModelObj.accuracy}</span>
            </div>
            <div>
              <span className="block text-[10px] text-gold uppercase">Precision</span>
              <span className="text-base font-bold">{bestModelObj.precision}</span>
            </div>
            <div>
              <span className="block text-[10px] text-gold uppercase">Recall</span>
              <span className="text-base font-bold">{bestModelObj.recall}</span>
            </div>
            <div>
              <span className="block text-[10px] text-gold uppercase">F1-Score</span>
              <span className="text-base font-bold text-emerald-400">{bestModelObj.f1_score}</span>
            </div>
          </div>
        </div>
      )}

      {/* Model Evaluation Results Table */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-custom/20">
          <h3 className="text-sm font-bold text-charcoal">Algorithm Performance Benchmarks</h3>
          <span className="text-xs text-slate-custom font-mono">Stratified 80/20 Test Validation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-custom/30 bg-ivory text-slate-custom uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Algorithm Name</th>
                <th className="py-3 px-4 text-right">Accuracy</th>
                <th className="py-3 px-4 text-right">Precision</th>
                <th className="py-3 px-4 text-right">Recall</th>
                <th className="py-3 px-4 text-right">F1-Score</th>
                <th className="py-3 px-4 text-right">Train Time (s)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-custom/20 font-mono">
              {results.map((m) => (
                <tr
                  key={m.model_name}
                  onClick={() => setSelectedCMModel(m.model_name)}
                  className={`cursor-pointer transition-colors ${
                    selectedCMModel === m.model_name ? 'bg-gold/10 font-bold' : 'hover:bg-ivory/50'
                  }`}
                >
                  <td className="py-3 px-4 text-charcoal flex items-center gap-2">
                    {m.is_best && <Award className="w-3.5 h-3.5 text-gold shrink-0" />}
                    <span>{m.model_name}</span>
                  </td>
                  <td className="py-3 px-4 text-right">{m.accuracy.toFixed(4)}</td>
                  <td className="py-3 px-4 text-right">{m.precision.toFixed(4)}</td>
                  <td className="py-3 px-4 text-right">{m.recall.toFixed(4)}</td>
                  <td className="py-3 px-4 text-right text-gold-muted font-bold">{m.f1_score.toFixed(4)}</td>
                  <td className="py-3 px-4 text-right text-slate-custom">{m.training_duration_sec}s</td>
                  <td className="py-3 px-4 text-center">
                    {m.is_best ? (
                      <span className="px-2 py-0.5 bg-gold text-charcoal rounded text-[10px] font-bold uppercase">Best Model</span>
                    ) : (
                      <span className="text-[10px] text-slate-custom">Evaluated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Comparison & Confusion Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Performance Bar Chart */}
        <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs">
          <h3 className="text-sm font-bold text-charcoal mb-1">Comparative Metrics Breakdown</h3>
          <p className="text-xs text-slate-custom mb-4">Multi-metric performance across classifiers</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', color: '#fff', borderRadius: '4px', fontSize: '11px' }} />
                <Legend />
                <Bar dataKey="Accuracy" fill="#171717" />
                <Bar dataKey="Precision" fill="#62666B" />
                <Bar dataKey="Recall" fill="#8F7848" />
                <Bar dataKey="F1-Score" fill="#B89B5E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix Inspector */}
        {activeCMObj && (
          <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-custom/20">
              <div>
                <h3 className="text-sm font-bold text-charcoal">Confusion Matrix Heatmap</h3>
                <p className="text-xs text-slate-custom">Inspecting: <strong>{activeCMObj.model_name}</strong></p>
              </div>

              <select
                value={selectedCMModel}
                onChange={(e) => setSelectedCMModel(e.target.value)}
                className="px-3 py-1 bg-ivory border border-stone-custom/40 rounded text-xs text-charcoal font-medium"
              >
                {results.map(r => (
                  <option key={r.model_name} value={r.model_name}>{r.model_name}</option>
                ))}
              </select>
            </div>

            {/* Confusion Matrix Grid */}
            <div className="grid grid-cols-2 gap-3 text-center font-mono max-w-md mx-auto pt-2">
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded">
                <span className="block text-[10px] uppercase font-bold text-emerald-800">True Negative (TN)</span>
                <span className="text-2xl font-bold text-emerald-900">{activeCMObj.confusion_matrix.true_negative}</span>
                <span className="block text-[10px] text-emerald-700">Correctly Predicted Non-Churn</span>
              </div>

              <div className="p-5 bg-rose-50 border border-rose-200 rounded">
                <span className="block text-[10px] uppercase font-bold text-rose-800">False Positive (FP)</span>
                <span className="text-2xl font-bold text-rose-900">{activeCMObj.confusion_matrix.false_positive}</span>
                <span className="block text-[10px] text-rose-700">Incorrectly Flagged Churn</span>
              </div>

              <div className="p-5 bg-amber-50 border border-amber-200 rounded">
                <span className="block text-[10px] uppercase font-bold text-amber-800">False Negative (FN)</span>
                <span className="text-2xl font-bold text-amber-900">{activeCMObj.confusion_matrix.false_negative}</span>
                <span className="block text-[10px] text-amber-700">Missed Churn Instances</span>
              </div>

              <div className="p-5 bg-emerald-100 border border-emerald-300 rounded">
                <span className="block text-[10px] uppercase font-bold text-emerald-800">True Positive (TP)</span>
                <span className="text-2xl font-bold text-emerald-900">{activeCMObj.confusion_matrix.true_positive}</span>
                <span className="block text-[10px] text-emerald-700">Correctly Identified Churn</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
