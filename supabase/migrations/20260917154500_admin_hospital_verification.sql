-- Admin role, hospital verification, and account status controls

alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('hospital', 'donor', 'admin'));

alter table public.profiles
  add column if not exists account_status text not null default 'active',
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references public.profiles (id) on delete set null,
  add column if not exists rejected_reason text;

alter table public.profiles drop constraint if exists profiles_account_status_check;
alter table public.profiles
  add constraint profiles_account_status_check
  check (account_status in ('pending', 'active', 'rejected', 'suspended'));

create index if not exists profiles_account_status_idx on public.profiles (account_status);
create index if not exists profiles_role_status_idx on public.profiles (role, account_status);

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check
  check (type in ('match', 'confirmed', 'sent', 'thanks', 'account'));

create table if not exists public.account_reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  reviewer_id uuid references public.profiles (id) on delete set null,
  action text not null check (action in ('approved', 'rejected', 'suspended', 'activated')),
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists account_reviews_profile_id_idx on public.account_reviews (profile_id);
create index if not exists account_reviews_created_at_idx on public.account_reviews (created_at desc);

alter table public.account_reviews enable row level security;
alter table public.account_reviews force row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and account_status = 'active'
  );
$$;

create or replace function public.is_hospital()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'hospital'
      and account_status = 'active'
  );
$$;

create or replace function public.is_donor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'donor'
      and account_status = 'active'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_role text;
  chosen_status text;
begin
  chosen_role := nullif(new.raw_app_meta_data->>'role', '');

  if chosen_role is null then
    chosen_role := coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'donor');
    if chosen_role not in ('hospital', 'donor') then
      chosen_role := 'donor';
    end if;
  elsif chosen_role not in ('hospital', 'donor', 'admin') then
    chosen_role := 'donor';
  end if;

  chosen_status := case when chosen_role = 'hospital' then 'pending' else 'active' end;

  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
    'role', chosen_role,
    'account_status', chosen_status
  )
  where id = new.id;

  insert into public.profiles (
    id, role, full_name, email, phone, blood_group, gender, city, address, available, account_status
  ) values (
    new.id,
    chosen_role,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.raw_user_meta_data->>'phone',
    nullif(new.raw_user_meta_data->>'blood_group', ''),
    new.raw_user_meta_data->>'gender',
    coalesce(nullif(new.raw_user_meta_data->>'city', ''), 'Yaoundé'),
    nullif(new.raw_user_meta_data->>'address', ''),
    true,
    chosen_status
  );

  if chosen_role = 'hospital' then
    insert into public.notifications (user_id, type, title, message)
    values (
      new.id,
      'account',
      'Hospital verification required',
      'Your hospital account is pending review. An EBM administrator must verify and approve it before you can request blood.'
    );
  end if;

  return new;
end;
$$;

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if not (
      new.role = 'admin'
      and exists (
        select 1 from auth.users u
        where u.id = new.id and coalesce(u.raw_app_meta_data->>'role', '') = 'admin'
      )
    ) then
      raise exception 'Role cannot be changed';
    end if;
  end if;

  if not public.is_admin() then
    if new.role is distinct from 'admin' then
      new.account_status := old.account_status;
      new.verified_at := old.verified_at;
      new.verified_by := old.verified_by;
      new.rejected_reason := old.rejected_reason;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
drop function if exists public.prevent_profile_role_change();

drop trigger if exists profiles_protect_privileges on public.profiles;
create trigger profiles_protect_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();

create or replace function public.sync_profile_admin_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.raw_app_meta_data->>'role', '') = 'admin'
     and coalesce(old.raw_app_meta_data->>'role', '') is distinct from 'admin' then
    update public.profiles
    set role = 'admin', account_status = 'active'
    where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_app_metadata on auth.users;
create trigger on_auth_user_app_metadata
  after update of raw_app_meta_data on auth.users
  for each row execute function public.sync_profile_admin_role();

