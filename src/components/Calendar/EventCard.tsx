import { format } from 'date-fns'
import type { CalendarEvent } from '../../types'
import { CATEGORY_LABELS } from '../../types'
import type { Language } from '../../types'

interface EventCardProps {
  event: CalendarEvent
  lang?: Language
  onClick?: (event: CalendarEvent) => void
  compact?: boolean
  style?: React.CSSProperties
}

export default function EventCard({ event, lang = 'it', onClick, compact = false, style }: EventCardProps) {
  const start = new Date(event.start_time)
  const end = new Date(event.end_time)

  const timeLabel = event.all_day
    ? (lang === 'it' ? 'Tutto il giorno' : 'All day')
    : `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`

  const categoryLabel = CATEGORY_LABELS[event.category]?.[lang] ?? event.category

  const sourceIcon = event.source === 'google' ? '🔵' : event.source === 'outlook' ? '🟦' : ''

  return (
    <div
      role="button"
      data-testid="event-card"
      data-category={event.category}
      tabIndex={0}
      onClick={() => onClick?.(event)}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(event)}
      style={{
        background: event.color + '22',
        borderLeft: `3px solid ${event.color}`,
        borderRadius: compact ? 4 : 8,
        padding: compact ? '2px 6px' : '8px 12px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        overflow: 'hidden',
        ...style,
      }}
    >
      {!compact && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
          <div
            data-testid="category-dot"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: event.color,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 10, color: event.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {categoryLabel}
          </span>
          {sourceIcon && <span style={{ marginLeft: 'auto', fontSize: 10 }}>{sourceIcon}</span>}
        </div>
      )}

      <div
        data-testid="event-title"
        style={{
          fontSize: compact ? 11 : 13,
          fontWeight: 600,
          color: '#1a1a2e',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: compact ? 'nowrap' : 'normal',
          lineHeight: 1.3,
        }}
      >
        {event.title}
      </div>

      {!compact && (
        <div
          data-testid="event-time"
          style={{ fontSize: 11, color: '#8a8aaa', marginTop: 2, fontWeight: 500 }}
        >
          {timeLabel}
        </div>
      )}

      {compact && (
        <div style={{ fontSize: 10, color: '#8a8aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {timeLabel}
        </div>
      )}
    </div>
  )
}
