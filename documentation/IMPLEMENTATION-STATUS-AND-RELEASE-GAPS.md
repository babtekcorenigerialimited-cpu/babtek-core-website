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
- Independent partner-to-BABTEK project conversation threads, now scoped to the exact professional engagement rather than only the shared project.
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
The latest Vercel build attempt for commit `788111a` successfully compiled the application bundle, then failed during TypeScript validation in `app/admin/commercial/actions.ts` because the quotation record was not narrowed before its ID was used. That null-handling issue has been corrected in commit `06f0bb9`; additional invoice, payment and agreement record checks were hardened in commit `ad75c8e`. The partner portal's unused exported action that allowed direct task-status mutation was also removed in commit `788111a`, preserving the intended progress-report-and-review workflow.

A fresh build of the corrected `ad75c8e` commit is still unverified. Vercel has returned HTTP 402 for further deployment creation because the Hobby team exceeded its 100 deployment API requests in a 24-hour period. The API reports a 24-hour retry window. Do not treat the earlier successful bundle compilation as a successful build; rerun a full build and typecheck when deployment capacity returns or an equivalent CI build is available.

## Production safety
- Work remains on `development/platform-foundation`.
- The `main` branch and production deployment have not been changed by this work.
- Do not expose the platform to external users until build, auth, RLS, storage and finance tests pass.


## Latest database review (27 November 2026)
- Database health advisor returned no health lints.
- Payment schedule and payment transaction tables now allow authenticated users to read only through their RLS policies; direct authenticated INSERT/UPDATE/DELETE privileges were revoked. Payment writes must use the two role-checked database functions.
- The payment transaction table has two SELECT policies: finance staff and the linked partner's own payment records. No direct client-side insert policy exists.
- Supabase security advisor still reports generic warnings for callable SECURITY DEFINER functions. The payment RPCs deliberately use SECURITY DEFINER to perform atomic writes, but each checks the authenticated user's BABTEK role and validates the requested schedule/engagement. The existing `has_role` and `can_access_project` helpers are also required by RLS. These functions still need a focused security review and adversarial tests.
- Supabase security advisor flags authenticated-policy access as potentially reachable by anonymous sign-ins across multiple tables and storage. The current Auth user table contains one user and zero anonymous users, but the anonymous sign-in setting itself still needs confirmation in Supabase Auth settings. Disable anonymous sign-ins unless BABTEK deliberately requires them; public enquiry intake does not require anonymous Auth accounts.
- Supabase security advisor currently reports leaked-password protection as disabled. Re-check the setting in Supabase Authentication → Attack Protection / Password Security even if it was previously toggled.
- Performance advisor reports 50 unindexed foreign keys, 27 RLS auth-initplan warnings, 37 multiple-permissive-policy warnings and 13 unused indexes. These are optimisation and policy-review items; do not blindly add every index or merge policies without checking query plans and access semantics.


## Partner conversation privacy hardening (27 November 2026)
- Added `partner_engagement_id` to `communication_messages`, referencing the exact professional engagement. The migration is recorded in Supabase as `20261127172711` and stored in the repository under the matching migration filename.
- Replaced project-wide partner read/insert RLS policies with engagement-scoped policies. A linked partner account can read and send only when the engagement belongs to one of its linked professional partner records and the message's project matches that engagement.
- Updated partner messaging actions to require an engagement ID and derive the project ID from the verified engagement record.
- Updated partner portal to show a separate thread per engagement, and founder Communication Centre to display/reply to each engagement independently.
- The new constraint requires engagement linkage for new partner messages. It is `NOT VALID` so historical project-wide partner messages remain in the staff archive without being incorrectly attributed to one professional. Historical partner messages are not automatically exposed to any partner account.
- This privacy boundary still requires end-to-end tests using two distinct partner accounts assigned to the same project.


## Latest partner-message access review
- Confirmed in the live Supabase schema that `partner_engagement_id` exists and references the partner engagement.
- Confirmed the old project-wide partner message policies have been replaced by engagement-scoped SELECT and INSERT policies.
- Confirmed the database check requires a non-null engagement ID for new `partner_update` messages. The constraint is intentionally `NOT VALID` to preserve historical records that cannot safely be attributed to a single partner.
- Confirmed the GitHub Actions/Vercel commit status remains blocked by Vercel's Hobby deployment-rate limit (build-rate-limit). No new successful build result is available for the latest messaging changes.


## Client and partner collaboration expansion (27 November 2026)
- The five-platform architecture visual is present on the homepage, `/platform`, and founder `/admin/platforms`. Subtle card motion and a restrained animated core indicator have been added. This is a visual architecture explainer, not evidence that every planned capability is complete.
- Added private client and partner project-file submission workflows. Clients can submit to projects linked to their client contact; partners can submit only against an exact engagement linked to their partner account.
- Added `project_file_submissions` with uploader identity, project/engagement scope, file metadata, review status and review notes. Files are stored in the private `babtek-private` bucket with 50 MB and MIME restrictions.
- Added a founder/staff review queue at `/admin/file-submissions`. Accepting a submission atomically creates a project document with both client and partner visibility disabled. BABTEK must explicitly enable sharing later. Clients and partners can see the review state of their own submissions.
- Storage and database RLS policies enforce client-project and partner-engagement boundaries. End-to-end testing with real client and partner accounts remains outstanding; the database currently has zero file submissions.
- Expanded the partner relationship model with type, specialties, division affiliations, website and relationship status. New partner records begin as prospects. This is a flexible enterprise relationship network, not an architecture-only directory. Portal-account invitations and self-service claim/acceptance are still future work; current linking remains founder-managed.
- Added a live workspace refresh indicator and refresh-on-focus / 30-second refresh for founder overview, client portal, partner portal, communications and file review. This is periodic refresh, not push-based realtime messaging. Unread counters, notification inbox, message attachments, typing indicators and email notifications remain outstanding.
- The partner portal now uses broader "Partner workspace" language. The underlying database table retains its historical `professional_partners` name for compatibility.

## Current build verification after collaboration expansion
- Vercel preview deployment `dpl_DUUZMrVAjYPqJE5SPqboeLtFFWD8` for commit `57755651069cd7ffb850f4c439e4a3c4cd55145d` compiled successfully, then failed TypeScript validation in `app/admin/commercial/actions.ts` because a nullable quotation record was not narrowed. An explicit redirect guard has since been added in a later development commit.
- Later development commits have not received a fresh preview build. GitHub status continues to report Vercel `build-rate-limit`; do not claim the latest source passes a production build.
- Database migrations `20261127174044`, `20261127174055` and `20261127174158` are applied and their matching SQL files are committed in the development branch.
