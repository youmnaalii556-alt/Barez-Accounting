export type UserRole = 'super_admin' | 'manager' | 'employee'

export interface Profile {
  id: string
  full_name: string | null
  full_name_ar: string | null
  role: UserRole
  department: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Module {
  id: string
  name: string
  name_ar: string
  slug: string
  icon: string
  description: string | null
  description_ar: string | null
  is_active: boolean
  order_index: number
  allowed_roles: UserRole[]
  parent_id: string | null
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string | null
  profile: Profile | null
}
