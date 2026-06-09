/**
 * Server-side data access for the accounting module.
 * Fetches projects, chart of accounts, and journals (with lines)
 * from Supabase, shaped for the engine in ./engine.
 */
import { createClient } from '@/lib/supabase/server'
import type { AccProject, Account, Journal, JournalLine } from '@/types/accounting'

export async function getProjects(): Promise<AccProject[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('acc_projects').select('*')
    .order('created_at', { ascending: true })
  return (data as AccProject[]) ?? []
}

export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('acc_accounts').select('*')
    .order('code', { ascending: true })
  return (data as Account[]) ?? []
}

/** Fetch journals with their lines, optionally filtered by project. */
export async function getJournals(projectId?: string | null): Promise<Journal[]> {
  const supabase = await createClient()
  let query = supabase
    .from('acc_journals')
    .select('*, lines:acc_journal_lines(*)')
    .order('entry_date', { ascending: false })
  if (projectId && projectId !== 'all') query = query.eq('project_id', projectId)

  const { data } = await query
  return ((data as (Journal & { lines: JournalLine[] })[]) ?? []).map(j => ({
    ...j,
    lines: (j.lines ?? []).sort((a, b) => a.line_order - b.line_order),
  }))
}

/** Next sequential journal reference, e.g. JE-0042. */
export async function nextJournalRef(): Promise<string> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('acc_journals').select('*', { count: 'exact', head: true })
  return 'JE-' + String((count ?? 0) + 1).padStart(4, '0')
}
