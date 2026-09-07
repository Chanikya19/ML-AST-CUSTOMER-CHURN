import React from 'react';
import { 
  BookOpen, 
  Cpu, 
  Layers, 
  PieChart, 
  CheckCircle2, 
  Code2, 
  FileText, 
  Network 
} from 'lucide-react';

export const ProjectInfoView: React.FC = () => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs flex items-center justify-between">
        <div>
          <span className="px-2.5 py-0.5 bg-gold/15 text-gold font-mono text-[10px] uppercase font-bold rounded">
            University Machine Learning Project
          </span>
          <h2 className="text-lg font-bold text-charcoal font-sans mt-1">
            Customer Churn Prediction & Customer Segmentation Platform
          </h2>
          <p className="text-xs text-slate-custom mt-0.5">
            Full-stack enterprise ML application demonstrating complete supervised classification and unsupervised clustering workflows.
          </p>
        </div>
      </div>

      {/* End-to-End Architecture Diagrams */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
          <Network className="w-4 h-4 text-gold" />
          End-to-End System Architecture & ML Pipeline Flowchart
        </h3>

        {/* Supervised Pipeline SVG Flowchart */}
        <div className="p-5 bg-ivory/50 border border-stone-custom/30 rounded space-y-3">
          <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
            1. Supervised Classification Pipeline Workflow
          </h4>
          <div className="overflow-x-auto py-2">
            <div className="flex items-center gap-2 min-w-[750px] text-[11px] font-mono font-semibold text-charcoal">
              <div className="px-3 py-2 bg-charcoal text-white rounded">Dataset</div>
              <span>➜</span>
              <div className="px-3 py-2 bg-white border border-stone-custom/40 rounded">Data Validation</div>
              <span>➜</span>
              <div className="px-3 py-2 bg-white border border-stone-custom/40 rounded">Preprocessing</div>
              <span>➜</span>
              <div className="px-3 py-2 bg-white border border-stone-custom/40 rounded">80/20 Train/Test Split</div>
              <span>➜</span>
              <div className="px-3 py-2 bg-white border border-stone-custom/40 rounded">6 ML Classifiers</div>
              <span>➜</span>
              <div className="px-3 py-2 bg-white border border-stone-custom/40 rounded">Evaluation Metrics</div>
              <span>➜</span>
              <div className="px-3 py-2 bg-gold text-charcoal font-bold rounded">Best Model (F1)</div>
              <span>➜</span>
              <div className="px-3 py-2 bg-charcoal text-white rounded">Risk Inference</div>
            </div>
          </div>
        </div>

        {/* Unsupervised Pipeline SVG Flowchart */}
        <div className="p-5 bg-ivory/50 border border-stone-custom/30 rounded space-y-3">
          <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
            2. Unsupervised Clustering & PCA Projection Workflow
          </h4>
          <div className="overflow-x-auto py-2">
            <div className="flex items-center gap-2 min-w-[750px] text-[11px] font-mono font-semibold text-charcoal">
              <div className="px-3 py-2 bg-white border border-stone-custom/40 rounded">Scaled Feature Matrix</div>
              <span>➜</span>
              <div className="px-3 py-2 bg-white border border-stone-custom/40 rounded">Elbow WSS & Silhouette (K=2..8)</div>
              <span>➜</span>
              <div className="px-3 py-2 bg-gold text-charcoal font-bold rounded">K-Means (K=4)</div>
              <span>➜</span>
              <div className="px-3 py-2 bg-white border border-stone-custom/40 rounded">PCA 2D Reduction</div>
              <span>➜</span>
              <div className="px-3 py-2 bg-white border border-stone-custom/40 rounded">Cluster Profiling</div>
              <span>➜</span>
              <div className="px-3 py-2 bg-charcoal text-white rounded">Retention Strategy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Syllabus Supervised ML Classifiers & Evaluation Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Classifiers */}
        <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
            <Cpu className="w-4 h-4 text-gold" />
            Implemented Supervised Learning Classifiers
          </h3>
          <ul className="text-xs text-slate-custom space-y-2 font-sans">
            <li className="p-2.5 bg-ivory/50 rounded border border-stone-custom/20">
              <strong className="text-charcoal font-mono">1. Logistic Regression:</strong> Linear probabilistic model utilizing L2 regularization and max_iter=1000 for smooth decision boundary modeling.
            </li>
            <li className="p-2.5 bg-ivory/50 rounded border border-stone-custom/20">
              <strong className="text-charcoal font-mono">2. Decision Tree Classifier:</strong> Non-parametric tree splitting algorithm configured with max_depth=6 to prevent over-fitting.
            </li>
            <li className="p-2.5 bg-ivory/50 rounded border border-stone-custom/20">
              <strong className="text-charcoal font-mono">3. Random Forest Classifier:</strong> Ensemble of 100 decision trees combining bootstrap aggregating (bagging) for feature importance evaluation.
            </li>
            <li className="p-2.5 bg-ivory/50 rounded border border-stone-custom/20">
              <strong className="text-charcoal font-mono">4. Gradient Boosting Classifier:</strong> Sequential boosting ensemble iteratively minimizing log-loss residual errors.
            </li>
            <li className="p-2.5 bg-ivory/50 rounded border border-stone-custom/20">
              <strong className="text-charcoal font-mono">5. K-Nearest Neighbors (KNN):</strong> Distance-based instance learning using K=5 Minkowski distance metric.
            </li>
            <li className="p-2.5 bg-ivory/50 rounded border border-stone-custom/20">
              <strong className="text-charcoal font-mono">6. Naive Bayes (GaussianNB):</strong> Probabilistic classifier enforcing feature conditional independence.
            </li>
          </ul>
        </div>

        {/* Evaluation Metrics Formulas */}
        <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
            <FileText className="w-4 h-4 text-gold" />
            Evaluation Metrics & Mathematical Background
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 bg-ivory border border-stone-custom/30 rounded">
              <span className="font-bold text-charcoal block">Accuracy = (TP + TN) / (TP + TN + FP + FN)</span>
              <span className="text-[11px] font-sans text-slate-custom">Overall correct classification ratio across all instances.</span>
            </div>
            <div className="p-3 bg-ivory border border-stone-custom/30 rounded">
              <span className="font-bold text-charcoal block">Precision = TP / (TP + FP)</span>
              <span className="text-[11px] font-sans text-slate-custom">Proportion of flagged churn customers who actually churned.</span>
            </div>
            <div className="p-3 bg-ivory border border-stone-custom/30 rounded">
              <span className="font-bold text-charcoal block">Recall = TP / (TP + FN)</span>
              <span className="text-[11px] font-sans text-slate-custom">Proportion of actual churners successfully identified by the model.</span>
            </div>
            <div className="p-3 bg-gold/15 border border-gold/40 rounded text-charcoal">
              <span className="font-bold block">F1-Score = 2 * (Precision * Recall) / (Precision + Recall)</span>
              <span className="text-[11px] font-sans text-slate-custom">Harmonic mean of precision and recall. Primary best model selection metric.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset & Tech Stack Specs */}
      <div className="bg-white border border-stone-custom/30 rounded-lg p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
          <Code2 className="w-4 h-4 text-gold" />
          Technical Stack & Dataset Attribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          <div className="p-4 bg-ivory/50 border border-stone-custom/30 rounded space-y-1">
            <strong className="text-charcoal block font-mono text-[11px] uppercase">Dataset Source</strong>
            <p className="text-slate-custom">
              IBM Telco Customer Churn Public Dataset (7,043 rows × 21 columns). Contains real-world customer demographics, billing, contracts, and service attributes.
            </p>
          </div>

          <div className="p-4 bg-ivory/50 border border-stone-custom/30 rounded space-y-1">
            <strong className="text-charcoal block font-mono text-[11px] uppercase">Backend ML Engine</strong>
            <p className="text-slate-custom">
              Python 3.11, FastAPI REST API, Scikit-Learn 1.5.0, Pandas 2.2.2, NumPy 1.26.4, Joblib model persistence.
            </p>
          </div>

          <div className="p-4 bg-ivory/50 border border-stone-custom/30 rounded space-y-1">
            <strong className="text-charcoal block font-mono text-[11px] uppercase">Frontend SaaS Interface</strong>
            <p className="text-slate-custom">
              React 18, TypeScript, Tailwind CSS 3.4, Recharts, Lucide Icons, Vite build system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
