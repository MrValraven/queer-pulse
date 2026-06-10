/**
 * Translates the design prototype's link targets into clean router paths.
 *
 * The prototype links to files like `"QueerPulse Business Directory.html"` and
 * in-page anchors like `"#discovery"`. We map those to paths the router knows:
 *   "QueerPulse Business Directory.html"        -> "/business-directory"
 *   "QueerPulse Communities.html#elders"        -> "/communities#elders"
 *   "#discovery"                                -> "/#discovery"  (home anchor)
 */

const HTML_SUFFIX = '.html'
const FILE_PREFIX = 'QueerPulse '

/** Slugify the human page name into a path segment. */
function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Map a prototype href to a clean router path (preserving any #anchor). */
export function linkToPath(href: string): string {
  if (!href) return '/'

  // Pure in-page anchor → home anchor
  if (href.startsWith('#')) return `/${href}`

  const [file, anchor] = href.split('#')
  const hash = anchor ? `#${anchor}` : ''

  if (!file.endsWith(HTML_SUFFIX)) {
    // Already a path or external — pass through
    return href
  }

  let name = file.slice(0, -HTML_SUFFIX.length)
  if (name.startsWith(FILE_PREFIX)) name = name.slice(FILE_PREFIX.length)

  // The homepage itself
  if (name === 'Homepage' || name === 'Homepage v2') return `/${hash}`

  return `/${slugify(name)}${hash}`
}

/** Known top-level routes that should render real (or placeholder) pages. */
export const KNOWN_ROUTE_SLUGS: string[] = [
  'invite',
  'members',
  'communities',
  'forum',
  'calendar',
  'arriving',
  'skills',
  'gatherings',
  'gathering',
  'profile',
  'messages',
  'search',
  'welcome',
  'changemakers',
  'parents',
  'coming-out',
  'grants',
  'library',
  'volunteer',
  'mentorship',
  'activism',
  'archive',
  'map',
  'business-directory',
  'barter',
  'housing',
  'jobs',
  'directory',
  'platforms',
  'accessibility',
  'contact',
  'wellbeing',
  'legal',
  'employer-reviews',
  'trans-hub',
  'report',
  'partners',
  'host',
  'offer',
  'connect',
  'story',
  'story-tomas',
  'story-safety',
  'emergency',
  'governance',
  'guidelines',
  'safety',
  // Mega-nav targets (placeholder pages)
  'member-directory-filter',
  'connections',
  'dating',
  'reading-groups',
  'family',
  'safe-spaces',
  'flatmates',
  'solidarity',
  'visas',
  'mental-health',
  'sexual-health',
  'trans-healthcare',
  'harm-reduction',
  'sober',
  'hate-crime',
  '101',
  'glossary',
  'trans-day-of-visibility',
  'world-aids-day',
  'pride-month',
  'micro-grants',
  'intersectionality',
  'issues',
  'cover-gallery',
  'tag',
  'podcast-show',
  'audio-player',
  'newsletter-archive',
  'creatives',
  'manifesto',
  'application-status',
  'economy',
  'annual-assembly',
  'constitution',
  'code-of-conduct',
  'transparency-report',
  'for-organisations',
  'cities',
  'get-the-app',
  'changelog',
  'newsletter',
  'privacy',
  'dsar',
  'terms',
  'press-kit',
  'press-archive',
  'component-library',
]
