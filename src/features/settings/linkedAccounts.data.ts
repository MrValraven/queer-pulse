// NOTE (i18n sweep — scope rule): `name` (provider/app brand) and `detail`
// (mock account values standing in for fetched fields: linked email,
// last-used, sync timestamps — this page has no live adapter yet) stay
// English per this catalog's file-header policy. `badgeKey` is a small fixed
// enum of UI states (never fetched/stored), so it routes through i18n.
export interface SignInMethod {
  id: string;
  name: string;
  detail: string;
  linked: boolean;
  alwaysOn?: boolean;
  defaultDisabled?: boolean;
  badgeKey: string;
  /** Only set for the "{count} device(s)" badge — plural, not baked text. */
  badgeCount?: number;
  canUnlink?: boolean;
  canLink?: boolean;
  canManage?: boolean;
}

export const SIGN_IN_METHODS: SignInMethod[] = [
  {
    id: "google",
    name: "Google",
    detail: "Linked as tomas@example.com · last used 12 days ago",
    linked: true,
    badgeKey: "settings:linkedAccounts.badge.linked",
    canUnlink: true,
  },
  {
    id: "apple",
    name: "Apple",
    detail: "Not linked · sign in once and we'll link automatically",
    linked: false,
    badgeKey: "settings:linkedAccounts.badge.notLinked",
    canLink: true,
  },
  {
    id: "magic",
    name: "Magic link · email",
    detail: "Sign in by clicking a link sent to tomas@example.com",
    linked: true,
    alwaysOn: true,
    defaultDisabled: true,
    badgeKey: "settings:linkedAccounts.badge.alwaysOn",
  },
  {
    id: "passkey",
    name: "Passkey · device biometric",
    detail: "Use FaceID / TouchID instead of a password · stored on this Mac",
    linked: true,
    badgeKey: "settings:linkedAccounts.badge.devices",
    badgeCount: 2,
    canManage: true,
  },
];

export interface ConnectedApp {
  id: string;
  name: string;
  detail: string;
  badgeKey: string;
  canRevoke?: boolean;
  canCopy?: boolean;
}

export const CONNECTED_APPS: ConnectedApp[] = [
  {
    id: "discord",
    name: "Discord",
    detail:
      "Linked for community chat sync · can read your member roles · can't post on your behalf",
    badgeKey: "settings:linkedAccounts.badge.linked",
    canRevoke: true,
  },
  {
    id: "bluesky",
    name: "Bluesky",
    detail:
      "Cross-post your public articles · posts only · no follower list access",
    badgeKey: "settings:linkedAccounts.badge.linked",
    canRevoke: true,
  },
  {
    id: "arena",
    name: "Are.na",
    detail: "Save QP articles to your channels · last sync 3 days ago",
    badgeKey: "settings:linkedAccounts.badge.linked",
    canRevoke: true,
  },
  {
    id: "calendar",
    name: "Calendar (Google / Apple / Outlook)",
    detail:
      "Add RSVP'd gatherings to your calendar · subscription URL, no further access",
    badgeKey: "settings:linkedAccounts.badge.subscribed",
    canCopy: true,
  },
];
