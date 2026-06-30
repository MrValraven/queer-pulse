import type { MyEvent, Pill } from './myEvents.types'
import { TODAY, NOW } from './myEvents.data'

/** Categories that count as a committed RSVP (used for conflicts + soon bar). */
export const COMMITTED: Record<string, boolean> = { going: true, hosting: true, waitlisted: true }

/** Parse a YYYY-MM-DD string into a local Date. */
export function parseDate(s: string): Date {
  const [y = 0, m = 0, d = 0] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function ymd(dt: Date): string {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

/** Whole-day difference from TODAY (0 = today, >0 = future). */
export function dayDiff(dt: Date): number {
  const a = new Date(dt)
  a.setHours(0, 0, 0, 0)
  return Math.round((a.getTime() - TODAY.getTime()) / 86400000)
}

export function mondayOf(dt: Date): Date {
  const x = new Date(dt)
  x.setHours(0, 0, 0, 0)
  const off = (x.getDay() + 6) % 7
  x.setDate(x.getDate() - off)
  return x
}

export function timeStr(ev: MyEvent): string {
  return ev.start + (ev.end ? ` – ${ev.end}` : '')
}

export function atTime(ev: MyEvent, which: 'start' | 'end'): Date {
  const dt = parseDate(ev.date)
  const [h = 0, m = 0] = (ev[which] || ev.start).split(':').map(Number)
  dt.setHours(h, m, 0, 0)
  return dt
}

export function isToday(ev: MyEvent): boolean {
  return dayDiff(parseDate(ev.date)) === 0
}

export function isOnline(ev: MyEvent): boolean {
  return !!ev.online || /online/i.test(ev.venue)
}

/** "Starts in 2h", "Happening now", or null when not imminent. */
export function soonLabel(ev: MyEvent): string | null {
  const s = atTime(ev, 'start')
  const e = atTime(ev, 'end')
  if (NOW >= s && NOW <= e) return 'Happening now'
  const mins = Math.round((s.getTime() - NOW.getTime()) / 60000)
  if (mins < 0) return null
  if (mins < 60) return `Starts in ${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `Starts in ${h}h${m ? ` ${m}m` : ''}`
}

/** Another committed event overlapping this one on the same day, if any. */
export function conflictFor(ev: MyEvent, events: MyEvent[]): MyEvent | null {
  if (!COMMITTED[ev.cat] || ev.cancelled) return null
  const s = atTime(ev, 'start')
  const e = atTime(ev, 'end')
  for (const o of events) {
    if (o.id === ev.id || !COMMITTED[o.cat] || o.cancelled || o.date !== ev.date) continue
    if (s < atTime(o, 'end') && atTime(o, 'start') < e) return o
  }
  return null
}

/** Whether an event belongs to a given pill bucket. */
export function inPill(ev: MyEvent, p: Pill): boolean {
  const future = dayDiff(parseDate(ev.date)) >= 0
  switch (p) {
    case 'upcoming':
      return (ev.cat === 'going' || ev.cat === 'hosting' || ev.cat === 'waitlisted') && future
    case 'going':
      return ev.cat === 'going' && future
    case 'hosting':
      return ev.cat === 'hosting'
    case 'waitlisted':
      return ev.cat === 'waitlisted'
    case 'past':
      return ev.cat === 'past'
    case 'saved':
      return ev.cat === 'saved' || ev.cat === 'invite' || ev.cat === 'sent'
    default:
      return false
  }
}

/** Dot class for a calendar cell, by category. */
export function dotClass(cat: string): string {
  return cat === 'going' ? 'going' : cat === 'hosting' ? 'hosting' : cat === 'past' ? 'past' : 'pending'
}
