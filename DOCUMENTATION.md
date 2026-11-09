# Mangu Service UG — Complete Project Documentation

## 1. System Overview & Mission

**Mangu Service UG** is a comprehensive, full-featured web application platform designed to connect clients in Uganda with verified, skilled local technicians and trade professionals (electricians, plumbers, mechanics, HVAC specialists, carpenters, solar technicians, and painters).

The platform bridges the trust gap between service requesters and service providers across major Ugandan municipalities (Kampala, Entebbe, Jinja, Gulu, Mbarara, Mbale, Fort Portal) by integrating background verification, transparent client reviews, peer recommendation badges, real-time dispatch alerts, and secure Mobile Money payment simulation (MTN MoMo and Airtel Money).

---

## 2. Technology Stack & Architecture

- **Frontend Framework:** React 19 with TypeScript (~5.8)
- **Build Tooling:** Vite 6
- **Styling & UI:** Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React icons (`lucide-react`), Framer Motion (`motion/react`)
- **Data Visualization:** Recharts
- **Backend / Dev Runtime:** Express 4 on Node.js (with `tsx` TypeScript runtime runner)
- **Database & Cloud Backend:** Supabase (`@supabase/supabase-js`) client configured via `.env` and `src/services/supabase.ts`
- **MCP Server Support:** `mcp.json` configured for Supabase Model Context Protocol integration (`https://mcp.supabase.com/mcp?project_ref=gsiygqwnezxjgolacndm`)
- **State & Data Persistence:** React Context (`AuthContext`), LocalStorage API service abstraction layer (`src/services/api.ts`) with robust initial mock data (`src/services/mockData.ts`)

---

## 3. User Roles & Permission Matrix

The application supports five distinct user roles with tailored interfaces and permissions:

1. **Client (Service Requester):**
   - Browse and search verified technicians by town and service category.
   - Request repair services or schedule appointment dates.
   - Leave ratings, reviews, and worker recommendations.
   - Process service payments via simulated Mobile Money channels.
   - Receive real-time system, appointment, and broadcast alerts.

2. **Technician (Trade Professional):**
   - Manage professional profile, trade specialties, hourly rate, and service areas.
   - Submit identity documents (NIN / National ID, Trade Certificates) for verification.
   - View, accept, decline, and update appointment booking statuses.
   - Manage availability status (Online, Busy, Offline, Away).
   - Track personal earnings, completed jobs, and client feedback.

3. **Staff Admin (Operations Officer / Desk Staff):**
   - Monitor daily service bookings and operational workflows.
   - Manage technician and client rosters.
   - Handle document verification queues and approve/reject credentials.
   - Send direct alerts to individual technicians or clients.

4. **Platform Admin (Super Administrator):**
   - Full system governance across all platform entities.
   - Advanced multi-channel notification broadcasts (In-App, SMS) targeting custom audience segments.
   - Category management (add/edit trade skills) and Location/Town configuration.
   - Financial management, platform revenue tracking, and payment disbursement logs.
   - Audit trail, system health monitoring, and activity logging.

5. **Guest / Unauthenticated Visitor:**
   - Public landing page with service exploration, search preview, and role-based quick login switcher.

---

## 4. Key Functional Modules

### 4.1. Authentication & Role Switcher
- Fast role switching available via header dropdown or login modal for testing and demonstration.
- Maintains user session in `localStorage` (`mangu_current_user`, `mangu_current_role`).

### 4.2. Technician Discovery & Profile Engine
- Search by keyword, town, category, rating, and verification status.
- View detailed technician profile featuring work history, verified badges, client reviews, and direct booking triggers.

### 4.3. Appointment & Job Dispatch Cycle
- Booking workflow: Request → Pending Approval → Confirmed → In Progress → Completed / Cancelled.
- Interactive calendar view (`src/services/calendarService.ts`) for managing daily schedules.

### 4.4. Recommendation & Endorsement System
- Clients and peer technicians can endorse skilled workers.
- Generates endorsement scores and trust badges.

### 4.5. Verification Portal
- Document upload and verification status tracking.
- Admin review interface for approving National ID and certification credentials.

### 4.6. Notification & Broadcast Center
- Segmented notifications (All Users, Clients, Technicians, Specific Town, Individual User).
- Priority badges (Normal, High, Critical) and multi-channel delivery indicators (In-App, SMS).

### 4.7. Mobile Money Payment Ledger
- Simulated payment processing for MTN MoMo and Airtel Money.
- Deposit escrow, payout tracking, and transaction history log.

---

## 5. Project Directory Structure

