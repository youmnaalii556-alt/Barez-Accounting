import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { getProjects, getAccounts, getJournals, nextJournalNo } from '@/lib/accounting/data'
import JournalClient from './JournalClient'
import type { Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function JournalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const [projects, accounts, journals, nextNo] = await Promise.all([
    getProjects(), getAccounts(), getJournals(), nextJournalNo(),
  ])

  return (
    <>
      <Header profile={profile as Profile | null} />
      <JournalClient projects={projects} accounts={accounts} journals={journals} nextNo={nextNo} />
    </>
  )
}
