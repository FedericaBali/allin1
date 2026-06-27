import { useMemo } from 'react'
import { format, startOfWeek, addDays, isSameDay, differenceInMinutes } from 'date-fns'
import { it as itLocale, enUS } from 'date-fns/locale'
import type { CalendarEvent, Language } from '../../types'
import EventCard from './EventCard'

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  lang: Language
  onSlotClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const SLOT_HEIGHT = 60 // px per hour

export default function WeekView({ currentDate, events, lang, onSlotClick, onEventClick }: WeekViewProps) {
  const locale = lang === 'it' ? itLocale : enUS

  // Week days starting Sunday
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const today = new Date()

  // Group events by day
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    days.forEach((day) => {
      const key = format(day, 'yyyy-MM-dd')
      map.set(key, [])
    })
    events.forEach((event) => {
      const key = format(new Date(event.start_time), 'yyyy-MM-dd')
      if (map.has(key)) {
        map.get(key)!.push(event)
      }
    })
    return map
  }, [events, days])

  function getEventStyle(event: CalendarEvent): React.CSSProperties {
    const start = new Date(event.start_time)
    const end = new Date(event.end_time)
    const startMinutes = start.getHours() * 60 + start.getMinutes()
    const durationMinutes = Math.max(differenceInMinutes(end, start), 30)
    const top = (startMinutes / 60) * SLOT_HEIGHT
    const height = (durationMinutes / 60) * SLOT_HEIGHT

    return {
      position: 'absolute',
      top,
      left: 2,
      right: 2,
      height: Math.max(height, 22),
      zIndex: 2,
    }
  }

  return (
    <div data-testid="week-view" style={styles.container}>
      {/* Day headers */}
      <div style={styles.headerRow}>
        <div style={styles.timeGutter} />
        {days.map((day, i) => {
          const isToday = isSameDay(day, today)
          return (
            <div
              key={i}
              data-testid="week-day-column-header"
              style={{
                ...styles.dayHeader,
                ...(isToday ? styles.dayHeaderToday : {}),
              }}
            >
              <span style={styles.dayName}>
                {format(day, 'EEE', { locale })}
              </span>
              <div style={{
                ...styles.dayNumber,
                ...(isToday ? styles.dayNumberToday : {}),
              }}>
                {format(day, 'd')}
              </div>
            </div>
          )
        })}
      </div>

      {/* All-day events row */}
      <div style={styles.allDayRow}>
        <div style={styles.timeGutter}>
          <span style={styles.allDayLabel}>{lang === 'it' ? 'tutto' : 'all day'}</span>
        </div>
        {days.map((day, i) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayEvents = (eventsByDay.get(key) ?? []).filter((e) => e.all_day)
          return (
            <div key={i} style={styles.allDayCell}>
              {dayEvents.map((event) => (
                <div key={event.id} style={{ marginBottom: 2 }}>
                  <EventCard event={event} lang={lang} onClick={onEventClick} compact />
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div style={styles.grid}>
        {/* Time labels column */}
        <div style={styles.timeColumn}>
          {HOURS.map((h) => (
            <div key={h} style={styles.timeSlot}>
              {h > 0 && (
                <span style={styles.timeLabel}>{String(h).padStart(2, '0')}:00</span>
              )}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, dayIdx) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayEvents = (eventsByDay.get(key) ?? []).filter((e) => !e.all_day)
          const isToday = isSameDay(day, today)

          return (
            <div
              key={dayIdx}
              data-testid="week-day-column"
              style={{
                ...styles.dayColumn,
                background: isToday ? 'rgba(232,121,160,0.04)' : 'transparent',
              }}
            >
              {/* Hour slots (clickable) */}
              {HOURS.map((h) => (
                <div
                  key={h}
                  style={styles.hourCell}
                  onClick={() => {
                    const slotDate = new Date(day)
                    slotDate.setHours(h, 0, 0, 0)
                    onSlotClick(slotDate)
                  }}
                />
              ))}

              {/* Events */}
              {dayEvents.map((event) => (
                <div key={event.id} style={getEventStyle(event)}>
                  <EventCard
                    event={event}
                    lang={lang}
                    onClick={onEventClick}
                    compact
                    style={{ height: '100%' }}
                  />
                </div>
              ))}

              {/* Current time indicator */}
              {isToday && (() => {
                const now = new Date()
                const minutes = now.getHours() * 60 + now.getMinutes()
                const top = (minutes / 60) * SLOT_HEIGHT
                return (
                  <div style={{ position: 'absolute', top, left: 0, right: 0, zIndex: 5, pointerEvents: 'none' }}>
                    <div style={{ height: 2, background: '#E879A0', position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: -5,
                        top: -4,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: '#E879A0',
                      }} />
                    </div>
                  </div>
                )
              })()}
            </div>
          )
        })}
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
    background: 'rgba(255,255,255,0.4)',
  },
  headerRow: {
    display: 'flex',
    borderBottom: '1px solid rgba(168,85,247,0.12)',
    background: 'rgba(255,255,255,0.7)',
    flexShrink: 0,
  },
  timeGutter: {
    width: 56,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeader: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 4px',
    borderLeft: '1px solid rgba(168,85,247,0.08)',
  },
  dayHeaderToday: {
    background: 'rgba(232,121,160,0.06)',
  },
  dayName: {
    fontSize: 11,
    fontWeight: 600,
    color: '#8a8aaa',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  dayNumber: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 600,
    color: '#1a1a2e',
    marginTop: 2,
  },
  dayNumberToday: {
    background: 'linear-gradient(135deg, #E879A0, #A855F7)',
    color: 'white',
  },
  allDayRow: {
    display: 'flex',
    minHeight: 28,
    borderBottom: '1px solid rgba(168,85,247,0.12)',
    background: 'rgba(255,255,255,0.6)',
    flexShrink: 0,
  },
  allDayLabel: {
    fontSize: 9,
    color: '#8a8aaa',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  allDayCell: {
    flex: 1,
    padding: '2px 4px',
    borderLeft: '1px solid rgba(168,85,247,0.08)',
    minHeight: 28,
  },
  grid: {
    display: 'flex',
    flex: 1,
    overflowY: 'auto',
  },
  timeColumn: {
    width: 56,
    flexShrink: 0,
  },
  timeSlot: {
    height: SLOT_HEIGHT,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingRight: 8,
    paddingTop: 0,
    borderBottom: '1px solid rgba(168,85,247,0.06)',
    position: 'relative',
  },
  timeLabel: {
    fontSize: 10,
    color: '#8a8aaa',
    fontWeight: 500,
    transform: 'translateY(-50%)',
  },
  dayColumn: {
    flex: 1,
    borderLeft: '1px solid rgba(168,85,247,0.08)',
    position: 'relative',
  },
  hourCell: {
    height: SLOT_HEIGHT,
    borderBottom: '1px solid rgba(168,85,247,0.06)',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
}
