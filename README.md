# CareerX - AI Job Portal & Talent Ecosystem

CareerX is a modern, high-performance talent network platform built with React 19, Vite, and Tailwind CSS v4. It features real-time synchronization between Job Seekers (Candidates) and Hiring Partners (Recruiters).

---

## 🌟 Key Features

### 1. Job Posting & Management
- **Full CRUD Support**: Create, Read, Edit, and Delete job listings.
- **10+ Supported Requisition Fields**:
  - Job Title, Hiring Company, Sector/Category
  - Employment Type (Full-time, Part-time, Contract, Remote, Hybrid, Internship)
  - Experience Level (Entry Level, Mid Level, Senior Level, Lead/Principal, Executive)
  - Salary Range & Compensation Benchmark
  - Work Location
  - Required Skills (interactive chip adder + preset tags)
  - Application Deadline (`<input type="date">`)
  - Status Toggle (`Open` ⇋ `Closed`)
  - Role Description & Responsibilities
- **Cross-Role Live Synchronization**:
  - Closing a requisition immediately updates candidate listings and blocks new applications.
  - Candidate 1-click Quick Apply increments applicant count and reflects in both candidate tracker and recruiter pipeline.

### 2. Company Management & REST API Sync
- **Live Background REST API**:
  - Integrates with JSONPlaceholder (`https://jsonplaceholder.typicode.com/users`).
  - Network requests (`GET`, `POST`, `PUT`, `DELETE`) trigger naturally in the browser DevTools Network tab.
- **Enterprise Details**: Logo, Industry, Scale, Address, Website, Email, Phone, and Active Job Requisitions.

### 3. Authentication & Role-Based Workspaces
- Dual workspace personas: **Candidate** and **Recruiter**.
- 1-Click demo logins for instant evaluation (`candidate@jobportal.com` / `recruiter@jobportal.com`).
- Protected routes and 4-step password recovery flow.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation & Run
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Run Oxlint checks
npm run lint

# Production build
npm run build
```

---

## 📁 Clean Architecture

```text
src/
├── assets/             # Optimized brand and hero imagery
├── components/
│   ├── auth/           # AuthLayout & ProtectedRoute
│   ├── companies/      # CompanyModal (Add / Edit)
│   ├── dashboard/      # StatCard, Header, Pipeline Stats, QuickActions, RecentActivities
│   └── jobs/           # JobModal (10+ fields, preset skills, status toggle)
├── context/
│   ├── AuthContext.jsx       # User session state & demo credentials
│   ├── CompanyContext.jsx    # Company state & REST API sync
│   └── DashboardContext.jsx  # Jobs CRUD, applications, saved jobs, live metrics
├── pages/
│   ├── auth/           # LoginPage, RegisterPage, ForgotPasswordPage
│   ├── companies/      # CompaniesPage, CompanyDetailsPage
│   ├── jobs/           # JobsPage, JobDetailsPage
│   └── Dashboard.jsx   # Role-adaptive main dashboard
└── services/
    └── companyApi.js   # Background REST API client for network sync
```

---

## 🎨 Theme & Performance
- **Design System**: Pure enterprise light theme (`bg-slate-50`, `#f8fafc`).
- **Typography & Icons**: Crisp Lucide React icons, high-contrast accessible color scales.
- **Performance**: Pre-compiled with React Compiler & Vite 8 for sub-millisecond route transitions.
