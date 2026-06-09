export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
export type NormalBalance = 'debit' | 'credit'

export interface AccProject {
  id: string
  name: string
  activity: string | null
  currency: string
  fiscal_year: string
  registration: string | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export interface Account {
  id: string
  code: string
  name: string
  type: AccountType
  standard: string | null
  category: string | null
  normal_balance: NormalBalance
  is_active: boolean
  created_at: string
}

export interface JournalLine {
  id: string
  journal_id: string
  account_code: string
  description: string | null
  debit: number
  credit: number
  payment_method: string | null
  line_order: number
}

export interface Journal {
  id: string
  ref: string
  entry_date: string
  project_id: string | null
  description: string
  doc_ref: string | null
  posted: boolean
  created_by: string | null
  created_at: string
  lines?: JournalLine[]
}

/** Draft line used in the new-journal-entry form (before persistence). */
export interface DraftLine {
  account_code: string
  description: string
  debit: string
  credit: string
  payment_method: string
}

export const ACCOUNT_TYPES_AR: Record<AccountType, string> = {
  asset:     'أصل',
  liability: 'التزام',
  equity:    'حقوق ملكية',
  revenue:   'إيراد',
  expense:   'مصروف',
}

export const IFRS_STANDARDS = [
  'IAS 1', 'IAS 7', 'IAS 16', 'IAS 19',
  'IFRS 9', 'IFRS 15', 'IFRS 16', 'IFRS 40',
] as const

export const PAYMENT_METHODS = ['نقدي', 'تحويل بنكي', 'Booking', 'آجل'] as const
