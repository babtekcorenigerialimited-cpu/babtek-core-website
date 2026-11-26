# BABTEK Core Nigeria Limited — Corporate Website

This repository is being developed into the public corporate website and, progressively, the shared digital platform for BABTEK Core Nigeria Limited.

## Approved brand direction

- Primary identity: blue, white and charcoal.
- Corporate tagline: **Building a Better Future.**
- Homepage headline: **Building Ideas. Engineering Possibilities. Creating Value.**
- Homepage visual direction: architecture-led.
- Domain: undecided; configure before production deployment.

## Product architecture

The long-term platform consists of five connected systems:

1. Corporate website.
2. Client management system.
3. Project operations platform.
4. BABTEK administration dashboard.
5. Technology ecosystem.

The current implementation focuses on the corporate website and its reusable application foundation.

## Technology

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- Supabase/PostgreSQL planned for backend services

Supabase is not yet configured. Do not commit credentials, service-role keys or other secrets.

## Run locally

Requirements: Node.js 20.9 or later and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Create a production build with:

```bash
npm run build
```

## Repository structure

- `app/` — application routes and global styles.
- `components/` — shared interface components.
- `documentation/` — architecture and implementation plans.
- `public/` — approved brand and project assets (to be populated).

The original `index.html` is retained during the transition and is not the new application entry point.

## Before production launch

- Select and configure the official domain.
- Configure production environment variables and backend services.
- Verify the CAC registration number and public business address.
- Confirm all contact details.
- Obtain permission for all project photography and case studies.
- Verify project statuses and professional credentials where relevant.
- Implement and test secure enquiry submission and data access controls.
- Configure hosting, backups, monitoring and deployment workflows.

## Development status

The application foundation and initial corporate homepage are being established on the `development/platform-foundation` branch. The `main` branch remains unchanged during this development stage.
