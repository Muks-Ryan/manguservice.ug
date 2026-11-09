# Mangu Service UG System Report

## 1. Document Purpose

This report provides a structured overview of the Mangu Service UG technician marketplace platform. It is intended to support the preparation of:

- A project presentation
- A formal system proposal
- A stakeholder briefing
- A technical design review
- An implementation and funding discussion

The report distinguishes between capabilities currently implemented in the repository and capabilities planned for future releases.

## 2. Executive Summary

Mangu Service UG is a two-sided digital marketplace designed to connect clients in Uganda with skilled technicians. Clients can discover technicians, review service information, submit booking requests, and track requests. Technicians can maintain their profiles, manage availability, and respond to booking requests. Administrators can manage technician directory records.

The current system is a working early-stage prototype built around a React and Vite frontend, an Express and TypeScript backend, and PostgreSQL persistence. It demonstrates the basic marketplace foundation: authentication, role-based access, technician discovery, profile management, and a basic booking request flow.

The project is not yet a complete commercial marketplace. Major SRS capabilities such as quotations, full job lifecycle management, messaging, identity verification, payments, reviews, disputes, warranties, notifications, maps, and advanced analytics remain to be implemented.

The recommended strategy is to evolve the prototype through a controlled phased implementation. The first commercial milestone should complete the core marketplace loop:

```text
Discovery -> Job Request -> Quotation -> Booking -> Service Execution -> Payment -> Review
```

## 3. Business Problem

Clients often find technicians through informal referrals, phone calls, social media, or unstructured directories. These channels make it difficult to:

- Compare technicians and prices
- Confirm technician identity and qualifications
- Schedule and track service appointments
- Maintain a reliable service history
- Resolve disputes
- Process and document payments
- Build trust through verified reviews

Technicians also lack a central digital workspace for managing requests, quotations, schedules, customers, earnings, and reputation.

Mangu Service UG addresses this gap by creating a structured marketplace for technical services, beginning with Uganda and designed for expansion across service categories and geographic areas.

## 4. Product Vision

Mangu Service UG aims to become a trusted digital operating platform for technical services in Uganda.

### Client value

- Discover technicians by trade and location
- Compare profiles and rates
- Submit service requests
- Schedule appointments
- Communicate with technicians
- Pay through supported payment channels
- Review completed services
- Access support and dispute resolution

### Technician value

- Reach new customers
- Present a professional profile
- Receive and manage job requests
- Submit quotations
- Manage availability and appointments
- Track earnings and payouts
- Build a verified reputation

### Administrator value

- Govern marketplace quality
- Verify technicians and credentials
- Manage users, jobs, payments, disputes, and reviews
- Monitor service demand and platform performance
- Maintain auditable operational records

## 5. Target Users and Stakeholders

### Primary users

1. **Clients**: Individuals or organizations seeking technical services.
2. **Technicians**: Skilled professionals or technical businesses offering services.
3. **Platform administrators**: Authorized users responsible for governance and operations.

### Supporting stakeholders

- Business and operations teams
- Payment providers
- Maps and geolocation providers
- Email, SMS, and push notification providers
- Identity and document verification providers
- Regulators and consumer-protection authorities
- Technology and hosting partners

## 6. Current System Scope

### Implemented capabilities

- Client and technician registration
- Admin login
- Password hashing with bcrypt
- JWT-based HTTP-only cookie sessions
- Role-restricted routes
- Password recovery with expiring reset tokens
- Dark and light theme support
- Landing page and authentication navigation
- Technician directory CRUD
- Technician search and filtering
- Technician profile details
- Technician availability labels
- Client favourites stored locally
- Client booking requests
- Estimated booking cost calculation
- Technician booking acceptance, decline, and completion actions
- PostgreSQL-backed users, technicians, bookings, and reset tokens
- Loading indicators and page skeletons
- International phone formatting and validation
- Country and city selection during registration

### Current booking lifecycle

```text
Pending -> Accepted / Declined -> Completed
```

The current lifecycle is a prototype-level workflow and does not yet represent the full SRS lifecycle.

## 7. Current Technical Architecture

```text
React 19 + TypeScript + Vite
              |
              v
Express 4 + TypeScript API
              |
              v
PostgreSQL through node-postgres
```

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Lucide React
- Framer Motion / Motion
- Recharts dependency available for future analytics

### Backend

- Node.js
- Express
- TypeScript through `tsx`
- PostgreSQL through `pg`
- JWT authentication
- bcrypt password hashing
- Helmet security headers
- CORS configuration
- Express rate limiting
- Cookie-based sessions

### Database entities currently present

- `users`
- `technicians`
- `bookings`
- `password_reset_tokens`

### Deployment direction

- Frontend: Vercel, Netlify, Cloudflare Pages, or similar static hosting
- Backend: Railway, Render, Fly.io, DigitalOcean, or Azure App Service
- Database: Railway PostgreSQL, Supabase, Neon, or another managed PostgreSQL service

## 8. Existing Functional Modules

