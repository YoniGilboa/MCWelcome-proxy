-- =====================================================
-- MIND CHANNEL ADMIN PANEL DATABASE SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. SOLUTIONS TABLE
-- Stores all available solutions in the system
CREATE TABLE IF NOT EXISTS public.solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_he TEXT NOT NULL,
  description TEXT,
  description_he TEXT,
  icon TEXT,
  color TEXT DEFAULT 'blue',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER SOLUTIONS TABLE
-- Tracks which solutions each user has access to
CREATE TABLE IF NOT EXISTS public.user_solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  solution_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('approved', 'revoked', 'pending')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, solution_id)
);

-- 3. USER PROFILES TABLE (Extended user information)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_solutions_user_id ON public.user_solutions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_solutions_solution_id ON public.user_solutions(solution_id);
CREATE INDEX IF NOT EXISTS idx_user_solutions_status ON public.user_solutions(status);
CREATE INDEX IF NOT EXISTS idx_solutions_active ON public.solutions(is_active);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Solutions Policies
CREATE POLICY "Anyone can view active solutions"
  ON public.solutions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all solutions"
  ON public.solutions FOR ALL
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- User Solutions Policies
CREATE POLICY "Users can view their own solutions"
  ON public.user_solutions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all user solutions"
  ON public.user_solutions FOR SELECT
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can manage all user solutions"
  ON public.user_solutions FOR ALL
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can manage all profiles"
  ON public.user_profiles FOR ALL
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_solutions_updated_at
  BEFORE UPDATE ON public.solutions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_solutions_updated_at
  BEFORE UPDATE ON public.user_solutions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT SOLUTIONS
-- =====================================================

INSERT INTO public.solutions (solution_id, name, name_he, description, description_he, icon, color) VALUES
  ('customer-database', 'Customer Database', 'מאגר לקוחות', 'Manage and update your customer database efficiently', 'ניהול ועדכון מאגר לקוחות בצורה יעילה', 'Users', 'blue'),
  ('reels-creation', 'Reels Creation', 'יצירת Reels', 'Create automated AI-powered Reels for your business', 'יצירת Reels אוטומטיים בעזרת AI לעסק שלך', 'Video', 'purple'),
  ('reports-forms', 'Reports & Forms', 'טפסים ודוחות', 'Automated report generation and form management', 'יצירת דוחות וניהול טפסים באופן אוטומטי', 'FileText', 'green')
ON CONFLICT (solution_id) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify everything was created successfully:

-- Check solutions table
SELECT * FROM public.solutions;

-- Check user_solutions table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_solutions';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- DONE! 
-- Your database is now ready for the admin panel.
-- =====================================================
