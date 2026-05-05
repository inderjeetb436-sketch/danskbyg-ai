
/*
  # Fix All Security Issues (Comprehensive)

  ## Issues Fixed
  1. **Function Search Path Mutable on get_user_company_id**: 
     - Revoke EXECUTE from anon and authenticated on this SECURITY DEFINER function
     - Only service_role and postgres need to call it (via RLS policy evaluation which runs as the definer)
     - Keep search_path='' and SECURITY DEFINER with fully-qualified table references

  2. **RLS Policy Always True on companies INSERT**:
     - Already fixed in previous migration (policy requires user not already in a company)
     - No additional changes needed

  3. **Public Can Execute SECURITY DEFINER Function (handle_new_user)**:
     - Revoke EXECUTE from public (the =X grant), anon, and authenticated
     - Only the trigger (running as postgres) needs to call this
     - Function is already SECURITY INVOKER with search_path=''

  4. **Signed-In Users Can Execute SECURITY DEFINER Function (handle_new_user)**:
     - Same fix as #3 — revoke authenticated role EXECUTE privilege

  ## Security Impact
  - get_user_company_id: Only callable by postgres, service_role, and during RLS policy evaluation (which runs as the function definer). anon/authenticated cannot call it directly.
  - handle_new_user: Only callable by postgres and service_role. The trigger still works because triggers execute as the table owner (postgres).
  - companies INSERT: Restricted to users who don't already belong to a company.
*/

-- 1. Revoke EXECUTE on get_user_company_id from anon and authenticated
-- This SECURITY DEFINER function is only needed for RLS policy evaluation,
-- which runs as the function owner (postgres), not as the calling role.
REVOKE ALL ON FUNCTION public.get_user_company_id() FROM anon, authenticated;

-- Also revoke from public grant (=X) if it exists
REVOKE ALL ON FUNCTION public.get_user_company_id() FROM PUBLIC;

-- 2. Revoke EXECUTE on handle_new_user from all non-essential roles
-- The trigger runs as postgres (table owner), so it doesn't need role-based grants
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;

-- 3. Verify: grant EXECUTE only to roles that need it
-- service_role and postgres already have grants from creation; ensure they're preserved
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_company_id() TO service_role;
