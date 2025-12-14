-- Restricted RLS for membership_packages
-- Allows reads for authenticated users and allows writes only for admin email mos@core.com
-- Run this in Supabase SQL editor to enable a restrictive policy for development testing.

BEGIN;

ALTER TABLE IF EXISTS public.membership_packages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated selects
CREATE POLICY IF NOT EXISTS allow_authenticated_select ON public.membership_packages
  FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.uid() IS NOT NULL);

-- Allow only mos@core.com to insert/update/delete
CREATE POLICY IF NOT EXISTS allow_mos_write ON public.membership_packages
  FOR INSERT, UPDATE, DELETE
  USING (auth.email() = 'mos@core.com')
  WITH CHECK (auth.email() = 'mos@core.com');

COMMIT;
