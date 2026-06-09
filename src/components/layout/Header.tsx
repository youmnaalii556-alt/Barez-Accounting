'use client'

import { Bell, Search, Home, ChevronLeft } from 'lucide-react'
import type { Profile } from '@/types'

interface HeaderProps {
  profile: Profile | null
  pageName: string
}

export default function Header({ profile, pageName }: HeaderProps) {
  const name = profile?.full_name_ar ?? profile?.full_name ?? 'مستخدم'
  const initial = name[0] ?? '؟'

  return (
    <header style={{
      height: '64px', background: '#fff', borderBottom: '1px solid #E4E6EF',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', position: 'sticky', top: 0, zIndex: 40,
      boxShadow: '0 1px 0 #E4E6EF',
    }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Home size={15} color="#A1A5B7" />
        <ChevronLeft size={14} color="#D1D5DB" />
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#181C32' }}>{pageName}</span>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        {/* Search */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          height: '38px', padding: '0 14px',
          background: '#F5F8FA', border: '1px solid #E4E6EF',
          borderRadius: '10px', cursor: 'pointer', color: '#A1A5B7', fontSize: '13px',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1b3a6b'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#E4E6EF'}>
          <Search size={14} />
          <span>بحث سريع...</span>
          <kbd style={{
            fontSize: '11px', background: '#E4E6EF', color: '#7E8299',
            padding: '2px 6px', borderRadius: '5px', fontFamily: 'monospace',
          }}>⌘K</kbd>
        </button>

        {/* Notifications */}
        <button style={{
          position: 'relative', width: '38px', height: '38px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#F5F8FA', border: '1px solid #E4E6EF',
          borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1b3a6b'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#E4E6EF'}>
          <Bell size={16} color="#5E6278" />
          <span style={{
            position: 'absolute', top: '8px', right: '9px',
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#F1416C', border: '1.5px solid #fff',
          }} />
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', background: '#E4E6EF', margin: '0 4px' }} />

        {/* User chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          height: '38px', padding: '0 12px',
          background: '#F5F8FA', border: '1px solid #E4E6EF',
          borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1b3a6b'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#E4E6EF'}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '8px',
            background: 'linear-gradient(135deg,#1b3a6b,#2a5298)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '12px', fontWeight: 700, flexShrink: 0,
          }}>
            {initial}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#3F4254' }}>{name}</span>
        </div>
      </div>
    </header>
  )
}
