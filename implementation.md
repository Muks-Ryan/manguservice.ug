# Mangu Service UG Implementation Backlog

This document converts the SRS gaps and partially implemented features into an actionable implementation checklist. Items should be completed in order unless a dependency is explicitly satisfied earlier.

## 1. Architecture and Data Foundation
- [ ] Choose one canonical backend strategy: Express + PostgreSQL or Supabase.
- [ ] Remove or isolate unused/conflicting backend paths and schema sources.
- [ ] Establish versioned PostgreSQL migrations as the only schema authority.
- [ ] Add shared request and response validation with `zod`.
- [ ] Add generated API documentation with `zod-openapi` or OpenAPI schemas.
- [ ] Add soft deletion and account deactivation fields for users, technicians, jobs, and related records.
- [ ] Add role and permission tables instead of relying only on a single hard-coded admin role.
- [ ] Add audit logging for authentication, administrative actions, status changes, verification, disputes, and financial events.
- [ ] Add database indexes and constraints for all marketplace relationships.
- [ ] Preserve historical jobs and transactions when users or technicians are deactivated.
- [ ] Add migration and seed commands to the project scripts.

**Libraries and services:** `zod`, `zod-openapi`, PostgreSQL, `node-pg-migrate` or the chosen migration tool, `pino`.

## 2. Authentication and Account Completion

- [ ] Fix JWT expiry so the token expiry matches the selected remember-me duration.
- [ ] Add email verification with expiring verification tokens.
- [ ] Add phone verification using an SMS provider.
- [ ] Add account deactivation and reactivation workflows.
- [ ] Add session revocation and logout-all-devices support.
- [ ] Add rate-limit, brute-force, and suspicious-login audit events.
- [ ] Move password-reset delivery from API response tokens to email or SMS delivery.
- [ ] Add privacy consent and account-data management screens.

**Libraries and services:** `jsonwebtoken`, `bcrypt`, `zod`, Resend or Postmark for email, Africa's Talking or Infobip for Uganda SMS.

## 3. Technician Profile Completion

- [ ] Add profile photos and business logos.
- [ ] Add multiple service categories and skills instead of one trade string.
- [ ] Add experience years, service description, pricing model, and business details.
- [ ] Add working hours and recurring availability windows.
- [ ] Add service areas using towns, radius, coordinates, and optional map boundaries.
- [ ] Add profile completeness scoring.
- [ ] Add verified attributes and completed-job statistics.
- [ ] Remove unsupported claims such as certified or verified until backed by verification records.

**Libraries and services:** `zod`, `sharp` for image processing, Supabase Storage or S3-compatible storage, PostGIS, MapLibre GL JS.

## 4. Verification and Trust

- [ ] Add verification submissions for identity, phone, email, business, licenses, and credentials.
- [ ] Add document metadata, private storage, expiry dates, review notes, and rejection reasons.
- [ ] Add administrator verification queues with approve, reject, and request-more-information actions.
- [ ] Add re-verification when verified profile fields change.
- [ ] Add visible verified badges based only on approved records.
- [ ] Add document access controls and signed URLs.
- [ ] Add fraud flags, report, block, and moderation workflows.

**Libraries and services:** Supabase Storage or S3, presigned URLs, `file-type`, `sharp`, `zod`, optional identity provider such as Smile Identity or Persona.

## 5. Service Categories, Skills, and Discovery

- [ ] Create configurable service category and skill tables.
- [ ] Link technicians to multiple skills and categories.
- [ ] Add server-side filters for category, skill, price, rating, availability, verification, and service area.
- [ ] Persist favourites in PostgreSQL instead of localStorage.
- [ ] Add pagination, sorting, and full-text search.
- [ ] Add location-aware technician discovery and distance estimates.
- [ ] Add configurable matching weights for skills, distance, availability, verification, ratings, and response history.

**Libraries and services:** PostgreSQL full-text search, PostGIS, `@turf/turf`, MapLibre GL JS, MapTiler or Mapbox geocoding.

## 6. Jobs and Marketplace Requests

