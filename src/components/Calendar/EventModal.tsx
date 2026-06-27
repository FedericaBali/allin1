import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import type { CalendarEvent, CreateEventPayload, EventCategory, Language } from '../../types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../types'

interface EventModalProps {
  event?: CalendarEvent | null
  initialStart?: Date
  lang: Language
  onSave: (payload: CreateEventPayload) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onClose: () => void
}

const CATEGORIES: EventCategory[] = ['work', 'personal', 'health', 'social', 'other']

const translations = {
  it: {
    newEvent: 'Nuovo Evento',
    editEvent: 'Modifica Evento',
    title: 'Titolo',
    description: 'Descrizione (opzionale)',
    start: 'Inizio',
    end: 'Fine',
    allDay: 'Tutto il giorno',
    category: 'Categoria',
    save: 'Salva',
    delete: 'Elimina',
    cancel: 'Annulla',
    titleRequired: 'Il titolo è obbligatorio',
    confirmDelete: 'Eliminare questo evento?',
  },
  en: {
    newEvent: 'New Event',
    editEvent: 'Edit Event',
    title: 'Title',
    description: 'Description (optional)',
    start: 'Start',
    end: 'End',
    allDay: 'All day',
    category: 'Category',
    save: 'Save',
    delete: 'Delete',
    cancel: 'Cancel',
    titleRequired: 'Title is required',
    confirmDelete: 'Delete this event?',
  },
}

function toLocalDateTimeString(iso: string): string {
  const d = new Date(iso)
  return format(d, "yyyy-MM-dd'T'HH:mm")
}

function toLocalDateString(iso: string): string {
  const d = new Date(iso)
  return format(d, 'yyyy-MM-dd')
}

export default function EventModal({
  event,
  initialStart,
  lang,
  onSave,
  onDelete,
  onClose,
}: EventModalProps) {
  const t = translations[lang]
  const isEditing = !!event

  const defaultStart = initialStart ?? new Date()
  const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000)

  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [startStr, setStartStr] = useState(
    event ? toLocalDateTimeString(event.start_time) : format(defaultStart, "yyyy-MM-dd'T'HH:mm")
  )
  const [endStr, setEndStr] = useState(
    event ? toLocalDateTimeString(event.end_time) : format(defaultEnd, "yyyy-MM-dd'T'HH:mm")
  )
  const [allDay, setAllDay] = useState(event?.all_day ?? false)
  const [category, setCategory] = useState<EventCategory>(event?.category ?? 'personal')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Update color based on category
  const color = CATEGORY_COLORS[category]

  async function handleSave() {
    if (!title.trim()) {
      setError(t.titleRequired)
      return
    }
    setError('')
    setSaving(true)
    try {
      const payload: CreateEventPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        start_time: allDay
          ? new Date(startStr.split('T')[0] + 'T00:00:00').toISOString()
          : new Date(startStr).toISOString(),
        end_time: allDay
          ? new Date(endStr.split('T')[0] + 'T23:59:59').toISOString()
          : new Date(endStr).toISOString(),
        all_day: allDay,
        category,
        color,
        source: 'manual',
      }
      await onSave(payload)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error saving event')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!event || !onDelete) return
    if (!window.confirm(t.confirmDelete)) return
    setDeleting(true)
    try {
      await onDelete(event.id)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error deleting event')
    } finally {
      setDeleting(false)
    }
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} role="dialog" aria-modal="true" aria-label={isEditing ? t.editEvent : t.newEvent}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>{isEditing ? t.editEvent : t.newEvent}</h2>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div style={styles.body}>
          {/* Title */}
          <div style={styles.field}>
            <label style={styles.label}>{t.title}</label>
            <input
              data-testid="event-title-input"
              style={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={lang === 'it' ? 'Titolo evento' : 'Event title'}
              autoFocus
            />
          </div>

          {/* Description */}
          <div style={styles.field}>
            <label style={styles.label}>{t.description}</label>
            <textarea
              data-testid="event-description-input"
              style={{ ...styles.input, height: 72, resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={lang === 'it' ? 'Aggiungi una descrizione...' : 'Add a description...'}
            />
          </div>

          {/* All day toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <div
                data-testid="all-day-toggle"
                onClick={() => setAllDay(!allDay)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: allDay ? 'linear-gradient(135deg, #E879A0, #A855F7)' : '#d1d5db',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 2,
                  left: allDay ? 22 : 2,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                  transition: 'left 0.2s',
                }} />
              </div>
              <span style={styles.label}>{t.allDay}</span>
            </label>
          </div>

          {/* Start / End */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={styles.field}>
              <label style={styles.label}>{t.start}</label>
              <input
                data-testid="event-start-input"
                type={allDay ? 'date' : 'datetime-local'}
                style={styles.input}
                value={allDay ? startStr.split('T')[0] : startStr}
                onChange={(e) => setStartStr(allDay ? e.target.value : e.target.value)}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>{t.end}</label>
              <input
                data-testid="event-end-input"
                type={allDay ? 'date' : 'datetime-local'}
                style={styles.input}
                value={allDay ? endStr.split('T')[0] : endStr}
                onChange={(e) => setEndStr(allDay ? e.target.value : e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div style={styles.field}>
            <label style={styles.label}>{t.category}</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  data-testid={`category-${cat}`}
                  onClick={() => setCategory(cat)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: `2px solid ${category === cat ? CATEGORY_COLORS[cat] : 'transparent'}`,
                    background: category === cat ? CATEGORY_COLORS[cat] + '22' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: category === cat ? 600 : 400,
                    color: category === cat ? CATEGORY_COLORS[cat] : '#4a4a6a',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[cat],
                  }} />
                  {CATEGORY_LABELS[cat][lang]}
                </button>
              ))}
            </div>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          {isEditing && onDelete && (
            <button
              data-testid="delete-event-btn"
              style={styles.deleteBtn}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '...' : t.delete}
            </button>
          )}
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button
              data-testid="cancel-event-btn"
              style={styles.cancelBtn}
              onClick={onClose}
            >
              {t.cancel}
            </button>
            <button
              data-testid="save-event-btn"
              style={styles.saveBtn}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '...' : t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(26,26,46,0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
  },
  modal: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.9)',
    borderRadius: 24,
    boxShadow: '0 24px 64px rgba(168,85,247,0.25)',
    width: '100%',
    maxWidth: 520,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px 16px',
    borderBottom: '1px solid rgba(232,121,160,0.15)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    background: 'linear-gradient(135deg, #E879A0, #A855F7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(0,0,0,0.05)',
    color: '#8a8aaa',
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: '20px 24px',
    overflowY: 'auto',
    maxHeight: '60vh',
  },
  field: {
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#4a4a6a',
  },
  input: {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1.5px solid rgba(168,85,247,0.2)',
    background: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    color: '#1a1a2e',
    outline: 'none',
    width: '100%',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8,
    padding: '8px 14px',
    color: '#dc2626',
    fontSize: 13,
    marginTop: 8,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 24px',
    borderTop: '1px solid rgba(232,121,160,0.15)',
    gap: 8,
  },
  deleteBtn: {
    padding: '10px 18px',
    borderRadius: 10,
    border: '1.5px solid rgba(239,68,68,0.4)',
    background: 'rgba(239,68,68,0.08)',
    color: '#dc2626',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '10px 18px',
    borderRadius: 10,
    border: '1.5px solid rgba(168,85,247,0.2)',
    background: 'transparent',
    color: '#4a4a6a',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 24px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #E879A0, #A855F7)',
    color: 'white',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(168,85,247,0.3)',
  },
}
