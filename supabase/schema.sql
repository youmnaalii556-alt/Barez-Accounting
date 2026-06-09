-- ============================================================
--  Barez ERP — Full Schema
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Profiles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  full_name_ar  TEXT,
  role          TEXT NOT NULL DEFAULT 'employee'
                  CHECK (role IN ('super_admin','manager','employee')),
  department    TEXT,
  avatar_url    TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Modules ───────────────────────────────────────────────
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

-- ── 3. Accounting Projects ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.acc_projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  activity     TEXT,
  currency     TEXT NOT NULL DEFAULT 'IQD',
  fiscal_year  TEXT NOT NULL DEFAULT '2025',
  registration TEXT,
  notes        TEXT,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. Chart of Accounts ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.acc_accounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           TEXT UNIQUE NOT NULL,
  name           TEXT NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('asset','liability','equity','revenue','expense')),
  standard       TEXT,
  category       TEXT,
  normal_balance TEXT NOT NULL DEFAULT 'debit' CHECK (normal_balance IN ('debit','credit')),
  parent_id      UUID REFERENCES public.acc_accounts(id),
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. Journal Entries ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.acc_journals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref         TEXT UNIQUE NOT NULL,
  entry_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  project_id  UUID REFERENCES public.acc_projects(id),
  description TEXT NOT NULL,
  doc_ref     TEXT,
  posted      BOOLEAN DEFAULT TRUE,
  created_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. Journal Lines ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.acc_journal_lines (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id     UUID NOT NULL REFERENCES public.acc_journals(id) ON DELETE CASCADE,
  account_code   TEXT NOT NULL,
  description    TEXT,
  debit          NUMERIC(18,3) NOT NULL DEFAULT 0,
  credit         NUMERIC(18,3) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'نقدي',
  line_order     INTEGER DEFAULT 0
);

-- ── 6. Projects ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_no  TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  name_ar     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'real_estate'
                CHECK (type IN ('real_estate','vehicle','construction','other')),
  status      TEXT NOT NULL DEFAULT 'planning'
                CHECK (status IN ('planning','active','paused','completed','cancelled')),
  budget      NUMERIC(18,3) DEFAULT 0,
  spent       NUMERIC(18,3) DEFAULT 0,
  start_date  DATE,
  end_date    DATE,
  description TEXT,
  manager_id  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. HR — Employees ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.employees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_no     TEXT UNIQUE NOT NULL,
  profile_id      UUID REFERENCES public.profiles(id),
  full_name       TEXT NOT NULL,
  full_name_ar    TEXT NOT NULL,
  department      TEXT NOT NULL,
  position        TEXT NOT NULL,
  basic_salary    NUMERIC(18,3) NOT NULL DEFAULT 0,
  hire_date       DATE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','terminated')),
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. HR — Leave Requests ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES public.employees(id),
  leave_type      TEXT NOT NULL CHECK (leave_type IN ('annual','sick','emergency','unpaid')),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  days            INTEGER NOT NULL,
  reason          TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_by     UUID REFERENCES public.profiles(id),
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. Customer Service — Clients ────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  name_ar     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'customer' CHECK (type IN ('customer','supplier','both')),
  phone       TEXT,
  email       TEXT,
  address     TEXT,
  notes       TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. Customer Service — Tickets ───────────────────────────
CREATE TABLE IF NOT EXISTS public.tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_no   TEXT UNIQUE NOT NULL,
  client_id   UUID REFERENCES public.clients(id),
  subject     TEXT NOT NULL,
  description TEXT,
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status      TEXT NOT NULL DEFAULT 'open'   CHECK (status IN ('open','in_progress','resolved','closed')),
  assigned_to UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_projects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_accounts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_journals    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets         ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "users_read_own_profile"  ON public.profiles;
DROP POLICY IF EXISTS "superadmin_all_profiles" ON public.profiles;
CREATE POLICY "users_read_own_profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "superadmin_all_profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

-- modules
DROP POLICY IF EXISTS "authenticated_read_modules" ON public.modules;
DROP POLICY IF EXISTS "superadmin_write_modules"   ON public.modules;
CREATE POLICY "authenticated_read_modules" ON public.modules
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "superadmin_write_modules" ON public.modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

-- acc_projects
DROP POLICY IF EXISTS "auth_read_acc_proj"  ON public.acc_projects;
DROP POLICY IF EXISTS "auth_write_acc_proj" ON public.acc_projects;
CREATE POLICY "auth_read_acc_proj"  ON public.acc_projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_acc_proj" ON public.acc_projects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','manager')));

-- acc_accounts
DROP POLICY IF EXISTS "auth_read_accounts"  ON public.acc_accounts;
DROP POLICY IF EXISTS "auth_write_accounts" ON public.acc_accounts;
CREATE POLICY "auth_read_accounts"  ON public.acc_accounts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_accounts" ON public.acc_accounts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','manager')));

-- acc_journals
DROP POLICY IF EXISTS "auth_read_journal"  ON public.acc_journals;
DROP POLICY IF EXISTS "auth_write_journal" ON public.acc_journals;
CREATE POLICY "auth_read_journal"  ON public.acc_journals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_journal" ON public.acc_journals FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','manager')));

