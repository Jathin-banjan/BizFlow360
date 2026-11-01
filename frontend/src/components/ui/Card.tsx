import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  noPadding = false,
}) => {
  return (
    <div
      className={`bg-surface rounded-xl border border-border shadow-card transition-all duration-200 ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            {title && <h3 className="font-semibold text-text-primary text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
};
