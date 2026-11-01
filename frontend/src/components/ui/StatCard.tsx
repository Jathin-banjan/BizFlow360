import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changePeriod?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changePeriod = 'vs target',
  icon,
  subtitle,
}) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-card hover:shadow-dropdown transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {title}
        </span>
        <div className="w-9 h-9 rounded-lg bg-surface-subtle flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold text-text-primary tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>

      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center font-semibold ${
              isPositive ? 'text-status-success' : 'text-status-error'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {Math.abs(change)}%
          </span>
          <span className="text-text-muted">{changePeriod}</span>
        </div>
      )}
    </div>
  );
};
