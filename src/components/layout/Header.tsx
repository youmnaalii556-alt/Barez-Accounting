'use client'

import { Bell, Search } from 'lucide-react'
import type { Profile } from '@/types'

interface HeaderProps {
  profile: Profile | null
  pageName: string
}

export default function Header({ profile, pageName }: HeaderProps) {
  const now = new Date()
  const dateAr = now.toLocaleDateString('ar-SA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-100 flex items-center
                       justify-between px-6 shadow-sm">
      {/* Page title */}
      <div>
        <h1 className="text-gray-800 font-bold text-lg leading-tight">{pageName}</h1>
        <p className="text-gray-400 text-xs">{dateAr}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200
                        rounded-xl px-3 py-2 text-sm text-gray-400 w-48 cursor-text">
          <Search className="w-4 h-4 flex-shrink-0" />
          <span>بحث...</span>
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl
                           bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white
                        text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1b3a6b, #2a5298)' }}>
          {(profile?.full_name_ar ?? profile?.full_name ?? '؟')[0]}
        </div>
      </div>
    </header>
  )
}
