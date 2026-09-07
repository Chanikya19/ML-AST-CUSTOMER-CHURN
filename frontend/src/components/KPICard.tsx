import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: string;
  accent?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = false
}) => {
  return (
    <div
      className={`p-5 rounded-lg border transition-all duration-150 ${
        accent
          ? 'bg-charcoal text-white border-charcoal-50 shadow-md'
          : 'bg-white text-charcoal border-stone-custom/30 shadow-xs hover:border-gold/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] font-semibold tracking-wider uppercase ${
            accent ? 'text-gold' : 'text-slate-custom'
          }`}
        >
          {title}
        </span>
        {Icon && (
          <div
            className={`w-8 h-8 rounded flex items-center justify-center ${
              accent ? 'bg-charcoal-50 text-gold' : 'bg-ivory text-gold'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight font-mono">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p
          className={`text-xs mt-1 font-sans ${
            accent ? 'text-stone-custom/70' : 'text-slate-custom'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
