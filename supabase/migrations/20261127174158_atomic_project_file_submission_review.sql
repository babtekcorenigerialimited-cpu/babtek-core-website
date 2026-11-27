create or replace function public.review_project_file_submission(
 p_submission_id uuid,
 p_decision text,
 p_review_note text default null
) returns uuid
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
 v_submission public.project_file_submissions%rowtype;
 v_document_id uuid;
begin
 if not public.has_role(array['owner','administrator','operations']::public.app_role[]) then
   raise exception 'Not authorised';
 end if;
 if p_decision not in ('accepted','changes_requested','rejected') then
   raise exception 'Invalid review decision';
 end if;
 select * into v_submission from public.project_file_submissions
 where id = p_submission_id for update;
 if not found then raise exception 'Submission not found'; end if;
 if v_submission.review_status <> 'pending' then raise exception 'Submission already reviewed'; end if;
 if p_decision = 'accepted' then
   insert into public.project_documents(project_id,title,document_type,storage_path,version_label,uploaded_by,client_visible,partner_visible)
   values(v_submission.project_id,v_submission.title,v_submission.mime_type,v_submission.storage_path,'Submitted by portal user',v_submission.uploader_id,false,false)
   returning id into v_document_id;
 end if;
 update public.project_file_submissions set
   review_status=p_decision,
   review_note=nullif(left(coalesce(p_review_note,''),2000),''),
   reviewed_by=auth.uid(),
   reviewed_at=now()
 where id=p_submission_id;
 return v_document_id;
end;
$$;
revoke all on function public.review_project_file_submission(uuid,text,text) from public, anon;
grant execute on function public.review_project_file_submission(uuid,text,text) to authenticated;