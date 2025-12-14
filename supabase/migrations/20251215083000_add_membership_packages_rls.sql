-- Add permissive RLS policies for membership_packages for testing/debugging
-- WARNING: These policies are permissive and intended for development/testing only.
-- Review and tighten before using in production.

BEGIN;

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.membership_packages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select
CREATE POLICY IF NOT EXISTS allow_authenticated_select ON public.membership_packages
  FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.uid() IS NOT NULL);

-- Allow authenticated users to insert
CREATE POLICY IF NOT EXISTS allow_authenticated_insert ON public.membership_packages
  FOR INSERT
  USING (auth.role() = 'authenticated' OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.role() = 'authenticated' OR auth.uid() IS NOT NULL);

-- Allow authenticated users to update
CREATE POLICY IF NOT EXISTS allow_authenticated_update ON public.membership_packages
  FOR UPDATE
  USING (auth.role() = 'authenticated' OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.role() = 'authenticated' OR auth.uid() IS NOT NULL);

-- Allow authenticated users to delete
CREATE POLICY IF NOT EXISTS allow_authenticated_delete ON public.membership_packages
  FOR DELETE
  USING (auth.role() = 'authenticated' OR auth.uid() IS NOT NULL);

COMMIT;
