import React from 'react';
import { useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon, Shield, Database, Radio } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Badge } from '../ui/Badge';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isConnected: isWsConnected } = useSocket();
  const location = useLocation();

  // Generate breadcrumb title from path
  const pathMap: Record<string, { title: string; subtitle: string }> = {
    '/': { title: 'Executive Operations Dashboard', subtitle: 'Live business performance & KPI metrics' },
    '/sales': { title: 'Sales Performance & Margin Analysis', subtitle: 'Regional revenue, costs, and gross profitability' },
    '/products': { title: 'Product Catalog & Pricing', subtitle: 'Manage SKUs, margins, and threshold configurations' },
    '/inventory': { title: 'Inventory Balances & Movement Audit', subtitle: 'Stock movements, valuation, and threshold alerts' },
    '/suppliers': { title: 'Supplier Network & Reliability SLAs', subtitle: 'Vendor directory, lead times, and on-time performance' },
    '/purchase-orders': { title: 'Purchase Order Management', subtitle: 'Dual-tier PO approvals and verified stock intake' },
    '/orders': { title: 'Customer Sales & Order Fulfilment', subtitle: 'Retail order processing and stock allocation' },
    '/analytics': { title: 'Analytics & Operational Insights', subtitle: 'Rules-based operational detection and recommendations' },
    '/requirements': { title: 'Business & Functional Documentation', subtitle: 'Placement portfolio requirements, objectives & acceptance criteria' },
    '/audit': { title: 'Security & Mutation Audit Trail', subtitle: 'Immutable administrative operational event logs' },
  };

  const currentMeta = pathMap[location.pathname] || {
    title: 'BizFlow 360',
    subtitle: 'Intelligent Operations Platform',
  };

  const roleBadgeVariant: Record<string, 'primary' | 'success' | 'info'> = {
    ADMIN: 'primary',
    MANAGER: 'success',
    ANALYST: 'info',
  };

  return (
    <header className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-base font-bold text-text-primary leading-tight">
          {currentMeta.title}
        </h1>
        <p className="text-xs text-text-secondary hidden sm:block">
          {currentMeta.subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live DB & WebSocket Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>MongoDB Live</span>
        </div>

        {isWsConnected && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-primary text-xs font-medium">
            <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>WebSockets Active</span>
          </div>
        )}

        {/* User Role Badge */}
        {user && (
          <Badge variant={roleBadgeVariant[user.role] || 'primary'} size="md">
            <Shield className="w-3 h-3 mr-1" />
            {user.role}
          </Badge>
        )}

        {/* Profile Pill & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-text-primary leading-tight">
              {user?.fullName}
            </span>
            <span className="text-[10px] text-text-muted leading-tight">
              {user?.department}
            </span>
          </div>

          <button
            onClick={() => logout()}
            className="p-2 text-text-muted hover:text-status-error hover:bg-status-error-bg rounded-lg transition-colors"
            title="Log out of BizFlow 360"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
