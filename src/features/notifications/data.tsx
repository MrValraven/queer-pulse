import type { NotifType } from './notifications.types'

export type { NotifType, NotifAction, Notification } from './notifications.types'
export { notifications } from './notificationsList.data'

export const notificationTabs: { value: 'all' | NotifType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'messages', label: 'Messages' },
  { value: 'events', label: 'Events' },
  { value: 'community', label: 'Community' },
  { value: 'platform', label: 'Platform' },
]
