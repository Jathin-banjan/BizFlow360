# Automated & Functional Test Plan — BizFlow 360

## 1. Test Strategy Overview
BizFlow 360 employs a multi-layered testing strategy combining unit tests for pure business math, integration tests for API endpoints and database mutations, and manual end-to-end workflow verification across core functional paths.

---

## 2. Unit Testing Scope (Vitest)
Unit tests verify calculations in isolation:
1. **Gross Profit:** `Net Revenue - COGS` across normal, zero, and loss scenarios.
2. **Gross Margin %:** Handling normal margin, zero revenue boundary (no divide-by-zero crashes), and negative revenue.
3. **Average Order Value (AOV):** Verification of rounding and protection against zero order count.
4. **Inventory Valuation:** Accurate summation of `stockQuantity * unitCost` and clamping negative stock counts to zero.
5. **Fulfilment Rate:** Percentage calculation clamped to 100% and safe on zero total orders.
6. **Supplier On-Time Rate:** Exact calculation against delivered purchase orders.
7. **Low-Stock Boundary Rule:** Exact equality (`currentStock == reorderThreshold`) flagged as low stock.

---

## 3. Integration Testing Scope
Integration tests verify HTTP handlers, validation middleware, and MongoDB operations:
- **Auth Integration:** Successful token generation on valid credentials; rejection with HTTP 401 on incorrect password; HTTP 403 on role breach.
- **PO State Machine:** Enforcing that only `APPROVED` or `PARTIALLY_RECEIVED` orders accept stock receipts; duplicate receipts rejected once ordered quantity is satisfied.
- **Stock Movements:** Every adjustment or receipt commits an `InventoryMovement` with matching previous and new stock balances.
- **Requirements CRUD:** Preserving custom acceptance criteria arrays and toggling checklist status.

---

## 4. End-to-End Verification Workflows (Manual / Browser)
1. **Workflow 1 (Executive KPI Analysis):** Log in as Manager &rarr; Open Dashboard &rarr; Change time filter to 90 Days &rarr; Verify refreshed chart and KPI values.
2. **Workflow 2 (Product SKU Lifecycle):** Create new SKU `COMP-TEST-1` &rarr; Verify low-stock warning appear when stock falls below reorder threshold.
3. **Workflow 3 (Stock Adjustment Audit):** Execute adjustment of `+10` units &rarr; Verify stock movement history records new balance and reason.
4. **Workflow 4 (Purchase Order Intake):** Create PO &rarr; Submit &rarr; Approve as Admin &rarr; Receive stock &rarr; Verify warehouse stock reflects added units.
5. **Workflow 5 (Requirements Traceability):** Open Requirements module &rarr; Toggle acceptance criteria &rarr; Reload page &rarr; Confirm status persists in database.
6. **Workflow 6 (CSV Export Verification):** Filter sales by region &rarr; Export CSV &rarr; Confirm formula injection prefixing (`'`) on formula characters.
