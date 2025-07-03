
-- First, let's create a security definer function to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing problematic policies that might cause recursion
DROP POLICY IF EXISTS "Admins can manage game_apis" ON public.game_apis;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view all bets" ON public.bets;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can manage withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Admins can manage matches" ON public.matches;
DROP POLICY IF EXISTS "Admins can manage payment_gateways" ON public.payment_gateways;
DROP POLICY IF EXISTS "Admins can manage system_settings" ON public.system_settings;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can manage game_apis" ON public.game_apis
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage admin_users" ON public.admin_users
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all bets" ON public.bets
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage withdrawal requests" ON public.withdrawal_requests
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage matches" ON public.matches
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage payment_gateways" ON public.payment_gateways
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage system_settings" ON public.system_settings
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Add missing tables for user functionality
CREATE TABLE IF NOT EXISTS public.user_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  bet_type TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  odds DECIMAL NOT NULL,
  potential_win DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  placed_at TIMESTAMPTZ DEFAULT NOW(),
  result TEXT
);

-- Enable RLS for user_bets
ALTER TABLE public.user_bets ENABLE ROW LEVEL SECURITY;

-- Create policies for user_bets
CREATE POLICY "Users can view own bets" ON public.user_bets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bets" ON public.user_bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user_bets" ON public.user_bets
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Add wallet transactions table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'bet_win', 'bet_loss'
  amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_gateway_id UUID REFERENCES public.payment_gateways(id),
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Enable RLS for wallet_transactions
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for wallet_transactions
CREATE POLICY "Users can view own wallet transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own wallet transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all wallet transactions" ON public.wallet_transactions
  FOR ALL USING (public.get_current_user_role() = 'admin');
