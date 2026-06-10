import type { AvatarTint } from '../../shared/components/ui/Avatar'

export interface ChatMessage {
  from: 'me' | 'them'
  text: string
  time?: string
}

export interface Conversation {
  id: string
  initials: string
  tint: AvatarTint
  name: string
  pronouns: string
  connectedSince: string
  time: string
  preview: string
  unread: boolean
  official?: boolean
  messages: { day: string; items: ChatMessage[] }[]
}

/** The signed-in member, used for sent-bubble avatars. */
export const me = { initials: 'SR', tint: 'plum' as AvatarTint }

export const conversations: Conversation[] = [
  {
    id: 'anika',
    initials: 'AK',
    tint: 'coral',
    name: 'Anika Kovač',
    pronouns: 'she/they',
    connectedSince: 'Feb 2026',
    time: 'Now',
    preview: "Thanks for the recommendation! I'll reach out to her this week",
    unread: true,
    messages: [
      {
        day: 'Yesterday',
        items: [
          { from: 'them', text: 'Hey! I saw your question in the Trans & Non-Binary thread about GPs. Dr. Carla Nunes at Clínica do Marquês is brilliant — she gets it without needing a full explanation every visit.' },
          { from: 'me', text: 'Oh brilliant, thank you! Is she taking new patients?' },
          { from: 'them', text: "Yes — I'd recommend booking by email rather than phone, she's quicker to respond. I can send you her contact if you like?" },
        ],
      },
      {
        day: 'Today',
        items: [
          { from: 'me', text: 'That would be amazing, yes please' },
          { from: 'them', text: "Thanks for the recommendation! I'll reach out to her this week — really appreciate you taking the time.", time: 'Just now' },
        ],
      },
    ],
  },
  {
    id: 'jordan',
    initials: 'JP',
    tint: 'plum',
    name: 'Jordan Park',
    pronouns: 'they/them',
    connectedSince: 'Mar 2026',
    time: 'Yesterday',
    preview: 'See you at the book club on Saturday',
    unread: false,
    messages: [
      {
        day: 'Yesterday',
        items: [
          { from: 'me', text: 'Are you going to the book club on Saturday?' },
          { from: 'them', text: 'See you at the book club on Saturday', time: 'Yesterday 3:14 PM' },
        ],
      },
    ],
  },
  {
    id: 'tomas',
    initials: 'TM',
    tint: 'jade',
    name: 'Tomás Mendes',
    pronouns: 'he/him',
    connectedSince: 'Jan 2026',
    time: 'Mon',
    preview: "The venue confirmed — we're all set for the…",
    unread: true,
    messages: [
      {
        day: 'Monday',
        items: [
          { from: 'them', text: "The venue confirmed — we're all set for the Pride Brunch. They've given us the whole terrace from 11am.", time: 'Mon 2:30 PM' },
        ],
      },
    ],
  },
  {
    id: 'maria',
    initials: 'MF',
    tint: 'jade',
    name: 'Maria Ferreira',
    pronouns: 'she/her',
    connectedSince: 'Apr 2026',
    time: 'Sun',
    preview: 'Of course, happy to chat. Are you free Thursday?',
    unread: false,
    messages: [
      {
        day: 'Sunday',
        items: [
          { from: 'me', text: 'Hi Maria — would you be open to a quick chat sometime? I have some questions about trans healthcare resources.' },
          { from: 'them', text: 'Of course, happy to chat. Are you free Thursday?', time: 'Sun 11:22 AM' },
        ],
      },
    ],
  },
  {
    id: 'kai',
    initials: 'KL',
    tint: 'plum',
    name: 'Kai Larsson',
    pronouns: 'they/them',
    connectedSince: 'May 2026',
    time: 'Fri',
    preview: "That's exactly the angle I was looking for, thank you",
    unread: false,
    messages: [
      {
        day: 'Friday',
        items: [
          { from: 'me', text: 'I think the angle you want is less about documentation and more about memory — what communities choose to remember vs forget.' },
          { from: 'them', text: "That's exactly the angle I was looking for, thank you", time: 'Fri 6:48 PM' },
        ],
      },
    ],
  },
  {
    id: 'team',
    initials: 'QP',
    tint: 'plum',
    name: 'QueerPulse Team',
    pronouns: 'Official',
    connectedSince: '',
    time: '1 Jun',
    preview: "Welcome to QueerPulse! Here's what to explore first…",
    unread: false,
    official: true,
    messages: [
      {
        day: '1 June 2026',
        items: [
          { from: 'them', text: "Welcome to QueerPulse! Here's what to explore first — your profile, upcoming gatherings, and the member directory. We're glad you're here.", time: '1 Jun 9:00 AM' },
        ],
      },
    ],
  },
  {
    id: 'bilal',
    initials: 'BK',
    tint: 'coral',
    name: 'Bilal Kaya',
    pronouns: 'he/him',
    connectedSince: 'May 2026',
    time: '28 May',
    preview: 'Let me know if you want me to introduce you',
    unread: false,
    messages: [
      {
        day: '28 May',
        items: [
          { from: 'them', text: 'Let me know if you want me to introduce you to Nadia — she does exactly the kind of work you\'re describing.', time: '28 May 4:12 PM' },
        ],
      },
    ],
  },
]
