-- BTX · Migración v2. Ejecutar DESPUÉS del script original, en el SQL Editor de Supabase.

-- 1. Columnas nuevas (suspensión, verificación, foto, reportes)
alter table profiles add column suspended boolean not null default false;
alter table drivers  add column suspended boolean not null default false,
                     add column verified  boolean not null default false,
                     add column avatar_url text;
alter table tickets  add column kind text not null default 'soporte' check (kind in ('soporte','reporte')),
                     add column plate text references drivers(plate) on delete cascade on update cascade;

-- 2. Llaves foráneas que impedían borrar cuentas o cambiar placas
alter table reviews drop constraint reviews_plate_fkey,
  add constraint reviews_plate_fkey foreign key (plate) references drivers(plate) on delete cascade on update cascade;
alter table reviews drop constraint reviews_user_id_fkey,
  add constraint reviews_user_id_fkey foreign key (user_id) references profiles on delete set null;
alter table tickets drop constraint tickets_user_id_fkey,
  add constraint tickets_user_id_fkey foreign key (user_id) references profiles on delete cascade;
alter table trips drop constraint trips_driver_id_fkey,
  add constraint trips_driver_id_fkey foreign key (driver_id) references drivers on delete cascade;

-- 3. La identificación del conductor ya no la ve cualquier usuario autenticado
create table driver_private(id uuid primary key references drivers on delete cascade, id_number text);
insert into driver_private select id, id_number from drivers;
alter table drivers drop column id_number;
alter table driver_private enable row level security;
create policy dp_sel on driver_private for select using (id=auth.uid() or is_admin());

-- 4. El alta del conductor la hace el trigger (funciona aunque se confirme el correo)
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
declare m jsonb := new.raw_user_meta_data;
        r text  := case when m->>'role'='conductor' then 'conductor' else 'usuario' end;
        n text  := coalesce(nullif(trim(m->>'name'),''),'Sin nombre');
begin
  insert into profiles(id,role,name,phone) values(new.id,r,n,m->>'phone');
  if r='conductor' then
    insert into drivers(id,name,plate,zone,addr,from_time,to_time)
    values(new.id,n,upper(m->>'plate'),m->>'zone',m->>'addr',
           coalesce(nullif(m->>'from','')::time,'06:00'),coalesce(nullif(m->>'to','')::time,'18:00'));
    insert into driver_private(id,id_number) values(new.id,m->>'id_number');
  end if;
  return new;
end $$;

drop policy d_ins on drivers;  -- un pasajero ya no puede crearse una fila de conductor

-- 5. El conductor solo edita sus datos operativos (no placa, verificado ni suspendido)
revoke update on drivers from authenticated;
grant update(name,zone,addr,from_time,to_time,estado,share_location,lat,lng,eta,pay,seen) on drivers to authenticated;

create function sync_driver_from_profile() returns trigger
language plpgsql security definer set search_path=public as $$
begin update drivers set name=new.name, avatar_url=new.avatar_url where id=new.id; return new; end $$;
create trigger profile_to_driver after update of name,avatar_url on profiles
for each row execute function sync_driver_from_profile();

-- "seen" lo marca el servidor, no el reloj del celular
create function touch_seen() returns trigger language plpgsql as $$
begin if auth.uid()=old.id then new.seen:=now(); end if; return new; end $$;
create trigger drivers_seen before update on drivers for each row execute function touch_seen();

-- 6. Funciones solo para el admin
create function admin_set_flags(uid uuid, p_suspended boolean default null, p_verified boolean default null)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not is_admin() then raise exception 'solo admin'; end if;
  if p_suspended is not null then
    update profiles set suspended=p_suspended where id=uid;
    update drivers  set suspended=p_suspended where id=uid;
  end if;
  if p_verified is not null then update drivers set verified=p_verified where id=uid; end if;
end $$;
create function admin_set_plate(uid uuid, p text) returns void
language plpgsql security definer set search_path=public as $$
begin if not is_admin() then raise exception 'solo admin'; end if; update drivers set plate=upper(p) where id=uid; end $$;
create function admin_delete_user(uid uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not is_admin() then raise exception 'solo admin'; end if;
  if uid=auth.uid() then raise exception 'no puedes borrar tu propia cuenta'; end if;
  delete from auth.users where id=uid;
end $$;
revoke execute on function admin_set_flags(uuid,boolean,boolean), admin_set_plate(uuid,text), admin_delete_user(uuid) from public, anon;
grant  execute on function admin_set_flags(uuid,boolean,boolean), admin_set_plate(uuid,text), admin_delete_user(uuid) to authenticated;

-- placa libre (se consulta al registrarse, antes de tener sesión)
create function plate_free(p text) returns boolean language sql security definer set search_path=public stable as $$
  select not exists(select 1 from drivers where plate=upper(p)) $$;
grant execute on function plate_free(text) to anon, authenticated;

-- 7. Tres pasajeros distintos reportan "no está aquí" en 2 horas => "sin señal"
create function on_report() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.kind='reporte' and new.plate is not null and
     (select count(distinct user_id) from tickets
       where kind='reporte' and plate=new.plate and created_at>now()-interval '2 hours')>=3
  then update drivers set share_location=false where plate=new.plate; end if;
  return new;
end $$;
create trigger tickets_report after insert on tickets for each row execute function on_report();

-- 8. Tiempo real en el mapa
alter publication supabase_realtime add table drivers;

-- 9. Fotos de perfil (bucket público, solo JPEG de hasta 1 MB, cada usuario en su carpeta)
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('avatars','avatars',true,1048576,array['image/jpeg']) on conflict (id) do nothing;
create policy av_sel on storage.objects for select using (bucket_id='avatars');
create policy av_ins on storage.objects for insert to authenticated
  with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy av_upd on storage.objects for update to authenticated
  using (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);

-- 10. Primer administrador (cambia el correo, tras registrarte en la app):
-- update profiles set role='admin' where id=(select id from auth.users where email='TU_CORREO');
