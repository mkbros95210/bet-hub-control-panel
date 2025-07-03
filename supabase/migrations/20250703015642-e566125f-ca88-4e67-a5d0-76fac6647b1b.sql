
-- Fix the infinite recursion in profiles table RLS policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a corrected policy that doesn't cause recursion
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR ALL USING (
  -- Allow users to see their own profile
  auth.uid() = id 
  OR 
  -- Allow admin access by checking the role directly in the same table
  (
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1
  ) = 'admin'
);

-- Also fix any other policies that might have similar issues
DROP POLICY IF EXISTS "Admins can manage game_apis" ON public.game_apis;
DROP POLICY IF EXISTS "Admins can manage payment_gateways" ON public.payment_gateways;
DROP POLICY IF EXISTS "Admins can manage system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can manage admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can manage matches" ON public.matches;

-- Recreate policies without recursion
CREATE POLICY "Admins can manage game_apis" ON public.game_apis
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);

CREATE POLICY "Admins can manage payment_gateways" ON public.payment_gateways
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);

CREATE POLICY "Admins can manage system_settings" ON public.system_settings
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);

CREATE POLICY "Admins can manage admin_users" ON public.admin_users
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);

CREATE POLICY "Admins can manage matches" ON public.matches
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);

-- Create admin profile if it doesn't exist
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'admin@bethub.com',
  'Admin User',
  'admin',
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'admin@bethub.com'
);