- [ ] Create a separate `jobs` entity instead of using bookings as service requests.
- [ ] Support job title, description, category, skills, urgency, budget, preferred schedule, location, and status.
- [ ] Support job attachments for photos and documents.
- [ ] Generate human-readable job references in addition to UUIDs.
- [ ] Implement direct booking and open marketplace job-posting workflows.
- [ ] Match eligible technicians based on configured rules.
- [ ] Allow technicians to express interest in eligible jobs.
- [ ] Add client job history and technician job history.

**Libraries and services:** `zod`, Supabase Storage or S3, `file-type`, PostGIS, PostgreSQL transactions.

## 7. Quotations

- [ ] Add quotation records linked to jobs and technicians.
- [ ] Support labour, materials, transport, taxes, fees, discounts, and total amount.
- [ ] Add quote expiry dates and quote status history.
- [ ] Allow technicians to create, edit, withdraw, and submit quotations.
- [ ] Allow clients to accept or decline quotations.
- [ ] Prevent expired quotations from being accepted.
- [ ] Link accepted quotations to the booking and payment amount.
- [ ] Notify clients when quotations are submitted or changed.

**Libraries and services:** `zod`, PostgreSQL numeric types, `date-fns`, Resend/Postmark, Africa's Talking/Infobip.

## 8. Booking, Scheduling, and Job Lifecycle

- [ ] Replace the current limited booking statuses with the SRS lifecycle:
  `REQUESTED -> QUOTED -> ACCEPTED -> SCHEDULED -> ASSIGNED -> EN_ROUTE -> ARRIVED -> IN_PROGRESS -> COMPLETED -> PAYMENT -> REVIEWED`.
- [ ] Define an explicit status transition matrix.
- [ ] Enforce valid transitions in the API and database transaction layer.
- [ ] Add appointment records and appointment history.
- [ ] Add technician working-hour and blackout-period support.
- [ ] Detect overlapping appointments and scheduling conflicts.
- [ ] Add client and technician rescheduling workflows.
- [ ] Add cancellation reasons and configurable cancellation rules.
- [ ] Add completion evidence and completion notes.
- [ ] Add immutable job status history.

**Libraries and services:** `date-fns`, PostgreSQL exclusion constraints, `zod`, `luxon` if timezone-heavy scheduling is required.

## 9. Messaging and Communication

- [ ] Add job-specific conversations and participants.
- [ ] Add persisted messages with timestamps and read status.
- [ ] Add text, image, and permitted document messages.
- [ ] Enforce relationship-based message access.
- [ ] Add moderation access for authorized administrators.
- [ ] Add unread counts and message notifications.
- [ ] Add message retention and abuse-report rules.

**Libraries and services:** Socket.IO with PostgreSQL persistence and Redis adapter, or Supabase Realtime if Supabase becomes canonical; `multer` or signed object-storage uploads; `zod`.

## 10. Payments and Financial Records

- [ ] Add payment intents, transactions, provider references, fees, refunds, and payouts.
- [ ] Add immutable transaction ledger records.
- [ ] Add payment status synchronization through signed webhooks.
- [ ] Add MTN MoMo provider integration.
- [ ] Add Airtel Money provider integration.
- [ ] Add idempotency keys for every payment operation.
- [ ] Add technician earnings and payout history.
- [ ] Add receipts and downloadable transaction history.
- [ ] Add reconciliation and failed-payment handling.
- [ ] Never store raw payment credentials or card data.

**Libraries and services:** MTN MoMo API, Airtel Money API, `zod`, `crypto` for webhook verification, PostgreSQL ledger tables, `pdfkit` or `@react-pdf/renderer` for receipts.

## 11. Reviews and Reputation

- [ ] Allow reviews only for completed jobs.
- [ ] Add structured scores for quality, punctuality, professionalism, and value.
- [ ] Add written reviews and technician responses.
- [ ] Calculate rating averages and completed-job statistics server-side.
- [ ] Add review reporting and moderation.
- [ ] Add reputation history and verified recommendation indicators.
- [ ] Prevent duplicate reviews for the same completed job.

**Libraries and services:** `zod`, PostgreSQL aggregate queries, `date-fns`, optional profanity/moderation provider.

## 12. Disputes, Support, and Warranty