create or replace function public.admin_set_account_status(
  target_id uuid,
  new_status text,
  reason text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.profiles%rowtype;
  actor uuid := (select auth.uid());
  review_action text;
  notice_title text;
  notice_message text;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can change account status';
  end if;

  if new_status not in ('active', 'rejected', 'suspended') then
    raise exception 'Invalid account status';
  end if;

  if target_id = actor then
    raise exception 'You cannot change your own account status';
  end if;

  select * into target from public.profiles where id = target_id;
  if not found then
    raise exception 'Account not found';
  end if;

  if target.role = 'admin' then
    raise exception 'Administrator accounts cannot be modified this way';
  end if;

  if new_status = 'rejected' then
    if target.role is distinct from 'hospital' then
      raise exception 'Only hospital accounts can be rejected';
    end if;
    if coalesce(nullif(trim(reason), ''), '') = '' then
      raise exception 'A reason is required to reject a hospital';
    end if;
  end if;

  if new_status = 'active' and target.role = 'hospital' then
    review_action := case when target.account_status = 'pending' then 'approved' else 'activated' end;
    notice_title := case when review_action = 'approved' then 'Hospital approved' else 'Hospital reactivated' end;
    notice_message := 'Your hospital account has been verified. You can now request blood and use the hospital portal.';
  elsif new_status = 'rejected' then
    review_action := 'rejected';
    notice_title := 'Hospital not approved';
    notice_message := 'Your hospital account was not approved. Reason: ' || trim(reason);
  else
    review_action := 'suspended';
    notice_title := 'Account suspended';
    notice_message := coalesce(nullif(trim(reason), ''), 'Your EBM account has been suspended by an administrator.');
  end if;

  update public.profiles
  set
    account_status = new_status,
    verified_at = case when new_status = 'active' then now() else verified_at end,
    verified_by = case when new_status = 'active' then actor else verified_by end,
    rejected_reason = case
      when new_status = 'rejected' then trim(reason)
      when new_status = 'active' then null
      else rejected_reason
    end,
    available = case
      when new_status = 'active' then available
      else false
    end
  where id = target_id
  returning * into target;

  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
    'role', target.role,
    'account_status', new_status
  )
  where id = target_id;

  insert into public.account_reviews (profile_id, reviewer_id, action, reason)
  values (target_id, actor, review_action, nullif(trim(reason), ''));

  insert into public.notifications (user_id, type, title, message)
  values (target_id, 'account', notice_title, notice_message);

  return target;
end;
$$;

create or replace function public.after_request_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  match_count integer;
begin
  select count(*)::int into match_count
  from public.profiles
  where role = 'donor'
    and account_status = 'active'
    and available = true
    and blood_group = new.blood_group;

  update public.blood_requests
  set matches_found = match_count
  where id = new.id;

  insert into public.notifications (user_id, type, title, message)
  values (
    new.created_by,
    'sent',
    'Request sent',
    'Your emergency request ' || new.public_id || ' was submitted successfully.'
  );

  insert into public.notifications (user_id, type, title, message)
  values (
    new.created_by,
    'match',
    'New matches found',
    match_count || ' compatible ' || new.blood_group || ' donors are available near ' || new.hospital_name || '.'
  );

  insert into public.notifications (user_id, type, title, message)
  select
    p.id,
    'match',
    'New blood request near you',
    'New blood request near you (' || new.blood_group || ', ' || coalesce(new.distance_km, 2.5) || ' km) at ' || new.hospital_name || '.'
  from public.profiles p
  where p.role = 'donor'
    and p.account_status = 'active'
    and p.available = true
    and p.blood_group = new.blood_group;

  return new;
end;
$$;

