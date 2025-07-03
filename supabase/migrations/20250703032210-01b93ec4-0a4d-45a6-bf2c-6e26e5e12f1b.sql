
-- Create a table to store sport categories from APIs
CREATE TABLE public.sport_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_source_id UUID REFERENCES public.game_apis(id) ON DELETE CASCADE NOT NULL,
  category_key TEXT NOT NULL,
  category_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(api_source_id, category_key)
);

-- Enable RLS on sport_categories table
ALTER TABLE public.sport_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admins to manage sport categories
CREATE POLICY "Admins can manage sport_categories" 
  ON public.sport_categories 
  FOR ALL 
  USING (get_current_user_role() = 'admin');

-- Create RLS policy for anyone to view active categories
CREATE POLICY "Anyone can view active sport_categories" 
  ON public.sport_categories 
  FOR SELECT 
  USING (is_active = true OR get_current_user_role() = 'admin');

-- Add category field to matches table if it doesn't exist
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS category TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sport_categories_api_source ON public.sport_categories(api_source_id);
CREATE INDEX IF NOT EXISTS idx_matches_category ON public.matches(category);
CREATE INDEX IF NOT EXISTS idx_matches_sport_category ON public.matches(sport, category);
