export type UserRole = 'ADMIN' | 'MANAGER' | 'ANALYST';

export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export type MovementType = 'RECEIPT' | 'SALE' | 'ADJUSTMENT' | 'RETURN';

export type SupplierStatus = 'ACTIVE' | 'INACTIVE';

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED';

export type CustomerOrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type RequirementType = 'BUSINESS' | 'FUNCTIONAL' | 'NON_FUNCTIONAL';

export type RequirementPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RequirementStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'IMPLEMENTED'
  | 'REJECTED';

export type InsightCategory = 'INVENTORY' | 'SALES' | 'SUPPLIERS' | 'MARGIN';

export type InsightSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type InsightStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
}
