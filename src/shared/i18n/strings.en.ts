import type { StringCatalog } from './types'

/**
 * English string catalog for shared chrome (nav, footer, common CTAs).
 * Homepage section copy currently lives as literals in each section for
 * Milestone 1; shared/reused strings are centralised here and the catalog
 * grows as more surfaces are built. A Portuguese catalog will mirror these keys.
 */
export const en: StringCatalog = {
  // Brand
  'brand.name': 'QueerPulse',
  'brand.tagline': 'A queer professional network, rooted in Lisbon.',

  // Primary CTAs
  'cta.requestInvite': 'Request an invite',
  'cta.exploreMembers': 'Explore members',
  'cta.backHome': 'Back to home',

  // Nav
  'nav.members': 'Members',
  'nav.gatherings': 'Gatherings',
  'nav.forum': 'Forum',
  'nav.calendar': 'Calendar',
  'nav.communities': 'Communities',
  'nav.arriving': 'New to Lisbon?',
  'nav.skills': 'Skills',
  'nav.toggleTheme': 'Toggle colour theme',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',

  // Footer column heads
  'footer.network': 'Network',
  'footer.community': 'Community',
  'footer.lisbon': 'Lisbon',
  'footer.wellbeing': 'Wellbeing',
  'footer.copyright': '© 2026 QueerPulse · Made in Lisbon with care',
}
