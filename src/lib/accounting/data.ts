/**
 * Server-side data access for the accounting module.
 * Reads accounts / journal_entries / journal_lines / projects from Supabase.
 */
import { createClient } from '@/lib/supabase/server'
import type { Account, Journal, JournalLine, Project } from '@/types/accounting'

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects').select('*')
    .order('created_at', { ascending: true })
  return (data as Project[]) ?? []
}

export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('accounts').select('*')
    .order('code', { ascending: true })
  return (data as Account[]) ?? []
}

/** Posted journals with their lines, optionally filtered by project. */
export async function getJournals(projectId?: string | null): Promise<Journal[]> {
  const supabase = await createClient()
  let query = supabase
    .from('journal_entries')
    .select('*, lines:journal_lines(*)')
    .eq('status', 'posted')
    .order('entry_date', { ascending: false })
  if (projectId && projectId !== 'all') query = query.eq('project_id', projectId)

  const { data } = await query
  return ((data as (Journal & { lines: JournalLine[] })[]) ?? []).map(j => ({
    ...j,
    lines: (j.lines ?? []).sort((a, b) => a.line_order - b.line_order),
  }))
}

/** Next sequential journal number, e.g. JE-0042. */
export async function nextJournalNo(): Promise<string> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('journal_entries').select('*', { count: 'exact', head: true })
  return 'JE-' + String((count ?? 0) + 1).padStart(4, '0')
}
