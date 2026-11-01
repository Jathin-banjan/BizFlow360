# Functional Requirements Document (FRD) — BizFlow 360

## 1. Authentication & Security (SEC)
- **FR-SEC-01:** System shall authenticate users via email and password, returning a signed JWT token with a 7-day expiration.
- **FR-SEC-02:** System shall enforce role-based access control across `ADMIN`, `MANAGER`, and `ANALYST` roles.
- **FR-SEC-03:** Passwords must be hashed using bcrypt with salt rounds of 10 prior to persistence.
- **FR-SEC-04:** Sensitive actions (stock adjustment, PO approval, product deletion/creation) must log an audit record containing user ID, IP address, action, and timestamp.

---

## 2. Executive Dashboard (DSH)
- **FR-DSH-01:** System shall calculate and display 8 core KPIs: Net Revenue, Cost of Goods Sold, Gross Profit, Gross Margin %, Average Order Value, Fulfilment Rate, Inventory Valuation, and Low-Stock Count.
- **FR-DSH-02:** Metrics must filter dynamically by timeframe: 30 days, 90 days, 180 days, and All Time.
- **FR-DSH-03:** Trailing 6-month revenue and gross profit must render as a dual area chart with currency-formatted tooltips.
- **FR-DSH-04:** Category and regional distributions must render as horizontal bar charts and data tables.

---

## 3. Product & Inventory Management (INV)
- **FR-INV-01:** System shall validate unique uppercase SKU codes for all products.
- **FR-INV-02:** System shall flag products as low-stock whenever `currentStock <= reorderThreshold`.
- **FR-INV-03:** Every stock balance change must record an `InventoryMovement` with movement type, previous stock, new stock, user, and documented business reason.
- **FR-INV-04:** Manual adjustments resulting in negative inventory quantities must be rejected with HTTP 400.

---

## 4. Supplier & Purchase Order Lifecycle (PUR)
- **FR-PUR-01:** Purchase orders must adhere strictly to the state machine:
  - `DRAFT` &rarr; `SUBMITTED` &rarr; `APPROVED` &rarr; `PARTIALLY_RECEIVED` &rarr; `RECEIVED` (or `CANCELLED`).
- **FR-PUR-02:** Stock intake can only be performed on purchase orders in `APPROVED` or `PARTIALLY_RECEIVED` status.
- **FR-PUR-03:** Stock intake must update inventory quantities transactionally, create `RECEIPT` movements, and update PO item counts without allowing receipt of more units than ordered.
- **FR-PUR-04:** Supplier on-time delivery percentage must be calculated dynamically from recorded PO delivery dates against expected dates.

---

## 5. Requirements Management (REQ)
- **FR-REQ-01:** System shall store searchable business, functional, and non-functional requirements.
- **FR-REQ-02:** Each requirement must support acceptance criteria items that can be interactively toggled between met/unmet.
- **FR-REQ-03:** Modifications must preserve author, last updater, and timestamps in MongoDB.
