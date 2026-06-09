import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import type { Module, Profile } from '@/types'

export default async function ERPLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const role = (profile as Profile | null)?.role ?? 'employee'

  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .eq('is_active', true)
    .contains('allowed_roles', [role])
    .order('order_index', { ascending: true })

  return (
    <div className="flex min-h-screen" style={{ background: '#f0f2f5' }}>
      <Sidebar modules={(modules as Module[]) ?? []} profile={profile as Profile | null} />
      <div className="flex-1 flex flex-col min-h-screen" style={{ marginRight: '256px' }}>
        {children}
      </div>
    </div>
  )
}
