import type { Member } from './types'
import { MEMBERS, memberName } from '../../members/data/members'

/**
 * Homepage member cards derive their identity (name, hood, avatar, vouchers,
 * verification, visibility) from the canonical registry, so editing a member in
 * one place updates them here too. Only the card-specific presentation — the
 * abbreviated `role`, the short `tags`, and the homepage `category` — stays local.
 */
function card(
  slug: string,
  category: Member['category'],
  tags: string[],
  role: string,
): Member {
  const m = MEMBERS[slug]!
  return {
    key: slug,
    name: memberName(slug),
    role,
    hood: m.hood,
    category,
    tags,
    verified: m.verified,
    visibility: m.visibility,
    initials: m.initials,
    tint: m.tint,
    photo: m.photo,
    vouchedBy: m.voucherNames,
  }
}

export const members: Member[] = [
  card('ines', 'design', ['Branding', 'Editorial', 'Type'], 'Graphic Designer'),
  card('rui', 'tech', ['Backend', 'Rust', 'Infra'], 'Software Engineer'),
  card('sofia', 'film', ['Directing', 'Editing', 'Sound'], 'Documentary Filmmaker'),
  card('tomas', 'food', ['Fermentation', 'Menus'], 'Chef · Supper Club Host'),
  card('mariana', 'care', ['LGBTQ+ care', 'Therapy'], 'Clinical Psychologist'),
  card('andre', 'film', ['Portrait', 'Analog'], 'Portrait Photographer'),
  card('carla', 'tech', ['Fintech', 'Strategy'], 'Product Manager'),
  card('beatriz', 'craft', ['Studio', 'Glazing'], 'Ceramicist'),
  card('diogo', 'music', ['Mixing', 'Live sets'], 'Music Producer'),
]

export const memberFilters: { value: 'all' | Member['category']; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'design', label: 'Design' },
  { value: 'tech', label: 'Tech' },
  { value: 'film', label: 'Film & Photo' },
  { value: 'music', label: 'Music' },
  { value: 'food', label: 'Food' },
  { value: 'craft', label: 'Craft' },
  { value: 'care', label: 'Care' },
]

/** Visibility helper copy used on member cards. */
export const visibilitySay: Record<Member['visibility'], string> = {
  open: 'Open to new people',
  network: 'Reachable via network',
  private: 'Keeping it quiet',
}
