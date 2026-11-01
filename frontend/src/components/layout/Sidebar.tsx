import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Boxes,
  Truck,
  FileSpreadsheet,
  ShoppingCart,
  Lightbulb,
  FileCheck2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, hasRole } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/sales', label: 'Sales & Margins', icon: <TrendingUp className="w-4 h-4" /> },
    { to: '/products', label: 'Products', icon: <Package className="w-4 h-4" /> },
    { to: '/inventory', label: 'Inventory', icon: <Boxes className="w-4 h-4" /> },
    { to: '/suppliers', label: 'Suppliers', icon: <Truck className="w-4 h-4" /> },
    { to: '/purchase-orders', label: 'Purchase Orders', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { to: '/orders', label: 'Customer Orders', icon: <ShoppingCart className="w-4 h-4" /> },
    { to: '/analytics', label: 'Analytics & Insights', icon: <Lightbulb className="w-4 h-4" /> },
    {
      to: '/requirements',
      label: 'Requirements Specs',
      icon: <FileCheck2 className="w-4 h-4 text-secondary" />,
      badge: 'Portfolio',
    },
  ];

  if (hasRole('ADMIN')) {
    navItems.push({
      to: '/audit',
      label: 'Audit Trail',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: 'Admin',
    });
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface border-r border-border select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shadow-subtle shrink-0">
            BF
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-text-primary text-sm tracking-tight">
                BizFlow <span className="text-primary">360</span>
              </span>
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
                Operations & Analytics
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-subtle transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-primary text-white shadow-subtle'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle'
              }`
            }
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="flex-1 truncate">{item.label}</span>
            )}
            {!collapsed && item.badge && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-surface-subtle text-primary border border-primary/20">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-border bg-surface-subtle/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate text-left">
              <span className="text-xs font-semibold text-text-primary truncate">
                {user?.fullName || 'User'}
              </span>
              <span className="text-[10px] text-text-muted truncate">{user?.role}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary text-white flex items-center justify-center font-bold text-xs">
            BF
          </div>
          <span className="font-bold text-sm text-text-primary">BizFlow 360</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-text-secondary hover:text-text-primary rounded-lg"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 max-w-[80vw] h-full bg-surface shadow-dropdown z-50">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block transition-all duration-200 shrink-0 h-screen sticky top-0 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