create or replace function public.donor_incoming_requests()
returns table (
  id uuid,
  public_id text,
  patient_display text,
  patient_full text,
  blood_group text,
  units integer,
  hospital_name text,
  hospital_contact text,
  hospital_location text,
  distance_km numeric,
  needed_by timestamptz,
  urgency text,
  status text,
  my_decision text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  donor_group text;
begin
  if not public.is_donor() then
    return;
  end if;

  select p.blood_group into donor_group
  from public.profiles p
  where p.id = (select auth.uid());

  return query
  select
    r.id,
    r.public_id,
    case
      when resp.decision = 'accepted' then r.patient_name
      else trim(
        split_part(r.patient_name, ' ', 1) || ' ' ||
        case
          when split_part(r.patient_name, ' ', 2) <> '' then left(split_part(r.patient_name, ' ', 2), 1) || '.'
          else ''
        end
      )
    end,
    case when resp.decision = 'accepted' then r.patient_name else null end,
    r.blood_group,
    r.units,
    r.hospital_name,
    case when resp.decision = 'accepted' then r.hospital_contact else null end,
    case when resp.decision = 'accepted' then r.hospital_location else null end,
    r.distance_km,
    r.needed_by,
    r.urgency,
    r.status,
    resp.decision,
    r.created_at
  from public.blood_requests r
  join public.profiles hp
    on hp.id = r.created_by
   and hp.role = 'hospital'
   and hp.account_status = 'active'
  left join public.request_responses resp
    on resp.request_id = r.id and resp.donor_id = (select auth.uid())
  where r.status <> 'Cancelled'
    and r.blood_group = donor_group
  order by r.distance_km asc nulls last, r.created_at desc;
end;
$$;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select
  on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or (select public.is_admin())
    or ((select public.is_hospital()) and role = 'donor' and account_status = 'active')
  );

drop policy if exists requests_select on public.blood_requests;
create policy requests_select
  on public.blood_requests for select to authenticated
  using (
    created_by = (select auth.uid())
    or (select public.is_hospital())
    or (select public.is_admin())
  );

drop policy if exists responses_select on public.request_responses;
create policy responses_select
  on public.request_responses for select to authenticated
  using (
    donor_id = (select auth.uid())
    or (select public.is_admin())
    or exists (
      select 1 from public.blood_requests r
      where r.id = request_id and r.created_by = (select auth.uid())
    )
  );

drop policy if exists contacts_select on public.request_contacts;
create policy contacts_select
  on public.request_contacts for select to authenticated
  using (
    donor_id = (select auth.uid())
    or (select public.is_admin())
    or exists (
      select 1 from public.blood_requests r
      where r.id = request_id and r.created_by = (select auth.uid())
    )
  );

drop policy if exists donations_select on public.donations;
create policy donations_select
  on public.donations for select to authenticated
  using (
    donor_id = (select auth.uid())
    or (select public.is_hospital())
    or (select public.is_admin())
  );

drop policy if exists blood_stock_admin_select on public.blood_stock;
create policy blood_stock_admin_select
  on public.blood_stock for select to authenticated
  using ((select public.is_admin()));

drop policy if exists account_reviews_select on public.account_reviews;
create policy account_reviews_select
  on public.account_reviews for select to authenticated
  using (
    profile_id = (select auth.uid())
    or (select public.is_admin())
  );

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'profiles'
  ) then
    execute 'alter publication supabase_realtime add table public.profiles';
  end if;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.protect_profile_privileges() from public, anon, authenticated;
revoke all on function public.sync_profile_admin_role() from public, anon, authenticated;
revoke all on function public.admin_set_account_status(uuid, text, text) from public, anon;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_hospital() from public, anon;
revoke all on function public.is_donor() from public, anon;
revoke all on function public.donor_incoming_requests() from public, anon;

grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.is_hospital() to authenticated, service_role;
grant execute on function public.is_donor() to authenticated, service_role;
grant execute on function public.donor_incoming_requests() to authenticated, service_role;
grant execute on function public.admin_set_account_status(uuid, text, text) to authenticated, service_role;
