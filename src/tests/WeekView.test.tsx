import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WeekView from '../components/Calendar/WeekView'
import type { CalendarEvent } from '../types'

const currentDate = new Date('2024-01-15T10:00:00.000Z') // Monday

const mockEvents: CalendarEvent[] = [
  {
    id: 'evt-1',
    user_id: 'user-1',
    title: 'Monday Meeting',
    start_time: '2024-01-15T09:00:00.000Z',
    end_time: '2024-01-15T10:00:00.000Z',
    all_day: false,
    category: 'work',
    color: '#6366F1',
    source: 'manual',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'evt-2',
    user_id: 'user-1',
    title: 'Wednesday Lunch',
    start_time: '2024-01-17T12:00:00.000Z',
    end_time: '2024-01-17T13:00:00.000Z',
    all_day: false,
    category: 'social',
    color: '#F59E0B',
    source: 'manual',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
]

const defaultProps = {
  currentDate,
  events: [],
  lang: 'en' as const,
  onSlotClick: vi.fn(),
  onEventClick: vi.fn(),
}

describe('WeekView', () => {
  it('renders 7 day column headers', () => {
    render(<WeekView {...defaultProps} />)
    const headers = screen.getAllByTestId('week-day-column-header')
    expect(headers).toHaveLength(7)
  })

  it('renders 7 day columns', () => {
    render(<WeekView {...defaultProps} />)
    const columns = screen.getAllByTestId('week-day-column')
    expect(columns).toHaveLength(7)
  })

  it('renders the week view container', () => {
    render(<WeekView {...defaultProps} />)
    expect(screen.getByTestId('week-view')).toBeTruthy()
  })

  it('renders events within the week', () => {
    render(<WeekView {...defaultProps} events={mockEvents} />)
    expect(screen.getByText('Monday Meeting')).toBeTruthy()
    expect(screen.getByText('Wednesday Lunch')).toBeTruthy()
  })

  it('calls onSlotClick when clicking an empty time slot', async () => {
    const user = userEvent.setup()
    const onSlotClick = vi.fn()
    render(<WeekView {...defaultProps} onSlotClick={onSlotClick} />)
    // Click first hour cell in first day column
    const columns = screen.getAllByTestId('week-day-column')
    const firstColumn = columns[0]
    const hourCells = firstColumn.querySelectorAll('div')
    // Click the column area
    await user.click(firstColumn)
    expect(onSlotClick).toHaveBeenCalled()
  })

  it('calls onEventClick when clicking an event', async () => {
    const user = userEvent.setup()
    const onEventClick = vi.fn()
    render(<WeekView {...defaultProps} events={mockEvents} onEventClick={onEventClick} />)
    await user.click(screen.getByText('Monday Meeting'))
    expect(onEventClick).toHaveBeenCalledWith(mockEvents[0])
  })

  it('renders day names in English', () => {
    render(<WeekView {...defaultProps} lang="en" />)
    // Should have abbreviated day names
    const headers = screen.getAllByTestId('week-day-column-header')
    const headerTexts = headers.map(h => h.textContent ?? '')
    expect(headerTexts.some(t => t.includes('Sun') || t.includes('Mon') || t.includes('Tue'))).toBe(true)
  })

  it('renders day names in Italian', () => {
    render(<WeekView {...defaultProps} lang="it" />)
    const headers = screen.getAllByTestId('week-day-column-header')
    const headerTexts = headers.map(h => h.textContent ?? '')
    // Italian day abbreviations
    expect(headerTexts.some(t =>
      t.includes('dom') || t.includes('lun') || t.includes('mar') ||
      t.includes('mer') || t.includes('gio') || t.includes('ven') || t.includes('sab')
    )).toBe(true)
  })
})
