
-- Create admin_users table for admin authentication
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payment_gateways table
CREATE TABLE public.payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'stripe', 'razorpay', 'paypal', etc.
  api_key TEXT,
  secret_key TEXT,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT false,
  is_test_mode BOOLEAN DEFAULT true,
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create game_apis table
CREATE TABLE public.game_apis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  api_url TEXT NOT NULL,
  api_key TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMPTZ,
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Update matches table to include show_on_frontend
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS show_on_frontend BOOLEAN DEFAULT false;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS api_source_id UUID REFERENCES public.game_apis(id);

-- Create system_settings table
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description) VALUES
('site_name', '"BetHub"', 'Website name'),
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('enable_deposits', 'true', 'Enable user deposits'),
('enable_withdrawals', 'true', 'Enable user withdrawals'),
('min_bet_amount', '10', 'Minimum bet amount'),
('max_bet_amount', '10000', 'Maximum bet amount');

-- Enable RLS on all tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_apis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admins can manage admin_users" ON public.admin_users
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can manage payment_gateways" ON public.payment_gateways
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can manage game_apis" ON public.game_apis
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can manage system_settings" ON public.system_settings
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Create function to handle admin user creation
CREATE OR REPLACE FUNCTION public.create_admin_user(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  password_hash TEXT;
BEGIN
  -- Generate password hash (in production, use proper bcrypt)
  password_hash := crypt(user_password, gen_salt('bf'));
  
  -- Insert admin user
  INSERT INTO public.admin_users (email, password_hash, full_name)
  VALUES (user_email, password_hash, user_name)
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$;

-- Create default admin user (password: admin123)
SELECT public.create_admin_user('admin@bethub.com', 'admin123', 'Admin User');
