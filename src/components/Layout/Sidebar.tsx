import { useState } from 'react'
import { format, startOfWeek, addDays, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, endOfWeek } from 'date-fns'
import { it as itLocale, enUS } from 'date-fns/locale'
import { LogOut, Bell, RefreshCw } from 'lucide-react'
import type { Language } from '../../types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../types'
import type { EventCategory } from '../../types'
import { requestNotificationPermission } from '../../hooks/useCalendarSync'

interface SidebarProps {
  currentDate: Date
  lang: Language
  userEmail?: string
  userAvatar?: string
  onDateClick: (date: Date) => void
  onSignOut: () => void
  onSync?: () => void
  isSyncing?: boolean
}

const CATEGORIES: EventCategory[] = ['work', 'personal', 'health', 'social', 'other']

export default function Sidebar({
  currentDate,
  lang,
  userEmail,
  onDateClick,
  onSignOut,
  onSync,
  isSyncing,
}: SidebarProps) {
  const locale = lang === 'it' ? itLocale : enUS
  const [miniDate, setMiniDate] = useState(new Date(currentDate))
  const [notifGranted, setNotifGranted] = useState(Notification.permission === 'granted')

  const today = new Date()

  // Mini calendar
  const miniStart = startOfWeek(startOfMonth(miniDate), { weekStartsOn: 0 })
  const miniEnd = endOfWeek(endOfMonth(miniDate), { weekStartsOn: 0 })
  const miniDays = eachDayOfInterval({ start: miniStart, end: miniEnd })
  const miniWeeks: Date[][] = []
  for (let i = 0; i < miniDays.length; i += 7) miniWeeks.push(miniDays.slice(i, i + 7))

  const dayInitials = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, i)
    return format(d, 'EEEEE', { locale })
  })

  async function handleNotif() {
    const perm = await requestNotificationPermission()
    setNotifGranted(perm === 'granted')
  }

  const labels = {
    it: {
      categories: 'Categorie',
      notifications: 'Notifiche',
      sync: 'Sincronizza',
      signOut: 'Esci',
      notifOn: 'Attivate',
      notifOff: 'Attiva notifiche',
    },
    en: {
      categories: 'Categories',
      notifications: 'Notifications',
      sync: 'Sync',
      signOut: 'Sign out',
      notifOn: 'Enabled',
      notifOff: 'Enable notifications',
    },
  }
  const l = labels[lang]

  return (
    <aside style={styles.sidebar}>
      {/* Mini calendar */}
      <div style={styles.section}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <button style={styles.miniNavBtn} onClick={() => setMiniDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>‹</button>
          <span style={styles.miniMonthLabel}>{format(miniDate, 'MMM yyyy', { locale })}</span>
          <button style={styles.miniNavBtn} onClick={() => setMiniDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>›</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
          {dayInitials.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#8a8aaa', textTransform: 'uppercase' }}>{d}</div>
          ))}
        </div>

        {miniWeeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 2 }}>
            {week.map((day, di) => {
              const isToday = isSameDay(day, today)
              const isSelected = isSameDay(day, currentDate)
              const isCurrentMonth = isSameMonth(day, miniDate)
              return (
                <button
                  key={di}
                  onClick={() => onDateClick(day)}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '50%',
                    border: 'none',
                    fontSize: 11,
                    fontWeight: isToday || isSelected ? 700 : 400,
                    cursor: 'pointer',
                    background: isSelected
                      ? 'linear-gradient(135deg, #E879A0, #A855F7)'
                      : isToday
                        ? 'rgba(232,121,160,0.15)'
                        : 'transparent',
                    color: isSelected ? 'white' : isCurrentMonth ? '#1a1a2e' : '#cccccc',
                  }}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Categories */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>{l.categories}</div>
        {CATEGORIES.map((cat) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: CATEGORY_COLORS[cat], flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#4a4a6a' }}>{CATEGORY_LABELS[cat][lang]}</span>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div style={styles.section}>
        <button
          style={styles.actionBtn}
          onClick={handleNotif}
        >
          <Bell size={14} />
          <span style={{ fontSize: 13 }}>{notifGranted ? l.notifOn : l.notifOff}</span>
          {notifGranted && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#10B981' }}>✓</span>}
        </button>

        {onSync && (
          <button style={styles.actionBtn} onClick={onSync} disabled={isSyncing}>
            <RefreshCw size={14} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
            <span style={{ fontSize: 13 }}>{l.sync}</span>
          </button>
        )}
      </div>

      {/* User + sign out */}
      <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid rgba(168,85,247,0.12)' }}>
        {userEmail && (
          <div style={{ fontSize: 12, color: '#8a8aaa', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userEmail}
          </div>
        )}
        <button style={styles.signOutBtn} onClick={onSignOut}>
          <LogOut size={14} />
          <span>{l.signOut}</span>
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </aside>
  )
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 220,
    flexShrink: 0,
    background: 'rgba(255,255,255,0.65)',
    backdropFilter: 'blur(12px)',
    borderRight: '1px solid rgba(232,121,160,0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  section: {
    padding: '16px',
    borderBottom: '1px solid rgba(168,85,247,0.08)',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#8a8aaa',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: 10,
  },
  miniNavBtn: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 16,
    color: '#4a4a6a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMonthLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1a1a2e',
    textTransform: 'capitalize',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid rgba(168,85,247,0.15)',
    background: 'transparent',
    cursor: 'pointer',
    color: '#4a4a6a',
    marginBottom: 6,
    transition: 'all 0.15s',
  },
  signOutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 8,
    border: 'none',
    background: 'rgba(232,121,160,0.1)',
    cursor: 'pointer',
    color: '#E879A0',
    fontSize: 13,
    fontWeight: 600,
    width: '100%',
  },
}
