import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, RotateCw } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<any[]>('/audit/logs');
      setLogs(data);
    } catch (err: any) {
      toast.error('Failed to load audit logs', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Security & Operational Audit Log</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Immutable administrative records of sensitive state mutations, stock adjustments, and approvals
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={loadLogs} icon={<RotateCw className="w-3.5 h-3.5" />}>
          Refresh Logs
        </Button>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-sm">
              No audit log entries recorded in database.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/60 text-text-secondary uppercase border-b border-border font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-surface-subtle/40 transition-colors">
                    <td className="py-3 px-4 text-text-secondary font-sans text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-primary">{log.action}</td>
                    <td className="py-3 px-4 font-semibold text-text-primary">{log.entityType}</td>
                    <td className="py-3 px-4 text-text-muted truncate max-w-[120px]">{log.entityId || 'N/A'}</td>
                    <td className="py-3 px-4 font-sans text-xs font-semibold text-text-primary">
                      {log.performedByName}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="primary" size="sm">
                        {log.performedByRole}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-text-muted">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 px-4 text-text-secondary font-sans text-[11px] truncate max-w-xs">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};
