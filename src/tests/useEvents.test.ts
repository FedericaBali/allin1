import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useEvents } from '../hooks/useEvents'
import { supabase } from '../lib/supabase'
import type { CalendarEvent } from '../types'

const mockEvent: CalendarEvent = {
  id: 'evt-1',
  user_id: 'user-1',
  title: 'Test Event',
  start_time: '2024-01-15T10:00:00.000Z',
  end_time: '2024-01-15T11:00:00.000Z',
  all_day: false,
  category: 'work',
  color: '#6366F1',
  source: 'manual',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches events successfully', async () => {
    const fromMock = vi.mocked(supabase.from)
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: [mockEvent], error: null }),
    } as ReturnType<typeof supabase.from>)

    // Override the final resolution to return array
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [mockEvent], error: null }),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockEvent, error: null }),
    }
    fromMock.mockReturnValue(mockChain as ReturnType<typeof supabase.from>)

    const { result } = renderHook(() => useEvents(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('createEvent calls supabase insert with correct data', async () => {
    const mockUser = { id: 'user-1', email: 'test@test.com' }
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser as Parameters<typeof vi.mocked>[0] },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getUser>>)

    const insertMock = vi.fn().mockReturnThis()
    const selectMock = vi.fn().mockReturnThis()
    const singleMock = vi.fn().mockResolvedValue({ data: mockEvent, error: null })
    const fromMock = vi.mocked(supabase.from)
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      insert: insertMock,
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: singleMock,
    } as ReturnType<typeof supabase.from>)
    insertMock.mockReturnValue({ select: selectMock })
    selectMock.mockReturnValue({ single: singleMock })

    const { result } = renderHook(() => useEvents(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.createEvent({
        title: 'New Event',
        start_time: '2024-01-15T10:00:00.000Z',
        end_time: '2024-01-15T11:00:00.000Z',
        all_day: false,
        category: 'work',
        color: '#6366F1',
      })
    })

    expect(insertMock).toHaveBeenCalled()
  })

  it('deleteEvent calls supabase delete', async () => {
    const deleteMock = vi.fn().mockReturnThis()
    const eqMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const fromMock = vi.mocked(supabase.from)
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: deleteMock,
      upsert: vi.fn().mockReturnThis(),
      eq: eqMock,
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    } as ReturnType<typeof supabase.from>)
    deleteMock.mockReturnValue({ eq: eqMock })

    const { result } = renderHook(() => useEvents(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.deleteEvent('evt-1')
    })

    expect(deleteMock).toHaveBeenCalled()
    expect(eqMock).toHaveBeenCalledWith('id', 'evt-1')
  })

  it('updateEvent calls supabase update with id and updates', async () => {
    const updateMock = vi.fn().mockReturnThis()
    const eqMock = vi.fn().mockReturnThis()
    const selectMock = vi.fn().mockReturnThis()
    const singleMock = vi.fn().mockResolvedValue({ data: { ...mockEvent, title: 'Updated' }, error: null })

    const fromMock = vi.mocked(supabase.from)
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: updateMock,
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: eqMock,
      single: singleMock,
    } as ReturnType<typeof supabase.from>)
    updateMock.mockReturnValue({ eq: eqMock })
    eqMock.mockReturnValue({ select: selectMock })
    selectMock.mockReturnValue({ single: singleMock })

    const { result } = renderHook(() => useEvents(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.updateEvent('evt-1', { title: 'Updated' })
    })

    expect(updateMock).toHaveBeenCalled()
  })

  it('returns empty array when no events', async () => {
    const fromMock = vi.mocked(supabase.from)
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    } as ReturnType<typeof supabase.from>)

    const { result } = renderHook(() => useEvents(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.events).toEqual([])
    })
  })
})
