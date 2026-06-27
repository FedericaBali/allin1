import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventModal from '../components/Calendar/EventModal'
import type { CalendarEvent } from '../types'

const mockEvent: CalendarEvent = {
  id: 'evt-1',
  user_id: 'user-1',
  title: 'Existing Event',
  description: 'Some description',
  start_time: '2024-01-15T10:00:00.000Z',
  end_time: '2024-01-15T11:00:00.000Z',
  all_day: false,
  category: 'work',
  color: '#6366F1',
  source: 'manual',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

const defaultProps = {
  lang: 'en' as const,
  onSave: vi.fn().mockResolvedValue(undefined),
  onDelete: vi.fn().mockResolvedValue(undefined),
  onClose: vi.fn(),
}

describe('EventModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the modal with "New Event" title when no event provided', () => {
    render(<EventModal {...defaultProps} />)
    expect(screen.getByText('New Event')).toBeTruthy()
  })

  it('renders "Edit Event" title when editing an event', () => {
    render(<EventModal {...defaultProps} event={mockEvent} />)
    expect(screen.getByText('Edit Event')).toBeTruthy()
  })

  it('renders title input field', () => {
    render(<EventModal {...defaultProps} />)
    expect(screen.getByTestId('event-title-input')).toBeTruthy()
  })

  it('renders description textarea', () => {
    render(<EventModal {...defaultProps} />)
    expect(screen.getByTestId('event-description-input')).toBeTruthy()
  })

  it('renders start and end date inputs', () => {
    render(<EventModal {...defaultProps} />)
    expect(screen.getByTestId('event-start-input')).toBeTruthy()
    expect(screen.getByTestId('event-end-input')).toBeTruthy()
  })

  it('renders category selector buttons', () => {
    render(<EventModal {...defaultProps} />)
    expect(screen.getByTestId('category-work')).toBeTruthy()
    expect(screen.getByTestId('category-personal')).toBeTruthy()
    expect(screen.getByTestId('category-health')).toBeTruthy()
    expect(screen.getByTestId('category-social')).toBeTruthy()
    expect(screen.getByTestId('category-other')).toBeTruthy()
  })

  it('renders Save and Cancel buttons', () => {
    render(<EventModal {...defaultProps} />)
    expect(screen.getByTestId('save-event-btn')).toBeTruthy()
    expect(screen.getByTestId('cancel-event-btn')).toBeTruthy()
  })

  it('renders Delete button when editing', () => {
    render(<EventModal {...defaultProps} event={mockEvent} />)
    expect(screen.getByTestId('delete-event-btn')).toBeTruthy()
  })

  it('does not render Delete button for new event', () => {
    render(<EventModal {...defaultProps} onDelete={undefined} />)
    expect(screen.queryByTestId('delete-event-btn')).toBeNull()
  })

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<EventModal {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByTestId('cancel-event-btn'))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows validation error when saving empty title', async () => {
    const user = userEvent.setup()
    render(<EventModal {...defaultProps} />)
    await user.click(screen.getByTestId('save-event-btn'))
    expect(screen.getByText('Title is required')).toBeTruthy()
  })

  it('calls onSave with correct payload when form is filled and saved', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<EventModal {...defaultProps} onSave={onSave} onClose={onClose} />)

    await user.type(screen.getByTestId('event-title-input'), 'New Meeting')
    await user.click(screen.getByTestId('save-event-btn'))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Meeting' })
      )
    })
  })

  it('prefills form when editing existing event', () => {
    render(<EventModal {...defaultProps} event={mockEvent} />)
    const titleInput = screen.getByTestId('event-title-input') as HTMLInputElement
    expect(titleInput.value).toBe('Existing Event')
  })

  it('renders in Italian when lang=it', () => {
    render(<EventModal {...defaultProps} lang="it" />)
    expect(screen.getByText('Nuovo Evento')).toBeTruthy()
    expect(screen.getByTestId('save-event-btn').textContent).toBe('Salva')
    expect(screen.getByTestId('cancel-event-btn').textContent).toBe('Annulla')
  })

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<EventModal {...defaultProps} onClose={onClose} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('toggles all-day switch', async () => {
    const user = userEvent.setup()
    render(<EventModal {...defaultProps} />)
    const toggle = screen.getByTestId('all-day-toggle')
    await user.click(toggle)
    // Start input should switch to date type (all-day)
    const startInput = screen.getByTestId('event-start-input') as HTMLInputElement
    expect(startInput.type).toBe('date')
  })
})