### 8.1 Authentication

The system supports client, technician, and administrator authentication. Passwords are hashed and sessions are maintained through HTTP-only cookies.

Remaining authentication improvements include email verification, phone verification, account deactivation, session revocation, and production-grade password reset delivery by email or SMS.

### 8.2 Technician Directory

Administrators can create, update, search, filter, and delete technician records. Clients can browse technicians by trade, town, and availability status.

The current directory is the foundation for a richer technician marketplace profile.

### 8.3 Booking Requests

Clients can select an available technician, describe the service, choose a future time, and estimate the number of hours. The platform calculates an estimated cost using the technician hourly rate.

Technicians can accept, decline, or complete requests from their dashboard.

### 8.4 Theme, Navigation, and Loading Experience

The application supports dark and light themes, a landing page, authentication navigation, startup loading, page skeletons, country-aware phone inputs, and city selection.

These features improve usability but are supporting functionality rather than the core marketplace value proposition.

## 9. SRS Compliance Summary

| SRS capability | Current status | Assessment |
|---|---|---|
| Client registration and login | Implemented | Functional prototype capability |
| Technician registration and login | Implemented | Functional prototype capability |
| Role-based permissions | Partial | Basic role checks exist; granular permissions are missing |
| Technician profile | Partial | Basic fields only |
| Technician verification | Missing | No verification records or admin queue |
| Categories and skills | Partial | Single trade field instead of normalized skills |
| Search and filtering | Partial | Text, trade, town, and status only |
| Location-aware matching | Missing | No maps, distance, or geospatial matching |
| Job posting | Partial | Direct booking request only |
| Attachments | Missing | No file storage or upload workflow |
| Technician matching | Missing | No configurable matching engine |
| Quotations | Missing | No quote data model or workflow |
| Booking and scheduling | Partial | Basic request statuses only |
| Full job lifecycle | Missing | SRS state machine not implemented |
| Messaging | Missing | Only phone and email links |
| Payments | Missing | Only estimated cost calculation |
| Reviews and ratings | Missing | No review entities or moderation |
| Disputes | Missing | No dispute workflow |
| Warranty | Missing | No warranty records or claims |
| Notifications | Partial | Toasts only; no delivery infrastructure |
| Administration | Partial | Technician directory administration only |
| Analytics | Partial | Basic directory statistics only |
| Audit logging | Missing | No audit log entity or interface |
| Automated testing | Missing | No test suite configured |

## 10. Major System Gaps

### 10.1 Data model gap

The SRS requires a marketplace data model containing users, profiles, categories, skills, verification, jobs, quotes, appointments, messages, payments, payouts, reviews, disputes, warranties, notifications, and audit records. The current schema is much smaller.

### 10.2 Marketplace lifecycle gap

The current booking flow does not yet support quotations, scheduling conflicts, technician assignment, travel statuses, service execution, payment, or reviews.

### 10.3 Trust and safety gap

The application presents a technician directory but does not yet verify identity, credentials, businesses, documents, or review history.

### 10.4 Communication gap

There is no persisted job-specific conversation system or event-driven notification service.

### 10.5 Financial gap

There is no payment ledger, Mobile Money integration, payout process, refund workflow, or reconciliation process.

### 10.6 Operational gap

The administrator currently manages technician directory records, but not the full operational marketplace.

## 11. Proposed Future Architecture

```text
Web and mobile clients
          |
          v
API gateway and authentication
          |
          v
Marketplace application services
  |       |        |       |
Jobs   Matching  Payments Notifications
  |       |        |       |
  +-------+--------+-------+
          |
          v
PostgreSQL + PostGIS + Object Storage
          |
          v
External integrations
Maps | Mobile Money | Email | SMS | Push | Verification
```

### Recommended architectural principles

- Keep business logic in modular services.
- Use PostgreSQL transactions for jobs, bookings, and payments.
- Use event-driven notifications.
- Store files in private object storage.
- Use signed URLs for sensitive documents.
- Use PostGIS for location-aware matching.
- Maintain immutable audit records for critical actions.
- Hide third-party providers behind replaceable interfaces.
- Validate requests consistently with shared schemas.

## 12. Recommended Libraries and Services

### Validation and API contracts

- `zod`
- `zod-openapi`

### Maps and geospatial services

- MapLibre GL JS
- MapTiler or Mapbox tiles
- PostGIS
- `@turf/turf`
- Nominatim, Mapbox Geocoding, or Google Geocoding

### File and document storage

- Supabase Storage or S3-compatible object storage
- Presigned URLs
- `file-type`
- `sharp`

### Messaging and realtime

- Socket.IO with PostgreSQL persistence and Redis adapter, or Supabase Realtime
- Redis for scaling realtime and queued work

### Notifications

- Resend or Postmark for email
- Africa's Talking or Infobip for Uganda SMS
- Web Push for browser notifications
- BullMQ and Redis for delivery queues

### Payments

- MTN MoMo API
- Airtel Money API
- `crypto` for signed webhook verification
- PostgreSQL ledger tables

