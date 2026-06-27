export type EventCategory = 'work' | 'personal' | 'health' | 'social' | 'other'

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description?: string
  start_time: string // ISO string
  end_time: string
  all_day: boolean
  category: EventCategory
  color: string
  source: 'manual' | 'google' | 'outlook'
  external_id?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  google_calendar_token?: string
  outlook_calendar_token?: string
  language: 'it' | 'en'
}

export type CalendarView = 'week' | 'month' | 'day' | 'agenda'

export type Language = 'it' | 'en'

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  work: '#6366F1',
  personal: '#E879A0',
  health: '#10B981',
  social: '#F59E0B',
  other: '#8B5CF6',
}

export const CATEGORY_LABELS: Record<EventCategory, Record<Language, string>> = {
  work: { it: 'Lavoro', en: 'Work' },
  personal: { it: 'Personale', en: 'Personal' },
  health: { it: 'Salute', en: 'Health' },
  social: { it: 'Sociale', en: 'Social' },
  other: { it: 'Altro', en: 'Other' },
}

export interface CreateEventPayload {
  title: string
  description?: string
  start_time: string
  end_time: string
  all_day: boolean
  category: EventCategory
  color: string
  source?: 'manual' | 'google' | 'outlook'
  external_id?: string
}
