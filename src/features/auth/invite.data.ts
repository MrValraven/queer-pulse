import type { IconType } from 'react-icons'
import { FaWhatsapp, FaXTwitter } from 'react-icons/fa6'
import { FiMessageSquare } from 'react-icons/fi'
import { currentUser } from '../members/data/members'

export const SENDER_NAME = `${currentUser.first} ${currentUser.last}`

export const INVITE_CODE = 'QP-7F3K-2026'
export const INVITE_DOMAIN = 'queerpulse.com'
/** Short, human-readable link for a code, shown in the URL field and preview card. */
export const inviteUrlFor = (code: string) => `${INVITE_DOMAIN}/invite/${code}`
/** The actual link copied / shared for a code. */
export const inviteFullUrlFor = (code: string) => `https://${inviteUrlFor(code)}`
/** Preview link shown before the invite is persisted (uses the sample code). */
export const INVITE_URL = inviteUrlFor(INVITE_CODE)
export const INVITE_FULL_URL = inviteFullUrlFor(INVITE_CODE)

/** Description shown in the preview card when the member hasn't written a note. */
export const DEFAULT_VOUCH =
  "A quiet, vouched-for queer community in Lisbon — no ads, no algorithm. I think you'd belong here."

/** Composed when sharing so the message always carries the link. */
export function buildShareMessage(senderFirst: string, fullUrl: string): string {
  return `${senderFirst} invited you to QueerPulse — a quiet, vouched-for queer community. Your personal invite: ${fullUrl}`
}

export interface ShareTarget {
  key: string
  label: string
  Icon: IconType
  /** Builds the share-intent URL from an already-composed message. */
  build: (message: string) => string
}

export const SHARE_TARGETS: ShareTarget[] = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    Icon: FaWhatsapp,
    build: (message) => `https://wa.me/?text=${encodeURIComponent(message)}`,
  },
  {
    key: 'x',
    label: 'X',
    Icon: FaXTwitter,
    build: (message) => `https://x.com/intent/tweet?text=${encodeURIComponent(message)}`,
  },
  {
    key: 'messages',
    label: 'Messages',
    Icon: FiMessageSquare,
    build: (message) => `sms:&body=${encodeURIComponent(message)}`,
  },
]
