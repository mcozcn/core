-- Create membership_packages table if it does not exist, then apply restricted RLS
-- Safe to run multiple times (idempotent)

BEGIN;

-- Create table if missing. Using integer serial primary key for broad compatibility.
CREATE TABLE IF NOT EXISTS public.membership_packages (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text,
  duration_days integer NOT NULL DEFAULT 30,
  price numeric NOT NULL DEFAULT 0,
  features text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS and apply restrictive policies (writes only allowed for mos@core.com)
ALTER TABLE IF EXISTS public.membership_packages ENABLE ROW LEVEL SECURITY;

-- Remove previous policies if any (safe to re-run)
DROP POLICY IF EXISTS allow_authenticated_select ON public.membership_packages;
DROP POLICY IF EXISTS allow_mos_insert ON public.membership_packages;
DROP POLICY IF EXISTS allow_mos_update ON public.membership_packages;
DROP POLICY IF EXISTS allow_mos_delete ON public.membership_packages;

-- Allow authenticated selects
CREATE POLICY allow_authenticated_select ON public.membership_packages
  FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.uid() IS NOT NULL);

-- Allow only mos@core.com to insert/update/delete
CREATE POLICY allow_mos_insert ON public.membership_packages
  FOR INSERT
  WITH CHECK (auth.email() = 'mos@core.com');

CREATE POLICY allow_mos_update ON public.membership_packages
  FOR UPDATE
  USING (auth.email() = 'mos@core.com')
  WITH CHECK (auth.email() = 'mos@core.com');

CREATE POLICY allow_mos_delete ON public.membership_packages
  FOR DELETE
  USING (auth.email() = 'mos@core.com');

COMMIT;

-- Quick verification queries (optional):
-- SELECT * FROM public.membership_packages LIMIT 5;
-- SELECT policyname FROM pg_policies WHERE tablename = 'membership_packages';
