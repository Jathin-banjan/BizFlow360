import React, { useState, useEffect } from 'react';
import { ordersApi } from '../api/orders';
import { productsApi } from '../api/products';
import { CustomerOrder, Product } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Plus, ShoppingCart, Truck, CheckCircle2, RotateCw } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Create Order Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [region, setRegion] = useState<'North' | 'South' | 'East' | 'West' | 'Central'>('East');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { hasRole } = useAuth();
  const toast = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, prodRes] = await Promise.all([
        ordersApi.getOrders({ status: statusFilter }),
        productsApi.getProducts({ status: 'ACTIVE' }),
      ]);
      setOrders(ordersRes);
      setProducts(prodRes);
    } catch (err: any) {
      toast.error('Failed to load orders', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleOpenCreate = () => {
    setCustomerName('');
    setCustomerEmail('');
    setRegion('North');
    setSelectedProductId(products[0]?._id || '');
    setOrderQuantity(1);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !selectedProductId) {
      toast.error('Validation Error', 'Please complete all customer and product fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await ordersApi.createOrder({
        customerName,
        customerEmail,
        region,
        items: [{ productId: selectedProductId, quantity: orderQuantity }],
      });
      toast.success('Order Placed', 'Customer order recorded and warehouse stock deducted.');
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Order Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvanceStatus = async (order: CustomerOrder) => {
    const transitions: Record<string, any> = {
      CONFIRMED: 'PROCESSING',
      PROCESSING: 'SHIPPED',
      SHIPPED: 'DELIVERED',
    };

    const nextStatus = transitions[order.status];
    if (!nextStatus) return;

    try {
      await ordersApi.updateStatus(order._id, nextStatus);
      toast.success('Status Updated', `Order ${order.orderNumber} moved to ${nextStatus}.`);
      loadData();
    } catch (err: any) {
      toast.error('Update Failed', err.message);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Customer Sales Orders & Fulfilment</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Order processing pipeline, real-time stock deduction, and shipping SLA delivery
          </p>
        </div>

        {hasRole('ADMIN', 'MANAGER') && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
            New Customer Order
          </Button>
        )}
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-border bg-surface-subtle/30 flex items-center justify-between">
          <div className="w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Fulfilment Stages' },
                { value: 'CONFIRMED', label: 'Confirmed' },
                { value: 'PROCESSING', label: 'Processing' },
                { value: 'SHIPPED', label: 'Shipped' },
                { value: 'DELIVERED', label: 'Delivered' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
            />
          </div>

          <Button variant="secondary" size="md" onClick={loadData} icon={<RotateCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-sm">
              No customer orders found matching filter criteria.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/60 text-text-secondary uppercase border-b border-border font-semibold">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4 text-right">Order Total</th>
                  <th className="py-3 px-4 text-center">Fulfilment Stage</th>
                  <th className="py-3 px-4 text-center">Pipeline Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((ord) => {
                  const stageVariant =
                    ord.status === 'DELIVERED'
                      ? 'success'
                      : ord.status === 'SHIPPED'
                      ? 'info'
                      : ord.status === 'PROCESSING'
                      ? 'warning'
                      : 'neutral';

                  return (
                    <tr key={ord._id} className="hover:bg-surface-subtle/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{ord.orderNumber}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-text-primary">{ord.customerName}</div>
                        <div className="text-[10px] text-text-muted">{ord.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-text-primary">{ord.region}</td>
                      <td className="py-3 px-4 text-text-secondary">
                        {new Date(ord.orderDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-text-primary">
                        {formatCurrency(ord.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={stageVariant} size="sm">
                          {ord.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED' && hasRole('ADMIN', 'MANAGER') ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdvanceStatus(ord)}
                            icon={
                              ord.status === 'SHIPPED' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                              ) : (
                                <Truck className="w-3.5 h-3.5 text-primary" />
                              )
                            }
                          >
                            Advance &rarr;{' '}
                            {ord.status === 'CONFIRMED'
                              ? 'Process'
                              : ord.status === 'PROCESSING'
                              ? 'Ship'
                              : 'Deliver'}
                          </Button>
                        ) : (
                          <span className="text-[10px] text-text-muted font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Create Order Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Customer Retail Order"
        description="Verify inventory availability before completing sale allocation"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Customer Name / Organization"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g. Apex Financial Corp"
            required
          />

          <Input
            label="Customer Contact Email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="purchasing@company.com"
            required
          />

          <Select
            label="Geographic Sales Region"
            value={region}
            onChange={(e: any) => setRegion(e.target.value)}
            options={[
              { value: 'North', label: 'North Region' },
              { value: 'South', label: 'South Region' },
              { value: 'East', label: 'East Region' },
              { value: 'West', label: 'West Region' },
              { value: 'Central', label: 'Central Region' },
            ]}
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Select
                label="Product"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                options={products.map((p) => ({
                  value: p._id,
                  label: `${p.name} ($${p.unitPrice}) [Avail: ${p.currentStock}]`,
                }))}
              />
            </div>
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(parseInt(e.target.value, 10) || 1)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Submit & Allocate Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
