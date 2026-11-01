import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/ui/Skeleton';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-64 space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 rounded-full bg-status-error-bg flex items-center justify-center text-status-error mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-text-primary">Access Restricted</h2>
        <p className="text-xs text-text-secondary max-w-sm mt-1 mb-4">
          Your current account role (<span className="font-semibold text-primary">{user.role}</span>) does not possess authorization for this administrative module. Required: {allowedRoles.join(' or ')}.
        </p>
        <Button variant="secondary" size="sm" onClick={() => window.history.back()}>
          Return to Previous Page
        </Button>
      </div>
    );
  }

  return <Outlet />;
};
