-- EBM core schema, RLS, and auth profile trigger

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('hospital', 'donor')),
  full_name text not null default '',
  email text,
  phone text,
  avatar_url text,
  blood_group text check (blood_group in ('O+','O-','A+','A-','B+','B-','AB+','AB-')),
  gender text,
  date_of_birth date,
  weight numeric,
  last_donation date,
  can_donate_after date generated always as (
    case when last_donation is null then null else (last_donation + interval '3 months')::date end
  ) stored,
  address text,
  emergency_contact text,
  city text default 'Yaoundé',
  location_label text,
  distance_km numeric(4,1) default 3.0,
  available boolean not null default true,
  notes text default 'Health: Healthy, No medication',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);
create index profiles_blood_group_idx on public.profiles (blood_group);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role then
    raise exception 'Role cannot be changed';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_profile_role_change();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_role text;
begin
  chosen_role := coalesce(new.raw_app_meta_data->>'role', new.raw_user_meta_data->>'role', 'donor');
  if chosen_role not in ('hospital', 'donor') then
    chosen_role := 'donor';
  end if;

  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', chosen_role)
  where id = new.id;

  insert into public.profiles (
    id, role, full_name, email, phone, blood_group, gender, city, available
  ) values (
    new.id,
    chosen_role,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'blood_group',
    new.raw_user_meta_data->>'gender',
    coalesce(new.raw_user_meta_data->>'city', 'Yaoundé'),
    true
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.blood_requests (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  created_by uuid not null references public.profiles (id) on delete cascade,
  patient_name text not null,
  blood_group text not null check (blood_group in ('O+','O-','A+','A-','B+','B-','AB+','AB-')),
  units integer not null default 1 check (units between 1 and 20),
  hospital_name text not null,
  hospital_contact text,
  hospital_location text,
  distance_km numeric(4,1) default 2.5,
  needed_by timestamptz,
  urgency text not null default 'High (Emergency)' check (urgency in ('High (Emergency)', 'Medium', 'Low')),
  status text not null default 'Active' check (status in ('Active', 'Matched', 'Completed', 'Cancelled')),
  matches_found integer not null default 0,
  confirmed_count integer not null default 0,
  in_progress_count integer not null default 0,
  completed_units integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blood_requests_created_by_idx on public.blood_requests (created_by);
create index blood_requests_blood_group_idx on public.blood_requests (blood_group);
create index blood_requests_status_idx on public.blood_requests (status);

create trigger blood_requests_set_updated_at
  before update on public.blood_requests
  for each row execute function public.set_updated_at();

create or replace function public.set_request_public_id()
returns trigger
language plpgsql
as $$
begin
  if new.public_id is null or new.public_id = '' then
    new.public_id := 'EBM' || to_char(now(), 'YYMMDD') || lpad(floor(random() * 9000 + 1000)::int::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger blood_requests_set_public_id
  before insert on public.blood_requests
  for each row execute function public.set_request_public_id();

create table public.request_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.blood_requests (id) on delete cascade,
  donor_id uuid not null references public.profiles (id) on delete cascade,
  decision text not null check (decision in ('accepted', 'declined')),
  created_at timestamptz not null default now(),
  unique (request_id, donor_id)
);

create index request_responses_request_id_idx on public.request_responses (request_id);
create index request_responses_donor_id_idx on public.request_responses (donor_id);

create table public.request_contacts (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.blood_requests (id) on delete cascade,
  donor_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (request_id, donor_id)
);

create index request_contacts_request_id_idx on public.request_contacts (request_id);

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,
  donor_id uuid references public.profiles (id) on delete set null,
  request_id uuid references public.blood_requests (id) on delete set null,
  donated_on date not null default current_date,
  blood_group text not null,
  units integer not null default 1,
  hospital_name text,
  status text not null default 'Completed',
  created_at timestamptz not null default now()
);

create index donations_donor_id_idx on public.donations (donor_id);
create index donations_request_id_idx on public.donations (request_id);

create or replace function public.set_donation_ref()
returns trigger
language plpgsql
as $$
begin
  if new.ref is null or new.ref = '' then
    new.ref := 'EBM-D-' || lpad(floor(random() * 9000 + 1000)::int::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger donations_set_ref
  before insert on public.donations
  for each row execute function public.set_donation_ref();

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null default 'sent' check (type in ('match', 'confirmed', 'sent', 'thanks')),
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id);
create index notifications_user_unread_idx on public.notifications (user_id, read);

create table public.blood_stock (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references public.profiles (id) on delete set null,
  blood_type text not null check (blood_type in ('O+','O-','A+','A-','B+','B-','AB+','AB-')),
  units integer not null default 0,
  status text not null default 'Adequate' check (status in ('Adequate', 'Low', 'Critical')),
  hospital_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blood_stock_hospital_id_idx on public.blood_stock (hospital_id);

create trigger blood_stock_set_updated_at
  before update on public.blood_stock
  for each row execute function public.set_updated_at();

create or replace function public.is_hospital()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'hospital'
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
    where id = (select auth.uid()) and role = 'donor'
  );
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
    and p.available = true
    and p.blood_group = new.blood_group;

  return new;
end;
$$;

create trigger blood_requests_after_insert
  after insert on public.blood_requests
  for each row execute function public.after_request_insert();

create or replace function public.after_response_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.blood_requests%rowtype;
  donor_name text;
begin
  select * into req from public.blood_requests where id = new.request_id;
  select full_name into donor_name from public.profiles where id = new.donor_id;

  if new.decision = 'accepted' then
    update public.blood_requests
    set
      confirmed_count = confirmed_count + 1,
      status = case when status = 'Completed' then status else 'Matched' end
    where id = new.request_id;

    insert into public.notifications (user_id, type, title, message)
    values (
      req.created_by,
      'confirmed',
      'Donor confirmed',
      coalesce(donor_name, 'A donor') || ' accepted request ' || req.public_id || ' and can donate ' || req.blood_group || '.'
    );

    insert into public.notifications (user_id, type, title, message)
    values (
      new.donor_id,
      'confirmed',
      'Request confirmed',
      'You accepted a ' || req.blood_group || ' request at ' || req.hospital_name || '. Contact details are now visible.'
    );
  end if;

  return new;
end;
$$;

create trigger request_responses_after_insert
  after insert on public.request_responses
  for each row execute function public.after_response_insert();

create or replace function public.after_contact_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.blood_requests%rowtype;
  donor_name text;
begin
  select * into req from public.blood_requests where id = new.request_id;
  select full_name into donor_name from public.profiles where id = new.donor_id;

  update public.blood_requests
  set
    confirmed_count = confirmed_count + 1,
    in_progress_count = greatest(in_progress_count, 1),
    status = case when status = 'Completed' then status else 'Matched' end
  where id = new.request_id;

  insert into public.notifications (user_id, type, title, message)
  values (
    req.created_by,
    'confirmed',
    'Donor confirmed',
    coalesce(donor_name, 'A donor') || ' was contacted and marked as a confirmed match.'
  );

  return new;
end;
$$;

create trigger request_contacts_after_insert
  after insert on public.request_contacts
  for each row execute function public.after_contact_insert();

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
  left join public.request_responses resp
    on resp.request_id = r.id and resp.donor_id = (select auth.uid())
  where r.status <> 'Cancelled'
    and r.blood_group = donor_group
  order by r.distance_km asc nulls last, r.created_at desc;
end;
$$;

alter table public.profiles enable row level security;
alter table public.blood_requests enable row level security;
alter table public.request_responses enable row level security;
alter table public.request_contacts enable row level security;
alter table public.donations enable row level security;
alter table public.notifications enable row level security;
alter table public.blood_stock enable row level security;

alter table public.profiles force row level security;
alter table public.blood_requests force row level security;
alter table public.request_responses force row level security;
alter table public.request_contacts force row level security;
alter table public.donations force row level security;
alter table public.notifications force row level security;
alter table public.blood_stock force row level security;

create policy profiles_select
  on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or ((select public.is_hospital()) and role = 'donor')
  );