### Analytics and observability

- Recharts for application charts
- PostgreSQL views and materialized views
- Metabase for operational reporting
- Pino for structured logs
- Sentry for error tracking
- OpenTelemetry for tracing and metrics

### Testing

- Vitest
- React Testing Library
- Supertest
- Playwright
- Testcontainers
- `axe-playwright`
- k6

## 13. Recommended Implementation Roadmap

### Phase 1: Foundation and Data Integrity

- Select Express/PostgreSQL or Supabase as the canonical backend.
- Establish one migration source of truth.
- Normalize users, roles, profiles, categories, skills, service areas, availability, and jobs.
- Add Zod validation and API contracts.
- Add soft deletion and account deactivation.
- Add audit logging and job status history.
- Fix JWT expiry and remember-me behavior.
- Add unit, API, and database integration tests.

### Phase 2: Complete Marketplace Loop

- Add independent jobs and attachments.
- Add category and skills management.
- Add configurable technician matching.
- Add quotations with expiry and acceptance.
- Implement conflict-aware appointment scheduling.
- Implement the full job state machine.
- Add completion notes and evidence.

### Phase 3: Trust and Communication

- Add verification submissions and private document storage.
- Add approval, rejection, expiry, and re-verification.
- Add job-specific messaging.
- Add reviews, structured ratings, reports, and moderation.
- Add disputes, evidence, resolutions, and warranties.

### Phase 4: Payments and Notifications

- Add payment intents and financial ledger.
- Integrate MTN MoMo and Airtel Money through provider interfaces.
- Add fees, refunds, payouts, receipts, and reconciliation.
- Add in-app, email, SMS, and push notifications.
- Add appointment reminders and notification preferences.

### Phase 5: Maps, Analytics, and Production Readiness

- Add PostGIS and map-based discovery.
- Add geocoding, distance calculation, and radius matching.
- Add operational, financial, and geographic analytics.
- Add monitoring, backups, load testing, accessibility testing, and CI/CD.
- Prepare mobile clients and future multi-country support.

## 14. Proposed MVP Definition

A production-ready first marketplace release should allow the following complete flow:

1. A client registers and verifies contact information.
2. A technician registers a professional profile.
3. An administrator verifies the technician.
4. The client searches for a technician by skill and location.
5. The client creates a job with description, schedule, budget, and attachments.
6. Matching technicians receive the request.
7. A technician submits a quotation.
8. The client accepts the quotation.
9. The system schedules the appointment without conflicts.
10. The technician updates job progress.
11. The client makes a supported payment.
12. The technician completes the job.
13. The client submits a structured review.
14. The system records the complete audit and transaction history.

## 15. Risks and Controls

| Risk | Control |
|---|---|
| Fraudulent technician identity | Identity and credential verification |
| Poor service quality | Reviews, completed-job history, disputes, warranties |
| Payment fraud | Provider webhooks, idempotency, immutable ledger |
| Scheduling conflicts | Availability windows and database constraints |
| Unauthorized data access | Role and relationship-based authorization |
| Document exposure | Private storage and signed URLs |
| Marketplace imbalance | Demand analytics and technician onboarding campaigns |
| Provider dependency | Integration interfaces and provider abstraction |
| Data loss | Automated backups and restore testing |
| Scope growth | Phased releases and acceptance criteria |

## 16. Presentation Structure

The following sequence can be used to prepare a project presentation:

1. Problem statement
2. Proposed solution
3. Target users and stakeholders
4. Product vision
5. Current prototype demonstration
6. Current architecture
7. Existing functionality
8. SRS compliance and current gaps
9. Proposed marketplace lifecycle
10. Future architecture and integrations
11. Implementation roadmap
12. Security, trust, and payment approach
13. Expected benefits
14. Risks and mitigation
15. MVP acceptance criteria
16. Conclusion and next steps

## 17. System Proposal Structure

The following structure can be used to prepare a formal proposal document:

1. Executive summary
2. Background and problem statement
3. Proposed system
4. Objectives
5. Target users and stakeholders
6. Scope of work
7. Functional requirements
8. Technical architecture
9. Implementation methodology
10. Project phases and deliverables
11. Technology stack and integrations
12. Security and privacy approach
13. Testing and quality assurance
14. Deployment and operations
15. Risks and assumptions
16. Budget and resource requirements
17. Acceptance criteria
18. Sustainability and future expansion
19. Conclusion

## 18. Conclusion

Mangu Service UG has a credible technical foundation and demonstrates the essential direction of a technician marketplace. Its strongest current capabilities are authentication, technician directory management, basic discovery, and direct booking requests.

To become the complete system described in the SRS, the project must next implement the full service lifecycle, verification, quotations, communication, payments, reviews, disputes, notifications, maps, analytics, and production controls.

The recommended approach is to treat the existing application as the foundation prototype and implement the remaining marketplace capabilities incrementally, with each phase producing a demonstrable and testable business outcome.
