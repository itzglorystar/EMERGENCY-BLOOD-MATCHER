-- Stop defaulting every new account to Yaoundé so EBM works nationwide.

alter table public.profiles alter column city drop default;

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
    nullif(new.raw_user_meta_data->>'city', ''),
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

revoke all on function public.handle_new_user() from public, anon, authenticated;
