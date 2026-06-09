import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import {
  Users, Fingerprint, DollarSign, Calendar,
  BarChart3, UserPlus, FileText, Shield, Star, Construction,
} from 'lucide-react'
import type { Profile } from '@/types'

export const dynamic = 'force-dynamic'

const MODULES = [
  {
    id: 'employees',
    title: 'سجلات الموظفين',
    desc: 'إدارة بيانات جميع الموظفين والعقود والهياكل التنظيمية',
    icon: Users,        color: '#3b82f6', gradient: 'linear-gradient(135deg,#2563eb,#3b82f6)',
    tags: ['بيانات شخصية', 'عقود', 'هيكل'],
  },
  {
    id: 'attendance',
    title: 'الحضور والانصراف',
    desc: 'نظام البصمة الإلكترونية — تسجيل الدخول والخروج واحتساب ساعات العمل تلقائياً',
    icon: Fingerprint,  color: '#8b5cf6', gradient: 'linear-gradient(135deg,#7c3aed,#8b5cf6)',
    tags: ['بصمة إلكترونية', 'ساعات عمل', 'يومي'],
    highlight: true,
  },
  {
    id: 'payroll',
    title: 'الرواتب والمكافآت',
    desc: 'الرواتب الشهرية، البدلات، الاستقطاعات، والتأمينات وفق IAS 19',
    icon: DollarSign,   color: '#22c55e', gradient: 'linear-gradient(135deg,#16a34a,#22c55e)',
    tags: ['IAS 19', 'تأمينات', 'قسائم راتب'],
  },
  {
    id: 'leave',
    title: 'الإجازات والغياب',
    desc: 'طلبات الإجازة وأرصدة الإجازات السنوية والمرضية والطارئة',
    icon: Calendar,     color: '#f59e0b', gradient: 'linear-gradient(135deg,#d97706,#f59e0b)',
    tags: ['طلبات إجازة', 'موافقات', 'أرصدة'],
  },
  {
    id: 'recruitment',
    title: 'التوظيف والسير الذاتية',
    desc: 'استقبال الـ CV، تتبع المتقدمين، مراحل المقابلات، وقرارات التعيين',
    icon: UserPlus,     color: '#0ea5e9', gradient: 'linear-gradient(135deg,#0284c7,#0ea5e9)',
    tags: ['CV', 'مقابلات', 'تعيينات'],
  },
  {
    id: 'performance',
    title: 'تقييم الأداء',
    desc: 'مؤشرات الأداء KPIs، التقييمات الدورية، وخطط التطوير الوظيفي',
    icon: Star,         color: '#f97316', gradient: 'linear-gradient(135deg,#ea580c,#f97316)',
    tags: ['KPI', 'تقييمات', 'تطوير'],
  },
  {
    id: 'documents',
    title: 'الوثائق والأرشيف',
    desc: 'أرشفة وثائق الموظفين، العقود، الشهادات، والمستندات الرسمية',
    icon: FileText,     color: '#64748b', gradient: 'linear-gradient(135deg,#475569,#64748b)',
    tags: ['أرشفة', 'عقود', 'شهادات'],
  },
  {
    id: 'permissions',
    title: 'الصلاحيات والأدوار',
    desc: 'تحديد صلاحيات الموظفين ومستويات الوصول داخل النظام',
    icon: Shield,       color: '#0f766e', gradient: 'linear-gradient(135deg,#0f766e,#14b8a6)',
    tags: ['أدوار', 'صلاحيات', 'وصول'],
  },
  {
    id: 'reports',
    title: 'التقارير والإحصاءات',
    desc: 'تقارير التوظيف، الرواتب، الحضور، والدوران الوظيفي',
    icon: BarChart3,    color: '#1b3a6b', gradient: 'linear-gradient(135deg,#0f2744,#1b3a6b)',
    tags: ['تقارير', 'إحصاءات', 'تحليلات'],
  },
]

export default async function HRPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <>
      <Header profile={profile as Profile | null} />
      <main className="flex-1 page-enter" style={{ background: '#f0f2f5' }}>

        {/* Department Hero */}
        <div style={{
          background: 'linear-gradient(135deg,#0f2744 0%,#1b3a6b 60%,#2a5298 100%)',
          padding: '36px 32px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-80px', left: '-60px', width: 320, height: 320,
            borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,.15),transparent 65%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <div style={{
                width: 58, height: 58, borderRadius: 16, flexShrink: 0,
                background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(59,130,246,.4)',
              }}>
                <Users size={28} color="#fff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 22, margin: 0 }}>إدارة الموارد البشرية</h1>
                  <span style={{
                    background: 'rgba(251,191,36,.15)', border: '1px solid rgba(251,191,36,.4)',
                    borderRadius: 20, padding: '2px 10px', fontSize: 11, color: '#fbbf24', fontWeight: 700,
                  }}>تحت الإنشاء</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 12, margin: '4px 0 0' }}>
                  Human Resources Management · IAS 19 · بصمة إلكترونية
                </p>
              </div>
            </div>

            {/* Biometric callout */}
            <div style={{
              background: 'rgba(124,58,237,.25)', border: '1px solid rgba(139,92,246,.4)',
              borderRadius: 12, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 14, maxWidth: 600,
            }}>
              <Fingerprint size={24} color="#a78bfa" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ color: '#c4b5fd', fontWeight: 700, fontSize: 13 }}>ربط نظام البصمة الإلكترونية</div>
                <div style={{ color: 'rgba(196,181,253,.6)', fontSize: 11, marginTop: 2 }}>
                  سيتم الربط بأجهزة البصمة لتسجيل الحضور تلقائياً واحتساب الأجور والإجازات
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div style={{ padding: '28px 32px 48px' }}>
          <p style={{ fontSize: 11, letterSpacing: 3, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 18, fontWeight: 700 }}>
            وحدات النظام · {MODULES.length} وحدة
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 16 }}>
            {MODULES.map(m => (
              <div key={m.id} style={{
                background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,.05)', padding: '20px',
                position: 'relative', overflow: 'hidden',
                ...(m.highlight ? { boxShadow: '0 4px 16px rgba(124,58,237,.15)', border: '1px solid rgba(139,92,246,.25)' } : {}),
              }}>
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: 4, height: '100%',
                  borderRadius: '0 14px 14px 0', background: m.gradient,
                }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: m.gradient, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 12px ${m.color}30`,
                  }}>
                    <m.icon size={22} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14, marginBottom: 5 }}>{m.title}</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {m.tags.map(t => (
                        <span key={t} style={{
                          background: `${m.color}12`, color: m.color,
                          border: `1px solid ${m.color}25`,
                          borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 600,
                        }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <span style={{
                    background: '#fffbeb', border: '1px solid #fde68a',
                    borderRadius: 20, padding: '2px 8px', fontSize: 10, color: '#92400e', fontWeight: 700,
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3,
                  }}>
                    <Construction size={9} /> قريباً
                  </span>
                </div>
                <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.65, margin: 0 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
