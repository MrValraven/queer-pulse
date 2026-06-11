export const RECENT = [
  { initials: 'SR', bg: 'rgba(74,140,111,.15)', color: 'var(--jade)', name: 'Sofia R.', time: 'Just now' },
  { initials: 'AK', bg: 'rgba(232,119,90,.12)', color: 'var(--accent-ink)', name: 'Anika K.', time: '3 min ago' },
  { initials: 'JP', bg: 'rgba(45,27,61,.1)', color: 'var(--plum)', name: 'Jordan P.', time: '7 min ago' },
  { initials: 'TM', bg: 'rgba(74,140,111,.08)', color: 'var(--jade)', name: 'Tomás M.', time: '11 min ago' },
]

export interface Guest {
  initials: string
  bg: string
  color: string
  name: string
  pronouns: string
  status: 'in' | 'pending'
  time?: string
}

export const INITIAL_GUESTS: Guest[] = [
  { initials: 'SR', bg: 'rgba(74,140,111,.12)', color: 'var(--jade)', name: 'Sofia Rodrigues', pronouns: 'she/her', status: 'in', time: '11:03' },
  { initials: 'AK', bg: 'rgba(232,119,90,.12)', color: 'var(--accent-ink)', name: 'Anika Kovač', pronouns: 'she/they', status: 'in', time: '11:07' },
  { initials: 'JP', bg: 'rgba(45,27,61,.1)', color: 'var(--plum)', name: 'Jordan Park', pronouns: 'they/them', status: 'in', time: '11:13' },
  { initials: 'TM', bg: 'rgba(74,140,111,.08)', color: 'var(--jade)', name: 'Tomás Mendes', pronouns: 'he/him', status: 'in', time: '11:19' },
  { initials: 'MF', bg: 'rgba(45,27,61,.07)', color: 'var(--plum)', name: 'Maria Ferreira', pronouns: 'she/her', status: 'in', time: '11:22' },
  { initials: 'RL', bg: 'rgba(232,119,90,.08)', color: 'var(--accent-ink)', name: 'Rosa Lima', pronouns: 'she/her', status: 'in', time: '11:28' },
  { initials: 'BK', bg: 'rgba(74,140,111,.1)', color: 'var(--jade)', name: 'Bilal Kaya', pronouns: 'he/him', status: 'in', time: '11:31' },
  { initials: 'PO', bg: 'rgba(45,27,61,.08)', color: 'var(--plum)', name: 'Priya Osei', pronouns: 'she/they', status: 'in', time: '11:38' },
  { initials: 'CN', bg: 'rgba(232,119,90,.1)', color: 'var(--accent-ink)', name: 'Carlos Neves', pronouns: 'he/him', status: 'in', time: '11:44' },
  { initials: 'LM', bg: 'rgba(45,27,61,.06)', color: 'var(--ink-60)', name: 'Lena Müller', pronouns: 'she/her', status: 'pending' },
  { initials: 'XP', bg: 'rgba(45,27,61,.06)', color: 'var(--ink-60)', name: 'Xabi Prieto', pronouns: 'he/they', status: 'pending' },
  { initials: 'AS', bg: 'rgba(45,27,61,.06)', color: 'var(--ink-60)', name: 'Amara Sow', pronouns: 'she/her', status: 'pending' },
  { initials: 'DO', bg: 'rgba(45,27,61,.06)', color: 'var(--ink-60)', name: 'Daniel Oliveira', pronouns: 'he/him', status: 'pending' },
  { initials: 'IF', bg: 'rgba(45,27,61,.06)', color: 'var(--ink-60)', name: 'Ines Fonseca', pronouns: 'she/her', status: 'pending' },
]

export const WAITLIST = [
  { initials: 'NC', bg: 'rgba(232,119,90,.08)', color: 'var(--accent-ink)', name: 'Nadia Castillo', meta: 'she/her · #1 on waitlist' },
  { initials: 'KL', bg: 'rgba(74,140,111,.08)', color: 'var(--jade)', name: 'Kai Larsson', meta: 'they/them · #2 on waitlist' },
]

export function nowHHMM() {
  const d = new Date()
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
