# BABTEK Owner Dashboard

## Current implementation

The development branch includes an initial owner-only workspace at `/admin` and a sign-in page at `/admin/login`.

The dashboard currently reads live, role-protected records from Supabase:
- Enquiry, project, client and professional-partner record counts
- Recent enquiry and project records
- A clearly labelled outstanding-invoice snapshot
- The eight BABTEK divisions
- An owner-only enquiry register with controlled status updates (new, reviewing, qualified, quoted, converted, declined and closed)

The finance figure is the sum of recorded invoices in issued, partially paid or overdue states within the dashboard's 500-record read window. It is not cash received, profit, a reconciled ledger or an accounts balance. The platform currently has no seeded operational transactions, so empty/zero records are expected until real business data is entered.

## Authentication and authorisation

- Supabase Auth password sign-in is used through `@supabase/ssr`.
- The server dashboard validates the user with `auth.getUser()`.
- The dashboard separately checks the signed-in user's `owner` role in `public.user_roles`.
- Existing Row Level Security remains the database enforcement layer.
- The route middleware refreshes the Supabase session and applies private/no-store cache headers to the admin workspace.
- The browser receives only the Supabase publishable/legacy anon key. Never configure a service-role or secret key in a `NEXT_PUBLIC_*` variable.

## Environment configuration

Configure the following in the local environment and hosting provider before the dashboard can authenticate:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-key>
```

The existing variable name is retained for compatibility with the public enquiry endpoint; the value should be the Supabase publishable key. The key is public by design and must be protected by RLS, not treated as a server secret.

## Still required before launch

1. Configure environment variables in the hosting provider.
2. Install dependencies and run `npm run typecheck` and `npm run build`.
3. Test owner sign-in, sign-out, session refresh, and non-owner denial.
4. Test RLS with owner, client and partner test accounts.
5. Add password recovery and stronger account lifecycle controls.
6. Add paginated registers, filters, detail views and controlled create/update workflows.
7. Add audit-log views and a proper financial ledger/reconciliation model before using financial summaries for decisions.
8. Add rate limiting, monitoring and deployment security review.

This is a development foundation, not a production-ready ERP. No production deployment or main-branch merge is authorised by this work.
