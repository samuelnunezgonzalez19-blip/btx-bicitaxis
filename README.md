# BTX · Bicitaxis Bogotá (v7)
React + Vite + Tailwind + Leaflet/OpenStreetMap + Supabase (datos, inicio de sesión y fotos de perfil).

## 1. Supabase (SQL Editor, en este orden)
`supabase/01_schema.sql` → `02`: `supabase/migration_v2.sql` → `03_seed_demo.sql` (demo con cuentas: `admin@btx.co` / Admin2026, `pasajero@btx.co` y `conductor@btx.co` / Demo12345).
Authentication → Sign In / Providers → Email: apaga **Confirm email** para la demo.

## 2. Local (Node 20 o superior)
```
cp .env.example .env     # pega la URL y la clave PUBLISHABLE (nunca la secret)
npm install && npm run dev
```
Regístrate en la app y luego ejecuta `supabase/04_hacerme_admin.sql` con tu correo.

## 3. GitHub
`git init && git add . && git commit -m "BTX" && git branch -M main`, crea un repo vacío y `git remote add origin URL && git push -u origin main`. El `.env` no se sube (está en .gitignore).

## 4. Vercel
Add New → Project → importa el repo. En Environment Variables agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Deploy.

## 5. Railway
New Project → Deploy from GitHub → mismas dos variables en Variables → Settings → Networking → Generate Domain.

Producción: en Supabase → Authentication → URL Configuration agrega tu dominio de Vercel/Railway.
