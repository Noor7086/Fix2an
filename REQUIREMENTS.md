# Fixa2an MVP Requirements

## Platform & Language
- ✅ Web only (responsive mobile & desktop)
- ✅ Swedish v1 with i18n support (EN/SV currently implemented)
- ✅ Brand colors: #1C3F94 (blue), #34C759 (green), #FFFFFF, text #333333
- ⚠️ Fonts: Montserrat/Poppins/Inter (need to verify current setup)

## Accounts & Auth
- ✅ Roles: Customer, Workshop, Admin (schema ready)
- ✅ Email + password auth (NextAuth implemented)
- ⏳ Magic-link support (partially implemented)
- ⏳ 2FA for Admin (not implemented)
- ⏳ BankID (later)

## Customer Flow

### 1. Upload (Step 1/3)
- ✅ Accept JPG/PNG/PDF, max 10 MB (implemented)
- ⏳ Store in secure object storage (S3/Cloud Storage) - currently using local/API
- ⏳ Virus scan + image compression
- ⏳ OCR parsing (later)

### 2. Offers List (Step 2/3)
- ⏳ Matching: notify verified workshops within radius (default 30 km)
- ⏳ Limit to top 10-12 offers
- ⏳ Sort by: price → distance → rating
- ⏳ Filters: Price | Distance | Rating
- ⏳ Offer contents: Price (incl. VAT), note, available date/time, ETA, warranty, rating, distance, "Fixa2an Verified"
- ⏳ Expiry: Offers auto-expire after 48h

### 3. Offer Detail & Booking (Step 3/3)
- ⏳ Customer selects slot from available times
- ⏳ Instant confirmation
- ⏳ Email confirmations to both parties

### 4. My Cases
- ⏳ Statuses: In bidding, Offers ready, Booked, Completed, Cancelled
- ⏳ Actions: View details, reschedule, cancel, leave review (1-5 stars + text)

## Booking, Cancellation, Reschedule
- ⏳ Reschedule: Free ≥24h before; inside 24h: workshop proposes new time
- ⏳ Cancellation: Free ≥24h before
- ⏳ No-show status available

## Payments & Business Model (MVP)
- ⏳ **Klarna Checkout integration** - Customer pays at booking
- ⏳ Platform commission per job (configurable, e.g., 10%)
- ⏳ Monthly invoice to workshops (email template)
- ⏳ Commission allocation: platform vs workshop share
- ⏳ Monthly payout reports (manual for MVP)

**Important:** Use Klarna Checkout API - no custom payment forms, no card storage

## Communication
- ⏳ Transactional emails for key events
- ⏳ Show phone/email after booking
- ⏳ In-app chat (later)

## Reviews & Ratings
- ⏳ Customer receives review email 24-48h after completion
- ⏳ 1-5 stars + text
- ⏳ Admin moderation tools (hide/unpublish)

## Workshop Onboarding & Verification
- ⏳ Required fields: company name, org. no., address, contact, opening hours, brands
- ⏳ Upload docs: F-tax, liability insurance, affiliations
- ⏳ Admin approval required before receiving requests
- ⏳ "Fixa2an Verified" badge
- ⏳ Workshops maintain availability (time windows) in dashboard

## Geo & Maps
- ⏳ Google Maps or Mapbox for geocoding & distance
- ⏳ Distance on offer cards
- ⏳ Embed map on offer detail & booking

## Notifications
- ✅ Email setup (backend configured)
- ⏳ Customer: verify account, upload received, new offer, booking confirmed, reminder 24h, job complete, review request, password reset
- ⏳ Workshops: welcome, new request, offer won/lost, new booking, reminder 24h, monthly invoice
- ⏳ SMS reminders (later, Twilio/Nexmo)

## Legal & GDPR
- ⏳ Terms & Conditions page
- ⏳ Privacy Policy page
- ⏳ Cookies page
- ⏳ Cookie consent banner
- ⏳ Data minimization, right to delete
- ⏳ Audit logs for admin actions
- ⏳ Store PII in EU region; encrypt at rest & in transit

## Accessibility & Performance
- ⏳ WCAG 2.1 AA basics
- ⏳ Lighthouse ≥90
- ✅ SSR/ISR with Next.js
- ⏳ Image lazy-loading, CDN

## Admin Panel
- ⏳ Dashboard KPIs: requests, offers, bookings, revenue
- ⏳ Customers: search, view activity, block if abuse
- ⏳ Workshops: approve/deny, docs view, toggle Verified, pause receiving requests
- ⏳ Requests/Offers/Bookings: list, filter, manual override
- ⏳ Reviews moderation: publish/hide
- ⏳ Billing: commission summary, export CSV/PDF, send invoice email

## Status Models

### Request
- NEW → IN_BIDDING → BIDDING_CLOSED → BOOKED → COMPLETED → CANCELLED

### Offer
- SENT → ACCEPTED → DECLINED → EXPIRED

### Booking
- CONFIRMED → RESCHEDULED → CANCELLED → DONE → NO_SHOW

## Data Model (to implement)
- ✅ Users (role, profile)
- ⏳ Workshops (with verification docs)
- ⏳ WorkshopDocs
- ✅ Vehicles (make/model/year)
- ⏳ InspectionReports (file refs to S3)
- ⏳ Requests
- ⏳ Offers
- ⏳ Bookings
- ⏳ Reviews
- ⏳ Invoices
- ⏳ Notifications

## Tech Stack
- ✅ Frontend: Next.js + Tailwind
- ⏳ Forms: React Hook Form (need to verify)
- ✅ Backend: Node.js (Express)
- ✅ DB: PostgreSQL (Prisma)
- ⏳ Storage: S3/Cloud Storage (EU region)
- ⏳ Email: Postmark/SendGrid with SPF/DKIM/DMARC
- ⏳ Analytics: GA4 or Plausible
- ⏳ Security: rate limiting, CAPTCHA on upload, role-based authorization

## Legend
- ✅ = Implemented
- ⏳ = Needs implementation
- ⚠️ = Needs verification

---

**Last Updated:** 2025-10-31
**Priority for MVP:** Clean web flow, verified workshops, offers & booking, admin approval, email notifications, **Klarna Checkout integration**


