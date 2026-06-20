export type PerkState = 'available' | 'locked' | 'claimed'

export type PerkFooter =
  | { type: 'active-auto'; autoLabel: string }
  | { type: 'button'; label: string; toast: string }
  | { type: 'link-auto'; label: string; to: string; autoLabel: string }
  | { type: 'lock'; label: string }
  | { type: 'claimed'; date: string }

export interface Perk {
  cat: string
  title: string
  desc: string
  state: PerkState
  footer: PerkFooter
}

export interface PerkGroup {
  label: string
  perks: Perk[]
}

export const perkGroups: PerkGroup[] = [
  {
    label: 'Available to claim',
    perks: [
      {
        cat: 'Early Access',
        title: 'Early RSVP Access',
        desc: "Get 48-hour early access to all new gathering RSVPs before they open to the community. You'll receive an email the moment a new gathering is approved — before the public link goes live.",
        state: 'available',
        footer: { type: 'active-auto', autoLabel: 'Applied automatically at Level 4' },
      },
      {
        cat: 'Community',
        title: 'Trusted Lounge',
        desc: 'Access to the Trusted members-only community — a smaller, quieter space for Level 4+ members to connect. Less noise, more depth. Not indexed or visible to the general directory.',
        state: 'available',
        footer: {
          type: 'button',
          label: 'Join the lounge',
          toast: 'Welcome to the Trusted Lounge',
        },
      },
      {
        cat: 'Membership',
        title: 'Increased Invite Quota',
        desc: 'Your monthly invite allowance increases from 1 to 2. You know people who belong here — now you can bring more of them in. Invites reset on the first of each month.',
        state: 'available',
        footer: {
          type: 'link-auto',
          label: 'Send an invite',
          to: '/invite',
          autoLabel: 'Requires action',
        },
      },
    ],
  },
  {
    label: 'Coming at Level 5 · Trusted',
    perks: [
      {
        cat: 'Hosting',
        title: 'Host without approval',
        desc: "Skip the host application review — your gatherings go live immediately. You've earned the trust. We're just formalising it.",
        state: 'locked',
        footer: { type: 'lock', label: 'Unlocks at Level 5 · Trusted' },
      },
      {
        cat: 'Membership',
        title: 'Invite quota increases to 3',
        desc: 'Bring even more people in. At Level 5, your monthly quota goes to 3 invites. The community grows because of people like you.',
        state: 'locked',
        footer: { type: 'lock', label: 'Unlocks at Level 5 · Trusted' },
      },
    ],
  },
  {
    label: 'Already claimed',
    perks: [
      {
        cat: 'Community',
        title: 'Vouch access',
        desc: "The ability to vouch for new members on the waitlist. You've used this perk — it's now permanently part of your account.",
        state: 'claimed',
        footer: { type: 'claimed', date: 'Claimed 14 Feb 2026' },
      },
    ],
  },
]

/** Number of perks currently available to redeem. */
export const availableCount = perkGroups[0].perks.length

export const sidebarCopy = {
  explain:
    "Perks aren't a loyalty programme. They're our way of making sure the members who show up get a little more back. Each level reflects something real — time invested, gatherings attended, people connected. The platform grows because you do.",
  suggestPrompt:
    'What would make being a long-term member feel genuinely valuable?',
  suggestToast: 'Suggestion sent — thank you',
}
