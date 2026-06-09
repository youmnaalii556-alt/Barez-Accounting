'use client'

import { useEffect, useState } from 'react'

export default function LiveClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  if (!now) return <span style={{ color: '#c5a028', fontWeight: 700, fontSize: 13 }}>--:--:--</span>

  const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  return <span style={{ color: '#c5a028', fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>{time}</span>
}
