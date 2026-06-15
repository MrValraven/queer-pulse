import { orgColors } from './data'

// Static copy + filter categories for the Events list page.
// The events themselves come from `calendarEvents` in ./data.

export const eventsHeader = {
  eyebrow: "What's on",
  subtitle:
    'Every gathering, meetup, and partner event across the Lisbon network — browse the season and find your people.',
}

export interface EventCategory {
  key: string
  label: string
  /** Dot colour for the filter chip. */
  dot: string
  /** Event `orgColor` values this category matches. Omitted for "All". */
  colors?: string[]
}

export const EVENT_CATEGORIES: EventCategory[] = [
  { key: 'all', label: 'All events', dot: orgColors.queerpulse },
  { key: 'queerpulse', label: 'QueerPulse', dot: orgColors.queerpulse, colors: [orgColors.queerpulse] },
  { key: 'community', label: 'Community', dot: orgColors.community, colors: [orgColors.community] },
  {
    key: 'partners',
    label: 'Partner orgs',
    dot: orgColors.ilga,
    colors: [orgColors.ilga, orgColors.partner],
  },
]
