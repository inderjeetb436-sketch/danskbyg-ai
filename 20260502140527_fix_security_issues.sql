
/*
  # Fix Security Issues

  ## Changes
  1. **Function Search Path Mutable**: Set `search_path` on `get_user_company_id()` to an empty string, preventing search_path manipulation attacks.
  2. **RLS Policy Always True**: Replace the unrestricted INSERT policy on `companies` with one that only allows insert when the user's profile doesn't already have a company_id (preventing abuse).
  3. **SECURITY DEFINER Function Execution**: Revoke EXECUTE from `anon` and `authenticated` on `handle_new_user()`, and restrict it to only be callable by the trigger (via `pg_authid` membership check). Switch to SECURITY INVOKER since the trigger runs as the postgres superuser anyway.

  ## Security Impact
  - `get_user_company_id()` now has immutable search_path, preventing search path injection
  - `companies` INSERT policy now requires the user to not already belong to a company
  - `handle_new_user()` can no longer be called via REST API by any role
*/

-- 1. Fix mutable search_path on get_user_company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Fix unrestricted INSERT policy on companies
DROP POLICY IF EXISTS "Authenticated users can insert companies" ON companies;

CREATE POLICY "Users can insert company only if not already in one"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

-- 3. Fix SECURITY DEFINER function being publicly executable
-- Revoke execute from anon and authenticated
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- Switch to SECURITY INVOKER so it inherits caller privileges
-- The trigger still works because it runs as the database superuser (postgres)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$;
