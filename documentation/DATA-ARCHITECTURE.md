# BABTEK platform data architecture

## Purpose
Initial Supabase/PostgreSQL foundation for BABTEK's corporate website and planned client, project, administration and technology systems. It supports the current founder-led, partner-coordinated operating model and future scale. The migration creates schema only; it does not seed fictional clients, staff, partners, projects or financial activity.

## Domains
- Corporate publishing: divisions, services, pages, approved portfolio/media, insights, careers, partnership opportunities and product initiatives.
- Enquiries: public intake, internal status management and activity history.
- Relationships: client organisations/contacts and independent professional partners/linked accounts.
- Delivery: projects, participating divisions, members, specialist engagements, milestones, tasks and documents.
- Commercial: quotations, agreements, invoices, line items and client payments.
- Finance: partner payment schedules, expenses, project margin summaries.
- Governance: profiles, role assignments and audit records.

## Commercial model
Client fees are recorded on projects. Specialist fees are recorded on partner engagements and staged payment records. Other direct costs are expenses. Gross project margin is client fee less specialist cost and other direct project costs; it is not net profit and excludes unallocated overhead and tax.

BABTEK's working payment practice—typically paying specialist engagements in full at or below ₦200,000 and in stages above ₦200,000—is intentionally not hard-coded. Record the agreed schedule per engagement because individual terms may vary.

## Security
RLS is enabled across application tables. Anonymous users can submit enquiries and read only published corporate content. Operational, client, partner and finance records have role- or relationship-scoped policies. Finance access is restricted to owner, administrator and finance roles.

This is a first security baseline, not a production security certification. Before live use, test each role with separate accounts, review all policies and functions, configure private Storage buckets and object policies, and verify backups and restore procedures. The first owner role must be assigned manually after confirming the founder's Supabase Auth UUID.

## Setup
1. Create a Supabase project in a BABTEK-controlled account.
2. Apply the SQL migration in `supabase/migrations/` using Supabase CLI or SQL editor.
3. Copy `.env.example` to the local environment file and set the project URL and anon/publishable key.
4. Keep service-role credentials server-only; never commit them or expose them with a NEXT_PUBLIC_ prefix.
5. Configure Auth providers and redirect URLs after the official domain is selected.
6. Create private Storage buckets and bucket-specific RLS policies before uploading client or company documents.
7. Create the founder's Auth account, verify the UUID, then grant the owner role through a trusted SQL session.
8. Test public, owner, finance, client and partner access paths before entering real company data.

## Deferred to later increments
Supabase app clients, authentication UI, live enquiry endpoint with validation and rate limiting, storage policies, invoice calculations/numbering, payment reconciliation, automatic margin rollups, immutable audit triggers, portals, and production deployment. These require the Supabase project and secure environment configuration.
