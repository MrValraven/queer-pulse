import type { Platform } from './types'
import { routes } from '../../../app/routeMap'

export const platforms: Platform[] = [
  { href: `${routes.platforms}#her`, badge: 'HER', name: 'HER', category: 'Dating · Social', tone: 'jade' },
  { href: `${routes.platforms}#lex`, badge: 'Lex', name: 'Lex', category: 'Social · Community', tone: 'plum' },
  { href: `${routes.platforms}#gaytimes`, badge: 'GT', name: 'Gay Times', category: 'Media · News', tone: 'coral' },
  { href: `${routes.platforms}#them`, badge: 'tm.', name: 'them.', category: 'Media · Culture', tone: 'plum' },
  { href: `${routes.platforms}#pinknews`, badge: 'PN', name: 'PinkNews', category: 'News · Rights', tone: 'coral' },
  { href: `${routes.platforms}#outintech`, badge: 'OT', name: 'Out in Tech', category: 'Professional', tone: 'jade' },
  { href: `${routes.platforms}#ilgaworld`, badge: 'IW', name: 'ILGA World', category: 'Advocacy · Rights', tone: 'jade' },
]
