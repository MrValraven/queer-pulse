import type { IconType } from 'react-icons'
import { FiBook, FiMusic, FiPlay, FiStar } from 'react-icons/fi'

export const SHAPING_META: Record<string, { label: string; icon: IconType }> = {
  film: { label: 'A film', icon: FiPlay },
  book: { label: 'A book or text', icon: FiBook },
  song: { label: 'A song or album', icon: FiMusic },
  moment: { label: 'A moment', icon: FiStar },
}

export const VISIBILITY_LABEL = {
  open: 'Open to connect',
  network: 'Network only',
  private: 'Private',
} as const
