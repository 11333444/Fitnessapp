# Habit Tracker

Next.js (App Router) Habit-Tracker mit Supabase als Backend (Auth, Postgres, Storage, Edge Functions).

## Setup

```bash
npm install
```

Umgebungsvariablen (`.env.local`, siehe `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Diese Werte findest du in Supabase unter Project Settings → API. Es wird **kein**
Service-Role-Key im Next.js-Projekt benötigt – Admin-Aktionen (User anlegen,
Passwort zurücksetzen) laufen über die Supabase Edge Function `admin-users`,
die den Service-Role-Key nur serverseitig in Supabase selbst verwendet.

```bash
npm run dev
```

## Architektur

- **Auth**: Supabase Auth (E-Mail/Passwort), erzwungener Passwortwechsel beim
  ersten Login über `profiles.must_change_password`, durchgesetzt in
  `src/middleware.ts`.
- **Datenbank**: `profiles`, `habits`, `habit_logs`, `daily_entries`,
  `workouts`, `weight_entries`, `form_checks`, `meal_photos` – alle mit Row
  Level Security (Owner-Zugriff + Admin-Vollzugriff über `is_admin()`).
- **Storage**: private Buckets `form-checks` und `meal-photos`, RLS anhand des
  User-Ordners (`<user_id>/...`). Uploads laufen direkt vom Client zu
  Supabase Storage.
- **Admin-User-Verwaltung**: Edge Function `admin-users` (Deno, deployed in
  Supabase) mit Service-Role-Zugriff, aufgerufen über
  `src/lib/supabase/edgeFunctions.ts`.
- **Tagesgrenzen**: UTC (siehe `src/lib/dates.ts`).

## Deployment auf Hostinger (Node.js-Hosting)

Hostinger Node.js-Hosting läuft als ein persistenter Node-Prozess (kein
Vercel-artiges Serverless/Edge). `next.config.ts` ist deshalb auf
`output: "standalone"` gestellt.

1. Build erzeugen:
   ```bash
   npm run build
   ```
2. Folgende Inhalte auf den Server hochladen:
   - `.next/standalone/` (enthält `server.js` und ein eigenes `node_modules`)
   - `.next/static/` → nach `.next/standalone/.next/static/` kopieren
   - `public/` → nach `.next/standalone/public/` kopieren
3. Auf dem Server (bzw. in der Hostinger Node.js-App-Konfiguration):
   - Startdatei: `server.js`
   - Umgebungsvariablen setzen: `NEXT_PUBLIC_SUPABASE_URL`,
     `NEXT_PUBLIC_SUPABASE_ANON_KEY`, sowie `PORT` (von Hostinger vorgegeben)
   - Start-Kommando: `node server.js`

Da Bild-Uploads direkt vom Browser zu Supabase Storage gehen, muss der
Node-Prozess selbst keine großen Dateien verarbeiten.

## Supabase-Projekt

- Projekt: `fitnessapp-habit-tracker`
- Region: Frankfurt (`eu-central-1`)
- Erster Admin-Account: manuell im Supabase Dashboard angelegt, Rolle danach
  per SQL auf `admin` gesetzt. Alle weiteren User werden über den
  Admin-Bereich (`/admin`) in der App angelegt.
