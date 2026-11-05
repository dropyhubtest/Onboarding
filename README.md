# DropyHub — Delivery Partner Registration & Onboarding Portal

A production-grade, full-stack recruitment, onboarding, and operational management platform built for **DropyHub Delivery Partners**. Features real-time frontend validation, transactional SQLite database persistence, secure private document storage, an administrative verification panel with complete audit logging, and an external Kotak 811 account opening workflow.

---

## 🌟 Architecture & Features

### 1. Delivery Partner Registration Page (`/`)
- Modern logistics & fintech aesthetic matching DropyHub's design system tokens and color palette.
- High-conversion Hero section with earning potential metrics, key highlights, and smooth scroll CTA.
- Delivery category showcase with Card A (Food & Quick Commerce: Swiggy, Zomato, BigBasket, Blinkit) and Card B (Logistics & E-Commerce: Licious, Apollo 24|7, Healthcare, Retail), including statutory non-partnership disclaimers.

### 2. Multi-Section Guided Registration Form
- **Section 1: Personal Information** — Aadhaar-matched name, DOB (18+ age verification), Gender, Indian 10-digit mobile number, Alternate number, Email, Address, City, State, PIN code.
- **Section 2: Delivery Preferences** — Selectable Cards for Food & Quick Commerce, Logistics & E-Commerce, or Both streams.
- **Section 3: Work Preferences & Vehicle Readiness** — Full-time/Part-time/Flexible, Shift hours, Hub location, Service radius, Two-wheeler ownership (with EV rental fleet assistance for riders without bikes), Driving license, RC, and Smartphone.
- **Section 4: Identity Documents** — Mandatory Aadhaar Card & PAN Card upload with instant client-side format/size validation (5MB max, PDF/JPG/PNG/WEBP), encrypted server-side storage, and statutory privacy assurances.
- **Section 5: Mandatory Kotak Banking Requirement** — Compulsory Kotak 811 zero-balance account acknowledgement with background verification consent.

### 3. Submission & Kotak Account Redirection (`/confirmation`)
- Generates a unique tracking reference: `DH-DP-YYYYMMDD-XXXX`.
- Immediately persists candidate record and documents to SQLite database before external redirect.
- Safe Kotak redirect URL construction via `KOTAK_ACCOUNT_OPENING_URL` with non-sensitive tracking parameters (`partner_ref`, `source`). **Zero leakage of Aadhaar, PAN, or credentials.**
- Clear 24-hour communication timeline clearly communicated as expected review turnaround (not automatic approval).

### 4. Public Status Tracking Portal (`/status`)
- Self-service portal where applicants enter their Application Reference ID and mobile number.
- Displays real-time application review status, Kotak account verification status, and timestamp.
- Direct link to resume Kotak 811 registration if still pending.

### 5. Administrative Operations Management Panel (`/admin`)
- Accessible with admin secret key (`x-admin-key: dropyhub_admin_secure_key_2026`).
- Real-time KPI metrics (Total Applications, Pending Review, Approved, Kotak Completed).
- Fast search (by applicant name, mobile number, reference ID, or email) and multi-factor filtering (by Application Status, Kotak Status, Delivery Category, City).
- Full application drawer:
  - Personal, contact, work, and vehicle details.
  - **Secure Identity Document Viewer** streaming files via protected endpoint `/api/admin/documents/[id]`.
  - Independent **Application Decision** manager (`Pending Review`, `Under Review`, `Additional Information Required`, `Approved`, `Rejected` with mandatory rejection reasons).
  - Independent **Kotak Banking Status** manager (`Pending`, `Completion Awaited`, `Completed`, `Verification Required`, `Failed`).
  - Internal administrative notes logger.
  - Complete **Audit History Trail** recording every transition, administrator identity, timestamp, and remarks.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript 5
- **Database**: SQLite (Node 24 built-in `node:sqlite` DatabaseSync — zero native binary overhead)
- **Styling**: CSS Modules with DropyHub Figma design tokens & dark logistics theme
- **Document Storage**: Private isolated disk storage outside web root (`./data/secure_documents`)
- **Testing**: Node.js native test runner (`node --test`) for unit, database, and live HTTP E2E testing

---

## 🚀 Getting Started

### 1. Installation & Environment Setup
\`\`\`bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local
\`\`\`

### 2. Run Development Server
\`\`\`bash
npm run dev
\`\`\`
Visit `http://localhost:3000` in your browser.

### 3. Run Production Build & Validation
\`\`\`bash
npm run build
npm run start
\`\`\`

### 4. Run Automated Test Suite
\`\`\`bash
# Run unit & database lifecycle tests
npm test

# Run live HTTP E2E tests (when server is running on :3000)
node tests/e2e-http.mjs
\`\`\`

---

## 🔐 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `KOTAK_ACCOUNT_OPENING_URL` | Official Kotak 811 account opening destination | `https://www.kotak811.bank.in/open-zero-balance-savings-account` |
| `ADMIN_SECRET_KEY` | Secret passkey for administrative API access | `dropyhub_admin_secure_key_2026` |
| `DOCUMENTS_STORAGE_PATH` | Private storage path for uploaded Aadhaar & PAN files | `./data/secure_documents` |
| `DATABASE_PATH` | Path to persistent SQLite database file | `./data/onboarding.db` |

---

## 📋 API Endpoints

### Public Endpoints
- `POST /api/upload` — Upload and encrypt Aadhaar or PAN document (multipart/form-data)
- `POST /api/applications` — Submit application with validation, persistence, and Kotak URL generation
- `GET /api/applications/status?reference=...&mobile=...` — Public candidate status lookup

### Protected Admin Endpoints (`x-admin-key` header required)
- `GET /api/admin/applications` — Paginated list of applications with search and filters
- `GET /api/admin/applications/[id]` — Detailed application view with documents and audit history
- `PATCH /api/admin/applications/[id]/status` — Update application status with audit logging
- `PATCH /api/admin/applications/[id]/kotak-status` — Update Kotak account verification status
- `POST /api/admin/applications/[id]/notes` — Add internal administrative note
- `GET /api/admin/documents/[id]` — Stream encrypted identity document for authorized verification
