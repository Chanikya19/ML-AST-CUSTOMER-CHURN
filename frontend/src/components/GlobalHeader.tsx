import React from 'react';
import { PipelineStatus } from '../types';
import { Database, Cpu, PieChart } from 'lucide-react';

interface GlobalHeaderProps {
  title: string;
  subtitle: string;
  status: PipelineStatus | null;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ title, subtitle, status }) => {
  return (
    <header className="bg-softwhite border-b border-stone-custom/30 px-8 py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-charcoal tracking-tight font-sans">
          {title}
        </h1>
        <p className="text-xs text-slate-custom mt-0.5 font-sans">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-ivory border border-stone-custom/40 rounded text-xs text-charcoal">
          <Database className="w-3.5 h-3.5 text-gold" />
          <span className="font-medium text-[11px] text-slate-custom">Dataset:</span>
          <span className="font-semibold text-charcoal">{status?.dataset_name || 'IBM Telco Churn'}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-ivory border border-stone-custom/40 rounded text-xs text-charcoal">
          <Cpu className="w-3.5 h-3.5 text-gold" />
          <span className="font-medium text-[11px] text-slate-custom">Best Model:</span>
          <span className="font-semibold text-charcoal">{status?.best_model_name || 'Logistic Regression'}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-ivory border border-stone-custom/40 rounded text-xs text-charcoal">
          <PieChart className="w-3.5 h-3.5 text-gold" />
          <span className="font-medium text-[11px] text-slate-custom">Segmentation:</span>
          <span className="font-semibold text-charcoal">{status?.n_clusters || 4} Clusters</span>
        </div>
      </div>
    </header>
  );
};
