// src/features/messages/officialAvatar.ts

/** The QueerPulse Team's avatar wherever it speaks in messaging: the member's
 *  official thread (inbox row, header, message runs, search and starred
 *  hits) and the staff side's QueerPulse Team mailbox. The app's own icon,
 *  served from `public/icons`, so it never depends on an upload. The "QP"
 *  initials stay beside it as the fallback while it loads or if it fails. */
export const OFFICIAL_AVATAR_URL = `${import.meta.env.BASE_URL}icons/apple-touch-icon-180-v3.png`;
