drop policy if exists "Public can submit partner network applications" on public.partner_network_applications;
create policy "Public can submit partner network applications"
on public.partner_network_applications for insert to anon
with check (
  status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
  and partner_id is null
  and privacy_acknowledged = true
  and privacy_acknowledged_at is not null
  and char_length(applicant_name) between 2 and 160
  and char_length(experience_summary) between 20 and 5000
  and char_length(collaboration_interest) between 20 and 3000
);
