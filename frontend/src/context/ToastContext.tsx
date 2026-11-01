import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toast: addToast,
        success: (title, msg) => addToast('success', title, msg),
        error: (title, msg) => addToast('error', title, msg),
        warning: (title, msg) => addToast('warning', title, msg),
        info: (title, msg) => addToast('info', title, msg),
      }}
    >
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((t) => {
          const bgMap = {
            success: 'bg-white border-status-success text-text-primary shadow-dropdown',
            error: 'bg-white border-status-error text-text-primary shadow-dropdown',
            warning: 'bg-white border-status-warning text-text-primary shadow-dropdown',
            info: 'bg-white border-primary text-text-primary shadow-dropdown',
          };

          const iconMap = {
            success: <CheckCircle2 className="w-5 h-5 text-status-success shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-status-error shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-status-warning shrink-0" />,
            info: <Info className="w-5 h-5 text-primary shrink-0" />,
          };

          return (
            <div
              key={t.id}
              className={`pointer-events-auto border-l-4 rounded-lg p-3.5 flex items-start gap-3 transition-all duration-200 transform translate-y-0 ${bgMap[t.type]}`}
            >
              {iconMap[t.type]}
              <div className="flex-1 text-sm">
                <div className="font-semibold text-text-primary">{t.title}</div>
                {t.message && <div className="text-text-secondary mt-0.5">{t.message}</div>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-text-muted hover:text-text-primary transition-colors p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