create policy profiles_update_own
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy requests_select
  on public.blood_requests for select to authenticated
  using (
    created_by = (select auth.uid())
    or (select public.is_hospital())
  );

create policy requests_insert_hospital
  on public.blood_requests for insert to authenticated
  with check (
    (select public.is_hospital())
    and created_by = (select auth.uid())
  );

create policy requests_update_hospital
  on public.blood_requests for update to authenticated
  using (created_by = (select auth.uid()) and (select public.is_hospital()))
  with check (created_by = (select auth.uid()) and (select public.is_hospital()));

create policy responses_select
  on public.request_responses for select to authenticated
  using (
    donor_id = (select auth.uid())
    or exists (
      select 1 from public.blood_requests r
      where r.id = request_id and r.created_by = (select auth.uid())
    )
  );

create policy responses_insert_donor
  on public.request_responses for insert to authenticated
  with check (
    donor_id = (select auth.uid())
    and (select public.is_donor())
  );

create policy contacts_select
  on public.request_contacts for select to authenticated
  using (
    exists (
      select 1 from public.blood_requests r
      where r.id = request_id and r.created_by = (select auth.uid())
    )
    or donor_id = (select auth.uid())
  );

create policy contacts_insert_hospital
  on public.request_contacts for insert to authenticated
  with check (
    (select public.is_hospital())
    and exists (
      select 1 from public.blood_requests r
      where r.id = request_id and r.created_by = (select auth.uid())
    )
  );

create policy donations_select
  on public.donations for select to authenticated
  using (
    donor_id = (select auth.uid())
    or (select public.is_hospital())
  );

create policy donations_insert
  on public.donations for insert to authenticated
  with check (
    donor_id = (select auth.uid())
    or (select public.is_hospital())
  );

create policy notifications_select_own
  on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));

create policy notifications_update_own
  on public.notifications for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy blood_stock_hospital
  on public.blood_stock for all to authenticated
  using ((select public.is_hospital()))
  with check ((select public.is_hospital()));

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated, service_role;
grant select on all tables in schema public to anon;
grant execute on function public.donor_incoming_requests() to authenticated, service_role;
grant execute on function public.is_hospital() to authenticated, service_role;
grant execute on function public.is_donor() to authenticated, service_role;

alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.blood_requests;

create or replace function public.after_request_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from 'Completed' and new.status = 'Completed' then
    insert into public.notifications (user_id, type, title, message)
    values (
      new.created_by,
      'thanks',
      'Thank you',
      new.patient_name || '''s transfusion is complete. Your match helped save a life.'
    );

    insert into public.notifications (user_id, type, title, message)
    select
      resp.donor_id,
      'thanks',
      'Thank you',
      'Thank you! Your donation saved a life.'
    from public.request_responses resp
    where resp.request_id = new.id and resp.decision = 'accepted';
  end if;
  return new;
end;
$$;

create trigger blood_requests_after_status
  after update of status on public.blood_requests
  for each row execute function public.after_request_status_change();
