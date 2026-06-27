import { format, addWeeks, subWeeks, addMonths, subMonths, addDays, subDays } from 'date-fns'
import { it as itLocale, enUS } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import type { CalendarView, Language } from '../../types'

interface CalendarHeaderProps {
  view: CalendarView
  currentDate: Date
  lang: Language
  onViewChange: (view: CalendarView) => void
  onDateChange: (date: Date) => void
  onLangChange: (lang: Language) => void
  onSync?: () => void
  isSyncing?: boolean
}

const VIEW_LABELS = {
  it: { week: 'Settimana', month: 'Mese', day: 'Giorno', agenda: 'Agenda' },
  en: { week: 'Week', month: 'Month', day: 'Day', agenda: 'Agenda' },
}

const VIEWS: CalendarView[] = ['week', 'month', 'day', 'agenda']

function getDateLabel(view: CalendarView, date: Date, lang: Language): string {
  const locale = lang === 'it' ? itLocale : enUS
  switch (view) {
    case 'week': {
      // Show week range
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      return `${format(weekStart, 'd MMM', { locale })} – ${format(weekEnd, 'd MMM yyyy', { locale })}`
    }
    case 'month':
      return format(date, 'MMMM yyyy', { locale })
    case 'day':
      return format(date, 'EEEE, d MMMM yyyy', { locale })
    case 'agenda':
      return format(date, 'MMMM yyyy', { locale })
    default:
      return format(date, 'MMMM yyyy', { locale })
  }
}

function navigate(view: CalendarView, date: Date, direction: 1 | -1): Date {
  switch (view) {
    case 'week':
      return direction === 1 ? addWeeks(date, 1) : subWeeks(date, 1)
    case 'month':
    case 'agenda':
      return direction === 1 ? addMonths(date, 1) : subMonths(date, 1)
    case 'day':
      return direction === 1 ? addDays(date, 1) : subDays(date, 1)
    default:
      return date
  }
}

export default function CalendarHeader({
  view,
  currentDate,
  lang,
  onViewChange,
  onDateChange,
  onLangChange,
  onSync,
  isSyncing,
}: CalendarHeaderProps) {
  const vl = VIEW_LABELS[lang]
  const todayLabel = lang === 'it' ? 'Oggi' : 'Today'
  const dateLabel = getDateLabel(view, currentDate, lang)

  return (
    <div style={styles.header}>
      {/* Left: nav + date */}
      <div style={styles.left}>
        <button
          style={styles.todayBtn}
          onClick={() => onDateChange(new Date())}
        >
          {todayLabel}
        </button>
        <button style={styles.navBtn} onClick={() => onDateChange(navigate(view, currentDate, -1))}>
          <ChevronLeft size={18} />
        </button>
        <button style={styles.navBtn} onClick={() => onDateChange(navigate(view, currentDate, 1))}>
          <ChevronRight size={18} />
        </button>
        <h2 style={styles.dateLabel}>{dateLabel}</h2>
      </div>

      {/* Right: view switcher + lang + sync */}
      <div style={styles.right}>
        {onSync && (
          <button style={styles.syncBtn} onClick={onSync} disabled={isSyncing} title="Sync calendars">
            <RefreshCw size={15} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        )}

        <div style={styles.viewSwitch}>
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              style={{
                ...styles.viewBtn,
                ...(view === v ? styles.viewBtnActive : {}),
              }}
            >
              {vl[v]}
            </button>
          ))}
        </div>

        <div style={styles.langSwitch}>
          {(['it', 'en'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => onLangChange(l)}
              style={{
                ...styles.langBtn,
                ...(lang === l ? styles.langBtnActive : {}),
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    background: 'rgba(255,255,255,0.7)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(232,121,160,0.15)',
    flexWrap: 'wrap',
    gap: 8,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  todayBtn: {
    padding: '6px 14px',
    borderRadius: 8,
    border: '1.5px solid rgba(168,85,247,0.3)',
    background: 'transparent',
    fontSize: 13,
    fontWeight: 600,
    color: '#A855F7',
    cursor: 'pointer',
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1.5px solid rgba(168,85,247,0.2)',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#4a4a6a',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a1a2e',
    textTransform: 'capitalize',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  syncBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1.5px solid rgba(168,85,247,0.2)',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#A855F7',
  },
  viewSwitch: {
    display: 'flex',
    background: 'rgba(168,85,247,0.08)',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  viewBtn: {
    padding: '5px 12px',
    borderRadius: 7,
    border: 'none',
    background: 'transparent',
    fontSize: 13,
    fontWeight: 500,
    color: '#4a4a6a',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  viewBtnActive: {
    background: 'linear-gradient(135deg, #E879A0, #A855F7)',
    color: 'white',
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(168,85,247,0.3)',
  },
  langSwitch: {
    display: 'flex',
    background: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
    padding: 3,
    gap: 2,
    border: '1px solid rgba(168,85,247,0.15)',
  },
  langBtn: {
    padding: '4px 10px',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    fontSize: 12,
    fontWeight: 600,
    color: '#8a8aaa',
    cursor: 'pointer',
  },
  langBtnActive: {
    background: 'linear-gradient(135deg, #E879A0, #A855F7)',
    color: 'white',
  },
}
