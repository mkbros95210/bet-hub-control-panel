
-- First, let's check if we have an admin profile and create one if needed
-- We'll use the existing user (if any) or create a default admin
DO $$ 
BEGIN
    -- Check if admin profile exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
        -- If no admin exists, let's create/update the current user to be admin
        -- This will handle the case where someone is already logged in
        IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
            -- Get the first user and make them admin
            INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
            SELECT 
                id,
                email,
                COALESCE(raw_user_meta_data->>'full_name', email),
                'admin',
                now(),
                now()
            FROM auth.users 
            LIMIT 1
            ON CONFLICT (id) DO UPDATE SET 
                role = 'admin',
                updated_at = now();
        ELSE
            -- Create a default admin profile (this will be linked when someone signs up)
            INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
            VALUES (
                gen_random_uuid(),
                'admin@bethub.com',
                'Admin User',
                'admin',
                now(),
                now()
            );
        END IF;
    END IF;
END $$;

-- Also ensure we have the handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'admin' -- Make all new users admin for now (you can change this later)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to be more permissive for testing
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;  
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.get_current_user_role() = 'admin');
