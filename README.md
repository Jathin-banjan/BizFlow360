# BizFlow 360 — Intelligent Business Operations & Analytics Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-v22+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0+-47A248.svg)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg)](https://tailwindcss.com/)

**BizFlow 360** is a full-stack business operations and executive analytics platform engineered with the **MERN** stack (MongoDB, Express.js, React, Node.js + TypeScript). Built as a placement portfolio application for **Business Analyst, Functional Analyst, and Product Analyst** roles, it unifies retail supply chain operations, purchase order lifecycles, inventory replenishment, and executive-grade business intelligence into a single cohesive platform.

---

## 1. Core Business Capabilities

- **Executive Performance Dashboard:** Real-time KPI calculations (Net Sales Revenue, Cost of Goods Sold, Gross Profit, Gross Margin %, Average Order Value, Fulfilment Rate, and Inventory Valuation) with dynamic timeframe filters (30d, 90d, 180d, All Time).
- **Sales & Profitability Analysis:** Transactional order history with regional filtering, product margin analysis, and formula-injection-safe CSV exports.
- **Product & SKU Catalog:** Master SKU catalog management with safety reorder thresholds, lead times, and retail pricing.
- **Inventory & Movement Audit Trail:** Real-time physical inventory valuation, manual stock adjustments with mandatory reason documentation, and immutable transaction audit logs.
- **Supplier Governance & SLA Tracking:** Vendor directory with empirical on-time delivery rates calculated directly from recorded purchase orders.
- **Dual-Approval Purchase Order Lifecycle:** Strict state machine (`DRAFT` &rarr; `SUBMITTED` &rarr; `APPROVED` &rarr; `PARTIALLY_RECEIVED` &rarr; `RECEIVED`) with atomic, transactional stock intake.
- **Rules-Based Insights Engine:** Automated detection of low stock, overdue deliveries, and compressed margins with acknowledge/resolve workflows.
- **Business Requirements Repository:** Traceability matrix tracking business problems, stakeholder objectives, functional specifications, and interactive acceptance criteria verification.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18.3, Vite 6, TypeScript 5.7
- **Styling & Design Tokens:** Tailwind CSS with Apple/Linear-inspired executive palette:
  - Background: `#F6F7FB`, Surface: `#FFFFFF`, Primary Accent: `#5B5FEF`, Secondary Accent: `#16A6A1`
- **Data Visualization:** Recharts (responsive area charts, horizontal bar charts)
- **Icons & Components:** Lucide React, accessible custom UI component system
- **Routing & Networking:** React Router 6, TanStack Query, typed REST fetch client

### Backend
- **Runtime:** Node.js 22 LTS, Express.js 4.21, TypeScript
- **Security & Authorization:** JSON Web Tokens (JWT), salted `bcryptjs` password hashing, Helmet, explicit CORS
- **Validation:** Zod schema validation for request payloads and query parameters
- **Auditing:** Administrative audit trail capturing user ID, IP address, and mutation metadata

### Database
- **Engine:** MongoDB 8.0+ Community Server (or MongoDB Atlas)
- **Object Modeling:** Mongoose 8.9 with compound indexes and high-performance single-pass aggregation pipelines

---

## 3. Quick Start (Windows 11 / PowerShell)

### Prerequisites
- **Node.js:** v20+ or v22+ LTS installed ([nodejs.org](https://nodejs.org/))
- **MongoDB:** MongoDB Community Server 7+ or 8+ locally installed, or a MongoDB Atlas connection URI.

### Option A: Automated One-Click Script
Open PowerShell in the project root:

```powershell
# 1. Run automated prerequisite checking and dependency setup
.\scripts\setup.ps1

# 2. Start all services (MongoDB, Backend on 5000, Frontend on 5173)
.\scripts\start.ps1

# 3. Verify platform health
.\scripts\health-check.ps1
```

### Option B: Manual Step-by-Step Setup

#### Step 1: Start MongoDB
If using local MongoDB, ensure `mongod` is running:
```powershell
mongod --dbpath ".\data\db" --port 27017 --bind_ip 127.0.0.1
```

#### Step 2: Configure & Start Backend
Open Terminal 1:
```powershell
cd backend
npm install
npm run seed       # Seeds realistic synthetic retail demonstration dataset
npm run dev        # Starts Express API server on http://localhost:5000
```

#### Step 3: Configure & Start Frontend
Open Terminal 2:
```powershell
cd frontend
npm install
npm run dev        # Starts Vite React application on http://localhost:5173
```

Open your browser to: **`http://localhost:5173`**

---

## 4. Default Demonstration Credentials

The deterministic seed script provisions three role-based accounts for examiner demonstration:

| Role | Email Address | Password | Permissions & Scope |
|---|---|---|---|
| **Admin** | `admin@bizflow360.com` | `Admin@12345` | Full administrative control, user management, audit trail inspection. |
| **Manager** | `manager@bizflow360.com` | `Manager@12345` | Operational oversight, PO approvals, stock intake, inventory adjustments. |
| **Analyst** | `analyst@bizflow360.com` | `Analyst@12345` | Read-only analytics, requirements authoring, CSV report exports. |

*Quick-fill demo buttons are provided directly on the `/login` screen for one-click access.*

---

## 5. Documentation Directory Map

Complete technical and business analysis documentation is maintained in the `docs/` folder:

- [`docs/architecture.md`](docs/architecture.md) — System architecture, component topology, and aggregation pipelines.
- [`docs/business-requirements.md`](docs/business-requirements.md) — Business problems, scope boundaries, and stakeholder profiles.
- [`docs/functional-requirements.md`](docs/functional-requirements.md) — Numbered functional specifications and business rules.
- [`docs/non-functional-requirements.md`](docs/non-functional-requirements.md) — Security, performance, and accessibility standards.
- [`docs/user-stories.md`](docs/user-stories.md) — Role-based user stories for managers, procurement leads, and analysts.
- [`docs/acceptance-criteria.md`](docs/acceptance-criteria.md) — Testable Given-When-Then acceptance scenarios.
- [`docs/process-flows.md`](docs/process-flows.md) — Mermaid sequence and flowcharts for POs, orders, and rules engine.
- [`docs/data-dictionary.md`](docs/data-dictionary.md) — Comprehensive schema definitions for all MongoDB collections.
- [`docs/api-reference.md`](docs/api-reference.md) — Complete REST endpoint documentation with request/response schemas.
- [`docs/test-plan.md`](docs/test-plan.md) — Testing strategy, unit test coverage, and end-to-end verification workflows.
- [`docs/user-manual.md`](docs/user-manual.md) — Step-by-step operator user manual.
- [`docs/project-presentation.md`](docs/project-presentation.md) — 5-slide placement interview presentation outline.
- [`docs/verification-report.md`](docs/verification-report.md) — Honest status report of automated and functional checks.

---

## 6. Running Automated Tests

Run backend unit tests verifying pure business mathematics:
```powershell
cd backend
npm run test
```

---

## 7. Stopping the Application
To cleanly terminate development processes:
```powershell
.\scripts\stop.ps1
```
