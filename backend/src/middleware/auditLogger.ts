import { Request } from 'express';
import { AuditEvent } from '../modules/audit/auditEvent.model.js';
import { logger } from '../config/logger.js';

export async function recordAudit(
  req: Request,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, any>
) {
  try {
    const performedBy = req.user ? (req.user.userId as any) : undefined;
    const performedByName = req.user ? req.user.fullName : 'System/Anonymous';
    const performedByRole = req.user ? req.user.role : 'ANONYMOUS';
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    await AuditEvent.create({
      action,
      entityType,
      entityId,
      performedBy,
      performedByName,
      performedByRole,
      details,
      ipAddress,
      timestamp: new Date(),
    });
  } catch (err: any) {
    logger.warn('Failed to record audit event', { error: err.message, action, entityType });
  }
}
