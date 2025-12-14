-- Restricted RLS for membership_packages
-- Allows reads for authenticated users and allows writes only for admin email mos@core.com
-- Run this in Supabase SQL editor to enable a restrictive policy for development testing.

BEGIN;

ALTER TABLE IF EXISTS public.membership_packages ENABLE ROW LEVEL SECURITY;

-- Ensure old policies (if any) are removed so the script can be run multiple times safely
DROP POLICY IF EXISTS allow_authenticated_select ON public.membership_packages;
DROP POLICY IF EXISTS allow_mos_write ON public.membership_packages;
DROP POLICY IF EXISTS allow_mos_insert ON public.membership_packages;
DROP POLICY IF EXISTS allow_mos_update ON public.membership_packages;
DROP POLICY IF EXISTS allow_mos_delete ON public.membership_packages;

-- Allow authenticated selects
CREATE POLICY allow_authenticated_select ON public.membership_packages
  FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.uid() IS NOT NULL);

-- Allow only mos@core.com to insert/update/delete
-- Create separate policies for INSERT, UPDATE and DELETE because Postgres does not accept multiple actions in a single FOR clause
CREATE POLICY allow_mos_insert ON public.membership_packages
  FOR INSERT
  USING (auth.email() = 'mos@core.com')
  WITH CHECK (auth.email() = 'mos@core.com');

CREATE POLICY allow_mos_update ON public.membership_packages
  FOR UPDATE
  USING (auth.email() = 'mos@core.com')
  WITH CHECK (auth.email() = 'mos@core.com');

CREATE POLICY allow_mos_delete ON public.membership_packages
  FOR DELETE
  USING (auth.email() = 'mos@core.com');

COMMIT;
