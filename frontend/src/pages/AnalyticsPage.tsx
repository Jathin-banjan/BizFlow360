import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api/analytics';
import { BusinessInsight } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCw,
  Boxes,
  Truck,
  TrendingUp,
  Percent,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { hasRole } = useAuth();
  const toast = useToast();

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const data = await analyticsApi.getInsights({
        category: categoryFilter,
        severity: severityFilter,
        status: statusFilter,
      });
      setInsights(data);
    } catch (err: any) {
      toast.error('Failed to load insights', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [categoryFilter, severityFilter, statusFilter]);

  const handleRefreshRules = async () => {
    setIsRefreshing(true);
    try {
      const updated = await analyticsApi.refreshInsights();
      setInsights(updated);
      toast.success('Rules Engine Executed', 'Real-time database thresholds and alerts recalculated.');
    } catch (err: any) {
      toast.error('Engine Execution Failed', err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'ACKNOWLEDGED' | 'RESOLVED') => {
    try {
      await analyticsApi.updateStatus(id, newStatus);
      toast.info('Insight Status Updated', `Marked as ${newStatus}.`);
      loadInsights();
    } catch (err: any) {
      toast.error('Status Update Failed', err.message);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'INVENTORY':
        return <Boxes className="w-4 h-4 text-amber-500" />;
      case 'SUPPLIERS':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'SALES':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'MARGIN':
        return <Percent className="w-4 h-4 text-emerald-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Rules-Based Analytics & Operational Insights
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Automated anomaly detection across stock safety levels, supplier lead times, and margins
          </p>
        </div>

        {hasRole('ADMIN', 'MANAGER') && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleRefreshRules}
            isLoading={isRefreshing}
            icon={<Play className="w-4 h-4" />}
          >
            Re-evaluate Rules Engine
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <Card noPadding>
        <div className="p-4 border-b border-border bg-surface-subtle/30 flex flex-wrap items-center gap-3">
          <div className="w-44">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                { value: 'INVENTORY', label: 'Inventory Safety' },
                { value: 'SUPPLIERS', label: 'Supplier Reliability' },
                { value: 'SALES', label: 'Sales Trends' },
                { value: 'MARGIN', label: 'Gross Margin' },
              ]}
            />
          </div>

          <div className="w-40">
            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              options={[
                { value: '', label: 'All Severities' },
                { value: 'CRITICAL', label: 'Critical' },
                { value: 'WARNING', label: 'Warning' },
                { value: 'INFO', label: 'Informational' },
              ]}
            />
          </div>

          <div className="w-40">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active Alerts' },
                { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
                { value: 'RESOLVED', label: 'Resolved' },
              ]}
            />
          </div>

          <Button variant="secondary" size="md" onClick={loadInsights} icon={<RotateCw className="w-3.5 h-3.5" />}>
            Filter
          </Button>
        </div>

        {/* Insights Grid */}
        <div className="p-5 space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))
          ) : insights.length === 0 ? (
            <div className="p-12 text-center text-text-secondary text-sm">
              <CheckCircle2 className="w-10 h-10 text-status-success mx-auto mb-3" />
              <div className="font-semibold text-text-primary">All Systems Operating Normal</div>
              <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                No active operational anomalies or threshold breaches detected in the database.
              </p>
            </div>
          ) : (
            insights.map((ins) => {
              const borderAccent =
                ins.severity === 'CRITICAL'
                  ? 'border-l-4 border-l-status-error'
                  : ins.severity === 'WARNING'
                  ? 'border-l-4 border-l-status-warning'
                  : 'border-l-4 border-l-primary';

              return (
                <div
                  key={ins._id}
                  className={`bg-surface rounded-xl border border-border p-5 shadow-card hover:shadow-dropdown transition-all ${borderAccent}`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryIcon(ins.category)}
                        <span className="font-bold text-text-primary text-sm">{ins.title}</span>
                        <Badge
                          variant={
                            ins.severity === 'CRITICAL'
                              ? 'error'
                              : ins.severity === 'WARNING'
                              ? 'warning'
                              : 'info'
                          }
                          size="sm"
                        >
                          {ins.severity}
                        </Badge>
                        <span className="text-[10px] text-text-muted font-mono">{ins.insightKey}</span>
                      </div>
                      <p className="text-xs text-text-secondary">{ins.explanation}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={ins.status === 'ACTIVE' ? 'primary' : 'neutral'} size="sm">
                        {ins.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Evidence & Recommendation Section */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-surface-subtle/50 p-3.5 rounded-lg border border-border/80">
                    <div>
                      <div className="font-bold text-text-secondary uppercase text-[10px] tracking-wider">
                        Empirical Data Evidence
                      </div>
                      <div className="text-text-primary font-medium mt-0.5">{ins.evidence}</div>
                      <div className="text-[10px] text-text-muted mt-1">
                        Metric: <span className="font-semibold">{ins.relevantMetric}</span> ({ins.metricValue}) •{' '}
                        {ins.period}
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-secondary uppercase text-[10px] tracking-wider">
                        Recommended Operational Action
                      </div>
                      <div className="text-text-primary font-medium mt-0.5">{ins.recommendedAction}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  {ins.status !== 'RESOLVED' && hasRole('ADMIN', 'MANAGER') && (
                    <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-border">
                      {ins.status === 'ACTIVE' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(ins._id, 'ACKNOWLEDGED')}
                        >
                          Acknowledge
                        </Button>
                      )}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateStatus(ins._id, 'RESOLVED')}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Mark Resolved
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};
