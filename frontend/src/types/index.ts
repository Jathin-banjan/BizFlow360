export type UserRole = 'ADMIN' | 'MANAGER' | 'ANALYST';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  department: string;
  lastLoginAt?: string;
}

export interface Category {
  _id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Product {
  _id: string;
  sku: string;
  name: string;
  categoryId: Category | string;
  description?: string;
  unitCost: number;
  unitPrice: number;
  currentStock: number;
  reorderThreshold: number;
  leadTimeDays: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  _id: string;
  productId: {
    _id: string;
    name: string;
    sku: string;
    currentStock: number;
  };
  movementType: 'RECEIPT' | 'SALE' | 'ADJUSTMENT' | 'RETURN';
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType?: string;
  referenceId?: string;
  reason?: string;
  performedByName?: string;
  createdAt: string;
}

export interface Supplier {
  _id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  leadTimeDays: number;
  rating: number;
  status: 'ACTIVE' | 'INACTIVE';
  totalOrdersPlaced: number;
  onTimeDeliveryRate: number;
  calculatedOnTimeDeliveryRate?: number;
  purchaseOrders?: any[];
}

export interface PurchaseOrderItem {
  _id?: string;
  productId: string;
  sku: string;
  productName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  supplierId: {
    _id: string;
    name: string;
    code: string;
    email: string;
  };
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'APPROVED'
    | 'PARTIALLY_RECEIVED'
    | 'RECEIVED'
    | 'CANCELLED';
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  notes?: string;
  createdBy?: { fullName: string; email: string };
  approvedBy?: { fullName: string; email: string };
}

export interface OrderItem {
  _id?: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  totalPrice: number;
  grossProfit: number;
}

export interface CustomerOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  region: 'North' | 'South' | 'East' | 'West' | 'Central';
  orderDate: string;
  status:
    | 'PLACED'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  grossProfit: number;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  fulfilledDate?: string;
}

export interface Requirement {
  _id: string;
  requirementId: string;
  title: string;
  description: string;
  businessObjective: string;
  stakeholder: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'BUSINESS' | 'FUNCTIONAL' | 'NON_FUNCTIONAL';
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'IMPLEMENTED' | 'REJECTED';
  relatedModule: string;
  acceptanceCriteria: Array<{
    id: string;
    text: string;
    isMet: boolean;
  }>;
  createdByName?: string;
  updatedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessInsight {
  _id: string;
  insightKey: string;
  title: string;
  category: 'INVENTORY' | 'SALES' | 'SUPPLIERS' | 'MARGIN';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  evidence: string;
  relevantMetric: string;
  metricValue: number;
  period: string;
  explanation: string;
  recommendedAction: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossMarginPercentage: number;
  totalOrders: number;
  averageOrderValue: number;
  fulfilmentRate: number;
  inventoryValuation: number;
  lowStockProductCount: number;
  pendingPurchaseOrdersCount: number;
  supplierDeliveryPerformance: number;
  activeAlertsCount: number;
}

export interface MonthlyTrend {
  period: string;
  revenue: number;
  profit: number;
  orders: number;
}
