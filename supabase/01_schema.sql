-- BTX · 01 Esquema base. Ejecutar PRIMERO en Supabase > SQL Editor.
create table profiles(id uuid primary key references auth.users on delete cascade,role text not null default 'usuario' check (role in ('usuario','conductor','admin')),name text not null,phone text,avatar_url text,created_at timestamptz default now());
create table drivers(id uuid primary key references profiles on delete cascade,name text not null,plate text unique not null,id_number text,zone text not null,addr text,from_time time default '06:00',to_time time default '18:00',estado text default 'Activo' check (estado in ('Activo','En parada','Fuera de servicio')),share_location boolean default false,lat double precision,lng double precision,eta int default 5,pay text[] default '{Efectivo}',seen timestamptz default now());
create table reviews(id bigint generated always as identity primary key,plate text not null references drivers(plate) on delete cascade,user_id uuid references profiles default auth.uid(),stars int check (stars between 1 and 5),comment text,created_at timestamptz default now());
create table routes(id bigint generated always as identity primary key,name text not null,zone_a text not null,zone_b text not null);
create table tickets(id bigint generated always as identity primary key,user_id uuid references profiles default auth.uid(),message text not null,reply text,created_at timestamptz default now());
create table trips(id bigint generated always as identity primary key,driver_id uuid references drivers default auth.uid(),amount int check (amount >= 1000),created_at timestamptz default now());
create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into profiles(id,role,name,phone) values(new.id,case when new.raw_user_meta_data->>'role'='conductor' then 'conductor' else 'usuario' end,coalesce(new.raw_user_meta_data->>'name','Sin nombre'),new.raw_user_meta_data->>'phone'); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
create function is_admin() returns boolean language sql security definer set search_path=public stable as $$ select exists(select 1 from profiles where id=auth.uid() and role='admin') $$;
alter table profiles enable row level security;alter table drivers enable row level security;alter table reviews enable row level security;alter table routes enable row level security;alter table tickets enable row level security;alter table trips enable row level security;
revoke update on profiles from authenticated;grant update(name,phone,avatar_url) on profiles to authenticated;
create policy p_sel on profiles for select using (id=auth.uid() or is_admin());
create policy p_upd on profiles for update using (id=auth.uid() or is_admin());
create policy d_sel on drivers for select to authenticated using (true);
create policy d_ins on drivers for insert with check (id=auth.uid());
create policy d_upd on drivers for update using (id=auth.uid() or is_admin());
create policy d_del on drivers for delete using (is_admin());
create policy r_sel on reviews for select to authenticated using (true);
create policy r_ins on reviews for insert with check (user_id=auth.uid());
create policy ro_sel on routes for select to authenticated using (true);
create policy ro_adm on routes for all using (is_admin()) with check (is_admin());
create policy t_sel on tickets for select using (user_id=auth.uid() or is_admin());
create policy t_ins on tickets for insert with check (user_id=auth.uid());
create policy t_upd on tickets for update using (is_admin());
create policy tr_sel on trips for select using (driver_id=auth.uid() or is_admin());
create policy tr_ins on trips for insert with check (driver_id=auth.uid());
-- Permisos base (proyectos nuevos de Supabase ya no los dan solos)
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to authenticated;
grant insert on drivers, reviews, tickets, trips, routes to authenticated;
grant update on tickets, routes to authenticated;
grant delete on drivers, routes to authenticated;
grant usage, select on all sequences in schema public to authenticated;
-- Fotos de perfil
insert into storage.buckets(id,name,public) values('avatars','avatars',true);
create policy a_ins on storage.objects for insert to authenticated with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy a_upd on storage.objects for update to authenticated using (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
