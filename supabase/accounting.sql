-- ============================================================
--  Barez ERP - Accounting / IFRS Schema (Double-Entry Engine)
--  Run AFTER schema.sql in: Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. Projects (each project keeps its own books; consolidated at group level)
CREATE TABLE IF NOT EXISTS public.acc_projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  activity      TEXT,
  currency      TEXT NOT NULL DEFAULT 'EGP',
  fiscal_year   TEXT NOT NULL DEFAULT 'يناير - ديسمبر',
  registration  TEXT,
  notes         TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Chart of Accounts (IFRS-tagged)
CREATE TABLE IF NOT EXISTS public.acc_accounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           TEXT UNIQUE NOT NULL,
  name           TEXT NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('asset','liability','equity','revenue','expense')),
  standard       TEXT,
  category       TEXT,
  normal_balance TEXT NOT NULL DEFAULT 'debit' CHECK (normal_balance IN ('debit','credit')),
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Journal Entries (header)
CREATE TABLE IF NOT EXISTS public.acc_journals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref          TEXT NOT NULL,
  entry_date   DATE NOT NULL,
  project_id   UUID REFERENCES public.acc_projects(id) ON DELETE CASCADE,
  description  TEXT NOT NULL,
  doc_ref      TEXT,
  posted       BOOLEAN DEFAULT TRUE,
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Journal Lines (detail) — debit/credit per account
CREATE TABLE IF NOT EXISTS public.acc_journal_lines (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id     UUID NOT NULL REFERENCES public.acc_journals(id) ON DELETE CASCADE,
  account_code   TEXT NOT NULL REFERENCES public.acc_accounts(code),
  description    TEXT,
  debit          NUMERIC(18,2) NOT NULL DEFAULT 0,
  credit         NUMERIC(18,2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'نقدي',
  line_order     INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_journals_project ON public.acc_journals(project_id);
CREATE INDEX IF NOT EXISTS idx_journals_date    ON public.acc_journals(entry_date);
CREATE INDEX IF NOT EXISTS idx_lines_journal    ON public.acc_journal_lines(journal_id);
CREATE INDEX IF NOT EXISTS idx_lines_account    ON public.acc_journal_lines(account_code);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.acc_projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_accounts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_journals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_journal_lines   ENABLE ROW LEVEL SECURITY;

-- All authenticated users can READ
CREATE POLICY "auth_read_projects" ON public.acc_projects      FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_accounts" ON public.acc_accounts      FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_journals" ON public.acc_journals      FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_lines"    ON public.acc_journal_lines FOR SELECT USING (auth.role() = 'authenticated');

-- super_admin + manager can WRITE
CREATE POLICY "mgr_write_projects" ON public.acc_projects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','manager'))
);
CREATE POLICY "mgr_write_accounts" ON public.acc_accounts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','manager'))
);
CREATE POLICY "mgr_write_journals" ON public.acc_journals FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','manager'))
);
CREATE POLICY "mgr_write_lines" ON public.acc_journal_lines FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','manager'))
);

-- ============================================================
-- Seed: default project + IFRS Chart of Accounts
-- ============================================================
INSERT INTO public.acc_projects (name, activity, currency, notes)
SELECT 'جوان - الشقق الفندقية', 'شقق فندقية', 'EGP', 'المشروع الرئيسي'
WHERE NOT EXISTS (SELECT 1 FROM public.acc_projects);

INSERT INTO public.acc_accounts (code, name, type, standard, category, normal_balance) VALUES
  ('1101','الصندوق - نقدي',              'asset',     'IAS 7',   'أصول متداولة',      'debit'),
  ('1102','البنك - حساب جاري',           'asset',     'IAS 7',   'أصول متداولة',      'debit'),
  ('1200','ذمم مدينة',                   'asset',     'IFRS 9',  'أصول متداولة',      'debit'),
  ('1300','مدفوعات مقدمة',               'asset',     'IAS 1',   'أصول متداولة',      'debit'),
  ('1600','أصول حق الاستخدام',           'asset',     'IFRS 16', 'أصول غير متداولة',  'debit'),
  ('2100','ذمم دائنة',                   'liability', 'IAS 1',   'التزامات متداولة',  'credit'),
  ('2200','مستحقات الموظفين',            'liability', 'IAS 19',  'التزامات متداولة',  'credit'),
  ('2600','التزامات الإيجار',            'liability', 'IFRS 16', 'التزامات',          'credit'),
  ('3100','رأس المال',                   'equity',    'IAS 1',   'حقوق الملكية',      'credit'),
  ('3200','الأرباح المحتجزة',            'equity',    'IAS 1',   'حقوق الملكية',      'credit'),
  ('4101','إيراد تأجير الغرف',           'revenue',   'IFRS 15', 'إيرادات تشغيلية',   'credit'),
  ('4102','إيراد تأجير - تحويل بنكي',    'revenue',   'IFRS 15', 'إيرادات تشغيلية',   'credit'),
  ('5101','مصروف رواتب',                 'expense',   'IAS 19',  'مصروفات موظفين',    'debit'),
  ('5201','مصروف كهرباء',                'expense',   'IAS 1',   'مصروفات تشغيل',     'debit'),
  ('5301','مصروف الإيجار',               'expense',   'IFRS 16', 'مصروفات تشغيل',     'debit'),
  ('5401','مصروف الصيانة',               'expense',   'IAS 16',  'مصروفات تشغيل',     'debit'),
  ('5501','مصروف النظافة',               'expense',   'IAS 1',   'مصروفات تشغيل',     'debit'),
  ('5601','عمولات الحجز',                'expense',   'IFRS 15', 'مصروفات تسويق',     'debit'),
  ('5701','رسوم بنكية',                  'expense',   'IFRS 9',  'مصروفات مالية',     'debit'),
  ('5801','مصروفات متنوعة',              'expense',   'IAS 1',   'مصروفات إدارية',    'debit')
ON CONFLICT (code) DO NOTHING;
