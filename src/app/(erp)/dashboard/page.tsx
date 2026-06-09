import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { getIcon, getGradient } from '@/lib/icons'
import { LayoutDashboard } from 'lucide-react'
import type { Module, Profile } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const role = (profile as Profile | null)?.role ?? 'employee'

  const { data: modules } = await supabase
    .from('modules').select('*')
    .eq('is_active', true)
    .contains('allowed_roles', [role])
    .order('order_index', { ascending: true })

  const list = (modules as Module[]) ?? []
  const displayName = (profile as Profile | null)?.full_name_ar
    ?? (profile as Profile | null)?.full_name
    ?? 'مستخدم'

  return (
    <>
      <Header profile={profile as Profile | null} pageName="الرئيسية" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10"
        style={{ background: 'linear-gradient(160deg,#f0f4ff 0%,#f0f2f5 60%,#f5f0ff 100%)' }}>

        {/* Welcome */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-md"
            style={{ background: 'linear-gradient(135deg,#0f2744,#1b3a6b)' }}>
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            أهلاً بك، {displayName}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            اختر الوحدة التي تريد العمل عليها
          </p>
        </div>

        {/* Icon grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 w-full max-w-2xl">
          {list.map((mod, i) => {
            const Icon     = getIcon(mod.icon)
            const gradient = getGradient(mod.slug, i)

            return (
              <Link key={mod.id} href={`/${mod.slug}`}
                className="group flex flex-col items-center justify-center gap-3
                           aspect-square rounded-3xl shadow-lg hover:shadow-2xl
                           hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  background: gradient,
                  transition: 'transform 220ms cubic-bezier(.34,1.56,.64,1), box-shadow 220ms',
                }}>

                {/* Icon bubble */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Icon className="w-8 h-8 text-white drop-shadow" />
                </div>

                {/* Label */}
                <span className="text-white font-bold text-sm text-center px-2 leading-snug
                                 drop-shadow-sm">
                  {mod.name_ar}
                </span>
              </Link>
            )
          })}
        </div>

        {list.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <p className="text-lg font-medium">لا توجد وحدات متاحة</p>
            <p className="text-sm mt-1">تواصل مع مدير النظام</p>
          </div>
        )}
      </main>
    </>
  )
}
