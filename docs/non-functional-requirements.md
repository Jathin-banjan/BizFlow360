# Non-Functional Requirements (NFR) — BizFlow 360

## 1. Performance & Responsiveness
- **NFR-PERF-01:** Dashboard KPI metrics API response time must remain beneath 350ms for datasets up to 100,000 transactions.
- **NFR-PERF-02:** Database indexes must cover all primary search and aggregation vectors (`sku`, `orderDate`, `status`, `region`, `categoryId`).
- **NFR-PERF-03:** Client bundle size must remain lightweight with code-splitting, lazy imports, and asset compression.

---

## 2. Security & Compliance
- **NFR-SEC-01:** All API mutations require valid JWT bearer tokens with signature verification.
- **NFR-SEC-02:** Passwords in transit and resting hashes must never appear in structured application logs.
- **NFR-SEC-03:** Exported CSV reports must sanitize formula escape characters (`=`, `+`, `-`, `@`) to prevent CSV injection vulnerabilities in Excel and Google Sheets.
- **NFR-SEC-04:** Helmet security headers must enforce Content-Security-Policy, HSTS, and frame protection.

---

## 3. Reliability & Data Consistency
- **NFR-REL-01:** Business calculation functions must handle zero denominators safely without NaN or Infinity errors.
- **NFR-REL-02:** Inventory receipts must use idempotent validation preventing duplicate stock increments from duplicate requests.
- **NFR-REL-03:** The application must fail visibly with structured error messages rather than displaying simulated successful states.

---

## 4. Accessibility & UI/UX Standards
- **NFR-UX-01:** Design tokens must conform to WCAG 2.1 Level AA color contrast ratios (minimum 4.5:1 for body copy).
- **NFR-UX-02:** All interactive controls (buttons, selects, dialogs) must support full keyboard navigation (Tab, Enter, Escape).
- **NFR-UX-03:** Layouts must adapt responsively across desktop (1440px+), laptop (1024px), tablet (768px), and mobile viewports (375px).
