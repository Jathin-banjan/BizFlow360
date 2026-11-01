import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-text-primary tracking-wide">
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-subtle">
          <select
            id={selectId}
            ref={ref}
            className={`w-full appearance-none rounded-lg border bg-surface py-2 pl-3.5 pr-9 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
              error
                ? 'border-status-error focus:ring-status-error'
                : 'border-border hover:border-border-focus'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-status-error font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
