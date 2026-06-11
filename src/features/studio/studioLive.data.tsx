import { type ReactNode } from 'react'

export const WF = [30, 55, 70, 90, 65, 80, 50, 42, 60, 75, 55, 88, 62, 48, 72, 80, 34, 58, 80, 46, 64, 78, 42, 90, 54, 38, 66, 74, 48, 60, 35, 50, 42, 65, 78, 50, 68, 42, 36]

/** Number of waveform bars already played */
export const PLAYED = 15

export const SET = [
  { n: '1', pre: 'A summer in ', em: 'Cascais', who: 'Inês Tavares · played 21:00 → 21:04', pay: '€0.05 to Inês', tm: '4:12', state: 'played', tint: 'coral' },
  { n: '2', pre: 'Paris is ', em: 'still', post: ' burning', who: 'Akin Diallo · played 21:04 → 21:09', pay: '€0.05 to Akin', tm: '5:08', state: 'played', tint: 'plum' },
  { n: '3', pre: 'If you have to ', em: 'ask', who: 'Yara Reis · played 21:09 → 21:10', pay: '€0.05 to Yara', tm: '1:22', state: 'played', tint: 'jade' },
  { n: '4', pre: 'Salt water, ', em: 'slowly', who: 'Akin Diallo · played 21:10 → 21:16', pay: '€0.05 to Akin', tm: '5:31', state: 'played', tint: 'coral' },
  { n: '5', pre: 'Cantiga para a ', em: 'vizinha', who: 'Coro de Outubro · played 21:16 → 21:22', pay: '€0.05 to Coro', tm: '6:08', state: 'played', tint: 'plum' },
  { n: '6', pre: 'Carta para a ', em: 'santa', who: 'Mariana Sol · playing now · 1:42 / 4:18', payNote: 'paying now', pay: '€0.05 to Mariana', tm: '4:18', state: 'now', tint: 'coral' },
  { n: '7', pre: 'Pedro on the ', em: '25', who: 'Pedro Limão · up next · starts in 2:36', payEm: 'queued by Sara', tm: '4:20', state: 'upnext', tint: 'jade' },
  { n: '8', pre: 'Mother, ', em: 'weather', who: 'Yuki Tanaka · planned, may rotate', pay: '€0.05 / play', tm: '7:14', state: 'queued', tint: 'plum' },
]

export type Msg =
  | { system: string }
  | { av: string; tone?: 'jade' | 'plum'; name: string; curator?: boolean; role?: string; roleClass?: string; text: ReactNode; time: string; tip?: boolean }

export const CHAT: Msg[] = [
  { system: '21:00 · Sara Marques opened the room' },
  { av: 'SM', tone: 'jade', name: 'Sara Marques', curator: true, role: 'Curator', roleClass: 'cu', text: <>welcome in. tonight: twelve tracks, mostly piano, some choir. don't shuffle — <em>i'll know</em>.</>, time: '21:01 · pinned' },
  { av: 'RT', name: 'Rita T.', text: 'first 🥹', time: '21:01' },
  { av: 'PL', name: 'Pedro L.', text: 'cascais opener, classic move', time: '21:02' },
  { system: '21:10 · 312 in the room · 41 cities' },
  { av: 'DO', tone: 'jade', name: 'D. Okoye', role: 'Sustainer', text: 'the akin double is so good. how did you sequence that 🤍', time: '21:15' },
  { av: 'SM', tone: 'jade', name: 'Sara Marques', curator: true, role: 'Curator', roleClass: 'cu', text: <>honestly? <em>by accident.</em> i had paris in slot 4 last week and it didn't land. moved it earlier, then salt water followed it home.</>, time: '21:16' },
  { av: 'PL', tone: 'jade', name: 'Pedro L.', role: 'Artist', roleClass: 'artist', tip: true, text: <><b>tipped €5 to Akin</b> · "salt water is the whole record"</>, time: '21:17' },
  { system: '21:22 · now playing: Carta para a santa, Mariana Sol' },
  { av: 'RT', name: 'Rita T.', text: <>second verse just broke me. <em>again.</em></>, time: '21:23' },
  { av: 'DO', tone: 'jade', name: 'D. Okoye', role: 'Sustainer', text: '@yara it\'s pinned in track notes 👇', time: '21:23' },
  { av: 'PL', name: 'Pedro L.', role: 'Artist', roleClass: 'artist', tip: true, text: <><b>tipped €5 to Mariana</b> · "earn it, mariana."</>, time: '21:24' },
  { av: 'SM', tone: 'jade', name: 'Sara Marques', curator: true, role: 'Curator', roleClass: 'cu', text: <>the piano leaves you here on purpose. <em>wait.</em></>, time: '21:24' },
  { av: '·', tone: 'plum', name: 'Anonymous', tip: true, text: <><b>tipped €10 to Mariana</b></>, time: '21:24' },
]

export const TABS = [
  { label: 'Chat', ct: '312' },
  { label: 'Tips', ct: '87' },
  { label: 'Listeners', ct: '' },
]
