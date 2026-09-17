create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    raise exception 'Role cannot be changed';
  end if;
  return new;
end;
$$;

create or replace function public.set_request_public_id()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.public_id is null or new.public_id = '' then
    new.public_id := 'EBM' || to_char(now(), 'YYMMDD') || lpad(floor(random() * 9000 + 1000)::int::text, 4, '0');
  end if;
  return new;
end;
$$;

create or replace function public.set_donation_ref()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.ref is null or new.ref = '' then
    new.ref := 'EBM-D-' || lpad(floor(random() * 9000 + 1000)::int::text, 4, '0');
  end if;
  return new;
end;
$$;

create index if not exists request_contacts_donor_id_idx on public.request_contacts (donor_id);

revoke all on function public.after_contact_insert() from public, anon, authenticated;
revoke all on function public.after_request_insert() from public, anon, authenticated;
revoke all on function public.after_request_status_change() from public, anon, authenticated;
revoke all on function public.after_response_insert() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.prevent_profile_role_change() from public, anon, authenticated;
revoke all on function public.set_request_public_id() from public, anon, authenticated;
revoke all on function public.set_donation_ref() from public, anon, authenticated;
revoke all on function public.is_hospital() from public, anon;
revoke all on function public.is_donor() from public, anon;
revoke all on function public.donor_incoming_requests() from public, anon;

grant execute on function public.is_hospital() to authenticated, service_role;
grant execute on function public.is_donor() to authenticated, service_role;
grant execute on function public.donor_incoming_requests() to authenticated, service_role;
