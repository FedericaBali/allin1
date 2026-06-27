import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventCard from '../components/Calendar/EventCard'
import type { CalendarEvent } from '../types'

const mockEvent: CalendarEvent = {
  id: 'evt-1',
  user_id: 'user-1',
  title: 'Team Meeting',
  description: 'Weekly sync',
  start_time: '2024-01-15T10:00:00.000Z',
  end_time: '2024-01-15T11:00:00.000Z',
  all_day: false,
  category: 'work',
  color: '#6366F1',
  source: 'manual',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

describe('EventCard', () => {
  it('renders the event title', () => {
    render(<EventCard event={mockEvent} />)
    expect(screen.getByTestId('event-title')).toHaveTextContent('Team Meeting')
  })

  it('renders the event time', () => {
    render(<EventCard event={mockEvent} />)
    const timeEl = screen.getByTestId('event-time')
    expect(timeEl).toBeTruthy()
    // Time format depends on locale but should contain a colon
    expect(timeEl.textContent).toMatch(/\d{2}:\d{2}/)
  })

  it('renders category color dot with correct color', () => {
    render(<EventCard event={mockEvent} />)
    const dot = screen.getByTestId('category-dot')
    expect(dot).toHaveStyle({ background: '#6366F1' })
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<EventCard event={mockEvent} onClick={onClick} />)
    await user.click(screen.getByTestId('event-card'))
    expect(onClick).toHaveBeenCalledWith(mockEvent)
  })

  it('renders "All day" / "Tutto il giorno" for all-day events', () => {
    const allDayEvent: CalendarEvent = { ...mockEvent, all_day: true }
    render(<EventCard event={allDayEvent} lang="it" />)
    const timeEl = screen.getByTestId('event-time')
    expect(timeEl.textContent).toContain('Tutto il giorno')
  })

  it('renders "All day" in English', () => {
    const allDayEvent: CalendarEvent = { ...mockEvent, all_day: true }
    render(<EventCard event={allDayEvent} lang="en" />)
    const timeEl = screen.getByTestId('event-time')
    expect(timeEl.textContent).toContain('All day')
  })

  it('renders different category colors for personal events', () => {
    const personalEvent: CalendarEvent = { ...mockEvent, category: 'personal', color: '#E879A0' }
    render(<EventCard event={personalEvent} />)
    const dot = screen.getByTestId('category-dot')
    expect(dot).toHaveStyle({ background: '#E879A0' })
  })

  it('is accessible via keyboard Enter', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<EventCard event={mockEvent} onClick={onClick} />)
    const card = screen.getByTestId('event-card')
    card.focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledWith(mockEvent)
  })
})
