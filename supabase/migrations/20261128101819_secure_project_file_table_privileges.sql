-- Private file intake tables are not public API resources.
-- Remove the anon role's table privileges entirely; authenticated access
-- remains governed by the existing role- and ownership-scoped RLS policies.
revoke all privileges on table public.project_file_submissions from anon;
revoke all privileges on table public.project_documents from anon;

-- RLS does not govern table-level TRUNCATE, REFERENCES, TRIGGER or MAINTAIN.
-- Keep normal row-level DML available to authenticated users, but remove
-- structural/maintenance privileges that portal users never need.
revoke truncate, references, trigger, maintain
on table public.project_file_submissions, public.project_documents
from authenticated;
