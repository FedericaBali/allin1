import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { CalendarEvent, CreateEventPayload } from '../types'

interface SyncResult {
  imported: number
  errors: number
}

export function useCalendarSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)
  const queryClient = useQueryClient()

  const syncGoogleCalendar = useCallback(async (): Promise<SyncResult> => {
    setIsSyncing(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // Get Google access token from provider token
      const providerToken = session.provider_token
      if (!providerToken) {
        throw new Error('No Google token available. Please re-login with Google.')
      }

      // Fetch events from Google Calendar API
      const now = new Date()
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)
      const twelveMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 12, 1)

      const baseParams = {
        timeMin: sixMonthsAgo.toISOString(),
        timeMax: twelveMonthsAhead.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '250',
      }

      const googleEvents: unknown[] = []
      let pageToken: string | undefined = undefined

      do {
        const params = new URLSearchParams({ ...baseParams, ...(pageToken ? { pageToken } : {}) })
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
          { headers: { Authorization: `Bearer ${providerToken}` } }
        )
        if (!response.ok) throw new Error('Failed to fetch Google Calendar events')
        const data = await response.json()
        googleEvents.push(...(data.items ?? []))
        pageToken = data.nextPageToken
      } while (pageToken)

      let imported = 0
      let errors = 0

      for (const gEvent of googleEvents) {
        try {
          const startTime = gEvent.start?.dateTime ?? gEvent.start?.date
          const endTime = gEvent.end?.dateTime ?? gEvent.end?.date
          if (!startTime || !endTime) continue

          const payload: CreateEventPayload = {
            title: gEvent.summary ?? '(No title)',
            description: gEvent.description,
            start_time: new Date(startTime).toISOString(),
            end_time: new Date(endTime).toISOString(),
            all_day: !gEvent.start?.dateTime,
            category: 'work',
            color: '#6366F1',
            source: 'google',
            external_id: gEvent.id,
          }

          const { data: { user } } = await supabase.auth.getUser()
          if (!user) continue

          // Upsert based on external_id
          const { error } = await supabase
            .from('events')
            .upsert(
              [{ ...payload, user_id: user.id }],
              { onConflict: 'external_id,user_id', ignoreDuplicates: false }
            )

          if (error) { errors++; continue }
          imported++
        } catch {
          errors++
        }
      }

      const result = { imported, errors }
      setLastSyncResult(result)
      queryClient.invalidateQueries({ queryKey: ['events'] })
      return result
    } finally {
      setIsSyncing(false)
    }
  }, [queryClient])

  const syncOutlookCalendar = useCallback(async (): Promise<SyncResult> => {
    setIsSyncing(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const providerToken = session.provider_token
      if (!providerToken) {
        throw new Error('No Microsoft token available. Please re-login with Microsoft.')
      }

      const now = new Date()
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const threeMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 3, 1)

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${oneMonthAgo.toISOString()}&endDateTime=${threeMonthsAhead.toISOString()}&$top=250`,
        { headers: { Authorization: `Bearer ${providerToken}` } }
      )

      if (!response.ok) throw new Error('Failed to fetch Outlook events')

      const data = await response.json()
      const outlookEvents = data.value ?? []

      let imported = 0
      let errors = 0

      for (const oEvent of outlookEvents) {
        try {
          const payload: CreateEventPayload = {
            title: oEvent.subject ?? '(No title)',
            description: oEvent.body?.content,
            start_time: new Date(oEvent.start?.dateTime ?? oEvent.start).toISOString(),
            end_time: new Date(oEvent.end?.dateTime ?? oEvent.end).toISOString(),
            all_day: oEvent.isAllDay ?? false,
            category: 'work',
            color: '#6366F1',
            source: 'outlook',
            external_id: oEvent.id,
          }

          const { data: { user } } = await supabase.auth.getUser()
          if (!user) continue

          const { error } = await supabase
            .from('events')
            .upsert(
              [{ ...payload, user_id: user.id }],
              { onConflict: 'external_id,user_id', ignoreDuplicates: false }
            )

          if (error) { errors++; continue }
          imported++
        } catch {
          errors++
        }
      }

      const result = { imported, errors }
      setLastSyncResult(result)
      queryClient.invalidateQueries({ queryKey: ['events'] })
      return result
    } finally {
      setIsSyncing(false)
    }
  }, [queryClient])

  return {
    syncGoogleCalendar,
    syncOutlookCalendar,
    isSyncing,
    lastSyncResult,
  }
}

// Notification utilities
export function requestNotificationPermission() {
  if (!('Notification' in window)) return Promise.resolve('denied' as NotificationPermission)
  return Notification.requestPermission()
}

export function scheduleEventNotification(event: CalendarEvent, minutesBefore = 15) {
  if (Notification.permission !== 'granted') return

  const eventStart = new Date(event.start_time)
  const notifyAt = new Date(eventStart.getTime() - minutesBefore * 60 * 1000)
  const now = new Date()
  const delay = notifyAt.getTime() - now.getTime()

  if (delay <= 0) return

  setTimeout(() => {
    new Notification(`Allin1: ${event.title}`, {
      body: `Inizia tra ${minutesBefore} minuti / Starts in ${minutesBefore} minutes`,
      icon: '/favicon.svg',
      tag: event.id,
    })
  }, delay)
}
