import React, { useState, useEffect } from 'react';
import { suppliersApi } from '../api/suppliers';
import { Supplier } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Plus, Search, Edit2, Truck, Mail, Phone, MapPin, CheckCircle, RotateCw } from 'lucide-react';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'United States',
    leadTimeDays: 7,
    rating: 4.5,
  });

  const { hasRole } = useAuth();
  const toast = useToast();

  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await suppliersApi.getSuppliers({ search, status });
      setSuppliers(data);
    } catch (err: any) {
      toast.error('Failed to load suppliers', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [status]);

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData({
      code: '',
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'United States',
      leadTimeDays: 7,
      rating: 4.5,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      code: s.code,
      name: s.name,
      contactPerson: s.contactPerson,
      email: s.email,
      phone: s.phone,
      address: s.address || '',
      city: s.city || '',
      country: s.country || 'United States',
      leadTimeDays: s.leadTimeDays,
      rating: s.rating,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await suppliersApi.updateSupplier(editingSupplier._id, formData);
        toast.success('Supplier Updated', `${formData.name} updated.`);
      } else {
        await suppliersApi.createSupplier(formData);
        toast.success('Supplier Created', `${formData.name} registered.`);
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (err: any) {
      toast.error('Save Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Supplier Directory & SLA Compliance</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Vendor lead times, contractual SLA tracking, and delivery reliability metrics
          </p>
        </div>

        {hasRole('ADMIN', 'MANAGER') && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
            Register Supplier
          </Button>
        )}
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-border bg-surface-subtle/30 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by code, supplier name, contact person..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadSuppliers()}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="w-40">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
          </div>

          <Button variant="secondary" size="md" onClick={loadSuppliers} icon={<RotateCw className="w-3.5 h-3.5" />}>
            Filter
          </Button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-4" />
                <Skeleton className="h-4 w-full" />
              </Card>
            ))
          ) : (
            suppliers.map((s) => {
              const slaColor =
                s.onTimeDeliveryRate >= 90
                  ? 'text-status-success'
                  : s.onTimeDeliveryRate >= 80
                  ? 'text-status-warning'
                  : 'text-status-error';

              return (
                <div
                  key={s._id}
                  className="bg-surface rounded-xl border border-border p-5 shadow-card hover:shadow-dropdown transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary-subtle">
                            {s.code}
                          </span>
                          <h3 className="font-bold text-text-primary text-sm">{s.name}</h3>
                        </div>
                        <p className="text-xs text-text-secondary mt-1">
                          Contact: <span className="text-text-primary font-medium">{s.contactPerson}</span>
                        </p>
                      </div>
                      <Badge variant={s.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                        {s.status}
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs pt-3 border-t border-border">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Mail className="w-3.5 h-3.5 text-text-muted" />
                        <span className="truncate">{s.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Phone className="w-3.5 h-3.5 text-text-muted" />
                        <span>{s.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Truck className="w-3.5 h-3.5 text-text-muted" />
                        <span>Lead Time: {s.leadTimeDays} days</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary">
                        <MapPin className="w-3.5 h-3.5 text-text-muted" />
                        <span className="truncate">{s.city ? `${s.city}, ${s.country}` : s.country}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-text-muted uppercase font-semibold">
                        Historical On-Time Delivery SLA
                      </div>
                      <div className={`text-base font-bold ${slaColor}`}>
                        {s.onTimeDeliveryRate}% on-time
                      </div>
                    </div>

                    {hasRole('ADMIN', 'MANAGER') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(s)}
                        icon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier Record' : 'Register New Vendor'}
        description="Vendor details, SLA lead times, and dispatch headquarters"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Supplier Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. SUPP-APEX"
              disabled={!!editingSupplier}
              required
            />
            <Input
              label="Company Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Legal business entity name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Person"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="Account representative"
              required
            />
            <Input
              label="Work Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="orders@supplier.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              required
            />
            <Input
              label="Contractual Lead Time (Days)"
              type="number"
              min="1"
              value={formData.leadTimeDays}
              onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value, 10) || 7 })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. San Jose, CA"
            />
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingSupplier ? 'Save Updates' : 'Register Vendor'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
