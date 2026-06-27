import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, isSameDay } from 'date-fns'
import { it as itLocale, enUS } from 'date-fns/locale'
import type { CalendarEvent, Language } from '../../types'
import EventCard from './EventCard'

interface AgendaViewProps {
  currentDate: Date
  events: CalendarEvent[]
  lang: Language
  onEventClick: (event: CalendarEvent) => void
}

export default function AgendaView({ currentDate, events, lang, onEventClick }: AgendaViewProps) {
  const locale = lang === 'it' ? itLocale : enUS

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)

  const grouped = useMemo(() => {
    const monthEvents = events
      .filter((e) => {
        const d = new Date(e.start_time)
        return d >= monthStart && d <= monthEnd
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    const map = new Map<string, CalendarEvent[]>()
    monthEvents.forEach((e) => {
      const key = format(new Date(e.start_time), 'yyyy-MM-dd')
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    })
    return map
  }, [events, currentDate])

  const noEventsLabel = lang === 'it' ? 'Nessun evento questo mese' : 'No events this month'

  if (grouped.size === 0) {
    return (
      <div data-testid="agenda-view" style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: '#8a8aaa', fontSize: 16 }}>
        {noEventsLabel}
      </div>
    )
  }

  return (
    <div data-testid="agenda-view" style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
      {Array.from(grouped.entries()).map(([dateKey, dayEvents]) => {
        const day = new Date(dateKey)
        const isToday = isSameDay(day, new Date())

        return (
          <div key={dateKey} style={{ marginBottom: 24 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 10,
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: isToday ? 'linear-gradient(135deg, #E879A0, #A855F7)' : 'rgba(168,85,247,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: isToday ? 'white' : '#1a1a2e' }}>
                  {format(day, 'd')}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: isToday ? 'rgba(255,255,255,0.8)' : '#8a8aaa', textTransform: 'uppercase' }}>
                  {format(day, 'EEE', { locale })}
                </span>
              </div>
              <div style={{ flex: 1, height: 1, background: 'rgba(168,85,247,0.12)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 60 }}>
              {dayEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  lang={lang}
                  onClick={onEventClick}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
