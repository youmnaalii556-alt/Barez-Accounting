import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { getAccounts } from '@/lib/accounting/data'
import CoaClient from './CoaClient'
import type { Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ChartOfAccountsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const accounts = await getAccounts()

  return (
    <>
      <Header profile={profile as Profile | null} />
      <CoaClient accounts={accounts} />
    </>
  )
}
