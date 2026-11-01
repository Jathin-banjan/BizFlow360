# Acceptance Criteria (Given-When-Then) — BizFlow 360

## 1. Authentication & Role-Based Authorization
### Scenario 1.1: Valid Administrator Login
- **Given** an existing active user with role `ADMIN` and email `admin@bizflow360.com`.
- **When** the user submits valid credentials on `/login`.
- **Then** the server responds with HTTP 200, sets an HTTP-only token cookie, returns the user payload, and redirects the client to `/`.

### Scenario 1.2: Unauthorized Mutation by Analyst
- **Given** an authenticated user with role `ANALYST`.
- **When** the user sends a `POST` request to `/api/v1/products` attempting to create a SKU.
- **Then** the backend rejects the request with HTTP 403 Forbidden with message indicating role `ANALYST` lacks permissions.

---

## 2. Purchase Order State Transitions & Stock Intake
### Scenario 2.1: Stock Intake on Approved Order
- **Given** a purchase order in `APPROVED` status with line item 30 units ordered, 0 received.
- **When** an authorized manager submits a receipt of 20 units.
- **Then** the product's `currentStock` increases by exactly 20 units, an `InventoryMovement` of type `RECEIPT` is created, and the PO status updates to `PARTIALLY_RECEIVED`.

### Scenario 2.2: Rejection of Over-Receipt
- **Given** a purchase order with 10 remaining unreceived units.
- **When** a user attempts to receive 15 units.
- **Then** the server rejects the transaction with HTTP 400 Bad Request, stating received quantity exceeds remaining pending units.

---

## 3. Inventory Valuation & Zero Denominator Protection
### Scenario 3.1: Gross Margin Calculation with Zero Revenue
- **Given** a reporting timeframe where zero eligible customer orders exist.
- **When** the dashboard metrics API calculates gross margin percentage.
- **Then** the calculation safely returns `0.00%` rather than throwing `NaN` or dividing by zero.

### Scenario 3.2: Negative Inventory Prevention
- **Given** a product with `currentStock = 5`.
- **When** a warehouse adjustment of `-10` is submitted.
- **Then** the server rejects the request with HTTP 400, stating the adjustment would breach zero stock boundary.

---

## 4. Requirements Management Traceability
### Scenario 4.1: Toggling Acceptance Criteria
- **Given** requirement `INV-001` with criterion `AC-INV-01` set to `false`.
- **When** a user clicks the criterion checkbox in `/requirements`.
- **Then** the backend updates `isMet = true`, persists the updated timestamp and user, and reflects the checked status on page refresh.
