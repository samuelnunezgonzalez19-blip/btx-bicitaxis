-- BTX · 03 Demo completa: cuentas con clave, conductores, reseñas, viajes, rutas y soporte.
-- Se puede ejecutar varias veces (borra y recrea la demo).
-- Cuentas: admin@btx.co / Admin2026 · pasajero@btx.co / Demo12345 · conductor@btx.co / Demo12345
delete from auth.users where email like '%@demo.btx.co' or email in ('admin@btx.co','pasajero@btx.co','conductor@btx.co');
delete from routes;
do $$
declare uid uuid; r record;
begin
 for r in select * from (values
  ('admin@btx.co','Admin2026','admin','Administrador','3000000000',null,null,null),
  ('pasajero@btx.co','Demo12345','usuario','Laura Gómez','3001112233',null,null,null),
  ('conductor@btx.co','Demo12345','conductor','Juan Pérez','3104445566','KEN10','Kennedy','Cra 68 #38 Sur'),
  ('bos13@demo.btx.co','Demo12345','conductor','Luis Gómez','3104440002','BOS13','Bosa','Cra 80 #65 Sur'),
  ('sub16@demo.btx.co','Demo12345','conductor','Carlos Rojas','3104440003','SUB16','Suba','Cl 145 #91'),
  ('eng19@demo.btx.co','Demo12345','conductor','Andrés Mora','3104440004','ENG19','Engativá','Cl 72 #100'),
  ('fon22@demo.btx.co','Demo12345','conductor','Pedro Díaz','3104440005','FON22','Fontibón','Cl 17 #99'),
  ('usa25@demo.btx.co','Demo12345','conductor','Mario Ruiz','3104440006','USA25','Usaquén','Cra 7 #119'),
  ('cha28@demo.btx.co','Demo12345','conductor','José Torres','3104440007','CHA28','Chapinero','Cra 13 #63'),
  ('cbo31@demo.btx.co','Demo12345','conductor','Camilo León','3104440008','CBO31','Ciudad Bolívar','Cl 70 Sur #19')
 ) v(email,pw,role,name,phone,plate,zone,addr) loop
  uid:=gen_random_uuid();
  insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change,email_change_token_new)
  values('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated',r.email,crypt(r.pw,gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}',
   jsonb_build_object('role',case when r.role='conductor' then 'conductor' else 'usuario' end,'name',r.name,'phone',r.phone,'plate',r.plate,'zone',r.zone,'addr',r.addr,'from','00:00','to','23:59','id_number','1000000000'),now(),now(),'','','','');
  insert into auth.identities(id,user_id,provider_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
  values(gen_random_uuid(),uid,uid::text,jsonb_build_object('sub',uid::text,'email',r.email,'email_verified',true),'email',now(),now(),now());
 end loop;
end $$;
update profiles set role='admin' where id=(select id from auth.users where email='admin@btx.co');
update drivers set share_location=true,verified=true,seen=now(),eta=3+abs(hashtext(plate))%14,
  pay=case when plate in ('BOS13','SUB16','FON22') then '{Efectivo,Nequi}'::text[] else '{Efectivo}'::text[] end,
  estado=case when plate in ('BOS13','CHA28') then 'En parada' else 'Activo' end;
insert into routes(name,zone_a,zone_b) values('Kennedy–Bosa','Kennedy','Bosa'),('Suba–Engativá','Suba','Engativá'),('Chapinero–Usaquén','Chapinero','Usaquén'),('Fontibón–Engativá','Fontibón','Engativá');
insert into reviews(plate,user_id,stars,comment) select p,(select id from auth.users where email='pasajero@btx.co'),s,c
 from (values('KEN10',5,'Muy amable y puntual'),('KEN10',4,'Buen servicio'),('BOS13',5,'Conoce muy bien la zona'),('SUB16',4,'Rápido y seguro'),('FON22',3,'Tardó un poco en llegar')) v(p,s,c);
insert into trips(driver_id,amount,created_at) select d.id,v.a,now()-(v.h||' hours')::interval from drivers d,(values(4000,1),(6000,3),(3500,5),(8000,26),(5000,30),(7000,50)) v(a,h) where d.plate='KEN10';
insert into tickets(user_id,message,reply) select id,m,rp from auth.users,(values('No encuentro bicitaxis en Usaquén por la noche','Gracias, estamos ampliando horarios en esa zona.'),('¿Cómo cambio mi foto de perfil?',null)) v(m,rp) where email='pasajero@btx.co';
-- Para refrescar los estados antes de exponer: update drivers set seen=now();
