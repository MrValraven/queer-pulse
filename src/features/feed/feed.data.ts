import { MEMBERS, memberName } from '../members/data/members'

export const FEED_TABS = ['All', 'Gatherings', 'People', 'Posts'] as const
export type FeedTab = (typeof FEED_TABS)[number]

const NEW_SLUGS = ['kai', 'bilal-kaya', 'ines-fonseca', 'daniel-oliveira'] as const

export const NEW_THIS_WEEK = NEW_SLUGS.map((slug) => ({
  slug,
  name: memberName(slug),
  initials: MEMBERS[slug].initials,
  tint: MEMBERS[slug].tint,
  photo: MEMBERS[slug].photo,
}))
