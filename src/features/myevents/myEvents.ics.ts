import type { MyEvent } from './myEvents.types'

/** RFC5545 text escaping: backslash, comma, semicolon, and newlines. */
function escapeText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n')
}

/** Build a basic-format local floating timestamp `YYYYMMDDTHHMMSS`. */
function toICSDate(date: string, time: string): string {
  const ymd = date.replace(/-/g, '')
  const hms = time.replace(/:/g, '') + '00'
  return `${ymd}T${hms}`
}

/** Build a valid VCALENDAR string from a list of events (local floating time). */
export function toICS(events: MyEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QueerPulse//My Events//EN',
  ]
  for (const ev of events) {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${ev.id}@queerpulse`)
    lines.push(`DTSTART:${toICSDate(ev.date, ev.start)}`)
    if (ev.end) lines.push(`DTEND:${toICSDate(ev.date, ev.end)}`)
    lines.push(`SUMMARY:${escapeText(ev.title)}`)
    lines.push(`LOCATION:${escapeText(ev.venue)}`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

/** Trigger a client-side download of an .ics file for the given events. */
export function downloadICS(filename: string, events: MyEvent[]): void {
  if (typeof document === 'undefined') return
  const blob = new Blob([toICS(events)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
