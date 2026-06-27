import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { CalendarEvent, CreateEventPayload } from '../types'

const EVENTS_TABLE = 'events'

export function useEvents(startDate?: Date, endDate?: Date) {
  const queryClient = useQueryClient()

  const queryKey = ['events', startDate?.toISOString(), endDate?.toISOString()]

  const { data: events = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from(EVENTS_TABLE)
        .select('*')
        .order('start_time', { ascending: true })

      if (startDate) {
        query = query.gte('start_time', startDate.toISOString())
      }
      if (endDate) {
        query = query.lte('start_time', endDate.toISOString())
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as CalendarEvent[]
    },
    enabled: true,
  })

  const createMutation = useMutation({
    mutationFn: async (payload: CreateEventPayload) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from(EVENTS_TABLE)
        .insert([{ ...payload, user_id: user.id, source: payload.source ?? 'manual' }])
        .select()
        .single()

      if (error) throw error
      return data as CalendarEvent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateEventPayload> }) => {
      const { data, error } = await supabase
        .from(EVENTS_TABLE)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as CalendarEvent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(EVENTS_TABLE)
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const createEvent = useCallback(
    (payload: CreateEventPayload) => createMutation.mutateAsync(payload),
    [createMutation]
  )

  const updateEvent = useCallback(
    (id: string, updates: Partial<CreateEventPayload>) =>
      updateMutation.mutateAsync({ id, updates }),
    [updateMutation]
  )

  const deleteEvent = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  )

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
