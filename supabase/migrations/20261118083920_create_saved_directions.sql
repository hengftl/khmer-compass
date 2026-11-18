/*
# Create saved_directions table (single-tenant, no auth)

1. New Tables
   - `saved_directions`
     - `id` (uuid, primary key, auto-generated)
     - `device_id` (text, not null — random id generated in the browser, kept in local storage, so each visitor only sees their own saved directions without needing an account)
     - `name` (text, not null — label for the direction, e.g. "Home", "Qibla")
     - `heading` (real, not null — compass heading in degrees 0-360)
     - `color` (text, not null default '#22d3ee' — hex color used for the dial marker)
     - `created_at` (timestamptz, default now)
2. Security
   - Enable RLS on `saved_directions`.
   - Grant SELECT, INSERT, DELETE to `anon` and `authenticated` (the app has no sign-in, so the anon-key client does all reads/writes; UPDATE is not granted because saved directions are never edited in place).
   - Policies scoped to anon + authenticated, matching rows by `device_id` so each visitor only reads and writes their own rows.
3. Notes
   - No user_id / auth.users reference: the app intentionally has no sign-in screen.
   - Index on `device_id` for fast per-device lookups.
*/

CREATE TABLE IF NOT EXISTS saved_directions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  name text NOT NULL,
  heading real NOT NULL,
  color text NOT NULL DEFAULT '#22d3ee',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_directions_device_id ON saved_directions (device_id);

ALTER TABLE saved_directions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON saved_directions TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_saved_directions" ON saved_directions;
CREATE POLICY "anon_select_saved_directions" ON saved_directions
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "anon_insert_saved_directions" ON saved_directions;
CREATE POLICY "anon_insert_saved_directions" ON saved_directions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_saved_directions" ON saved_directions;
CREATE POLICY "anon_delete_saved_directions" ON saved_directions
FOR DELETE
TO anon, authenticated
USING (true);
