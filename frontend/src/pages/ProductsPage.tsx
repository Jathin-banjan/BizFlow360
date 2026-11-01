import React, { useState, useEffect } from 'react';
import { productsApi } from '../api/products';
import { Product, Category } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Plus, Search, Edit2, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    categoryId: '',
    description: '',
    unitCost: 0,
    unitPrice: 0,
    currentStock: 0,
    reorderThreshold: 10,
    leadTimeDays: 7,
  });

  const { hasRole } = useAuth();
  const toast = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        productsApi.getCategories(),
        productsApi.getProducts({
          search,
          categoryId: selectedCategory,
          lowStock: lowStockOnly ? true : undefined,
        }),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err: any) {
      toast.error('Failed to load products', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, lowStockOnly]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      sku: '',
      name: '',
      categoryId: categories[0]?._id || '',
      description: '',
      unitCost: 50,
      unitPrice: 99,
      currentStock: 25,
      reorderThreshold: 10,
      leadTimeDays: 7,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      categoryId: typeof p.categoryId === 'object' ? p.categoryId._id : p.categoryId,
      description: p.description || '',
      unitCost: p.unitCost,
      unitPrice: p.unitPrice,
      currentStock: p.currentStock,
      reorderThreshold: p.reorderThreshold,
      leadTimeDays: p.leadTimeDays,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productsApi.updateProduct(editingProduct._id, formData);
        toast.success('Product Updated', `${formData.name} updated successfully.`);
      } else {
        await productsApi.createProduct(formData);
        toast.success('Product Created', `${formData.name} added to catalog.`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Save Failed', err.message || 'Validation error while saving product.');
    }
  };

  const handleToggleStatus = async (p: Product) => {
    const nextStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await productsApi.setStatus(p._id, nextStatus);
      toast.info('Status Changed', `${p.name} is now ${nextStatus}.`);
      loadData();
    } catch (err: any) {
      toast.error('Error', err.message);
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Product Catalog & Master SKUs</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure retail products, standard unit costs, sales pricing, and safety stock levels
          </p>
        </div>

        {hasRole('ADMIN', 'MANAGER') && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
            New Product SKU
          </Button>
        )}
      </div>

      {/* Filter Row */}
      <Card noPadding>
        <div className="p-4 border-b border-border bg-surface-subtle/30 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by SKU, product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadData()}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="w-48">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map((c) => ({ value: c._id, label: c.name })),
              ]}
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer select-none bg-surface px-3 py-2 rounded-lg border border-border">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <span>Low Stock Warnings Only</span>
          </label>

          <Button variant="secondary" size="md" onClick={loadData} icon={<RotateCw className="w-3.5 h-3.5" />}>
            Search
          </Button>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/60 text-text-secondary uppercase border-b border-border font-semibold">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Unit Cost</th>
                  <th className="py-3 px-4 text-right">Retail Price</th>
                  <th className="py-3 px-4 text-right">Unit Margin</th>
                  <th className="py-3 px-4 text-center">Stock / Threshold</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => {
                  const isLow = p.currentStock <= p.reorderThreshold;
                  const unitMargin = p.unitPrice > 0 ? (((p.unitPrice - p.unitCost) / p.unitPrice) * 100).toFixed(0) : '0';
                  const catName = typeof p.categoryId === 'object' ? p.categoryId.name : 'General';

                  return (
                    <tr key={p._id} className="hover:bg-surface-subtle/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-primary">{p.sku}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-text-primary">{p.name}</div>
                        {p.description && <div className="text-[10px] text-text-muted truncate max-w-xs">{p.description}</div>}
                      </td>
                      <td className="py-3 px-4 font-medium text-text-secondary">{catName}</td>
                      <td className="py-3 px-4 text-right text-text-secondary">{formatCurrency(p.unitCost)}</td>
                      <td className="py-3 px-4 text-right font-bold text-text-primary">{formatCurrency(p.unitPrice)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-secondary">+{unitMargin}%</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded ${
                            isLow
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isLow && <AlertCircle className="w-3 h-3 text-amber-600" />}
                          {p.currentStock} / {p.reorderThreshold}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={p.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {hasRole('ADMIN', 'MANAGER') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(p)}
                              icon={<Edit2 className="w-3.5 h-3.5" />}
                            >
                              Edit
                            </Button>
                          )}
                          {hasRole('ADMIN') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={p.status === 'ACTIVE' ? 'text-status-warning' : 'text-status-success'}
                              onClick={() => handleToggleStatus(p)}
                            >
                              {p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product SKU' : 'Create New Product SKU'}
        description="Configure pricing, initial stock balance, and reorder levels"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU Code"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              placeholder="e.g. COMP-X1-PRO"
              disabled={!!editingProduct}
              required
            />
            <Select
              label="Category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={categories.map((c) => ({ value: c._id, label: c.name }))}
            />
          </div>

          <Input
            label="Product Title"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Commercial product name"
            required
          />

          <Input
            label="Description / Specs"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Technical specifications or packaging notes"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Unit Cost ($)"
              type="number"
              step="0.01"
              min="0"
              value={formData.unitCost}
              onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Retail Unit Price ($)"
              type="number"
              step="0.01"
              min="0"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {!editingProduct && (
              <Input
                label="Initial Stock"
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value, 10) || 0 })}
                required
              />
            )}
            <Input
              label="Reorder Threshold"
              type="number"
              min="0"
              value={formData.reorderThreshold}
              onChange={(e) => setFormData({ ...formData, reorderThreshold: parseInt(e.target.value, 10) || 0 })}
              required
            />
            <Input
              label="Lead Time (Days)"
              type="number"
              min="1"
              value={formData.leadTimeDays}
              onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value, 10) || 1 })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingProduct ? 'Save Updates' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
