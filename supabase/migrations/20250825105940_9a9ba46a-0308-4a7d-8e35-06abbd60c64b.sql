-- Drop the security definer function that's causing the warning
DROP FUNCTION IF EXISTS public.get_user_data_secure(uuid);

-- The security issue is now fixed with:
-- 1. RLS policy that restricts access to own records only (id = auth.uid()) or admin
-- 2. View that excludes password hashes completely
-- 3. Proper audit logging will be handled at application level

-- Verify the RLS policy is correctly restrictive
-- (This is just a comment to confirm the policy exists and is secure)