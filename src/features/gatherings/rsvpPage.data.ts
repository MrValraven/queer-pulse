import type { IconType } from 'react-icons'
import { FiCalendar, FiMapPin, FiUser } from 'react-icons/fi'
import { memberName } from '../members/data/members'

export const RSVP_DETAILS: { icon: IconType; bg: string; label: string; value: string }[] = [
  { icon: FiCalendar, bg: 'rgba(232,119,90,.1)', label: 'Date & time', value: 'Sunday 22 June · 7:00 PM' },
  { icon: FiMapPin, bg: 'rgba(74,140,111,.1)', label: 'Location', value: 'Mouraria Community Centre' },
  { icon: FiUser, bg: 'rgba(45,27,61,.07)', label: 'Host', value: memberName('mariana') },
]

const GATHERING_TITLE = 'The Dispossessed — Reading Group #8'
const GATHERING_LOCATION = 'Mouraria Community Centre'
const GATHERING_DETAILS_TEXT =
  "Reading group #8 — chapters 10–14 of The Dispossessed. The kitchen opens from 6:45 PM if you'd like to arrive early. RSVP'd via QueerPulse."
// 22 June 2026, 19:00–21:00 UTC, in Google Calendar's compact UTC format.
const GATHERING_START = '20260622T190000Z'
const GATHERING_END = '20260622T210000Z'

export function googleCalendarUrl() {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: GATHERING_TITLE,
    dates: `${GATHERING_START}/${GATHERING_END}`,
    details: GATHERING_DETAILS_TEXT,
    location: GATHERING_LOCATION,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** Escape commas, semicolons, and newlines per the iCalendar (RFC 5545) spec. */
function icsEscape(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

/** Build a VCALENDAR document, wrap it in a Blob, and trigger a download. */
export function downloadIcs() {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QueerPulse//Gatherings//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${GATHERING_START}-queerpulse@queerpulse.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${GATHERING_START}`,
    `DTEND:${GATHERING_END}`,
    `SUMMARY:${icsEscape(GATHERING_TITLE)}`,
    `DESCRIPTION:${icsEscape(GATHERING_DETAILS_TEXT)}`,
    `LOCATION:${icsEscape(GATHERING_LOCATION)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'queerpulse-reading-group-8.ics'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export const RSVP_COC = [
  { strong: 'This is an affirming space.', rest: ' Bring your whole self — including the parts you usually have to leave at the door. Queer identity, trans experience, neurodivergence, disability: you\'re welcome as you are.' },
  { strong: 'We practise active consent.', rest: ' Ask before touching, check before sharing photos, and take cues from each other. When in doubt, ask.' },
  { strong: 'What happens here stays here.', rest: ' This is a private community. Please don\'t share personal information, stories, or photos from gatherings without consent.' },
  { strong: 'If something doesn\'t feel right, tell the organiser.', rest: ' Mariana is there to make the space work for everyone. You don\'t need to manage it alone.' },
]
