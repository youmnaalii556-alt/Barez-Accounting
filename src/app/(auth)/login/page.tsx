'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f2744 0%, #1b3a6b 50%, #2a5298 100%)' }}>

      {/* Background decorative circles */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #c5a028, transparent)' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #c5a028, transparent)' }} />

      <div className="relative w-full max-w-md px-4">

        {/* Logo & Company Name */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #c5a028, #e2b93b)' }}>
            <span className="text-white font-bold text-3xl">B</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Barez ERP</h1>
          <p className="text-blue-200 mt-1 text-sm">نظام إدارة الموارد المؤسسية</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800">تسجيل الدخول</h2>
            <p className="text-gray-500 text-sm mt-1">أدخل بياناتك للوصول إلى النظام</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700
                            rounded-lg px-4 py-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="example@barez.com"
                  dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm
                             focus:outline-none focus:ring-2 focus:border-transparent text-gray-800
                             placeholder:text-gray-400"
                  style={{ '--tw-ring-color': '#1b3a6b' } as React.CSSProperties}
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm
                             focus:outline-none focus:ring-2 focus:border-transparent text-gray-800
                             placeholder:text-gray-400"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm
                         disabled:opacity-60 disabled:cursor-not-allowed
                         shadow-lg hover:shadow-xl active:scale-[0.98]"
              style={{ background: loading
                ? '#94a3b8'
                : 'linear-gradient(135deg, #1b3a6b, #2a5298)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  جاري تسجيل الدخول...
                </span>
              ) : 'دخول'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-300 text-xs mt-6">
          © {new Date().getFullYear()} Barez Company — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  )
}
