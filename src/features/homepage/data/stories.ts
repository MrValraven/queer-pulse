import type { StoryCard, StoryFeature } from './types'
import { routes } from '../../../app/routeMap'
import { MEMBERS, memberName } from '../../members/data/members'

export const featureStory: StoryFeature = {
  category: 'Field Notes',
  title: 'How a Príncipe Real studio became a quiet home for queer designers',
  excerpt:
    "Six years ago it was a dusty first-floor flat with bad wiring. Today it's where half of Lisbon's queer design scene passes through — and nobody there is performing for an algorithm.",
  bylineInitials: MEMBERS.ines!.initials,
  byline: `Words by ${memberName('ines')} · 6 min read →`,
  href: routes.story,
  tint: 'coral',
  image:
    'https://images.unsplash.com/photo-1600188769099-d25b4ec79659?q=80&w=600&auto=format&fit=crop',
}

export const storyCards: StoryCard[] = [
  {
    category: 'Profiles',
    title: 'Leaving the startup grind for a supper club in Mouraria',
    bylineInitials: MEMBERS.sofia!.initials,
    byline: `${memberName('sofia')} · 4 min read`,
    href: routes.storyTomas,
    tint: 'jade',
    image:
      'https://images.unsplash.com/photo-1600188769045-bc6026bfc8cd?q=80&w=600&auto=format&fit=crop',
  },
  {
    category: 'On Building',
    title: 'Why we stayed invite-only: safety as a feature, not a gate',
    bylineInitials: 'QP',
    byline: 'The QueerPulse team · 3 min read',
    href: routes.storySafety,
    tint: 'plum',
    image:
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?q=80&w=800&auto=format&fit=crop',
  },
]
