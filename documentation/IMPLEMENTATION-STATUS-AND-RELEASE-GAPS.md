# BABTEK Core Platform — Implementation and Outstanding Work Register

**Scope:** Development branch `development/platform-foundation`. This document distinguishes implemented foundations from capabilities that still require configuration, testing or development. It is not a claim that BABTEK is production-ready.

## Implemented foundations

### 1. Corporate website
- Multi-page Next.js website with dedicated routes for company information, divisions, services, projects, technology, research, academy, real estate, ventures, products/supply, partnerships, careers, insights and contact.
- Eight approved divisions and the three strategic pillars are represented.
- Public enquiry form writes to the Supabase enquiry register.
- CMS foundations for pages, services, divisions, portfolio, insights, careers, partnerships and technology initiatives.
- Brand management centre supports company identity settings and public logo asset paths.
- The five-platform architecture is now visualised on the homepage, the public `/platform` page and the founder's `/admin/platforms` workspace.

### 2. Client management
- Client account registration and email/password login.
- Client portal access is manually linked by BABTEK to a client contact record; registration alone grants no project access.
- Linked clients can view assigned projects, client-visible milestones and documents, issued quotations/invoices, issued agreements and project conversations.
- Client project messages are persisted in the database and visible to the linked client and authorised BABTEK staff.

### 3. Project operations
- Project register and status management.
- Project milestones, deliverables, progress, due dates, delay reasons and acceptance status.
- Task creation and partner assignment against an existing partner engagement.
- Private project document storage with explicit client/partner visibility.
- Partner engagements and project-specific delivery updates.
- Partner portal access to assigned work, scoped documents and progress submissions.

### 4. Founder administration
- Founder-only control room with operational counts, content inventory, finance snapshot, audit activity and platform navigation.
- User role assignment/revocation for non-owner roles.
- Brand management, CMS, enquiry register, client register, partner register, communication centre and project/finance workspaces.
- Founder authority is not granted by Google sign-in or public registration; the owner role remains separately assigned.

### 5. Technology ecosystem
- Initiative catalogue and roadmap for BABTEK AEC Workspace, BABTEK Commercial, CADWAL-X, WAL-X Portfolio, BABTEK AI, BABTEK Studio and BABTEK-OS.
- Product catalogue is a roadmap/register, not evidence that these products are released or operational.

### Communications
- Client-to-BABTEK project conversation threads.
- Independent partner-to-BABTEK project conversation threads.
- Enquiry internal notes are separate and are not client-visible.
- Conversation messages persist in Supabase. Current implementation is not a real-time chat service: live presence, typing indicators, unread counters, push notifications and outbound email/SMS/WhatsApp delivery are not implemented.

### Commercial and finance
- Quotation draft, issue and invoice draft generation workflows.
- Manual client receipt recording with invoice balance update.
- Agreement register and issue-status workflow.
- Expense register and project profitability reporting, grouped by currency.
- Specialist payable schedules and an immutable partner payment transaction ledger.
- Database functions atomically create payment schedules within the agreed partner fee and record instalments without allowing an overpayment.

## Authentication status

- Email/password login is implemented for founder, client and partner entry points.
- Password recovery request, callback and password reset routes have been added.
- Google sign-in controls have been added to the login screens.
- **Google OAuth is not enabled by code alone.** A Google OAuth client ID/secret must be created in Google Cloud Console, entered in Supabase Authentication → Providers → Google, and the correct production/preview callback URLs must be added to Supabase Auth URL Configuration. Keep secrets in Supabase, never in browser environment variables or source control.
- Recovery and OAuth flows still require end-to-end tests with the founder, a client account and a partner account.

## Outstanding work and release gates

### Required before external client/partner rollout
1. Obtain a successful production build and run a full typecheck.
2. Complete a role-by-role RLS and storage policy review, including tests for cross-client and cross-partner data isolation.
3. Test registration, email confirmation, login, recovery, Google OAuth, account linking, sign-out and session expiry with controlled test accounts.
4. Test client and partner messaging in both directions; verify that client messages never appear in partner threads and partner messages never appear in client threads.
5. Test file uploads, signed links, visibility revocation and expired links.
6. Verify all finance calculations against source agreements and bank statements; add reconciliation exports and evidence handling.
7. Confirm business identity details, public address, CAC number, professional credentials and all public claims before publication.
8. Upload BABTEK's official logo and confirm its light/dark variants and favicon. Dynamic brand colours are not yet applied across every public component.
9. Select and configure the production domain, HTTPS, redirect URLs, metadata and email sender configuration.

### Product and workflow enhancements
- Real-time messaging, unread counters, notifications and email delivery.
- Client enquiry-stage conversations before a project is formally registered.
- Client and partner invitations, account lifecycle management and granular permission editor.
- Downloadable, professionally formatted quotation/invoice PDFs and approved legal agreement templates.
- E-signature, online payment collection and bank-feed reconciliation.
- Partner payment evidence uploads and exportable payment statements.
- Media library uploads, image rights review, richer homepage CMS control and verified project case studies.
- Full accounting controls, cashbook, tax reporting, general ledger and period-based reconciliation.
- Product development, testing, release management, licensing and integrations for the technology initiatives.

## Current deployment constraint
The latest available Vercel build attempt failed. The logs identified a literal escaped-newline syntax error in the commercial actions file; that source was corrected. A later build then identified a missing relative import in the new specialist-payment page; that import was corrected. Additional changes have been made since those attempts, but they have not yet been verified by a fresh build.

Vercel has currently returned HTTP 402 for further deployment creation because the Hobby team exceeded its 100 deployment API requests in a 24-hour period. The tool reports a 24-hour retry window. The latest source cannot be certified as build-ready until Vercel permits another preview build or an equivalent local/CI build is run.

## Production safety
- Work remains on `development/platform-foundation`.
- The `main` branch and production deployment have not been changed by this work.
- Do not expose the platform to external users until build, auth, RLS, storage and finance tests pass.
