# BABTEK Digital Platform — Technical Architecture

**Status:** Initial implementation baseline  
**Design direction:** Blue, white and charcoal; architecture-led corporate identity.

## Product structure

The platform is planned as five connected systems:

1. Public corporate website.
2. Client management system.
3. Project operations platform.
4. BABTEK administration dashboard.
5. Technology ecosystem.

The first release focuses on the corporate website while establishing a codebase that can accommodate the remaining systems.

## Current application foundation

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Reusable site header and footer
- Central global design tokens and responsive styles

## Planned backend

Supabase/PostgreSQL is the proposed backend for authentication, relational data and file storage. It is not configured yet. No credentials or private keys should be committed to this repository.

## Planned domains and deployment

The corporate domain remains undecided. Deployment will be configured after domain selection and environment setup. The current metadata base URL is a placeholder and must be replaced before production.

## Security requirements

- Server-side validation for all submitted data.
- Row-level security for client, partner and internal records.
- Private storage for confidential documents.
- Role-based access to administrative functions.
- Environment variables for secrets.
- Audit records for sensitive business operations.

## Content integrity

BABTEK is currently founder-led and coordinates specialist work through independent professionals. Public content must distinguish current capabilities, partner-coordinated services, concepts and future plans. Concept imagery must not be represented as completed BABTEK projects.
