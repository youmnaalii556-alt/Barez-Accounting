'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { AccountType, Nature } from '@/types/accounting'

export interface CreateAccountInput {
  code: string
  name_ar: string
  name: string
  type: AccountType
  nature: Nature
  notes: string
}

export interface ActionResult { ok: boolean; error?: string }

export async function createAccount(input: CreateAccountInput): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'غير مصرح — سجّل الدخول' }

  if (!input.code.trim())    return { ok: false, error: 'أدخل رقم الحساب' }
  if (!input.name_ar.trim()) return { ok: false, error: 'أدخل اسم الحساب بالعربية' }

  const { error } = await supabase.from('accounts').insert({
    code: input.code.trim(),
    name: input.name.trim() || input.name_ar.trim(),
    name_ar: input.name_ar.trim(),
    type: input.type,
    nature: input.nature,
    level: 3,          // postable leaf account
    is_active: true,
    notes: input.notes.trim() || null,
  })

  if (error) {
    if (error.code === '23505') return { ok: false, error: 'رقم الحساب موجود بالفعل' }
    return { ok: false, error: `فشل الإضافة: ${error.message}` }
  }

  revalidatePath('/accounting/chart-of-accounts')
  revalidatePath('/accounting/journal')
  return { ok: true }
}

export async function deleteAccount(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('accounts').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') return { ok: false, error: 'لا يمكن حذف حساب مستخدم في قيود' }
    return { ok: false, error: error.message }
  }
  revalidatePath('/accounting/chart-of-accounts')
  return { ok: true }
}