-- acc_journal_lines
DROP POLICY IF EXISTS "auth_read_jlines"  ON public.acc_journal_lines;
DROP POLICY IF EXISTS "auth_write_jlines" ON public.acc_journal_lines;
CREATE POLICY "auth_read_jlines"  ON public.acc_journal_lines FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_jlines" ON public.acc_journal_lines FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','manager')));

-- projects
DROP POLICY IF EXISTS "auth_read_projects"  ON public.projects;
DROP POLICY IF EXISTS "auth_write_projects" ON public.projects;
CREATE POLICY "auth_read_projects"  ON public.projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_projects" ON public.projects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','manager')));

-- employees
DROP POLICY IF EXISTS "auth_read_employees"  ON public.employees;
DROP POLICY IF EXISTS "auth_write_employees" ON public.employees;
CREATE POLICY "auth_read_employees"  ON public.employees FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_employees" ON public.employees FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','manager')));

-- leave_requests
DROP POLICY IF EXISTS "auth_read_leaves"  ON public.leave_requests;
DROP POLICY IF EXISTS "auth_write_leaves" ON public.leave_requests;
CREATE POLICY "auth_read_leaves"  ON public.leave_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_leaves" ON public.leave_requests FOR ALL USING (auth.uid() IS NOT NULL);

-- clients
DROP POLICY IF EXISTS "auth_read_clients"  ON public.clients;
DROP POLICY IF EXISTS "auth_write_clients" ON public.clients;
CREATE POLICY "auth_read_clients"  ON public.clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_clients" ON public.clients FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','manager')));

-- tickets
DROP POLICY IF EXISTS "auth_read_tickets"  ON public.tickets;
DROP POLICY IF EXISTS "auth_write_tickets" ON public.tickets;
CREATE POLICY "auth_read_tickets"  ON public.tickets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_tickets" ON public.tickets FOR ALL USING (auth.uid() IS NOT NULL);

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
    COALESCE(NEW.raw_user_meta_data->>'role','employee')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── updated_at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles','modules','acc_journals','projects','employees','clients','tickets']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END $$;

