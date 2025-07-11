/*
  # Create hero_banners table

  1. New Tables
    - `hero_banners`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `subtitle` (text, required)
      - `button_text` (text, required)
      - `background_color` (text, default orange)
      - `is_active` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `hero_banners` table
    - Add policy for admins to manage hero banners
    - Add policy for public users to view active hero banners
*/

-- Create hero_banners table
CREATE TABLE IF NOT EXISTS public.hero_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text NOT NULL,
  button_text text NOT NULL,
  background_color text DEFAULT '#f97316',
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on hero_banners table
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage hero banners
CREATE POLICY "Admins can manage hero_banners"
  ON public.hero_banners
  FOR ALL
  TO authenticated
  USING (get_current_user_role() = 'admin');

-- Create policy for public users to view active hero banners
CREATE POLICY "Anyone can view active hero_banners"
  ON public.hero_banners
  FOR SELECT
  USING (is_active = true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_hero_banners_active ON public.hero_banners(is_active);