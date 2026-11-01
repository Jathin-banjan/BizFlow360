# API Reference — BizFlow 360 REST Endpoints

Base URL: `/api/v1`

All requests expecting JSON must provide `Content-Type: application/json`.
Protected endpoints require `Authorization: Bearer <token>` or valid session cookie.

---

## 1. Authentication Endpoints

### `POST /auth/login`
Authenticates user and returns JWT token.
- **Request Body:** `{ "email": "admin@bizflow360.com", "password": "Admin@12345" }`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "67...",
      "username": "admin",
      "email": "admin@bizflow360.com",
      "role": "ADMIN",
      "fullName": "Eleanor Vance"
    }
  }
}
```

### `GET /auth/me`
Returns currently authenticated user profile. (Requires Authentication).

### `POST /auth/logout`
Clears session cookies and invalidates client token.

---

## 2. Dashboard Analytics Endpoints

### `GET /dashboard/metrics`
Returns aggregate business KPIs with optional date range boundaries.
- **Query Params:** `startDate` (YYYY-MM-DD), `endDate` (YYYY-MM-DD)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 84520.00,
    "totalCost": 51200.00,
    "grossProfit": 33320.00,
    "grossMarginPercentage": 39.42,
    "totalOrders": 10,
    "averageOrderValue": 8452.00,
    "fulfilmentRate": 90.00,
    "inventoryValuation": 128450.00,
    "lowStockProductCount": 3,
    "pendingPurchaseOrdersCount": 3,
    "supplierDeliveryPerformance": 88.25
  }
}
```

### `GET /dashboard/trends?months=6`
Returns monthly revenue, profit, and order volumes for Recharts visualization.

### `GET /dashboard/breakdowns`
Returns revenue and profit breakdowns partitioned by region and product category.

---

## 3. Product Catalog Endpoints

### `GET /products`
List catalog products with optional filters: `search`, `categoryId`, `status`, `lowStock=true`.

### `POST /products` (Role: `ADMIN`, `MANAGER`)
Creates a new SKU with validation.
- **Request Body:**
```json
{
  "sku": "COMP-DOCK-8K",
  "name": "Universal Thunderbolt 4 Dock",
  "categoryId": "67...",
  "unitCost": 110.00,
  "unitPrice": 229.00,
  "currentStock": 25,
  "reorderThreshold": 15,
  "leadTimeDays": 7
}
```

---

## 4. Inventory Endpoints

### `GET /inventory/summary`
Returns total inventory valuation, physical unit totals, and low-stock SKU count.

### `GET /inventory/movements`
Returns paginated stock movement audit trail. Query filters: `productId`, `movementType`.

### `POST /inventory/adjust` (Role: `ADMIN`, `MANAGER`)
Executes manual stock adjustment and records movement audit.
- **Request Body:**
```json
{
  "productId": "67...",
  "adjustmentQuantity": 15,
  "reason": "Found buffer stock in aisle 4 during cycle count"
}
```

---

## 5. Purchase Order Endpoints

### `POST /purchase-orders` (Role: `ADMIN`, `MANAGER`)
Creates draft PO with line items.

### `PATCH /purchase-orders/:id/status` (Role: `ADMIN`, `MANAGER`)
Updates PO state: `SUBMITTED`, `APPROVED`, `CANCELLED`.

### `POST /purchase-orders/:id/receive` (Role: `ADMIN`, `MANAGER`)
Receives physical shipment units, increases product stock, and logs `RECEIPT` movements.

---

## 6. Business Requirements Endpoints

### `GET /requirements`
List requirements with filters: `search`, `type`, `status`, `priority`, `module`.

### `POST /requirements` (Role: `ADMIN`, `MANAGER`, `ANALYST`)
Creates a new software requirement with acceptance criteria.

### `PATCH /requirements/:id/criteria/:criteriaId/toggle`
Toggles acceptance criterion `isMet` boolean state.
