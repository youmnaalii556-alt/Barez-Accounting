'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import {
  Settings, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Check, X, ChevronUp, ChevronDown,
} from 'lucide-react'
import type { Module, Profile, UserRole } from '@/types'

const ALL_ROLES: UserRole[] = ['super_admin', 'manager', 'employee']
const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'مدير النظام',
  manager:     'مدير قسم',
  employee:    'موظف',
}

const ICON_OPTIONS = [
  'users','dollar-sign','briefcase','book-open','settings',
  'bar-chart','file-text','calendar','building','truck','home','shield',
]

interface ModuleForm {
  name: string
  name_ar: string
  slug: string
  icon: string
  description: string
  description_ar: string
  allowed_roles: UserRole[]
  order_index: number
}

const DEFAULT_FORM: ModuleForm = {
  name: '', name_ar: '', slug: '', icon: 'settings',
  description: '', description_ar: '',
  allowed_roles: ['super_admin'], order_index: 0,
}

export default function AdminModulesPage() {
  const [modules, setModules]   = useState<Module[]>([])
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState<string | null>(null)
  const [adding, setAdding]     = useState(false)
  const [form, setForm]         = useState<ModuleForm>(DEFAULT_FORM)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

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

  function flash(type: 'ok' | 'err', text: string) {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  function startEdit(mod: Module) {
    setEditing(mod.id)
    setAdding(false)
    setForm({
      name: mod.name, name_ar: mod.name_ar, slug: mod.slug,
      icon: mod.icon, description: mod.description ?? '',
      description_ar: mod.description_ar ?? '',
      allowed_roles: mod.allowed_roles, order_index: mod.order_index,
    })
  }

  function startAdd() {
    setAdding(true)
    setEditing(null)
    setForm({ ...DEFAULT_FORM, order_index: modules.length })
  }

  function cancelEdit() { setEditing(null); setAdding(false) }

  function toggleRole(role: UserRole) {
    setForm(f => ({
      ...f,
      allowed_roles: f.allowed_roles.includes(role)
        ? f.allowed_roles.filter(r => r !== role)
        : [...f.allowed_roles, role],
    }))
  }

  async function saveEdit() {
    if (!editing) return
    setSaving(true)
    const { error } = await supabase.from('modules').update({
      name: form.name, name_ar: form.name_ar, slug: form.slug,
      icon: form.icon, description: form.description || null,
      description_ar: form.description_ar || null,
      allowed_roles: form.allowed_roles, order_index: form.order_index,
      updated_at: new Date().toISOString(),
    }).eq('id', editing)
    setSaving(false)
    if (error) { flash('err', 'فشل الحفظ'); return }
    flash('ok', 'تم الحفظ بنجاح')
    cancelEdit()
    load()
  }

  async function saveAdd() {
    setSaving(true)
    const { error } = await supabase.from('modules').insert({
      name: form.name, name_ar: form.name_ar, slug: form.slug,
      icon: form.icon, description: form.description || null,
      description_ar: form.description_ar || null,
      allowed_roles: form.allowed_roles, order_index: form.order_index,
      is_active: true,
    })
    setSaving(false)
    if (error) { flash('err', `فشل الإضافة: ${error.message}`); return }
    flash('ok', 'تمت إضافة الوحدة بنجاح')
    cancelEdit()
    load()
  }

  async function toggleActive(mod: Module) {
    await supabase.from('modules').update({ is_active: !mod.is_active }).eq('id', mod.id)
    load()
  }

  async function deleteModule(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذه الوحدة؟')) return
    await supabase.from('modules').delete().eq('id', id)
    flash('ok', 'تم الحذف')
    load()
  }

  const isEditingRow = (id: string) => editing === id

  return (
    <>
      <Header profile={profile} pageName="إدارة الوحدات" />
      <main className="flex-1 p-6 space-y-5">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: '#f8fafc' }}>
              <Settings className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">إدارة الوحدات</h2>
              <p className="text-gray-500 text-sm">إضافة وتعديل وحذف وحدات النظام</p>
            </div>
          </div>
          <button onClick={startAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow"
            style={{ background: 'linear-gradient(135deg, #1b3a6b, #2a5298)' }}>
            <Plus className="w-4 h-4" />
            إضافة وحدة
          </button>
        </div>

        {/* Flash message */}
        {msg && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border
                          ${msg.type === 'ok'
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'}`}>
            {msg.type === 'ok' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {msg.text}
          </div>
        )}

        {/* Add form */}
        {adding && (
          <ModuleFormCard
            form={form} setForm={setForm} onSave={saveAdd} onCancel={cancelEdit}
            saving={saving} title="إضافة وحدة جديدة" toggleRole={toggleRole} />
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100" style={{ background: '#f8fafc' }}>
                {['الترتيب','الاسم','المسار','الأيقونة','الصلاحيات','الحالة','إجراءات'].map(h => (
                  <th key={h} className="px-4 py-3 text-right font-semibold text-gray-600 text-xs">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center text-gray-400">جاري التحميل...</td></tr>
              ) : modules.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-gray-400">لا توجد وحدات</td></tr>
              ) : modules.map(mod => (
                isEditingRow(mod.id) ? (
                  <tr key={mod.id}>
                    <td colSpan={7} className="p-4">
                      <ModuleFormCard
                        form={form} setForm={setForm} onSave={saveEdit} onCancel={cancelEdit}
                        saving={saving} title={`تعديل: ${mod.name_ar}`} toggleRole={toggleRole} />
                    </td>
                  </tr>
                ) : (
                  <tr key={mod.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-500">{mod.order_index}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{mod.name_ar}</p>
                      <p className="text-gray-400 text-xs">{mod.name}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">/{mod.slug}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{mod.icon}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {mod.allowed_roles.map(r => (
                          <span key={r} className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              background: r === 'super_admin' ? '#1b3a6b15' : r === 'manager' ? '#8b5cf615' : '#22c55e15',
                              color:      r === 'super_admin' ? '#1b3a6b'   : r === 'manager' ? '#8b5cf6'   : '#22c55e',
                            }}>
                            {ROLE_LABELS[r]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(mod)}
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
                                    ${mod.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {mod.is_active
                          ? <><ToggleRight className="w-3.5 h-3.5" /> نشط</>
                          : <><ToggleLeft  className="w-3.5 h-3.5" /> متوقف</>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(mod)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg
                                     text-gray-400 hover:text-blue-500 hover:bg-blue-50">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteModule(mod.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg
                                     text-gray-400 hover:text-red-500 hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}

function ModuleFormCard({
  form, setForm, onSave, onCancel, saving, title, toggleRole
}: {
  form: ModuleForm
  setForm: React.Dispatch<React.SetStateAction<ModuleForm>>
  onSave: () => void
  onCancel: () => void
  saving: boolean
  title: string
  toggleRole: (r: UserRole) => void
}) {
  const field = (label: string, key: keyof ModuleForm, placeholder = '') => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        value={form[key] as string}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:border-transparent text-gray-800"
      />
    </div>
  )

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="font-bold text-gray-700 text-sm">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {field('الاسم بالعربية *',  'name_ar',        'مثال: الموارد البشرية')}
        {field('الاسم بالإنجليزية', 'name',            'مثال: HR')}
        {field('المسار (slug) *',    'slug',            'مثال: hr')}
        {field('الأيقونة',           'icon',            'مثال: users')}
        {field('الترتيب',            'order_index',    '0')}
        {field('الوصف بالعربية',     'description_ar', '')}
      </div>

      {/* Roles */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">الصلاحيات</label>
        <div className="flex gap-3">
          {(['super_admin', 'manager', 'employee'] as UserRole[]).map(r => (
            <button key={r} type="button" onClick={() => toggleRole(r)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
              style={{
                background: form.allowed_roles.includes(r) ? '#1b3a6b' : '#fff',
                color:      form.allowed_roles.includes(r) ? '#fff' : '#64748b',
                borderColor: form.allowed_roles.includes(r) ? '#1b3a6b' : '#e2e8f0',
              }}>
              {form.allowed_roles.includes(r) && <Check className="w-3 h-3" />}
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button onClick={onSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium
                     disabled:opacity-50"
          style={{ background: '#1b3a6b' }}>
          {saving ? 'جاري الحفظ...' : <><Check className="w-3.5 h-3.5" /> حفظ</>}
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-gray-600 text-sm
                     font-medium border border-gray-200 hover:bg-gray-100">
          <X className="w-3.5 h-3.5" /> إلغاء
        </button>
      </div>
    </div>
  )
}
