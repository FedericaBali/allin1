import { useState, useCallback } from 'react'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subDays } from 'date-fns'
import { Plus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useEvents } from '../hooks/useEvents'
import { useCalendarSync } from '../hooks/useCalendarSync'
import CalendarHeader from '../components/Calendar/CalendarHeader'
import WeekView from '../components/Calendar/WeekView'
import MonthView from '../components/Calendar/MonthView'
import DayView from '../components/Calendar/DayView'
import AgendaView from '../components/Calendar/AgendaView'
import EventModal from '../components/Calendar/EventModal'
import Sidebar from '../components/Layout/Sidebar'
import type { CalendarEvent, CalendarView, Language, CreateEventPayload } from '../types'

export default function CalendarPage() {
  const { user, signOut } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('week')
  const [lang, setLang] = useState<Language>('it')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [newEventStart, setNewEventStart] = useState<Date | undefined>()

  const { syncGoogleCalendar, syncOutlookCalendar, isSyncing } = useCalendarSync()

  // Compute date range for fetching
  const { startDate, endDate } = (() => {
    switch (view) {
      case 'week': {
        const s = startOfWeek(currentDate, { weekStartsOn: 0 })
        return { startDate: subDays(s, 1), endDate: addDays(endOfWeek(currentDate, { weekStartsOn: 0 }), 1) }
      }
      case 'month':
      case 'agenda':
        return { startDate: startOfMonth(currentDate), endDate: endOfMonth(currentDate) }
      case 'day':
        return { startDate: subDays(currentDate, 1), endDate: addDays(currentDate, 1) }
      default:
        return { startDate: undefined, endDate: undefined }
    }
  })()

  const { events, createEvent, updateEvent, deleteEvent } = useEvents(startDate, endDate)

  const handleSlotClick = useCallback((date: Date) => {
    setNewEventStart(date)
    setEditingEvent(null)
    setModalOpen(true)
  }, [])

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setEditingEvent(event)
    setNewEventStart(undefined)
    setModalOpen(true)
  }, [])

  const handleNewEvent = useCallback(() => {
    setEditingEvent(null)
    setNewEventStart(new Date())
    setModalOpen(true)
  }, [])

  const handleSave = useCallback(async (payload: CreateEventPayload) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, payload)
    } else {
      await createEvent(payload)
    }
  }, [editingEvent, createEvent, updateEvent])

  const handleDelete = useCallback(async (id: string) => {
    await deleteEvent(id)
  }, [deleteEvent])

  async function handleSync() {
    const provider = user?.app_metadata?.provider
    try {
      let result
      if (provider === 'google') {
        result = await syncGoogleCalendar()
      } else if (provider === 'azure') {
        result = await syncOutlookCalendar()
      } else {
        const [g] = await Promise.allSettled([syncGoogleCalendar(), syncOutlookCalendar()])
        result = g.status === 'fulfilled' ? g.value : null
      }
      if (result) {
        alert(`Sync completato! ${result.imported} eventi importati${result.errors ? `, ${result.errors} errori` : ''}.`)
      }
    } catch (e) {
      alert(`Errore sync: ${e instanceof Error ? e.message : 'Errore sconosciuto'}`)
    }
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        currentDate={currentDate}
        lang={lang}
        userEmail={user?.email}
        onDateClick={(date) => { setCurrentDate(date); setView('day') }}
        onSignOut={signOut}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <CalendarHeader
          view={view}
          currentDate={currentDate}
          lang={lang}
          onViewChange={setView}
          onDateChange={setCurrentDate}
          onLangChange={setLang}
          onSync={handleSync}
          isSyncing={isSyncing}
        />

        {/* Calendar view */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={events}
              lang={lang}
              onSlotClick={handleSlotClick}
              onEventClick={handleEventClick}
            />
          )}
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={events}
              lang={lang}
              onDayClick={(date) => { setCurrentDate(date); setView('day') }}
              onEventClick={handleEventClick}
            />
          )}
          {view === 'day' && (
            <DayView
              currentDate={currentDate}
              events={events}
              lang={lang}
              onSlotClick={handleSlotClick}
              onEventClick={handleEventClick}
            />
          )}
          {view === 'agenda' && (
            <AgendaView
              currentDate={currentDate}
              events={events}
              lang={lang}
              onEventClick={handleEventClick}
            />
          )}

          {/* FAB - New Event */}
          <button
            onClick={handleNewEvent}
            style={{
              position: 'absolute',
              bottom: 24,
              right: 24,
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: 'none',
              background: 'linear-gradient(135deg, #E879A0, #A855F7)',
              color: 'white',
              boxShadow: '0 8px 24px rgba(168,85,247,0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            title={lang === 'it' ? 'Nuovo evento' : 'New event'}
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Event Modal */}
      {modalOpen && (
        <EventModal
          event={editingEvent}
          initialStart={newEventStart}
          lang={lang}
          onSave={handleSave}
          onDelete={editingEvent ? handleDelete : undefined}
          onClose={() => { setModalOpen(false); setEditingEvent(null) }}
        />
      )}
    </div>
  )
}
