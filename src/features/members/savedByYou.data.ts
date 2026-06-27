import type { SavedKind } from '../../app/providers/SavedProvider'

/** Display config for each saved-item kind, in the order groups should appear. */
export interface KindGroup {
  kind: SavedKind
  /** Plural section heading. */
  label: string
  /** 3-letter badge shown on each row. */
  badge: string
}

export const KIND_GROUPS: KindGroup[] = [
  { kind: 'article', label: 'Articles', badge: 'ART' },
  { kind: 'film', label: 'Films', badge: 'FLM' },
  { kind: 'job', label: 'Jobs', badge: 'JOB' },
  { kind: 'event', label: 'Events', badge: 'EVT' },
  { kind: 'post', label: 'Posts', badge: 'PST' },
  { kind: 'group', label: 'Groups', badge: 'GRP' },
]
