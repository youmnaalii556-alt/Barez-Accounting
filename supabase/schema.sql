-- ============================================================
--  Barez ERP — Supabase Schema
--  Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  full_name_ar  TEXT,
  role          TEXT NOT NULL DEFAULT 'employee'
                  CHECK (role IN ('super_admin', 'manager', 'employee')),
  department    TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Modules (dynamic ERP modules registry)
CREATE TABLE IF NOT EXISTS public.modules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  name_ar         TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  icon            TEXT NOT NULL DEFAULT 'settings',
  description     TEXT,
  description_ar  TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  order_index     INTEGER DEFAULT 0,
  allowed_roles   TEXT[] DEFAULT ARRAY['super_admin'],
  parent_id       UUID REFERENCES public.modules(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules   ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile
CREATE POLICY "users_read_own_profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Profiles: super_admin can read/write all profiles
CREATE POLICY "superadmin_all_profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

-- Modules: any authenticated user can read active modules
CREATE POLICY "authenticated_read_modules" ON public.modules
  FOR SELECT USING (auth.role() = 'authenticated');

-- Modules: only super_admin can write modules
CREATE POLICY "superadmin_write_modules" ON public.modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

-- ============================================================
-- Trigger: auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, full_name_ar, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'full_name_ar',
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Seed: default ERP modules
-- ============================================================

INSERT INTO public.modules (name, name_ar, slug, icon, description_ar, order_index, allowed_roles) VALUES
  ('HR',         'الموارد البشرية', 'hr',         'users',       'إدارة الموظفين، الرواتب، والإجازات',       1, ARRAY['super_admin','manager','employee']),
  ('Finance',    'المالية',         'finance',    'dollar-sign', 'الميزانية، المصروفات، والتقارير المالية', 2, ARRAY['super_admin','manager']),
  ('Projects',   'المشاريع',       'projects',   'briefcase',   'إدارة العقارات، المركبات، والمشاريع',     3, ARRAY['super_admin','manager']),
  ('Accounting', 'الحسابات',       'accounting', 'book-open',   'القيود اليومية، ميزان المراجعة، IFRS',    4, ARRAY['super_admin','manager']),
  ('Admin',      'الإدارة',        'admin/modules','settings',  'إدارة وحدات النظام والصلاحيات',           99, ARRAY['super_admin'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- IMPORTANT: After running this SQL, create your first user in
-- Supabase Auth → Users, then update their role:
--
--   UPDATE public.profiles SET role = 'super_admin', full_name_ar = 'اسمك'
--   WHERE id = '<user-uuid>';
-- ============================================================
