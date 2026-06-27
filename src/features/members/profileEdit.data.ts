import type { VisibilityMode } from '../../shared/components/ui/VisibilityBadge'

/** Quick-pick pronoun sets offered in the inline editor (custom entry also allowed). */
export const PRONOUN_OPTIONS = [
  'she/her',
  'he/him',
  'they/them',
  'she/they',
  'he/they',
  'ze/zir',
] as const

/** Visibility / connect-status options shown as a segmented control on the hero. */
export const VISIBILITY_OPTIONS: {
  value: VisibilityMode
  label: string
  hint: string
}[] = [
  { value: 'open', label: 'Open to connect', hint: 'Anyone on QueerPulse can say hello.' },
  { value: 'network', label: 'Network only', hint: 'Only people you’re connected to.' },
  { value: 'private', label: 'Private', hint: 'Members must request an intro first.' },
]
