# BABTEK Independent Professional Partner Portal

## Purpose
The partner portal supports BABTEK's current project-based model of engaging independent professionals and firms. It is not an employee HR system and does not imply that every discipline is an internal department or that a registered user has been engaged.

## Account lifecycle
1. A professional creates a portal login at `/partner/register` and confirms their email when email confirmation is enabled.
2. Registration alone grants no project or commercial access.
3. The professional shares their account UUID with BABTEK.
4. An owner verifies the person and existing `professional_partners` record in `/admin/partners`, then links the account.
5. The owner action grants the `partner` role and creates a `partner_user_links` association.
6. The user signs in at `/partner/login` and can view only records scoped to their linked partner identity.

## Current portal capabilities
- View own linked partner record(s).
- View own project engagements, agreed fee, scope, status, dates and payment terms.
- View tasks explicitly assigned to the linked partner record.
- Update assigned task status through an allowlisted server action.
- View payment schedules for own engagements, including planned amount, paid amount, status and due date.

## Access boundaries
- Partner users cannot create or link partner identities.
- Partner users cannot browse other partners' engagements or payment schedules.
- Task read access is scoped to tasks assigned to their linked partner record.
- Partner task updates are restricted by row-level security to assigned tasks; the server action only accepts status changes from an allowlist.
- Project documents are not yet exposed as downloadable files. A `partner_visible` flag and metadata read policy establish a future foundation, but private storage download permissions and UI must be implemented and tested separately.
- No partner-to-BABTEK chat, notification delivery, deliverable upload workflow, or timesheet module is claimed as live.
- Partner payment schedule is an operational record, not proof of bank settlement.

## Founder workflow
- Create a partner record in `/admin/partners`.
- Ask the professional to register and confirm their email.
- Verify identity and professional relationship independently.
- Link the user's account UUID to the partner record using the owner-only form.
- Create the project and a partner engagement in the project operations workflow.
- Assign project tasks to that partner record.
- Maintain payment stages in the finance workflow and reconcile actual payments separately.

## Production readiness still required
Before external partner onboarding at scale, test with separate partner accounts and at least two partner records on one project. Verify that each partner cannot see the other's agreed fee, payment schedule, assigned tasks, or private files. Add rate limiting, operational monitoring, document download authorization, notifications, and audit coverage for partner task updates.
