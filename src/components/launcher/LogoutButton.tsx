'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }
  return (
    <button onClick={handleLogout}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(220,38,38,.15)', border: '1px solid rgba(220,38,38,.3)',
        color: '#fca5a5', borderRadius: 8, padding: '7px 14px',
        fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      }}>
      <LogOut size={14} /> خروج
    </button>
  )
}
