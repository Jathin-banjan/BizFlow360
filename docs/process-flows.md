# Business Process Flows — BizFlow 360

## 1. Purchase Order Lifecycle & Stock Intake Flow

```mermaid
flowchart TD
    A[Start: Low-Stock Detected or Buffer Needed] --> B[Procurement Specialist Creates PO Draft]
    B --> C[Submit PO for Authorization]
    C --> D{Manager / Admin Review}
    D -->|Rejected / Mod Needed| E[Cancelled or Reverted to Draft]
    D -->|Approved| F[Purchase Order Approved]
    F --> G[Supplier Dispatches Goods]
    G --> H[Physical Delivery at Warehouse Intake Dock]
    H --> I[Warehouse Manager Inspects & Enters Received Qty]
    I --> J{All Line Items Fully Received?}
    J -->|Partial Units| K[PO Marked PARTIALLY_RECEIVED]
    K --> L[Update Product Inventory Transactionally]
    L --> M[Generate Immutable Movement Audit Record]
    J -->|All Units Arrived| N[PO Marked RECEIVED & Set Delivery Date]
    N --> L
```

---

## 2. Customer Order Sales & Inventory Deduction Flow

```mermaid
flowchart TD
    A[Sales Portal: Customer Submits Order] --> B{Verify Available Stock >= Requested Qty}
    B -->|Insufficient Units| C[Reject Order with Insufficient Stock Error]
    B -->|Stock Available| D[Calculate Subtotal, Tax, and Gross Profit]
    D --> E[Deduct Inventory Balance]
    E --> F[Generate SALE Inventory Movement Audit]
    F --> G[Set Order Status to CONFIRMED]
    G --> H[Warehouse Picks & Packs: PROCESSING]
    H --> I[Logistics Carrier Dispatches: SHIPPED]
    I --> J[Customer Receives Goods: DELIVERED]
    J --> K[Update Fulfilment Rate KPI & Refresh Dashboard]
```

---

## 3. Rules-Based Analytics & Alerting Engine Flow

```mermaid
flowchart TD
    A[Scheduled or Manual Engine Trigger] --> B[Evaluate Active Product Stock vs Reorder Threshold]
    B --> C{Any CurrentStock <= Threshold?}
    C -->|Yes| D[Generate/Update RULE_LOW_STOCK_ALERT]
    C -->|No| E[Pass]
    D --> F[Evaluate Approved POs vs Expected Delivery Dates]
    E --> F
    F --> G{Any Delivery Overdue?}
    G -->|Yes| H[Generate/Update RULE_OVERDUE_PURCHASE_ORDERS]
    G -->|No| I[Pass]
    H --> J[Evaluate Supplier On-Time Delivery %]
    I --> J
    J --> K{Any Supplier < 85% SLA?}
    K -->|Yes| L[Generate/Update RULE_POOR_SUPPLIER_RELIABILITY]
    K -->|No| M[Pass]
    L --> N[Surface Prioritized Alerts on Dashboard & Analytics Page]
    M --> N
    N --> O[Manager / Analyst Acknowledges or Resolves Alert]
```
