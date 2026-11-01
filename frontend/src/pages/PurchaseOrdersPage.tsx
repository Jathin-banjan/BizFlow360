import React, { useState, useEffect } from 'react';
import { purchaseOrdersApi } from '../api/purchaseOrders';
import { productsApi } from '../api/products';
import { suppliersApi } from '../api/suppliers';
import { PurchaseOrder, Product, Supplier } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Plus, Check, Send, PackageCheck, Eye, Trash2, RotateCw } from 'lucide-react';

export const PurchaseOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Create PO Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSupplierId, setNewSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [poNotes, setPoNotes] = useState('');
  const [lineItems, setLineItems] = useState<Array<{ productId: string; orderedQuantity: number; unitCost: number }>>([]);

  // Receive Stock Modal
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [activePO, setActivePO] = useState<PurchaseOrder | null>(null);
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({});
  const [isReceiving, setIsReceiving] = useState(false);

  // View Details Modal
  const [viewPO, setViewPO] = useState<PurchaseOrder | null>(null);

  const { hasRole } = useAuth();
  const toast = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [poRes, suppRes, prodRes] = await Promise.all([
        purchaseOrdersApi.getOrders({ status: statusFilter }),
        suppliersApi.getSuppliers({ status: 'ACTIVE' }),
        productsApi.getProducts({ status: 'ACTIVE' }),
      ]);
      setOrders(poRes);
      setSuppliers(suppRes);
      setProducts(prodRes);
    } catch (err: any) {
      toast.error('Failed to load purchase orders', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleOpenCreate = () => {
    setNewSupplierId(suppliers[0]?._id || '');
    const inSevenDays = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0];
    setExpectedDate(inSevenDays);
    setPoNotes('');
    if (products.length > 0) {
      setLineItems([{ productId: products[0]._id, orderedQuantity: 20, unitCost: products[0].unitCost }]);
    }
    setIsCreateOpen(true);
  };

  const handleAddLineItem = () => {
    if (products.length > 0) {
      setLineItems([
        ...lineItems,
        { productId: products[0]._id, orderedQuantity: 10, unitCost: products[0].unitCost },
      ]);
    }
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleItemProductChange = (index: number, pId: string) => {
    const prod = products.find((p) => p._id === pId);
    const updated = [...lineItems];
    updated[index].productId = pId;
    if (prod) {
      updated[index].unitCost = prod.unitCost;
    }
    setLineItems(updated);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      toast.error('Validation Error', 'Purchase order must have at least one line item.');
      return;
    }

    try {
      await purchaseOrdersApi.createOrder({
        supplierId: newSupplierId,
        expectedDeliveryDate: expectedDate,
        notes: poNotes,
        items: lineItems,
      });
      toast.success('PO Created', 'Purchase order created in DRAFT status.');
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Creation Failed', err.message);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'SUBMITTED' | 'APPROVED' | 'CANCELLED') => {
    try {
      await purchaseOrdersApi.updateStatus(id, newStatus);
      toast.success('Status Updated', `Purchase order is now ${newStatus}.`);
      loadData();
    } catch (err: any) {
      toast.error('Action Failed', err.message);
    }
  };

  const handleOpenReceive = (po: PurchaseOrder) => {
    setActivePO(po);
    const initialQtys: Record<string, number> = {};
    po.items.forEach((item) => {
      const remaining = Math.max(0, item.orderedQuantity - item.receivedQuantity);
      initialQtys[item.productId] = remaining;
    });
    setReceiveQuantities(initialQtys);
    setIsReceiveOpen(true);
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePO) return;

    const receiptPayload = Object.entries(receiveQuantities)
      .map(([productId, receivedQuantity]) => ({
        productId,
        receivedQuantity,
      }))
      .filter((item) => item.receivedQuantity > 0);

    if (receiptPayload.length === 0) {
      toast.error('Validation Error', 'Please specify received quantities greater than zero.');
      return;
    }

    setIsReceiving(true);
    try {
      await purchaseOrdersApi.receiveStock(activePO._id, receiptPayload);
      toast.success('Stock Received', 'Warehouse inventory updated and movement audit logged.');
      setIsReceiveOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Receipt Failed', err.message);
    } finally {
      setIsReceiving(false);
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
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Purchase Order Management</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Procurement lifecycle: Draft &rarr; Submitted &rarr; Dual Approval &rarr; Transactional Stock Intake
          </p>
        </div>

        {hasRole('ADMIN', 'MANAGER') && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
            Create Purchase Order
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
                { value: '', label: 'All Lifecycle Statuses' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'SUBMITTED', label: 'Submitted' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
                { value: 'RECEIVED', label: 'Fully Received' },
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
              No purchase orders found matching selected filters.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/60 text-text-secondary uppercase border-b border-border font-semibold">
                <tr>
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Expected Delivery</th>
                  <th className="py-3 px-4 text-right">Total Cost</th>
                  <th className="py-3 px-4 text-center">Lifecycle Status</th>
                  <th className="py-3 px-4 text-center">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((po) => {
                  const statusVariant =
                    po.status === 'RECEIVED'
                      ? 'success'
                      : po.status === 'APPROVED'
                      ? 'info'
                      : po.status === 'PARTIALLY_RECEIVED'
                      ? 'warning'
                      : po.status === 'CANCELLED'
                      ? 'error'
                      : 'neutral';

                  return (
                    <tr key={po._id} className="hover:bg-surface-subtle/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{po.poNumber}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-text-primary">{po.supplierId?.name || 'Supplier'}</div>
                        <div className="text-[10px] text-text-muted">{po.supplierId?.code}</div>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {new Date(po.orderDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-medium text-text-primary">
                        {new Date(po.expectedDeliveryDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-text-primary">
                        {formatCurrency(po.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={statusVariant} size="sm">
                          {po.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewPO(po)}
                            icon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Details
                          </Button>

                          {/* Submit Draft */}
                          {po.status === 'DRAFT' && hasRole('ADMIN', 'MANAGER') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(po._id, 'SUBMITTED')}
                              icon={<Send className="w-3.5 h-3.5" />}
                            >
                              Submit
                            </Button>
                          )}

                          {/* Approve Submitted */}
                          {po.status === 'SUBMITTED' && hasRole('ADMIN', 'MANAGER') && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleUpdateStatus(po._id, 'APPROVED')}
                              icon={<Check className="w-3.5 h-3.5" />}
                            >
                              Approve
                            </Button>
                          )}

                          {/* Receive Stock */}
                          {(po.status === 'APPROVED' || po.status === 'PARTIALLY_RECEIVED') &&
                            hasRole('ADMIN', 'MANAGER') && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenReceive(po)}
                                icon={<PackageCheck className="w-3.5 h-3.5" />}
                              >
                                Receive
                              </Button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Create Purchase Order Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Purchase Order"
        description="Select approved supplier and add catalog line items with procurement quantities"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Select Supplier"
              value={newSupplierId}
              onChange={(e) => setNewSupplierId(e.target.value)}
              options={suppliers.map((s) => ({ value: s._id, label: `${s.code} - ${s.name}` }))}
              required
            />
            <Input
              label="Expected Delivery Date"
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-primary uppercase">Order Line Items</label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLineItem} icon={<Plus className="w-3 h-3" />}>
                Add Item
              </Button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {lineItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-subtle/50 border border-border">
                  <div className="flex-1">
                    <Select
                      value={item.productId}
                      onChange={(e) => handleItemProductChange(idx, e.target.value)}
                      options={products.map((p) => ({
                        value: p._id,
                        label: `${p.sku} - ${p.name} ($${p.unitCost})`,
                      }))}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.orderedQuantity}
                      onChange={(e) => {
                        const updated = [...lineItems];
                        updated[idx].orderedQuantity = parseInt(e.target.value, 10) || 1;
                        setLineItems(updated);
                      }}
                    />
                  </div>
                  <div className="w-28">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Cost ($)"
                      value={item.unitCost}
                      onChange={(e) => {
                        const updated = [...lineItems];
                        updated[idx].unitCost = parseFloat(e.target.value) || 0;
                        setLineItems(updated);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLineItem(idx)}
                    className="p-1.5 text-text-muted hover:text-status-error transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Input
            label="Internal Procurement Notes"
            value={poNotes}
            onChange={(e) => setPoNotes(e.target.value)}
            placeholder="e.g. Expedited shipping approved for holiday inventory build"
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Draft PO
            </Button>
          </div>
        </form>
      </Modal>

      {/* Receive Stock Modal */}
      {activePO && (
        <Modal
          isOpen={isReceiveOpen}
          onClose={() => setIsReceiveOpen(false)}
          title={`Receive Stock for ${activePO.poNumber}`}
          description="Enter received quantities from shipping manifest to update warehouse inventory"
        >
          <form onSubmit={handleReceiveSubmit} className="space-y-4">
            <div className="space-y-3">
              {activePO.items.map((item) => {
                const remaining = Math.max(0, item.orderedQuantity - item.receivedQuantity);
                return (
                  <div key={item.productId} className="p-3 bg-surface-subtle/50 rounded-lg border border-border">
                    <div className="flex justify-between text-xs font-semibold text-text-primary">
                      <span>{item.productName}</span>
                      <span className="text-text-muted">
                        Ordered: {item.orderedQuantity} | Received: {item.receivedQuantity}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-xs text-secondary font-medium">Pending: {remaining} units</span>
                      <div className="w-32">
                        <Input
                          type="number"
                          min="0"
                          max={remaining}
                          value={receiveQuantities[item.productId] ?? 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            setReceiveQuantities({
                              ...receiveQuantities,
                              [item.productId]: Math.min(remaining, Math.max(0, val)),
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant="secondary" onClick={() => setIsReceiveOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isReceiving}>
                Confirm & Update Inventory
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* PO View Details Modal */}
      {viewPO && (
        <Modal
          isOpen={!!viewPO}
          onClose={() => setViewPO(null)}
          title={`Purchase Order: ${viewPO.poNumber}`}
          description={`Supplier: ${viewPO.supplierId?.name || 'Supplier'} • Status: ${viewPO.status}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 bg-surface-subtle/40 rounded-lg border border-border">
              <div>
                <span className="text-text-muted">Order Date:</span>{' '}
                <span className="font-semibold text-text-primary">{new Date(viewPO.orderDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-text-muted">Expected Delivery:</span>{' '}
                <span className="font-semibold text-text-primary">{new Date(viewPO.expectedDeliveryDate).toLocaleDateString()}</span>
              </div>
              {viewPO.actualDeliveryDate && (
                <div>
                  <span className="text-text-muted">Actual Delivered:</span>{' '}
                  <span className="font-semibold text-status-success">{new Date(viewPO.actualDeliveryDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-text-secondary uppercase">Line Items</h4>
              <div className="divide-y divide-border border rounded-lg overflow-hidden">
                {viewPO.items.map((it, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between bg-surface-subtle/20">
                    <div>
                      <div className="font-semibold text-text-primary">{it.productName}</div>
                      <div className="text-[10px] text-text-muted">
                        Ordered: {it.orderedQuantity} • Received: {it.receivedQuantity}
                      </div>
                    </div>
                    <div className="text-right font-bold text-text-primary">
                      {formatCurrency(it.totalCost)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between font-bold text-sm pt-2 border-t border-border">
              <span>Total PO Cost:</span>
              <span className="text-primary">{formatCurrency(viewPO.totalAmount)}</span>
            </div>

            <div className="text-right pt-2">
              <Button variant="secondary" size="sm" onClick={() => setViewPO(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
