import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../api/inventory';
import { productsApi } from '../api/products';
import { InventoryMovement, Product } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Boxes, Sliders, Download, History, RotateCw, AlertTriangle } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [movementType, setMovementType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Adjustment Modal
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjProductId, setAdjProductId] = useState('');
  const [adjQuantity, setAdjQuantity] = useState<number>(0);
  const [adjReason, setAdjReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { hasRole } = useAuth();
  const toast = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, movRes, prodRes] = await Promise.all([
        inventoryApi.getSummary(),
        inventoryApi.getMovements({
          productId: selectedProduct,
          movementType,
        }),
        productsApi.getProducts(),
      ]);
      setSummary(sumRes);
      setMovements(movRes);
      setProducts(prodRes);
    } catch (err: any) {
      toast.error('Failed to load inventory', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProduct, movementType]);

  const handleOpenAdjust = () => {
    setAdjProductId(products[0]?._id || '');
    setAdjQuantity(0);
    setAdjReason('');
    setIsAdjustOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adjQuantity === 0) {
      toast.error('Validation Error', 'Adjustment quantity cannot be zero.');
      return;
    }
    if (!adjReason.trim()) {
      toast.error('Validation Error', 'A documented reason is required for inventory audit.');
      return;
    }

    setIsSubmitting(true);
    try {
      await inventoryApi.adjustStock({
        productId: adjProductId,
        adjustmentQuantity: adjQuantity,
        reason: adjReason,
      });
      toast.success('Stock Adjusted', 'Inventory balance updated and movement audit recorded.');
      setIsAdjustOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Adjustment Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const blob = await inventoryApi.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bizflow360_inventory_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Inventory Export Downloaded', 'Inventory CSV report downloaded.');
    } catch (err: any) {
      toast.error('Export Error', err.message);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Inventory Balances & Stock Movements</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Physical stock valuation, safety thresholds, and auditable movement tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            isLoading={isExporting}
            icon={<Download className="w-4 h-4 text-primary" />}
          >
            Export CSV
          </Button>

          {hasRole('ADMIN', 'MANAGER') && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdjust}
              icon={<Sliders className="w-4 h-4" />}
            >
              Manual Adjustment
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4 shadow-card">
          <div className="text-xs text-text-secondary font-semibold uppercase">Total Inventory Valuation</div>
          <div className="text-2xl font-bold text-text-primary mt-1">
            {summary ? formatCurrency(summary.totalValuation) : <Skeleton className="h-7 w-28" />}
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 shadow-card">
          <div className="text-xs text-text-secondary font-semibold uppercase">Total Physical Units</div>
          <div className="text-2xl font-bold text-text-primary mt-1">
            {summary ? `${summary.totalItems} units` : <Skeleton className="h-7 w-20" />}
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 shadow-card">
          <div className="text-xs text-status-warning font-semibold uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low-Stock Warning SKUs</span>
          </div>
          <div className="text-2xl font-bold text-status-warning mt-1">
            {summary ? summary.lowStockCount : <Skeleton className="h-7 w-12" />}
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 shadow-card">
          <div className="text-xs text-status-error font-semibold uppercase">Depleted (0 Units)</div>
          <div className="text-2xl font-bold text-status-error mt-1">
            {summary ? summary.outOfStockCount : <Skeleton className="h-7 w-12" />}
          </div>
        </div>
      </div>

      {/* Movement History Table */}
      <Card
        title="Stock Movement Audit Trail"
        subtitle="Chronological transaction record of receipts, customer deductions, and adjustments"
        noPadding
      >
        <div className="p-4 border-b border-border bg-surface-subtle/30 flex flex-wrap items-center gap-3">
          <div className="w-56">
            <Select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              options={[
                { value: '', label: 'All Products' },
                ...products.map((p) => ({ value: p._id, label: `${p.sku} - ${p.name}` })),
              ]}
            />
          </div>

          <div className="w-44">
            <Select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
              options={[
                { value: '', label: 'All Movement Types' },
                { value: 'RECEIPT', label: 'Receipt (Inflow)' },
                { value: 'SALE', label: 'Sale (Deduction)' },
                { value: 'ADJUSTMENT', label: 'Adjustment' },
                { value: 'RETURN', label: 'Return' },
              ]}
            />
          </div>

          <Button variant="secondary" size="md" onClick={loadData} icon={<RotateCw className="w-3.5 h-3.5" />}>
            Filter Logs
          </Button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : movements.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-sm">
              No stock movements recorded for selected criteria.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/60 text-text-secondary uppercase border-b border-border font-semibold">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Product SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4 text-center">Delta Qty</th>
                  <th className="py-3 px-4 text-center">Prev &rarr; New Stock</th>
                  <th className="py-3 px-4">Reason / Reference</th>
                  <th className="py-3 px-4">Responsible User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {movements.map((m) => {
                  const isPositive = m.movementType === 'RECEIPT' || (m.movementType === 'ADJUSTMENT' && m.newStock > m.previousStock);
                  const badgeVariant =
                    m.movementType === 'RECEIPT'
                      ? 'success'
                      : m.movementType === 'SALE'
                      ? 'info'
                      : m.movementType === 'ADJUSTMENT'
                      ? 'warning'
                      : 'neutral';

                  return (
                    <tr key={m._id} className="hover:bg-surface-subtle/40 transition-colors">
                      <td className="py-3 px-4 text-text-secondary">
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-primary">
                        {m.productId?.sku || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-text-primary">
                        {m.productId?.name || 'Catalog Item'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={badgeVariant} size="sm">
                          {m.movementType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className={isPositive ? 'text-status-success' : 'text-status-error'}>
                          {isPositive ? `+${m.quantity}` : `-${m.quantity}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-text-secondary font-medium">
                        {m.previousStock} &rarr; <span className="text-text-primary font-bold">{m.newStock}</span>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        <div>{m.reason || 'Routine movement'}</div>
                        {m.referenceId && (
                          <div className="text-[10px] text-text-muted font-mono">{m.referenceId}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-text-primary">
                        {m.performedByName || 'System / Auto'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Manual Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        title="Execute Manual Inventory Adjustment"
        description="Every quantity adjustment creates an immutable audit trail entry"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <Select
            label="Select Product to Adjust"
            value={adjProductId}
            onChange={(e) => setAdjProductId(e.target.value)}
            options={products.map((p) => ({
              value: p._id,
              label: `${p.sku} — ${p.name} (Current Stock: ${p.currentStock})`,
            }))}
            required
          />

          <Input
            label="Adjustment Quantity (Use + to add stock, - to deduct)"
            type="number"
            value={adjQuantity}
            onChange={(e) => setAdjQuantity(parseInt(e.target.value, 10) || 0)}
            helperText="Positive value adds to warehouse; negative value removes units (e.g. shrinkage/damage)."
            required
          />

          <Input
            label="Reason / Audit Note"
            value={adjReason}
            onChange={(e) => setAdjReason(e.target.value)}
            placeholder="e.g. Physical cycle count discrepancy reconciliation"
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsAdjustOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Apply & Log Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