```
/
├── public/                 # Static assets and icons
├── src/
│   ├── components/         # Reusable UI components & layouts
│   │   ├── common/         # Buttons, badges, modals, cards
│   │   ├── layout/         # Header Navbar, Sidebar, Footer, Alert badges
│   │   └── ui/             # Reusable UI elements
│   ├── context/            # React Context providers (AuthContext)
│   ├── services/           # Data & API abstraction layer
│   │   ├── api.ts          # Core service methods & LocalStorage engine
│   │   ├── calendarService.ts # Date/calendar calculation helpers
│   │   └── mockData.ts     # Initial seed dataset (towns, users, appointments)
│   ├── types/              # Global TypeScript interfaces & types (index.ts)
│   ├── views/              # Page views categorized by user role
│   │   ├── admin/          # Admin pages (Users, Notifications, Financials, etc.)
│   │   ├── auth/           # Login and Registration modals
│   │   ├── client/         # Client views (Dashboard, Technicians, Appointments)
│   │   ├── landing/        # Public home & service landing pages
│   │   ├── shared/         # Shared pages (Profile, Settings, Help/Support)
│   │   └── technician/     # Technician views (Dashboard, Requests, Earnings)
│   ├── App.tsx             # Main router component & app state root
│   ├── index.css           # Tailwind CSS directives & global styling
│   └── main.tsx            # React DOM entrypoint
├── metadata.json           # Application metadata & platform settings
├── package.json            # Node dependencies & build scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

---

## 6. Development & Deployment

### Local Development Setup
```bash
# Install dependencies
npm install

# Run development server on http://localhost:3000
npm run dev
```

### Type Checking & Linting
```bash
npm run lint
```

### Production Build
```bash
npm run build
```

---

## 7. Future Enhancements & Product Roadmap

The current platform already provides a strong base for technician discovery, booking workflows, and admin oversight. The next phase of growth should focus on deeper operational automation, stronger trust features, and better scalability for real-world service delivery across Uganda.

### 7.1. Advanced Booking & Dispatch Features
- Add a full service request lifecycle with job scheduling, rescheduling, and cancellation logic.
- Introduce automated technician matching based on location, skills, availability, and estimated response time.
- Add dispatch queues for urgent jobs, recurring maintenance requests, and multi-service package bookings.

### 7.2. Trust, Reviews & Reputation Systems
- Expand review scoring with quality, punctuality, communication, and professionalism metrics.
- Add technician badges, achievement milestones, and recommendation history for higher trust visibility.
- Enable client verification and dispute reporting for service complaints and claims.

### 7.3. Finance & Payments Expansion
- Integrate real Mobile Money workflows for MTN MoMo and Airtel Money payments.
- Add escrow-style payment handling, payout approvals, and transaction auditing.
- Introduce service fees, commissions, refunds, and invoice generation for admin and technicians.

### 7.4. Admin Intelligence & Analytics
- Provide dashboards for revenue, service volume, technician productivity, and zone activity trends.
- Add operational KPIs such as response time, booking conversion rate, and completion rate by town.
- Support exportable reports for finance, compliance, and business performance reviews.

### 7.5. Communication & Engagement
- Add in-app messaging between clients and technicians for job coordination.
- Introduce system alerts, SMS reminders, and appointment notifications for all stakeholders.
- Support push notifications for job confirmations, completion reminders, and payment updates.

### 7.6. Security, Compliance & Governance
- Introduce role-based access enforcement, audit trails, and permission controls for sensitive data.
- Add document verification workflows with stronger identity checks and expiry monitoring.
- Support secure file storage, signed transactions, and platform policy controls.

### 7.7. Mobile Experience & Accessibility
- Develop a mobile-first interface or native mobile app for technicians and clients.
- Improve accessibility for low-bandwidth users, including simplified layouts and offline-ready features.
- Add multilingual support for English, Luganda, and other regional languages used in Uganda.

### 7.8. AI & Automation Opportunities
- Add AI-assisted technician recommendations based on service history and customer preferences.
- Automate route suggestions, service categorization, and priority assignment for high-demand areas.
- Use predictive analytics to forecast service demand and technician load by region.

### 7.9. Platform Growth & Scalability
- Expand to new towns, categories, and service verticals beyond the current core offerings.
- Add partner integrations for logistics, financing, insurance, and telecommunications.
- Prepare the platform for broader multi-tenant operations and higher transaction volumes.

Overall, the platform roadmap should move from a strong demo and prototype foundation toward a trusted commercial marketplace for skilled trades and home services in Uganda.

---

## 8. License & Credits

Developed for **Mangu Service UG** — Connecting Uganda with trusted, verified trade skills.
