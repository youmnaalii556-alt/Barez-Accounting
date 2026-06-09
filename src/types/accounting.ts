// Types aligned to supabase/schema.sql (accounts / journal_entries / journal_lines / projects)

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
export type Nature = 'debit' | 'credit'
export type JournalStatus = 'draft' | 'posted' | 'void'

export interface Account {
  id: string
  code: string
  name: string
  name_ar: string
  type: AccountType
  nature: Nature
  parent_id: string | null
  level: number
  is_active: boolean
  notes: string | null
  created_at: string
}

export interface JournalLine {
  id: string
  entry_id: string
  account_id: string
  debit: number
  credit: number
  description: string | null
  line_order: number
}

export interface Journal {
  id: string
  entry_no: string
  entry_date: string
  description: string
  reference: string | null
  project_id: string | null
  status: JournalStatus
  posted_by: string | null
  posted_at: string | null
  created_by: string | null
  created_at: string
  lines?: JournalLine[]
}

export interface Project {
  id: string
  project_no: string
  name: string
  name_ar: string
  type: 'real_estate' | 'vehicle' | 'construction' | 'other'
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
  budget: number
  spent: number
  start_date: string | null
  end_date: string | null
  description: string | null
  manager_id: string | null
  created_at: string
}

/** Draft line used in the new-journal-entry form (before persistence). */
export interface DraftLine {
  account_id: string
  description: string
  debit: string
  credit: string
}

export const ACCOUNT_TYPES_AR: Record<AccountType, string> = {
  asset:     'أصل',
  liability: 'التزام',
  equity:    'حقوق ملكية',
  revenue:   'إيراد',
  expense:   'مصروف',
}
