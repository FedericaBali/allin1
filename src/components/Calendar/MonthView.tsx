import { useMemo } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameDay, isSameMonth,
} from 'date-fns'
import { it as itLocale, enUS } from 'date-fns/locale'
import type { CalendarEvent, Language } from '../../types'
import EventCard from './EventCard'

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  lang: Language
  onDayClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export default function MonthView({ currentDate, events, lang, onDayClick, onEventClick }: MonthViewProps) {
  const locale = lang === 'it' ? itLocale : enUS
  const today = new Date()

  const calDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const weeks: Date[][] = []
  for (let i = 0; i < calDays.length; i += 7) {
    weeks.push(calDays.slice(i, i + 7))
  }

  const dayNames = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, i) // starts Sunday
    return format(d, 'EEE', { locale })
  })

  function eventsForDay(day: Date) {
    return events.filter((e) => isSameDay(new Date(e.start_time), day))
  }

  return (
    <div data-testid="month-view" style={styles.container}>
      {/* Day name headers */}
      <div style={styles.dayNames}>
        {dayNames.map((name, i) => (
          <div key={i} style={styles.dayNameCell}>{name}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={styles.grid}>
        {weeks.map((week, wi) => (
          <div key={wi} style={styles.week}>
            {week.map((day, di) => {
              const isToday = isSameDay(day, today)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const dayEvents = eventsForDay(day)

              return (
                <div
                  key={di}
                  style={{
                    ...styles.dayCell,
                    opacity: isCurrentMonth ? 1 : 0.4,
                  }}
                  onClick={() => onDayClick(day)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{
                      ...styles.dayNum,
                      ...(isToday ? styles.dayNumToday : {}),
                    }}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  <div style={styles.eventsContainer}>
                    {dayEvents.slice(0, 3).map((event) => (
                      <div key={event.id} style={{ marginBottom: 2 }} onClick={(e) => { e.stopPropagation(); onEventClick(event) }}>
                        <EventCard event={event} lang={lang} compact />
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div style={styles.moreLabel}>+{dayEvents.length - 3} {lang === 'it' ? 'altri' : 'more'}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  dayNames: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    borderBottom: '1px solid rgba(168,85,247,0.12)',
    background: 'rgba(255,255,255,0.7)',
    flexShrink: 0,
  },
  dayNameCell: {
    padding: '8px 4px',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 600,
    color: '#8a8aaa',
    textTransform: 'capitalize',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflowY: 'auto',
  },
  week: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    flex: 1,
    borderBottom: '1px solid rgba(168,85,247,0.08)',
    minHeight: 100,
  },
  dayCell: {
    padding: '6px',
    borderRight: '1px solid rgba(168,85,247,0.08)',
    cursor: 'pointer',
    transition: 'background 0.15s',
    minHeight: 80,
  },
  dayNum: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: '#1a1a2e',
  },
  dayNumToday: {
    background: 'linear-gradient(135deg, #E879A0, #A855F7)',
    color: 'white',
  },
  eventsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  moreLabel: {
    fontSize: 11,
    color: '#A855F7',
    fontWeight: 600,
    paddingLeft: 4,
  },
}
