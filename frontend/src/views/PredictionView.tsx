import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { SinglePredictionResponse, BatchPredictionResponse } from '../types';
import { 
  Target, 
  Upload, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export const PredictionView: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'individual' | 'batch'>('individual');
  
  // Single prediction state
  const [formData, setFormData] = useState<Record<string, any>>({
    customerID: 'CUST-8832',
    gender: 'Female',
    SeniorCitizen: 0,
    Partner: 'No',
    Dependents: 'No',
    tenure: 4,
    PhoneService: 'Yes',
    MultipleLines: 'No',
    InternetService: 'Fiber optic',
    OnlineSecurity: 'No',
    OnlineBackup: 'No',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'Yes',
    StreamingMovies: 'No',
    Contract: 'Month-to-month',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Electronic check',
    MonthlyCharges: 85.5,
    TotalCharges: 342.0
  });

  const [singleResult, setSingleResult] = useState<SinglePredictionResponse | null>(null);
  const [predicting, setPredicting] = useState<boolean>(false);

  // Batch prediction state
  const [batchResult, setBatchResult] = useState<BatchPredictionResponse | null>(null);
  const [batchUploading, setBatchUploading] = useState<boolean>(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSinglePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPredicting(true);
      const res = await apiClient.predictSingle(formData);
      setSingleResult(res);
    } catch (err) {
      console.error("Single prediction error:", err);
    } finally {
      setPredicting(false);
    }
  };

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBatchUploading(true);
      const res = await apiClient.predictBatch(file);
      setBatchResult(res);
    } catch (err) {
      console.error("Batch prediction error:", err);
    } finally {
      setBatchUploading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Mode Switcher Banner */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-charcoal font-sans">Customer Churn Prediction Engine</h2>
          <p className="text-xs text-slate-custom mt-1">
            Real-time supervised classifier inference using the highest F1-score production model.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-ivory p-1 rounded border border-stone-custom/40">
          <button
            onClick={() => setActiveMode('individual')}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${
              activeMode === 'individual'
                ? 'bg-charcoal text-white shadow-xs'
                : 'text-slate-custom hover:text-charcoal'
            }`}
          >
            Individual Customer Form
          </button>
          <button
            onClick={() => setActiveMode('batch')}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${
              activeMode === 'batch'
                ? 'bg-charcoal text-white shadow-xs'
                : 'text-slate-custom hover:text-charcoal'
            }`}
          >
            Batch CSV Prediction
          </button>
        </div>
      </div>

      {activeMode === 'individual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form Column */}
          <form onSubmit={handleSinglePredict} className="lg:col-span-2 space-y-6">
            {/* Customer Demographics */}
            <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider border-b border-stone-custom/20 pb-2">
                1. Customer & Account Demographics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-custom mb-1 font-medium">Customer ID</label>
                  <input
                    type="text"
                    value={formData.customerID}
                    onChange={(e) => handleInputChange('customerID', e.target.value)}
                    className="w-full p-2 bg-ivory border border-stone-custom/40 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-custom mb-1 font-medium">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full p-2 bg-ivory border border-stone-custom/40 rounded"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-custom mb-1 font-medium">Senior Citizen</label>
                  <select
                    value={formData.SeniorCitizen}
                    onChange={(e) => handleInputChange('SeniorCitizen', parseInt(e.target.value))}
                    className="w-full p-2 bg-ivory border border-stone-custom/40 rounded"
                  >
                    <option value={0}>No (0)</option>
                    <option value={1}>Yes (1)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-custom mb-1 font-medium">Partner</label>
                  <select
                    value={formData.Partner}
                    onChange={(e) => handleInputChange('Partner', e.target.value)}
                    className="w-full p-2 bg-ivory border border-stone-custom/40 rounded"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-custom mb-1 font-medium">Dependents</label>
                  <select
                    value={formData.Dependents}
                    onChange={(e) => handleInputChange('Dependents', e.target.value)}
                    className="w-full p-2 bg-ivory border border-stone-custom/40 rounded"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-custom mb-1 font-medium">Tenure (Months)</label>
                  <input
                    type="number"
                    value={formData.tenure}
                    onChange={(e) => handleInputChange('tenure', parseInt(e.target.value) || 0)}
                    className="w-full p-2 bg-ivory border border-stone-custom/40 rounded font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider border-b border-stone-custom/20 pb-2">
                2. Subscribed Telecommunication Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-custom mb-1 font-medium">Internet Service</label>
                  <select
                    value={formData.InternetService}
                    onChange={(e) => handleInputChange('InternetService', e.target.value)}
                    className="w-full p-2 bg-ivory border border-stone-custom/40 rounded"
                  >
                    <option value="Fiber optic">Fiber optic</option>
                    <option value="DSL">DSL</option>
                    <option value="No">No Internet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-custom mb-1 font-medium">Online Security</label>
                  <select
                    value={formData.OnlineSecurity}
                    onChange={(e) => handleInputChange('OnlineSecurity', e.target.value)}
                    className="w-full p-2 bg-ivory border border-stone-custom/40 rounded"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-custom mb-1 font-medium">Tech Support</label>
                  <select
                    value={formData.TechSupport}
                    onChange={(e) => handleInputChange('TechSupport', e.target.value)}
                    className="w-full p-2 bg-ivory border border-stone-custom/40 rounded"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-custom mb-1 font-medium">Online Backup</label>
                  <select
                    value={formData.OnlineBackup}
                    onChange={(e) => handleInputChange('OnlineBackup', e.target.value)}
                    className="w-full p-2 bg-ivory border border-stone-custom/40 rounded"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-custom mb-1 font-medium">Device Protection</label>
                  <select
                    value={formData.DeviceProtection}
                    onChange={(e) => handleInputChange('DeviceProtection', e.target.value)}
                    className="w-full p-2 bg-ivory border border-stone-custom/40 rounded"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-custom mb-1 font-medium">Streaming TV</label>
                  <select
                    value={formData.StreamingTV}
                    onChange={(e) => handleInputChange('StreamingTV', e.target.value)}
                    className="w-full p-2 bg-ivory border border-stone-custom/40 rounded"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contract & Billing */}
            <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider border-b border-stone-custom/20 pb-2">
                3. Contract & Financial Billing Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-custom mb-1 font-medium">Contract Type</label>
                  <select
                    value={formData.Contract}
                    onChange={(e) => handleInputChange('Contract', e.target.value)}
                    className="w-full p-2 bg-ivory border border-stone-custom/40 rounded"
                  >
                    <option value="Month-to-month">Month-to-month</option>
                    <option value="One year">One year</option>
                    <option value="Two year">Two year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-custom mb-1 font-medium">Payment Method</label>
                  <select
                    value={formData.PaymentMethod}
                    onChange={(e) => handleInputChange('PaymentMethod', e.target.value)}
                    className="w-full p-2 bg-ivory border border-stone-custom/40 rounded"
                  >
                    <option value="Electronic check">Electronic check</option>
                    <option value="Mailed check">Mailed check</option>
                    <option value="Bank transfer (automatic)">Bank transfer</option>
                    <option value="Credit card (automatic)">Credit card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-custom mb-1 font-medium">Monthly Charges ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.MonthlyCharges}
                    onChange={(e) => handleInputChange('MonthlyCharges', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-ivory border border-stone-custom/40 rounded font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={predicting}
              className="w-full py-3 bg-gold text-charcoal font-bold rounded text-xs hover:bg-gold-muted hover:text-white transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Target className="w-4 h-4" />
              {predicting ? 'Computing ML Risk Inference...' : 'Predict Customer Churn Risk'}
            </button>
          </form>

          {/* Single Prediction Results Panel */}
          <div className="lg:col-span-1 space-y-6">
            {singleResult ? (
              <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-md space-y-5 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-stone-custom/20">
                  <span className="text-[11px] font-mono uppercase font-bold text-slate-custom">
                    Inference Output
                  </span>
                  <span className="font-mono text-xs text-charcoal font-semibold">{singleResult.customer_id}</span>
                </div>

                {/* Risk Level Badge */}
                <div className={`p-4 rounded border text-center space-y-1 ${
                  singleResult.risk_level === 'HIGH'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : singleResult.risk_level === 'MEDIUM'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}>
                  <div className="text-[10px] uppercase font-bold tracking-wider">
                    Calculated Customer Risk Level
                  </div>
                  <div className="text-2xl font-extrabold font-mono">
                    {singleResult.risk_level} CHURN RISK
                  </div>
                  <p className="text-xs">Predicted Class: <strong>{singleResult.predicted_class === 'Yes' ? 'Likely Churn' : 'Active Account'}</strong></p>
                </div>

                {/* Probabilities */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-custom">Churn Probability:</span>
                    <span className="font-mono font-bold text-rose-700">{singleResult.churn_probability}%</span>
                  </div>
                  <div className="w-full bg-ivory h-2 rounded-full overflow-hidden border">
                    <div className="bg-rose-700 h-full" style={{ width: `${singleResult.churn_probability}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-custom">Retention Probability:</span>
                    <span className="font-mono font-bold text-emerald-700">{singleResult.non_churn_probability}%</span>
                  </div>
                </div>

                {/* Contributing Factors */}
                <div>
                  <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                    Key Contributing Features
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    {singleResult.contributing_factors.map((factor, idx) => (
                      <div key={idx} className="p-2 bg-ivory/60 border border-stone-custom/20 rounded flex items-center justify-between">
                        <span>{factor.feature}: <strong>{factor.value}</strong></span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                          factor.impact.includes('Increases') ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {factor.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actionable Strategy */}
                <div className="p-3 bg-ivory border border-stone-custom/30 rounded space-y-1">
                  <span className="text-[10px] font-bold uppercase text-gold tracking-wider">Data-Driven Recommendation</span>
                  <p className="text-xs text-charcoal leading-relaxed">{singleResult.recommendation}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-stone-custom/30 rounded-lg p-8 shadow-xs text-center text-slate-custom space-y-3">
                <Target className="w-8 h-8 text-gold mx-auto" />
                <h4 className="text-xs font-bold uppercase text-charcoal">Awaiting Prediction Request</h4>
                <p className="text-xs leading-relaxed">
                  Fill out the customer attributes form and click <strong>Predict Customer Churn Risk</strong> to run ML prediction inference.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Batch CSV Upload Mode */
        <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-stone-custom/20">
            <div>
              <h3 className="text-sm font-bold text-charcoal">Batch Customer Prediction Workspace</h3>
              <p className="text-xs text-slate-custom">Upload a customer CSV file to run bulk risk inference and segment assignment</p>
            </div>

            <label className="px-4 py-2 bg-charcoal text-white rounded text-xs font-semibold hover:bg-graphite transition-all cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4 text-gold" />
              {batchUploading ? 'Processing Batch...' : 'Upload Customer CSV'}
              <input type="file" accept=".csv" onChange={handleBatchUpload} className="hidden" />
            </label>
          </div>

          {batchResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-ivory rounded border">
                  <div className="text-[10px] uppercase font-semibold text-slate-custom">Total Records Analyzed</div>
                  <div className="text-xl font-bold font-mono text-charcoal">{batchResult.total_records}</div>
                </div>
                <div className="p-4 bg-rose-50 rounded border border-rose-200">
                  <div className="text-[10px] uppercase font-semibold text-rose-800">Predicted Churn Instances</div>
                  <div className="text-xl font-bold font-mono text-rose-900">{batchResult.churn_count}</div>
                </div>
                <div className="p-4 bg-gold/10 rounded border border-gold/30">
                  <div className="text-[10px] uppercase font-semibold text-gold-muted">Batch Churn Rate</div>
                  <div className="text-xl font-bold font-mono text-gold-muted">{batchResult.churn_rate}%</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-custom/30 bg-ivory text-slate-custom uppercase text-[10px]">
                      <th className="py-2.5 px-3">Customer ID</th>
                      <th className="py-2.5 px-3 text-right">Churn Prob</th>
                      <th className="py-2.5 px-3 text-center">Predicted Class</th>
                      <th className="py-2.5 px-3 text-center">Risk Level</th>
                      <th className="py-2.5 px-3">Recommended Retention Strategy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-custom/20">
                    {batchResult.records.map((r: any, i: number) => (
                      <tr key={i} className="hover:bg-ivory/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-charcoal">{r.customer_id}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">{r.churn_probability}%</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.predicted_class === 'Yes' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {r.predicted_class}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold">{r.risk_level}</td>
                        <td className="py-2.5 px-3 text-slate-custom">{r.recommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-custom space-y-2">
              <Upload className="w-8 h-8 text-gold mx-auto" />
              <p className="text-xs">Upload a CSV file containing customer attributes to process batch predictions.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
