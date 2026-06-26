import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'
import { FiBookOpen, FiClipboard, FiClock, FiHome, FiStar, FiTag } from 'react-icons/fi'
import type { AvatarTint } from '../../shared/components/ui/Avatar'
import { routes } from '../../app/routeMap'
import { memberName } from '../members/data/members'

export type NotifType = 'messages' | 'events' | 'community' | 'platform'

export interface NotifAction {
  label: string
  variant: 'primary' | 'ghost'
  href: string
}

export interface Notification {
  id: number
  type: NotifType
  unread: boolean
  /** Either an avatar (initials + tint) or an emoji icon with a background. */
  avatar?: { initials: string; tint: AvatarTint }
  icon?: { Glyph: IconType; bg: string }
  text: ReactNode
  meta: string
  time: string
  actions?: NotifAction[]
}

export const notificationTabs: { value: 'all' | NotifType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'messages', label: 'Messages' },
  { value: 'events', label: 'Events' },
  { value: 'community', label: 'Community' },
  { value: 'platform', label: 'Platform' },
]

export const notifications: Notification[] = [
  {
    id: 1,
    type: 'messages',
    unread: true,
    avatar: { initials: 'IT', tint: 'jade' },
    text: (
      <>
        <strong>{memberName('ines')}</strong> replied to your message about the
        Sunday table gathering.
      </>
    ),
    meta: 'Private message',
    time: '2 min ago',
    actions: [
      { label: 'Reply', variant: 'primary', href: routes.messages },
      { label: 'View thread', variant: 'ghost', href: routes.messages },
    ],
  },
  {
    id: 2,
    type: 'events',
    unread: true,
    icon: { Glyph: FiTag, bg: 'rgba(232,119,90,.1)' },
    text: (
      <>
        Your RSVP for <strong>Newcomer Welcome Dinner</strong> has been
        confirmed. The event is on Saturday June 14th at Casa do Alentejo.
      </>
    ),
    meta: 'Event · Gathering',
    time: '18 min ago',
    actions: [{ label: 'View event', variant: 'primary', href: routes.event }],
  },
  {
    id: 3,
    type: 'community',
    unread: true,
    avatar: { initials: 'DV', tint: 'plum' },
    text: (
      <>
        <strong>{memberName('diogo')}</strong> invited you to join{' '}
        <strong>Queer Classics</strong> reading group.
      </>
    ),
    meta: 'Reading group · Invitation',
    time: '1 hr ago',
    actions: [
      { label: 'Accept', variant: 'primary', href: routes.readingGroups },
      { label: 'Decline', variant: 'ghost', href: '#' },
    ],
  },
  {
    id: 4,
    type: 'messages',
    unread: true,
    avatar: { initials: 'SA', tint: 'jade' },
    text: (
      <>
        <strong>{memberName('sofia')}</strong> mentioned you in the Forum thread:
        "What are we reading in July?"
      </>
    ),
    meta: 'Forum · Mention',
    time: '3 hr ago',
    actions: [{ label: 'View thread', variant: 'primary', href: routes.forum }],
  },
  {
    id: 5,
    type: 'platform',
    unread: true,
    icon: { Glyph: FiBookOpen, bg: 'rgba(45,27,61,.07)' },
    text: (
      <>
        <strong>QueerPulse Magazine Issue 18</strong> is now available. Cover
        story: The city changed. Did we?
      </>
    ),
    meta: 'Magazine · June 2026',
    time: 'Yesterday',
    actions: [{ label: 'Read now', variant: 'primary', href: routes.magazine }],
  },
  {
    id: 6,
    type: 'events',
    unread: true,
    icon: { Glyph: FiClock, bg: 'rgba(74,140,111,.1)' },
    text: (
      <>
        Reminder: <strong>Theory Thursdays</strong> reading group meets tomorrow
        at 7pm in Mouraria. 1 spot still open.
      </>
    ),
    meta: 'Reading group · Reminder',
    time: 'Yesterday',
    actions: [{ label: 'See details', variant: 'ghost', href: routes.readingGroups }],
  },
  {
    id: 7,
    type: 'community',
    unread: true,
    avatar: { initials: 'MC', tint: 'coral' },
    text: (
      <>
        <strong>Mariana Costa</strong> accepted your connection request.
      </>
    ),
    meta: 'Connection',
    time: '2 days ago',
  },
  {
    id: 8,
    type: 'platform',
    unread: false,
    icon: { Glyph: FiStar, bg: 'rgba(232,119,90,.09)' },
    text: (
      <>
        New platform feature: <strong>Barter Exchange</strong> now supports
        service bundles. You can offer multi-session packages.
      </>
    ),
    meta: 'Platform update',
    time: '3 days ago',
    actions: [{ label: 'See barter board', variant: 'ghost', href: routes.barter }],
  },
  {
    id: 9,
    type: 'events',
    unread: false,
    icon: { Glyph: FiTag, bg: 'rgba(232,119,90,.1)' },
    text: (
      <>
        The <strong>Queer Cinema Night — Levante</strong> you attended has a
        follow-up discussion scheduled for June 20th.
      </>
    ),
    meta: 'Event · Follow-up',
    time: '4 days ago',
    actions: [{ label: 'View event', variant: 'ghost', href: routes.event }],
  },
  {
    id: 10,
    type: 'messages',
    unread: false,
    avatar: { initials: 'RF', tint: 'jade' },
    text: (
      <>
        <strong>Rui Fernandes</strong> sent you a message regarding the Archive
        Night on Friday.
      </>
    ),
    meta: 'Private message',
    time: '5 days ago',
    actions: [{ label: 'Read message', variant: 'ghost', href: routes.messages }],
  },
  {
    id: 11,
    type: 'community',
    unread: false,
    icon: { Glyph: FiClipboard, bg: 'rgba(45,27,61,.07)' },
    text: 'Your post in the Forum ("Housing law update — what I found out") received 12 replies.',
    meta: 'Forum · Activity',
    time: '6 days ago',
    actions: [{ label: 'View replies', variant: 'ghost', href: routes.forum }],
  },
  {
    id: 12,
    type: 'platform',
    unread: false,
    icon: { Glyph: FiHome, bg: 'rgba(45,27,61,.07)' },
    text: (
      <>
        The <strong>Q2 2026 Community Health Report</strong> has been published.
        Moderation stats and finances are now live.
      </>
    ),
    meta: 'Governance · Quarterly report',
    time: '1 week ago',
    actions: [{ label: 'Read report', variant: 'ghost', href: routes.governance }],
  },
]
