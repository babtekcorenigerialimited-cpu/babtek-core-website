
revoke insert, update, delete on public.partner_payment_schedules from anon, authenticated;
grant select on public.partner_payment_schedules to authenticated;
revoke all on public.partner_payment_transactions from anon, authenticated;
grant select on public.partner_payment_transactions to authenticated;
