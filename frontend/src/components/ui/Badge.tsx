import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    success: 'bg-status-success-bg text-status-success-text border border-status-success/20',
    warning: 'bg-status-warning-bg text-status-warning-text border border-status-warning/20',
    error: 'bg-status-error-bg text-status-error-text border border-status-error/20',
    info: 'bg-status-info-bg text-status-info-text border border-status-info/20',
    primary: 'bg-primary-subtle text-primary border border-primary/20',
    neutral: 'bg-surface-subtle text-text-secondary border border-border',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
