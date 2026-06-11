export const FEED_TABS = ['All', 'Gatherings', 'People', 'Posts'] as const
export type FeedTab = (typeof FEED_TABS)[number]

export const NEW_THIS_WEEK = [
  { initials: 'KL', tint: 'plum', name: 'Kai Larsson', slug: 'kai' },
  { initials: 'BK', tint: 'jade', name: 'Bilal Kaya', slug: 'bilal' },
  { initials: 'IF', tint: 'coral', name: 'Ines Fonseca', slug: 'ines' },
  { initials: 'DO', tint: 'plum', name: 'Daniel Oliveira', slug: 'daniel' },
] as const
