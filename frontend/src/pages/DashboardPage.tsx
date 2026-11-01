import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboard';
import { DashboardMetrics, MonthlyTrend } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import {
  DollarSign,
  TrendingUp,
  Percent,
  ShoppingCart,
  CheckCircle2,
  Boxes,
  AlertTriangle,
  Truck,
  RotateCw,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<'30d' | '90d' | '180d' | 'all'>('180d');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [breakdowns, setBreakdowns] = useState<any>(null);
  const [productsData, setProductsData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let startDate: string | undefined;
      const now = new Date();

      if (period === '30d') {
        const d = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
        startDate = d.toISOString().split('T')[0];
      } else if (period === '90d') {
        const d = new Date(now.getTime() - 90 * 24 * 3600 * 1000);
        startDate = d.toISOString().split('T')[0];
      } else if (period === '180d') {
        const d = new Date(now.getTime() - 180 * 24 * 3600 * 1000);
        startDate = d.toISOString().split('T')[0];
      }

      const [metricsRes, trendsRes, breakdownsRes, productsRes, ordersRes] = await Promise.all([
        dashboardApi.getMetrics(startDate),
        dashboardApi.getTrends(6),
        dashboardApi.getBreakdowns(),
        dashboardApi.getTopProducts(),
        dashboardApi.getRecentOrders(6),
      ]);

      setMetrics(metricsRes);
      setTrends(trendsRes);
      setBreakdowns(breakdownsRes);
      setProductsData(productsRes);
      setRecentOrders(ordersRes);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch executive dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (error) {
    return (
      <div className="p-8 text-center bg-surface rounded-xl border border-status-error/30 shadow-card">
        <AlertTriangle className="w-10 h-10 text-status-error mx-auto mb-3" />
        <h3 className="text-base font-semibold text-text-primary">Dashboard Connection Error</h3>
        <p className="text-xs text-text-secondary mt-1 mb-4">{error}</p>
        <Button variant="primary" size="sm" onClick={fetchData} icon={<RotateCw className="w-4 h-4" />}>
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Executive Performance Overview</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time multi-dimensional operational metrics & profitability calculations
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-border shadow-subtle">
          {(['30d', '90d', '180d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-primary text-white shadow-subtle'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle'
              }`}
            >
              {p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : p === '180d' ? '6 Months' : 'All Time'}
            </button>
          ))}
          <button
            onClick={fetchData}
            className="p-1.5 text-text-muted hover:text-text-primary rounded-md transition-colors"
            title="Refresh metrics"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading || !metrics ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Net Sales Revenue"
              value={formatCurrency(metrics.totalRevenue)}
              change={12.4}
              changePeriod="vs last period"
              icon={<DollarSign className="w-5 h-5" />}
            />
            <StatCard
              title="Gross Profit"
              value={formatCurrency(metrics.grossProfit)}
              change={8.7}
              changePeriod="vs target"
              icon={<TrendingUp className="w-5 h-5 text-secondary" />}
            />
            <StatCard
              title="Gross Margin"
              value={`${metrics.grossMarginPercentage}%`}
              subtitle={`Total Cost: ${formatCurrency(metrics.totalCost)}`}
              icon={<Percent className="w-5 h-5 text-indigo-500" />}
            />
            <StatCard
              title="Average Order Value"
              value={formatCurrency(metrics.averageOrderValue)}
              subtitle={`${metrics.totalOrders} completed orders`}
              icon={<ShoppingCart className="w-5 h-5 text-amber-500" />}
            />
            <StatCard
              title="Fulfilment Rate"
              value={`${metrics.fulfilmentRate}%`}
              subtitle="Orders delivered on SLA"
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            />
            <StatCard
              title="Inventory Valuation"
              value={formatCurrency(metrics.inventoryValuation)}
              subtitle="Active warehouse stock"
              icon={<Boxes className="w-5 h-5 text-blue-500" />}
            />
            <StatCard
              title="Low-Stock SKUs"
              value={metrics.lowStockProductCount}
              subtitle="Items below threshold"
              icon={<AlertTriangle className="w-5 h-5 text-status-warning" />}
            />
            <StatCard
              title="Supplier SLA Delivery"
              value={`${metrics.supplierDeliveryPerformance}%`}
              subtitle={`${metrics.pendingPurchaseOrdersCount} active POs pending`}
              icon={<Truck className="w-5 h-5 text-purple-500" />}
            />
          </>
        )}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Profit Trends */}
        <Card
          className="lg:col-span-2"
          title="Revenue & Gross Profit Trajectory"
          subtitle="Monthly net sales revenue versus gross profit across trailing 6 months"
        >
          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5B5FEF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#5B5FEF" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A6A1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#16A6A1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7EAF0" vertical={false} />
                  <XAxis dataKey="period" stroke="#697386" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#697386"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E7EAF0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Net Revenue"
                    stroke="#5B5FEF"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Gross Profit"
                    stroke="#16A6A1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Category Breakdown */}
        <Card
          title="Revenue by Category"
          subtitle="Top performing operational divisions"
        >
          {isLoading || !breakdowns ? (
            <div className="h-72 flex items-center justify-center">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdowns.byCategory} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E7EAF0" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="category" stroke="#697386" fontSize={11} width={90} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E7EAF0',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#5B5FEF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Regional Performance & Top Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Performance */}
        <Card title="Regional Distribution" subtitle="Sales volume and gross profit by geographic territory">
          {isLoading || !breakdowns ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-secondary uppercase">
                    <th className="py-2.5 px-3">Region</th>
                    <th className="py-2.5 px-3">Revenue</th>
                    <th className="py-2.5 px-3">Gross Profit</th>
                    <th className="py-2.5 px-3">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {breakdowns.byRegion.map((r: any) => (
                    <tr key={r.region} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-text-primary">{r.region}</td>
                      <td className="py-2.5 px-3 font-medium text-text-primary">{formatCurrency(r.revenue)}</td>
                      <td className="py-2.5 px-3 font-medium text-secondary">{formatCurrency(r.profit)}</td>
                      <td className="py-2.5 px-3 text-text-secondary">{r.orders} orders</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Top Products */}
        <Card
          title="Top Performing Products"
          subtitle="Highest revenue-generating retail catalog items"
          action={
            <Link to="/products" className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
              View Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {isLoading || !productsData ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="space-y-3">
              {productsData.topProducts.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-subtle/50">
                  <div>
                    <div className="text-xs font-semibold text-text-primary">{p.name}</div>
                    <div className="text-[10px] text-text-muted">
                      SKU: {p.sku} • {p.unitsSold} units sold
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-text-primary">{formatCurrency(p.revenue)}</div>
                    <div className="text-[10px] font-medium text-secondary">+{formatCurrency(p.profit)} profit</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card
        title="Recent Customer Sales Orders"
        subtitle="Latest order intake with live fulfilment tracking"
        action={
          <Link to="/sales" className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
            All Sales Records <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-text-secondary uppercase">
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((ord: any) => (
                  <tr key={ord._id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-primary">{ord.orderNumber}</td>
                    <td className="py-2.5 px-3 text-text-primary">{ord.customerName}</td>
                    <td className="py-2.5 px-3 text-text-secondary">
                      {new Date(ord.orderDate).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 text-text-secondary">{ord.region}</td>
                    <td className="py-2.5 px-3 font-semibold text-text-primary">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
