# User Manual & Operator Guide — BizFlow 360

## 1. Getting Started & Logging In
1. Navigate to `http://localhost:5173/login` in your web browser.
2. Enter your work email and password.
3. For local placement testing, use the quick-fill buttons beneath the login card:
   - **Admin:** `admin@bizflow360.com` / `Admin@12345` (Full access + audit log)
   - **Manager:** `manager@bizflow360.com` / `Manager@12345` (Operational management)
   - **Analyst:** `analyst@bizflow360.com` / `Analyst@12345` (Analytics & Specs)
4. Click **Sign In to Platform**.

---

## 2. Navigating the Executive Dashboard
- **Period Filter:** Use the top-right pill buttons (`30 Days`, `90 Days`, `6 Months`, `All Time`) to adjust the reporting window.
- **KPI Cards:** Review Net Sales, Gross Profit, Gross Margin, Average Order Value, Fulfilment Rate, and Inventory Valuation.
- **Charts:** Hover over the Recharts area chart to view month-by-month net sales revenue and gross profit.

---

## 3. Product Catalog Operations
1. Click **Products** in the left sidebar.
2. **Search:** Enter SKU codes or product titles in the search bar.
3. **Filter:** Select a category from the dropdown or check **Low Stock Warnings Only**.
4. **Create SKU:** Click **New Product SKU**, fill out title, unit cost, retail price, safety threshold, and click **Create Product**.

---

## 4. Warehouse Stock Adjustment
1. Click **Inventory** in the sidebar.
2. Review total valuation and physical units.
3. Click **Manual Adjustment**.
4. Select target product, enter adjustment quantity (`+` to add stock, `-` to deduct), provide a business reason, and click **Apply & Log Adjustment**.
5. Inspect the newly created entry in the **Stock Movement Audit Trail** table.

---

## 5. Purchase Order Creation & Stock Intake
1. Click **Purchase Orders** in the sidebar.
2. Click **Create Purchase Order**, pick an approved supplier, select delivery date, and add line items. Click **Create Draft PO**.
3. In the PO table, click **Submit** to advance to management review.
4. With an `ADMIN` or `MANAGER` account, click **Approve**.
5. Once shipment arrives at the dock, click **Receive**, enter verified delivered quantities, and click **Confirm & Update Inventory**. Notice the product's available stock increases immediately.

---

## 6. Business Requirements & Specifications Repository
1. Click **Requirements Specs** in the sidebar.
2. Search and filter by priority, module, or status.
3. Review functional specs, business objectives, and sponsor details.
4. Click on any acceptance criteria item to toggle its verified status (`isMet`), which persists immediately to MongoDB.
