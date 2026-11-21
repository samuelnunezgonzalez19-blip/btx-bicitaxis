-- Primero regístrate en la app, luego cambia el correo y ejecuta:
update profiles set role='admin' where id=(select id from auth.users where email='TU_CORREO');
