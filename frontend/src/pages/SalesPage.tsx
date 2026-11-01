import React, { useState, useEffect } from 'react';
import { ordersApi } from '../api/orders';
import { CustomerOrder } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import { Download, Search, Filter, RotateCw, Eye } from 'lucide-react';

export const SalesPage: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const toast = useToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await ordersApi.getOrders({
        search,
        region,
        status,
        startDate,
        endDate,
      });
      setOrders(data);
    } catch (err: any) {
      toast.error('Failed to load sales data', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [region, status, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const blob = await ordersApi.exportSalesCsv({
        region,
        status,
        startDate,
        endDate,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bizflow360_sales_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Sales Export Downloaded', 'CSV report successfully generated.');
    } catch (err: any) {
      toast.error('Export Error', err.message || 'Failed to export sales records');
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  const totalFilteredRevenue = orders.reduce((acc, o) => acc + (o.status !== 'CANCELLED' ? o.totalAmount : 0), 0);
  const totalFilteredProfit = orders.reduce((acc, o) => acc + (o.status !== 'CANCELLED' ? o.grossProfit : 0), 0);
  const avgMargin = totalFilteredRevenue > 0 ? ((totalFilteredProfit / totalFilteredRevenue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Top Banner & Summaries */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Sales & Profitability Analysis</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Transaction-level customer sales records with granular margin calculations
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          isLoading={isExporting}
          icon={<Download className="w-4 h-4 text-primary" />}
        >
          Export Filtered CSV
        </Button>
      </div>

      {/* Aggregate Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4 shadow-card">
          <div className="text-xs text-text-secondary font-semibold uppercase">Filtered Net Revenue</div>
          <div className="text-xl font-bold text-text-primary mt-1">{formatCurrency(totalFilteredRevenue)}</div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 shadow-card">
          <div className="text-xs text-text-secondary font-semibold uppercase">Filtered Gross Profit</div>
          <div className="text-xl font-bold text-secondary mt-1">{formatCurrency(totalFilteredProfit)}</div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 shadow-card">
          <div className="text-xs text-text-secondary font-semibold uppercase">Average Gross Margin</div>
          <div className="text-xl font-bold text-primary mt-1">{avgMargin}%</div>
        </div>
      </div>

      {/* Filter Controls */}
      <Card noPadding>
        <div className="p-4 border-b border-border bg-surface-subtle/30 flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by order #, customer name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </form>

          <div className="w-36">
            <Select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              options={[
                { value: '', label: 'All Regions' },
                { value: 'North', label: 'North' },
                { value: 'South', label: 'South' },
                { value: 'East', label: 'East' },
                { value: 'West', label: 'West' },
                { value: 'Central', label: 'Central' },
              ]}
            />
          </div>

          <div className="w-36">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'CONFIRMED', label: 'Confirmed' },
                { value: 'PROCESSING', label: 'Processing' },
                { value: 'SHIPPED', label: 'Shipped' },
                { value: 'DELIVERED', label: 'Delivered' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
            />
          </div>

          <Button variant="secondary" size="md" onClick={fetchOrders} icon={<RotateCw className="w-3.5 h-3.5" />}>
            Apply
          </Button>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-sm">
              No sales orders matched your active search criteria.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/60 text-text-secondary uppercase border-b border-border font-semibold">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                  <th className="py-3 px-4 text-right">Gross Profit</th>
                  <th className="py-3 px-4 text-right">Margin %</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((ord) => {
                  const marginPct =
                    ord.totalAmount > 0 ? ((ord.grossProfit / ord.totalAmount) * 100).toFixed(1) : '0';
                  return (
                    <tr key={ord._id} className="hover:bg-surface-subtle/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-primary">{ord.orderNumber}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-text-primary">{ord.customerName}</div>
                        <div className="text-[10px] text-text-muted">{ord.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {new Date(ord.orderDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-medium text-text-primary">{ord.region}</td>
                      <td className="py-3 px-4 text-right font-bold text-text-primary">
                        {formatCurrency(ord.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-secondary">
                        {formatCurrency(ord.grossProfit)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-text-primary">{marginPct}%</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            ord.status === 'DELIVERED'
                              ? 'success'
                              : ord.status === 'CANCELLED'
                              ? 'error'
                              : 'info'
                          }
                          size="sm"
                        >
                          {ord.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(ord)}
                          icon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl border border-border shadow-dropdown max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-text-primary">Order {selectedOrder.orderNumber}</h3>
                <p className="text-xs text-text-secondary">
                  Customer: {selectedOrder.customerName} • {selectedOrder.region} Region
                </p>
              </div>
              <Badge variant={selectedOrder.status === 'DELIVERED' ? 'success' : 'info'}>
                {selectedOrder.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-text-secondary uppercase">Purchased Line Items</h4>
              <div className="divide-y divide-border border rounded-lg overflow-hidden">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-surface-subtle/30">
                    <div>
                      <div className="font-semibold text-text-primary">{it.productName}</div>
                      <div className="text-[10px] text-text-muted">
                        SKU: {it.sku} • Qty: {it.quantity} × {formatCurrency(it.unitPrice)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-text-primary">{formatCurrency(it.totalPrice)}</div>
                      <div className="text-[10px] text-secondary">+{formatCurrency(it.grossProfit)} profit</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-subtle p-3 rounded-lg space-y-1.5 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Discount:</span>
                <span>-{formatCurrency(selectedOrder.discount)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Estimated Tax (8%):</span>
                <span>{formatCurrency(selectedOrder.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-text-primary text-sm pt-1 border-t border-border">
                <span>Total Amount:</span>
                <span>{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-secondary pt-0.5">
                <span>Total Gross Profit:</span>
                <span>{formatCurrency(selectedOrder.grossProfit)}</span>
              </div>
            </div>

            <div className="text-right pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
