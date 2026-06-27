/** Static field options + copy for the Culture modal flows. */

export const PICK_KINDS = ['Book', 'Film', 'Music'] as const

/** Areas a member can offer when posting a creative-commission project. */
export const PROJECT_LOOKING_FOR = [
  'Writer',
  'Editor',
  'Photographer',
  'Illustrator',
  'Designer',
  'Musician',
  'Translator',
  'Sensitivity reader',
  'Studio space',
]

/** Mediums for the art-showcase submission. */
export const SHOWCASE_MEDIUMS = [
  'Photography',
  'Painting',
  'Illustration',
  'Mixed media',
  'Ceramics',
  'Digital',
  'Performance',
  'Installation',
]

/** Vibes a member can tag a radio playlist with. */
export const PLAYLIST_VIBES = [
  'Late night',
  'Tender',
  'Joyful',
  'Political',
  'Ambient',
  'Dancefloor',
  'Healing',
  'Nostalgic',
]

/**
 * Pretty date a few weeks out, used in success copy ("we'll email you by …").
 * Computed once at module load so the prototype always shows a future date.
 */
export function replyByDate(weeks = 2): string {
  const d = new Date()
  d.setDate(d.getDate() + weeks * 7)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}
