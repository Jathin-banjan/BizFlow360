import React, { useState, useEffect } from 'react';
import { requirementsApi } from '../api/requirements';
import { Requirement } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Search,
  Edit2,
  CheckSquare,
  Square,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Layers,
  RotateCw,
} from 'lucide-react';

export const RequirementsPage: React.FC = () => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<Requirement | null>(null);
  const [formData, setFormData] = useState({
    requirementId: '',
    title: '',
    description: '',
    businessObjective: '',
    stakeholder: '',
    priority: 'MEDIUM' as any,
    type: 'FUNCTIONAL' as any,
    status: 'DRAFT' as any,
    relatedModule: 'Inventory',
    criteriaText: '',
  });

  const { hasRole } = useAuth();
  const toast = useToast();

  const loadRequirements = async () => {
    setIsLoading(true);
    try {
      const data = await requirementsApi.getRequirements({
        search,
        type: typeFilter,
        status: statusFilter,
        priority: priorityFilter,
        module: moduleFilter,
      });
      setRequirements(data);
    } catch (err: any) {
      toast.error('Failed to load requirements', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, [typeFilter, statusFilter, priorityFilter, moduleFilter]);

  const handleOpenCreate = () => {
    setEditingReq(null);
    setFormData({
      requirementId: `REQ-00${requirements.length + 1}`,
      title: '',
      description: '',
      businessObjective: '',
      stakeholder: 'Business Operations Director',
      priority: 'HIGH',
      type: 'FUNCTIONAL',
      status: 'APPROVED',
      relatedModule: 'Inventory',
      criteriaText: 'AC-1: System validates threshold boundary.\nAC-2: Audit log records responsible user.',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (req: Requirement) => {
    setEditingReq(req);
    const criteriaString = req.acceptanceCriteria
      .map((c) => `${c.id}: ${c.text}`)
      .join('\n');

    setFormData({
      requirementId: req.requirementId,
      title: req.title,
      description: req.description,
      businessObjective: req.businessObjective,
      stakeholder: req.stakeholder,
      priority: req.priority,
      type: req.type,
      status: req.status,
      relatedModule: req.relatedModule,
      criteriaText: criteriaString,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Parse multiline criteria text
    const parsedCriteria = formData.criteriaText
      .split('\n')
      .map((line, idx) => {
        const parts = line.split(':');
        const id = parts.length > 1 ? parts[0].trim() : `AC-${idx + 1}`;
        const text = parts.length > 1 ? parts.slice(1).join(':').trim() : line.trim();
        return { id, text, isMet: true };
      })
      .filter((c) => c.text.length > 0);

    const payload = {
      ...formData,
      acceptanceCriteria: parsedCriteria,
    };

    try {
      if (editingReq) {
        await requirementsApi.updateRequirement(editingReq._id, payload);
        toast.success('Requirement Updated', `${formData.requirementId} successfully updated.`);
      } else {
        await requirementsApi.createRequirement(payload);
        toast.success('Requirement Created', `${formData.requirementId} registered in repository.`);
      }
      setIsModalOpen(false);
      loadRequirements();
    } catch (err: any) {
      toast.error('Save Failed', err.message);
    }
  };

  const handleToggleCriteria = async (reqId: string, criteriaId: string) => {
    try {
      await requirementsApi.toggleCriteria(reqId, criteriaId);
      loadRequirements();
    } catch (err: any) {
      toast.error('Toggle Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text-primary tracking-tight">
              Business & Functional Requirements Repository
            </h2>
            <Badge variant="primary" size="sm">
              Placement Portfolio Core
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Traceability matrix connecting stakeholder objectives, functional specifications, and verified criteria
          </p>
        </div>

        {hasRole('ADMIN', 'MANAGER', 'ANALYST') && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
            New Specification
          </Button>
        )}
      </div>

      {/* SDLC Process Flow Visual */}
      <Card noPadding>
        <div className="p-4 bg-primary-subtle/50 border-b border-border flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Layers className="w-4 h-4" />
            <span>Traceability Lifecycle</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1">
            <span className="px-2.5 py-1 rounded bg-white font-semibold text-text-primary border border-border shrink-0 shadow-subtle">
              1. Business Problem
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="px-2.5 py-1 rounded bg-white font-semibold text-text-primary border border-border shrink-0 shadow-subtle">
              2. Stakeholder Need
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="px-2.5 py-1 rounded bg-white font-semibold text-text-primary border border-border shrink-0 shadow-subtle">
              3. Functional Spec
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="px-2.5 py-1 rounded bg-primary text-white font-semibold shrink-0 shadow-subtle">
              4. Implementation & Acceptance
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-border bg-surface-subtle/30 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search specifications by ID, title, objective, stakeholder..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadRequirements()}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="w-36">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                { value: 'FUNCTIONAL', label: 'Functional' },
                { value: 'BUSINESS', label: 'Business' },
                { value: 'NON_FUNCTIONAL', label: 'Non-Functional' },
              ]}
            />
          </div>

          <div className="w-36">
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: '', label: 'All Priorities' },
                { value: 'CRITICAL', label: 'Critical' },
                { value: 'HIGH', label: 'High' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LOW', label: 'Low' },
              ]}
            />
          </div>

          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'IMPLEMENTED', label: 'Implemented' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'UNDER_REVIEW', label: 'Under Review' },
                { value: 'DRAFT', label: 'Draft' },
              ]}
            />
          </div>

          <Button variant="secondary" size="md" onClick={loadRequirements} icon={<RotateCw className="w-3.5 h-3.5" />}>
            Search
          </Button>
        </div>

        {/* Specifications List */}
        <div className="p-5 space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))
          ) : requirements.length === 0 ? (
            <div className="p-12 text-center text-text-secondary text-sm">
              No business requirements found matching selected filters.
            </div>
          ) : (
            requirements.map((req) => {
              const priorityVariant =
                req.priority === 'CRITICAL'
                  ? 'error'
                  : req.priority === 'HIGH'
                  ? 'warning'
                  : 'neutral';

              const statusVariant =
                req.status === 'IMPLEMENTED'
                  ? 'success'
                  : req.status === 'APPROVED'
                  ? 'info'
                  : 'neutral';

              return (
                <div
                  key={req._id}
                  className="bg-surface rounded-xl border border-border p-5 shadow-card hover:shadow-dropdown transition-all space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-primary px-2.5 py-0.5 rounded bg-primary-subtle border border-primary/20">
                          {req.requirementId}
                        </span>
                        <h3 className="font-bold text-text-primary text-base">{req.title}</h3>
                        <Badge variant={priorityVariant} size="sm">
                          {req.priority}
                        </Badge>
                        <Badge variant={statusVariant} size="sm">
                          {req.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                        {req.description}
                      </p>
                    </div>

                    {hasRole('ADMIN', 'MANAGER', 'ANALYST') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(req)}
                        icon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        Edit
                      </Button>
                    )}
                  </div>

                  {/* Business Objective & Stakeholder Meta */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-surface-subtle/50 p-3.5 rounded-lg border border-border">
                    <div>
                      <span className="font-bold text-text-secondary uppercase text-[10px] tracking-wider block">
                        Business Objective
                      </span>
                      <span className="text-text-primary font-medium mt-0.5 block">{req.businessObjective}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-text-secondary uppercase text-[10px] tracking-wider block">
                          Stakeholder / Sponsor
                        </span>
                        <span className="text-text-primary font-medium mt-0.5 block">{req.stakeholder}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-text-secondary uppercase text-[10px] tracking-wider block">
                          Related Module
                        </span>
                        <span className="text-primary font-bold mt-0.5 block">{req.relatedModule}</span>
                      </div>
                    </div>
                  </div>

                  {/* Acceptance Criteria Checklist */}
                  {req.acceptanceCriteria && req.acceptanceCriteria.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Acceptance Criteria ({req.acceptanceCriteria.filter((c) => c.isMet).length}/
                        {req.acceptanceCriteria.length} Verified)
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {req.acceptanceCriteria.map((crit) => (
                          <div
                            key={crit.id}
                            onClick={() => handleToggleCriteria(req._id, crit.id)}
                            className="flex items-center gap-2 p-2 rounded-lg bg-surface hover:bg-surface-subtle border border-border cursor-pointer transition-colors text-xs select-none"
                          >
                            {crit.isMet ? (
                              <CheckSquare className="w-4 h-4 text-status-success shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-text-muted shrink-0" />
                            )}
                            <span className="font-mono text-[11px] font-bold text-text-secondary shrink-0">
                              [{crit.id}]
                            </span>
                            <span className={crit.isMet ? 'text-text-primary font-medium' : 'text-text-muted'}>
                              {crit.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReq ? `Edit Requirement: ${formData.requirementId}` : 'Create Requirement Specification'}
        description="Formal software specification for placement portfolio evaluation"
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Requirement ID"
              value={formData.requirementId}
              onChange={(e) => setFormData({ ...formData, requirementId: e.target.value.toUpperCase() })}
              placeholder="e.g. INV-001"
              disabled={!!editingReq}
              required
            />
            <Select
              label="Type"
              value={formData.type}
              onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'FUNCTIONAL', label: 'Functional' },
                { value: 'BUSINESS', label: 'Business' },
                { value: 'NON_FUNCTIONAL', label: 'Non-Functional' },
              ]}
            />
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e: any) => setFormData({ ...formData, priority: e.target.value })}
              options={[
                { value: 'CRITICAL', label: 'Critical' },
                { value: 'HIGH', label: 'High' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LOW', label: 'Low' },
              ]}
            />
          </div>

          <Input
            label="Requirement Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Clear, descriptive functional title"
            required
          />

          <Input
            label="Functional Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed narrative of system behaviour"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Business Objective"
              value={formData.businessObjective}
              onChange={(e) => setFormData({ ...formData, businessObjective: e.target.value })}
              placeholder="Measurable business outcome"
              required
            />
            <Input
              label="Primary Stakeholder"
              value={formData.stakeholder}
              onChange={(e) => setFormData({ ...formData, stakeholder: e.target.value })}
              placeholder="e.g. VP Procurement"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Related Module"
              value={formData.relatedModule}
              onChange={(e) => setFormData({ ...formData, relatedModule: e.target.value })}
              options={[
                { value: 'Inventory', label: 'Inventory Management' },
                { value: 'Purchasing', label: 'Purchasing & POs' },
                { value: 'Sales', label: 'Sales & Profitability' },
                { value: 'Analytics', label: 'Analytics & Insights' },
                { value: 'Security', label: 'Security & Audit' },
                { value: 'Dashboard', label: 'Executive Dashboard' },
              ]}
            />
            <Select
              label="Lifecycle Status"
              value={formData.status}
              onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'DRAFT', label: 'Draft' },
                { value: 'UNDER_REVIEW', label: 'Under Review' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'IMPLEMENTED', label: 'Implemented' },
                { value: 'REJECTED', label: 'Rejected' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary tracking-wide mb-1">
              Acceptance Criteria (One per line format: "ID: Text")
            </label>
            <textarea
              rows={4}
              value={formData.criteriaText}
              onChange={(e) => setFormData({ ...formData, criteriaText: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface p-3 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              placeholder={'AC-1: Criterion text description\nAC-2: Second criterion description'}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingReq ? 'Save Changes' : 'Create Requirement'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
