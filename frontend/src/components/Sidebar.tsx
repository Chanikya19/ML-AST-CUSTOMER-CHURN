import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  BarChart3, 
  Target, 
  Cpu, 
  PieChart as PieChartIcon, 
  ShieldAlert, 
  BookOpen, 
  CheckCircle2, 
  Clock,
  Sparkles
} from 'lucide-react';
import { PipelineStatus } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  status: PipelineStatus | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, status }) => {
  const navItems = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'dataset', label: 'Dataset & Preprocessing', icon: Database },
    { id: 'eda', label: 'Exploratory Analysis', icon: BarChart3 },
    { id: 'prediction', label: 'Churn Prediction', icon: Target },
    { id: 'modellab', label: 'Model Lab', icon: Cpu },
    { id: 'segmentation', label: 'Customer Segmentation', icon: PieChartIcon },
    { id: 'risk', label: 'Risk & Retention', icon: ShieldAlert },
    { id: 'project', label: 'Project Info', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-charcoal text-stone-custom border-r border-charcoal-50 flex flex-col h-screen fixed left-0 top-0 z-30 select-none shadow-xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-charcoal-50 flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-gold flex items-center justify-center text-charcoal shadow-sm">
          <Sparkles className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-wide text-white uppercase font-sans">
            Churn Intelligence
          </h1>
          <p className="text-[11px] text-stone-custom/60 tracking-tight font-sans">
            Enterprise Predictive Analytics
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-wider font-semibold text-stone-custom/40">
          Analytics Pipeline
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gold/15 text-gold border-l-2 border-gold font-semibold shadow-inner'
                  : 'text-stone-custom/80 hover:bg-charcoal-50 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-gold' : 'text-stone-custom/60'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ML Pipeline Status Footer */}
      <div className="p-4 border-t border-charcoal-50 bg-charcoal-100/50 space-y-2">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-gold/90 mb-2 flex items-center justify-between">
          <span>ML Pipeline Status</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-stone-custom/70">Dataset Loaded</span>
            {status?.dataset_loaded ? (
              <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-mono text-[10px]">
                <Clock className="w-3 h-3" /> Pending
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-custom/70">Preprocessing</span>
            {status?.preprocessing_ready ? (
              <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> Processed
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-mono text-[10px]">
                <Clock className="w-3 h-3" /> Pending
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-custom/70">Models Trained</span>
            {status?.models_trained ? (
              <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> 6 Models
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-mono text-[10px]">
                <Clock className="w-3 h-3" /> Pending
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-custom/70">K-Means PCA</span>
            {status?.clustering_ready ? (
              <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> {status.n_clusters} Clusters
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-mono text-[10px]">
                <Clock className="w-3 h-3" /> Pending
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
