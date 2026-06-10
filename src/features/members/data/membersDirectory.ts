import type { AvatarTint } from '../../../shared/components/ui/Avatar'

export type ConnectState = 'connect' | 'pending' | 'connected'

export interface DirectoryMember {
  slug: string
  initials: string
  name: string
  pronouns: string
  location: string
  since: string
  bio: string
  skills: string[]
  tint: AvatarTint
  cover: string
  connectState: ConnectState
}

export const directoryMembers: DirectoryMember[] = [
  {
    slug: 'sofia',
    initials: 'SR',
    name: 'Sofia Rodrigues',
    pronouns: 'she/her',
    location: 'Lisbon',
    since: 'Jan 2025',
    bio: 'UX designer working on civic tech. Passionate about accessible design, queer nightlife preservation, and really good coffee.',
    skills: ['UX Design', 'Mentorship'],
    tint: 'jade',
    cover: 'linear-gradient(135deg,var(--plum),rgba(74,140,111,.4))',
    connectState: 'connected',
  },
  {
    slug: 'anika',
    initials: 'AK',
    name: 'Anika Kovač',
    pronouns: 'she/they',
    location: 'Lisbon',
    since: 'Mar 2025',
    bio: 'Translator and poet. Working on a collection about queerness and migration. Looking for collaborators for a bilingual reading series.',
    skills: ['Translation', '+1'],
    tint: 'coral',
    cover: 'linear-gradient(135deg,rgba(45,27,61,.8),rgba(232,119,90,.3))',
    connectState: 'connect',
  },
  {
    slug: 'jordan',
    initials: 'JP',
    name: 'Jordan Park',
    pronouns: 'they/them',
    location: 'Lisbon',
    since: 'Jun 2025',
    bio: 'Community organiser and facilitator. I help groups have hard conversations well. Open to mentoring queer people entering social sector work.',
    skills: ['Facilitation', 'Activism'],
    tint: 'plum',
    cover: 'linear-gradient(135deg,rgba(45,27,61,.7),rgba(74,140,111,.3))',
    connectState: 'pending',
  },
  {
    slug: 'tomas',
    initials: 'TM',
    name: 'Tomás Mendes',
    pronouns: 'he/him',
    location: 'Lisbon',
    since: 'Oct 2024',
    bio: 'Architect turning queer spaces into reality. Currently working on a low-cost housing project in Mouraria. Avid cook.',
    skills: ['Architecture', '+2'],
    tint: 'jade',
    cover: 'linear-gradient(135deg,rgba(74,140,111,.5),rgba(45,27,61,.6))',
    connectState: 'connect',
  },
  {
    slug: 'maria',
    initials: 'MF',
    name: 'Maria Ferreira',
    pronouns: 'she/her',
    location: 'Porto',
    since: 'Feb 2025',
    bio: 'Psychologist specialising in queer and trans mental health. Accepting new clients. Open to mentoring people retraining in psychology.',
    skills: ['Psychology', 'Mentorship'],
    tint: 'coral',
    cover: 'linear-gradient(135deg,rgba(232,119,90,.35),rgba(45,27,61,.7))',
    connectState: 'connect',
  },
  {
    slug: 'kai',
    initials: 'KL',
    name: 'Kai Larsson',
    pronouns: 'they/them',
    location: 'Lisbon',
    since: 'Apr 2026',
    bio: 'Filmmaker making a documentary about queer nightlife in southern Europe. Looking for interviewees, fixers, and people with good taste in music.',
    skills: ['Film'],
    tint: 'plum',
    cover: 'linear-gradient(135deg,rgba(45,27,61,.6),rgba(74,140,111,.4))',
    connectState: 'connect',
  },
]