-- ============================================================
-- Seed: default modules
-- ============================================================
INSERT INTO public.modules (name, name_ar, slug, icon, description_ar, order_index, allowed_roles) VALUES
  ('HR',              'الموارد البشرية',  'hr',               'users',       'ادارة الموظفين والرواتب والاجازات',      1,  ARRAY['super_admin','manager','employee']),
  ('Self Service',    'الخدمة الذاتية',   'self-service',     'user-cog',    'بياناتك الشخصية وطلباتك واجازاتك',      2,  ARRAY['super_admin','manager','employee']),
  ('Accounting',      'الحسابات',         'accounting',       'book-open',   'القيود اليومية وميزان المراجعة و IFRS', 3,  ARRAY['super_admin','manager']),
  ('Customer Service','خدمة العملاء',     'customer-service', 'headphones',  'ادارة التذاكر والشكاوى وطلبات العملاء', 4,  ARRAY['super_admin','manager']),
  ('Projects',        'المشاريع',         'projects',         'briefcase',   'ادارة العقارات والمركبات والمشاريع',     5,  ARRAY['super_admin','manager']),
  ('Finance',         'المالية',          'finance',          'dollar-sign', 'الميزانية والمصروفات والتقارير المالية', 6,  ARRAY['super_admin','manager']),
  ('Admin',           'الاعدادات',        'admin/modules',    'settings',    'ادارة وحدات النظام والصلاحيات',          99, ARRAY['super_admin'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Seed: Default Accounting Project
-- ============================================================
INSERT INTO public.acc_projects (name, activity, currency, fiscal_year, is_active)
VALUES ('شركة Barez الرئيسية', 'تطوير عقاري وتجاري', 'IQD', '2025', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed: Chart of Accounts (IFRS compliant)
-- ============================================================
INSERT INTO public.acc_accounts (code, name, type, standard, normal_balance) VALUES
  -- Assets
  -- Assets
  ('1101', 'الصندوق',                     'asset',     'IAS 7',   'debit' ),
  ('1102', 'البنك – الحساب الجاري',       'asset',     'IAS 7',   'debit' ),
  ('1103', 'البنك – حساب توفير',           'asset',     'IAS 7',   'debit' ),
  ('1201', 'ذمم مدينة – عملاء',           'asset',     'IFRS 15', 'debit' ),
  ('1301', 'مخزون ومستلزمات',             'asset',     'IAS 2',   'debit' ),
  ('1501', 'مباني ومنشآت',               'asset',     'IAS 16',  'debit' ),
  ('1502', 'أثاث ومعدات',                'asset',     'IAS 16',  'debit' ),
  ('1503', 'سيارات ومركبات',             'asset',     'IAS 16',  'debit' ),
  ('1601', 'أصول حق الاستخدام',          'asset',     'IFRS 16', 'debit' ),
  -- Liabilities
  ('2101', 'رواتب مستحقة',               'liability', 'IAS 19',  'credit'),
  ('2102', 'ذمم دائنة – موردون',         'liability', 'IAS 37',  'credit'),
  ('2103', 'ضريبة القيمة المضافة',       'liability', null,      'credit'),
  ('2201', 'قروض بنكية طويلة الأجل',    'liability', 'IFRS 9',  'credit'),
  ('2301', 'التزامات إيجار – IFRS 16',   'liability', 'IFRS 16', 'credit'),
  -- Equity
  ('3101', 'رأس المال',                  'equity',    'IAS 1',   'credit'),
  ('3102', 'الأرباح المحتجزة',           'equity',    'IAS 1',   'credit'),
  -- Revenue
  ('4101', 'إيرادات المبيعات',           'revenue',   'IFRS 15', 'credit'),
  ('4102', 'إيرادات الخدمات',            'revenue',   'IFRS 15', 'credit'),
  ('4201', 'إيرادات إيجارية',            'revenue',   'IFRS 40', 'credit'),
  ('4901', 'إيرادات متنوعة أخرى',       'revenue',   null,      'credit'),
  -- Expenses
  ('5101', 'تكلفة المبيعات',             'expense',   'IAS 2',   'debit' ),
  ('5201', 'مصروف الرواتب والأجور',      'expense',   'IAS 19',  'debit' ),
  ('5202', 'مكافآت وعلاوات',             'expense',   'IAS 19',  'debit' ),
  ('5301', 'إيجار المكاتب',              'expense',   'IFRS 16', 'debit' ),
  ('5302', 'كهرباء وماء',                'expense',   null,      'debit' ),
  ('5303', 'صيانة وإصلاح',               'expense',   null,      'debit' ),
  ('5401', 'استهلاك الأصول الثابتة',    'expense',   'IAS 16',  'debit' ),
  ('5501', 'مصروفات تمويلية – فوائد',   'expense',   'IFRS 9',  'debit' ),
  ('5901', 'مصروفات متنوعة',             'expense',   null,      'debit' )
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- Company Settings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.company_settings (
  id            INTEGER PRIMARY KEY DEFAULT 1,
  name          TEXT NOT NULL DEFAULT 'Barez Company',
  name_ar       TEXT NOT NULL DEFAULT 'شركة بارز',
  logo_url      TEXT,
  currency      TEXT NOT NULL DEFAULT 'EGP',
  currency_ar   TEXT NOT NULL DEFAULT 'ج.م',
  tax_no        TEXT,
  reg_no        TEXT,
  address       TEXT,
  phone         TEXT,
  email         TEXT,
  website       TEXT,
  founded_year  INTEGER,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_read_company"  ON public.company_settings;
DROP POLICY IF EXISTS "admin_write_company" ON public.company_settings;
CREATE POLICY "auth_read_company"   ON public.company_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_write_company" ON public.company_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));

INSERT INTO public.company_settings (id, name, name_ar, currency, currency_ar, address, phone, founded_year)
VALUES (1, 'Barez Company', 'شركة بارز للاستثمار العقاري', 'EGP', 'ج.م',
        'القاهرة، جمهورية مصر العربية', '+20-10-0000-0000', 2018)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Hotel Apartment Projects (5 units + consolidated)
-- ============================================================
INSERT INTO public.projects
  (project_no, name, name_ar, type, status, budget, start_date, description)
VALUES
  ('PRJ-001', 'Barez Heights Unit A',  'برج بارز — الوحدة أ',  'real_estate', 'active', 2500000, '2023-01-01', 'شقة فندقية — الطابق الثالث'),
  ('PRJ-002', 'Barez Heights Unit B',  'برج بارز — الوحدة ب',  'real_estate', 'active', 2500000, '2023-01-01', 'شقة فندقية — الطابق الثالث'),
  ('PRJ-003', 'Barez Heights Unit C',  'برج بارز — الوحدة ج',  'real_estate', 'active', 3200000, '2023-03-01', 'شقة فندقية — الطابق الخامس'),
  ('PRJ-004', 'Barez Heights Unit D',  'برج بارز — الوحدة د',  'real_estate', 'active', 3200000, '2023-03-01', 'شقة فندقية — الطابق الخامس'),
  ('PRJ-005', 'Barez Heights Unit E',  'برج بارز — الوحدة هـ', 'real_estate', 'active', 4800000, '2023-06-01', 'بنتهاوس — الطابق العاشر'),
  ('PRJ-006', 'Barez Consolidated',    'المحفظة المجمعة',       'other',       'active', 16200000,'2023-01-01', 'القوائم المالية المجمعة لجميع وحدات شركة بارز')
ON CONFLICT (project_no) DO NOTHING;

-- ============================================================
-- After running this SQL:
-- 1. Go to Supabase Auth → Users, create your first user
-- 2. Promote to Super Admin (replace UUID):
--
--   UPDATE public.profiles
--   SET role = 'super_admin', full_name_ar = 'اسمك هنا'
--   WHERE id = '<paste-user-uuid-here>';
-- ============================================================
