# Data Dictionary — BizFlow 360 MongoDB Schemas

## 1. Collection: `users`
Stores system accounts, hashed credentials, and role authorizations.

| Field | BSON Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique document identifier. |
| `username` | String | Unique, Indexed, Trimmed | Account username for login. |
| `email` | String | Unique, Indexed, Lowercase | Valid work email address. |
| `passwordHash` | String | Required | Salted bcrypt password hash. |
| `role` | String | Enum: `ADMIN`, `MANAGER`, `ANALYST` | Role-based authorization tier. |
| `fullName` | String | Required | Full display name. |
| `department` | String | Default: `'Operations'` | Organizational unit. |
| `isActive` | Boolean | Default: `true` | Account active flag. |
| `lastLoginAt` | Date | Optional | Timestamp of last successful session. |
| `createdAt` | Date | Auto-timestamp | Account provisioning timestamp. |
| `updatedAt` | Date | Auto-timestamp | Account modification timestamp. |

---

## 2. Collection: `categories`
Product grouping taxonomy.

| Field | BSON Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique identifier. |
| `code` | String | Unique, Uppercase | Category short code (e.g., `COMP`, `ERGO`). |
| `name` | String | Required | Full category title. |
| `description`| String | Optional | Department scope narrative. |
| `icon` | String | Default: `'Package'` | Lucide icon identifier. |

---

## 3. Collection: `products`
Master catalog items, standard costs, retail pricing, and current inventory.

| Field | BSON Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique product identifier. |
| `sku` | String | Unique, Indexed, Uppercase | Stock Keeping Unit (e.g. `COMP-X1-PRO`). |
| `name` | String | Required | Commercial title. |
| `categoryId` | ObjectId | Ref: `Category`, Indexed | Foreign reference to category. |
| `unitCost` | Number | Min: 0 | Purchase/manufacturing cost per unit ($). |
| `unitPrice` | Number | Min: 0 | Retail sales price per unit ($). |
| `currentStock` | Number | Min: 0, Default: 0 | Real-time on-hand warehouse inventory. |
| `reorderThreshold`| Number | Min: 0, Default: 10 | Minimum inventory buffer level. |
| `leadTimeDays` | Number | Min: 1, Default: 7 | Expected vendor fulfillment duration. |
| `status` | String | Enum: `ACTIVE`, `INACTIVE` | Product availability flag. |

---

## 4. Collection: `inventorymovements`
Immutable audit log tracking all warehouse balance changes.

| Field | BSON Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Movement identifier. |
| `productId` | ObjectId | Ref: `Product`, Indexed | Target catalog item. |
| `movementType`| String | Enum: `RECEIPT`, `SALE`, `ADJUSTMENT`, `RETURN` | Flow direction. |
| `quantity` | Number | Non-zero | Units added or deducted. |
| `previousStock`| Number | Required | Inventory count prior to action. |
| `newStock` | Number | Required | Inventory count following action. |
| `referenceType`| String | Optional | Source system (e.g., `PURCHASE_ORDER`, `SALE`). |
| `referenceId` | String | Optional | Identifier of associated order/PO. |
| `reason` | String | Optional | Documented explanation for change. |
| `performedByName`| String | Optional | Name of user who executed mutation. |
| `createdAt` | Date | Auto-timestamp, Indexed | Execution timestamp. |

---

## 5. Collection: `purchaseorders`
Procurement contracts and vendor shipments.

| Field | BSON Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | PO identifier. |
| `poNumber` | String | Unique, Indexed | Formatted number (e.g. `PO-2026-01001`). |
| `supplierId` | ObjectId | Ref: `Supplier`, Indexed | Vendor recipient. |
| `status` | String | Enum: `DRAFT`, `SUBMITTED`, `APPROVED`, `PARTIALLY_RECEIVED`, `RECEIVED`, `CANCELLED` | Lifecycle state. |
| `orderDate` | Date | Required | Submission date. |
| `expectedDeliveryDate`| Date | Required | Promised delivery SLA date. |
| `actualDeliveryDate` | Date | Optional | Timestamp when fully received. |
| `items` | Array | Min length: 1 | Line items: `{ productId, sku, orderedQuantity, receivedQuantity, unitCost, totalCost }`. |
| `totalAmount` | Number | Min: 0 | Aggregate financial commitment ($). |

---

## 6. Collection: `customerorders`
Retail transactions, regional allocation, and gross profit accounting.

| Field | BSON Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Order identifier. |
| `orderNumber` | String | Unique, Indexed | Transaction number (`ORD-2026-10001`). |
| `customerName`| String | Required | Client organization or person name. |
| `customerEmail`| String | Required, Lowercase | Contact email. |
| `region` | String | Enum: `North`, `South`, `East`, `West`, `Central` | Geographic market territory. |
| `orderDate` | Date | Required, Indexed | Transaction timestamp. |
| `status` | String | Enum: `PLACED`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` | Fulfillment stage. |
| `items` | Array | Required | Line items: `{ productId, quantity, unitPrice, unitCost, totalPrice, grossProfit }`. |
| `totalAmount` | Number | Min: 0 | Invoiced customer revenue ($). |
| `grossProfit` | Number | Required | Revenue minus cost of goods sold ($). |
