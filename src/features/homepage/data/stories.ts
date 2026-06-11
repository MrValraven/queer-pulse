import type { StoryCard, StoryFeature } from './types'
import { routes } from '../../../app/routeMap'

export const featureStory: StoryFeature = {
  category: 'Field Notes',
  title: 'How a Príncipe Real studio became a quiet home for queer designers',
  excerpt:
    "Six years ago it was a dusty first-floor flat with bad wiring. Today it's where half of Lisbon's queer design scene passes through — and nobody there is performing for an algorithm.",
  bylineInitials: 'IT',
  byline: 'Words by Inês Tavares · 6 min read →',
  href: routes.story,
  tint: 'coral',
}

export const storyCards: StoryCard[] = [
  {
    category: 'Profiles',
    title: 'Leaving the startup grind for a supper club in Mouraria',
    bylineInitials: 'SA',
    byline: 'Sofia Andrade · 4 min read',
    href: routes.storyTomas,
    tint: 'jade',
  },
  {
    category: 'On Building',
    title: 'Why we stayed invite-only: safety as a feature, not a gate',
    bylineInitials: 'QP',
    byline: 'The QueerPulse team · 3 min read',
    href: routes.storySafety,
    tint: 'plum',
  },
]
