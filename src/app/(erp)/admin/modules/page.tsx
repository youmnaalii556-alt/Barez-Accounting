'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import { ICON_LIST, ICON_REGISTRY, getIcon, getGradient } from '@/lib/icons'
import {
  Settings, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Check, X, Search,
} from 'lucide-react'
import type { Module, Profile, UserRole } from '@/types'

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'مدير النظام',
  manager:     'مدير قسم',
  employee:    'موظف',
}

interface ModuleForm {
  name: string; name_ar: string; slug: string; icon: string
  description_ar: string; allowed_roles: UserRole[]; order_index: number
}
const EMPTY: ModuleForm = {
  name: '', name_ar: '', slug: '', icon: 'settings',
  description_ar: '', allowed_roles: ['super_admin'], order_index: 0,
}

export default function AdminModulesPage() {
  const [modules,  setModules]  = useState<Module[]>([])
  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState<string | null>(null)
  const [adding,   setAdding]   = useState(false)
  const [form,     setForm]     = useState<ModuleForm>(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState<{ ok: boolean; text: string } | null>(null)
  const [iconOpen, setIconOpen] = useState(false)
  const [iconQ,    setIconQ]    = useState('')

  const supabase = createClient()

  async function load() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p as Profile)
    }
    const { data: m } = await supabase.from('modules').select('*').order('order_index')
    setModules((m as Module[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function flash(ok: boolean, text: string) {
    setMsg({ ok, text })
    setTimeout(() => setMsg(null), 3000)
  }

  function startEdit(mod: Module) {
    setEditing(mod.id); setAdding(false)
    setForm({ name: mod.name, name_ar: mod.name_ar, slug: mod.slug, icon: mod.icon,
      description_ar: mod.description_ar ?? '', allowed_roles: mod.allowed_roles,
      order_index: mod.order_index })
  }
  function startAdd()  { setAdding(true); setEditing(null); setForm({ ...EMPTY, order_index: modules.length }) }
  function cancel()    { setEditing(null); setAdding(false); setIconOpen(false) }
  function toggleRole(r: UserRole) {
    setForm(f => ({ ...f, allowed_roles: f.allowed_roles.includes(r)
      ? f.allowed_roles.filter(x => x !== r) : [...f.allowed_roles, r] }))
  }

  async function saveEdit() {
    if (!editing) return
    setSaving(true)
    const { error } = await supabase.from('modules').update({
      name: form.name, name_ar: form.name_ar, slug: form.slug, icon: form.icon,
      description_ar: form.description_ar || null, allowed_roles: form.allowed_roles,
      order_index: form.order_index, updated_at: new Date().toISOString(),
    }).eq('id', editing)
    setSaving(false)
    if (error) { flash(false, 'فشل الحفظ'); return }
    flash(true, 'تم الحفظ بنجاح'); cancel(); load()
  }

  async function saveAdd() {
    setSaving(true)
    const { error } = await supabase.from('modules').insert({
      name: form.name, name_ar: form.name_ar, slug: form.slug, icon: form.icon,
      description_ar: form.description_ar || null, allowed_roles: form.allowed_roles,
      order_index: form.order_index, is_active: true,
    })
    setSaving(false)
    if (error) { flash(false, `فشل الإضافة: ${error.message}`); return }
    flash(true, 'تمت إضافة الوحدة بنجاح'); cancel(); load()
  }

  async function toggleActive(mod: Module) {
    await supabase.from('modules').update({ is_active: !mod.is_active }).eq('id', mod.id)
    load()
  }
  async function deleteModule(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذه الوحدة؟')) return
    await supabase.from('modules').delete().eq('id', id)
    flash(true, 'تم الحذف'); load()
  }

  const filteredIcons = ICON_LIST.filter(n => n.includes(iconQ.toLowerCase()))

  return (
    <>
      <Header profile={profile} pageName="إدارة الوحدات" />
      <main className="flex-1 p-6 space-y-5">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-gray-100">
              <Settings className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">إدارة الوحدات</h2>
              <p className="text-gray-400 text-sm">إضافة وتعديل وحدات النظام وأيقوناتها</p>
            </div>
          </div>
          <button onClick={startAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow"
            style={{ background: 'linear-gradient(135deg,#1b3a6b,#2a5298)' }}>
            <Plus className="w-4 h-4" /> إضافة وحدة
          </button>
        </div>

        {/* Flash */}
        {msg && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border
            ${msg.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {msg.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {msg.text}
          </div>
        )}

        {/* Add / Edit form */}
        {(adding || editing) && (
          <ModuleForm
            form={form} setForm={setForm}
            onSave={adding ? saveAdd : saveEdit}
            onCancel={cancel}
            saving={saving}
            title={adding ? 'إضافة وحدة جديدة' : 'تعديل الوحدة'}
            toggleRole={toggleRole}
            iconOpen={iconOpen} setIconOpen={setIconOpen}
            iconQ={iconQ} setIconQ={setIconQ}
            filteredIcons={filteredIcons}
          />
        )}

        {/* Modules grid preview */}
        {!loading && modules.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">
              معاينة الأيقونات
            </p>
            <div className="flex flex-wrap gap-3">
              {modules.map((mod, i) => {
                const Icon = getIcon(mod.icon)
                return (
                  <div key={mod.id} title={mod.name_ar}
                    className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1
                               shadow-sm cursor-default"
                    style={{ background: getGradient(mod.slug, i), opacity: mod.is_active ? 1 : 0.4 }}>
                    <Icon className="w-6 h-6 text-white" />
                    <span className="text-white text-[9px] font-bold text-center px-1 leading-tight">
                      {mod.name_ar.slice(0, 8)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f8fafc' }} className="border-b border-gray-100">
                {['#','الوحدة','المسار','الأيقونة','الصلاحيات','الحالة','إجراءات'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center text-gray-400">جاري التحميل...</td></tr>
              ) : modules.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-gray-400">لا توجد وحدات</td></tr>
              ) : modules.map((mod, i) => {
                const Icon = getIcon(mod.icon)
                return (
                  <tr key={mod.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{mod.order_index}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: getGradient(mod.slug, i) }}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{mod.name_ar}</p>
                          <p className="text-gray-400 text-xs">{mod.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">/{mod.slug}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{mod.icon}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {mod.allowed_roles.map(r => (
                          <span key={r} className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              background: r==='super_admin'?'#1b3a6b15':r==='manager'?'#8b5cf615':'#22c55e15',
                              color:      r==='super_admin'?'#1b3a6b'  :r==='manager'?'#8b5cf6'  :'#22c55e',
                            }}>
                            {ROLE_LABELS[r]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(mod)}
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
                          ${mod.is_active?'bg-green-50 text-green-600':'bg-gray-100 text-gray-400'}`}>
                        {mod.is_active
                          ? <><ToggleRight className="w-3.5 h-3.5"/>نشط</>
                          : <><ToggleLeft  className="w-3.5 h-3.5"/>متوقف</>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(mod)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg
                                     text-gray-400 hover:text-blue-500 hover:bg-blue-50">
                          <Pencil className="w-3.5 h-3.5"/>
                        </button>
                        <button onClick={() => deleteModule(mod.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg
                                     text-gray-400 hover:text-red-500 hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}

/* ── Inline form component ── */
function ModuleForm({
  form, setForm, onSave, onCancel, saving, title, toggleRole,
  iconOpen, setIconOpen, iconQ, setIconQ, filteredIcons,
}: {
  form: ModuleForm
  setForm: React.Dispatch<React.SetStateAction<ModuleForm>>
  onSave: () => void; onCancel: () => void; saving: boolean; title: string
  toggleRole: (r: UserRole) => void
  iconOpen: boolean; setIconOpen: (v: boolean) => void
  iconQ: string; setIconQ: (v: string) => void
  filteredIcons: string[]
}) {
  const SelectedIcon = getIcon(form.icon)

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-5">
      <h3 className="font-bold text-gray-700">{title}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Name AR */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">الاسم بالعربية *</label>
          <input value={form.name_ar} onChange={e=>setForm(f=>({...f,name_ar:e.target.value}))}
            placeholder="مثال: الموارد البشرية"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none text-gray-800" />
        </div>
        {/* Name EN */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">الاسم بالإنجليزية</label>
          <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
            placeholder="مثال: HR" dir="ltr"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none text-gray-800" />
        </div>
        {/* Slug */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">المسار (slug) *</label>
          <input value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))}
            placeholder="مثال: hr" dir="ltr"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none text-gray-800" />
        </div>
        {/* Order */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">الترتيب</label>
          <input type="number" value={form.order_index}
            onChange={e=>setForm(f=>({...f,order_index:+e.target.value}))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none text-gray-800" />
        </div>
        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">الوصف (اختياري)</label>
          <input value={form.description_ar} onChange={e=>setForm(f=>({...f,description_ar:e.target.value}))}
            placeholder="وصف مختصر للوحدة"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none text-gray-800" />
        </div>
      </div>

      {/* Icon picker */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">الأيقونة</label>
        <button type="button" onClick={() => setIconOpen(!iconOpen)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200
                     bg-white hover:bg-gray-50 text-sm text-gray-700">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#1b3a6b,#2a5298)' }}>
            <SelectedIcon className="w-4 h-4 text-white" />
          </div>
          <span>{form.icon}</span>
          <span className="text-gray-400 text-xs">{iconOpen ? '▲ إغلاق' : '▼ اختر أيقونة'}</span>
        </button>

        {iconOpen && (
          <div className="mt-3 bg-white rounded-2xl border border-gray-200 shadow-lg p-4 space-y-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                value={iconQ}
                onChange={e => setIconQ(e.target.value)}
                placeholder="ابحث عن أيقونة... (مثال: user, home, chart)"
                dir="ltr"
                className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder:text-gray-400"
              />
            </div>

            {/* Icon grid */}
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-56 overflow-y-auto">
              {filteredIcons.map(name => {
                const Ic = ICON_REGISTRY[name]
                const selected = form.icon === name
                return (
                  <button key={name} type="button" title={name}
                    onClick={() => { setForm(f => ({ ...f, icon: name })); setIconOpen(false); setIconQ('') }}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl
                               border text-xs hover:scale-110 transition-transform"
                    style={{
                      background:   selected ? '#1b3a6b' : '#f8fafc',
                      borderColor:  selected ? '#1b3a6b' : '#e2e8f0',
                      color:        selected ? '#fff'    : '#64748b',
                    }}>
                    <Ic className="w-5 h-5" />
                    <span className="truncate w-full text-center text-[9px]">
                      {name.replace(/-/g, ' ')}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="text-gray-400 text-xs">{filteredIcons.length} أيقونة متاحة</p>
          </div>
        )}
      </div>

      {/* Roles */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">الصلاحيات</label>
        <div className="flex gap-3 flex-wrap">
          {(['super_admin','manager','employee'] as UserRole[]).map(r => (
            <button key={r} type="button" onClick={() => toggleRole(r)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border"
              style={{
                background:  form.allowed_roles.includes(r) ? '#1b3a6b' : '#fff',
                color:       form.allowed_roles.includes(r) ? '#fff'    : '#64748b',
                borderColor: form.allowed_roles.includes(r) ? '#1b3a6b' : '#e2e8f0',
              }}>
              {form.allowed_roles.includes(r) && <Check className="w-3.5 h-3.5" />}
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button onClick={onSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold
                     shadow disabled:opacity-50"
          style={{ background: '#1b3a6b' }}>
          <Check className="w-4 h-4" />
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-600 text-sm
                     font-medium border border-gray-200 hover:bg-gray-100">
          <X className="w-4 h-4" /> إلغاء
        </button>
      </div>
    </div>
  )
}
