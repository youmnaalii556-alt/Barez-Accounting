-- ============================================================
--  Barez ERP — Seed: Projects (5 hotel apartments + others)
--  Run AFTER schema.sql in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Company identity (logo + name) used in financial statement headers
CREATE TABLE IF NOT EXISTS public.company_settings (
  id          INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- single row
  name        TEXT NOT NULL DEFAULT 'Barez Company',
  name_ar     TEXT NOT NULL DEFAULT 'شركة بارز',
  logo_url    TEXT,
  currency    TEXT NOT NULL DEFAULT 'EGP',
  currency_ar TEXT NOT NULL DEFAULT 'ج.م',
  tax_no      TEXT,
  reg_no      TEXT,
  address     TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_read_company"  ON public.company_settings;
DROP POLICY IF EXISTS "admin_write_company" ON public.company_settings;
CREATE POLICY "auth_read_company"  ON public.company_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_write_company" ON public.company_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','manager')));

INSERT INTO public.company_settings (id, name, name_ar, currency, currency_ar)
VALUES (1, 'Barez Company', 'شركة بارز', 'EGP', 'ج.م')
ON CONFLICT (id) DO NOTHING;

-- 5 hotel apartments + other projects
INSERT INTO public.projects (project_no, name, name_ar, type, status, start_date) VALUES
  ('PRJ-001', 'Jwan Hotel Apartments',      'جوان - الشقق الفندقية',     'real_estate', 'active', '2024-01-01'),
  ('PRJ-002', 'Marina Hotel Apartments',    'مارينا - الشقق الفندقية',   'real_estate', 'active', '2024-01-01'),
  ('PRJ-003', 'Nile Hotel Apartments',      'النيل - الشقق الفندقية',    'real_estate', 'active', '2024-03-01'),
  ('PRJ-004', 'Zohour Hotel Apartments',    'الزهور - الشقق الفندقية',   'real_estate', 'active', '2024-06-01'),
  ('PRJ-005', 'Corniche Hotel Apartments',  'الكورنيش - الشقق الفندقية', 'real_estate', 'active', '2024-09-01'),
  ('PRJ-006', 'Other Investments',          'مشاريع أخرى',               'other',       'active', '2024-01-01')
ON CONFLICT (project_no) DO NOTHING;
