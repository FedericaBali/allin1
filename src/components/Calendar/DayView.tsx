import { useMemo } from 'react'
import { format, differenceInMinutes, isSameDay } from 'date-fns'
import { it as itLocale, enUS } from 'date-fns/locale'
import type { CalendarEvent, Language } from '../../types'
import EventCard from './EventCard'

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
  lang: Language
  onSlotClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const SLOT_HEIGHT = 64

export default function DayView({ currentDate, events, lang, onSlotClick, onEventClick }: DayViewProps) {
  const locale = lang === 'it' ? itLocale : enUS
  const today = new Date()
  const isToday = isSameDay(currentDate, today)

  const dayEvents = useMemo(() =>
    events.filter((e) => isSameDay(new Date(e.start_time), currentDate) && !e.all_day),
    [events, currentDate]
  )

  const allDayEvents = useMemo(() =>
    events.filter((e) => isSameDay(new Date(e.start_time), currentDate) && e.all_day),
    [events, currentDate]
  )

  function getEventStyle(event: CalendarEvent): React.CSSProperties {
    const start = new Date(event.start_time)
    const end = new Date(event.end_time)
    const startMinutes = start.getHours() * 60 + start.getMinutes()
    const durationMinutes = Math.max(differenceInMinutes(end, start), 30)
    return {
      position: 'absolute',
      top: (startMinutes / 60) * SLOT_HEIGHT,
      left: 64,
      right: 16,
      height: Math.max((durationMinutes / 60) * SLOT_HEIGHT, 24),
      zIndex: 2,
    }
  }

  return (
    <div data-testid="day-view" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Day header */}
      <div style={{
        padding: '16px 24px',
        background: 'rgba(255,255,255,0.7)',
        borderBottom: '1px solid rgba(168,85,247,0.12)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', textTransform: 'capitalize' }}>
          {format(currentDate, 'EEEE', { locale })}
        </div>
        <div style={{ fontSize: 14, color: '#8a8aaa', marginTop: 2 }}>
          {format(currentDate, 'd MMMM yyyy', { locale })}
        </div>
        {allDayEvents.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
            {allDayEvents.map((e) => (
              <EventCard key={e.id} event={e} lang={lang} onClick={onEventClick} compact />
            ))}
          </div>
        )}
      </div>

      {/* Time grid */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {HOURS.map((h) => (
          <div key={h} style={{ height: SLOT_HEIGHT, display: 'flex', borderBottom: '1px solid rgba(168,85,247,0.06)' }}>
            <div style={{ width: 56, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 0 }}>
              {h > 0 && <span style={{ fontSize: 11, color: '#8a8aaa', transform: 'translateY(-50%)' }}>{String(h).padStart(2, '0')}:00</span>}
            </div>
            <div
              style={{ flex: 1, cursor: 'pointer', background: isToday ? 'rgba(232,121,160,0.02)' : 'transparent' }}
              onClick={() => {
                const d = new Date(currentDate)
                d.setHours(h, 0, 0, 0)
                onSlotClick(d)
              }}
            />
          </div>
        ))}

        {/* Events */}
        {dayEvents.map((event) => (
          <div key={event.id} style={getEventStyle(event)}>
            <EventCard event={event} lang={lang} onClick={onEventClick} style={{ height: '100%' }} />
          </div>
        ))}

        {/* Current time line */}
        {isToday && (() => {
          const now = new Date()
          const top = ((now.getHours() * 60 + now.getMinutes()) / 60) * SLOT_HEIGHT
          return (
            <div style={{ position: 'absolute', top, left: 56, right: 0, zIndex: 5, pointerEvents: 'none' }}>
              <div style={{ height: 2, background: '#E879A0', position: 'relative' }}>
                <div style={{ position: 'absolute', left: -4, top: -4, width: 10, height: 10, borderRadius: '50%', background: '#E879A0' }} />
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