- [ ] Add dispute records linked to jobs and payments.
- [ ] Support reasons, descriptions, evidence, status, assigned administrator, and resolution notes.
- [ ] Add dispute audit history.
- [ ] Support refunds, payment adjustments, cancellation, and closure outcomes.
- [ ] Add technician warranty definitions and warranty periods.
- [ ] Allow clients to submit warranty claims during the valid period.
- [ ] Add support tickets, report, block, and escalation workflows.

**Libraries and services:** Supabase Storage or S3 for evidence, `zod`, `date-fns`, Pino audit logging, email/SMS providers.

## 13. Notifications and Calendar

- [ ] Create server-persisted in-app notifications.
- [ ] Add event-driven notifications for job requests, quotes, acceptance, reminders, completion, payments, disputes, and verification expiry.
- [ ] Add email notifications.
- [ ] Add SMS notifications for Uganda users.
- [ ] Add browser push notifications.
- [ ] Add appointment reminders and timezone-safe scheduling.
- [ ] Add notification preferences and delivery status.
- [ ] Replace localStorage-only calendar events with server-backed appointments.

**Libraries and services:** Resend or Postmark, Africa's Talking or Infobip, Web Push, `date-fns`, `bullmq` with Redis for queued delivery.

## 14. Administration and Analytics

- [ ] Build authoritative user management from PostgreSQL.
- [ ] Add technician verification queues.
- [ ] Add job, quote, booking, dispute, payment, payout, review, and notification administration.
- [ ] Add audit-log search and export.
- [ ] Add analytics for registered users, active users, jobs, conversion, average value, cancellation, repeat usage, response time, completion, revenue, and geographic demand.
- [ ] Add service-category and town demand reports.
- [ ] Add CSV export for operational and financial reports.
- [ ] Replace localStorage-based admin user data with API-backed data.

**Libraries and services:** Recharts for in-app charts, PostgreSQL views/materialized views, Metabase for internal reporting, `json2csv` for exports.

## 15. Maps and Geospatial Features

- [ ] Add map-based technician discovery.
- [ ] Add technician coordinates and service-area geometry.
- [ ] Add address search and geocoding.
- [ ] Add distance and estimated travel calculations.
- [ ] Add radius and service-area matching.
- [ ] Protect user location data and limit precision where appropriate.

**Libraries and services:** MapLibre GL JS, MapTiler or Mapbox tiles, PostGIS, `@turf/turf`, Nominatim or Mapbox Geocoding.

## 16. Testing and Production Readiness

- [ ] Add unit tests for validation, pricing, status transitions, matching, and permission rules.
- [ ] Add API integration tests for authentication, jobs, quotes, bookings, payments, and disputes.
- [ ] Add PostgreSQL integration tests with an isolated database.
- [ ] Add end-to-end tests for registration, discovery, booking, quotation, completion, payment, and review.
- [ ] Add accessibility testing.
- [ ] Add structured logs, error monitoring, metrics, and tracing.
- [ ] Add backup and restore procedures.
- [ ] Add load testing for public discovery and booking endpoints.
- [ ] Add CI checks for type checking, tests, migrations, and production builds.

**Libraries and services:** Vitest, React Testing Library, Supertest, Playwright, Testcontainers, `axe-playwright`, Pino, Sentry, OpenTelemetry, k6.

## Suggested Delivery Order

- [ ] Phase 1: Canonical backend, normalized schema, validation, permissions, audit logs, and tests.
- [ ] Phase 2: Jobs, categories, skills, attachments, matching, quotations, and conflict-aware scheduling.
- [ ] Phase 3: Full lifecycle state machine, messaging, reviews, verification, disputes, and warranties.
- [ ] Phase 4: MTN MoMo/Airtel Money payments, ledger, payouts, receipts, and notifications.
- [ ] Phase 5: Maps, PostGIS matching, analytics, monitoring, backups, accessibility, and scale testing.

## Current MVP Gaps

- [ ] Replace the current `Pending -> Accepted/Declined -> Completed` flow with the SRS lifecycle.
- [ ] Replace localStorage favourites and calendar data with server-backed records.
- [ ] Replace documentation-only claims about verification, payments, notifications, and recommendations with executable modules.
- [ ] Reconcile `database.sql` with the supported migration path.
- [ ] Keep `DOCUMENTATION.md` synchronized with verified implementation status.
