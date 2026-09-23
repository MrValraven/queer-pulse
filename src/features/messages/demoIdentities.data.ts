import type {
  AuthorSummary,
  IdentityKind,
} from "../../shared/contracts/contracts";
import type { MailboxSummary } from "../../shared/api/mailboxViewer";

/** Demo identity ids. Readable on purpose: they appear in `?as=` URLs. */
export const DEMO_IDENTITY = {
  viewerProfile: "demo-identity-tiago",
  cafeLisboa: "demo-identity-cafe-lisboa",
  atelierPulso: "demo-identity-atelier-pulso",
  estudioNorte: "demo-identity-estudio-norte",
  livrariaAurora: "demo-identity-livraria-aurora",
} as const;

interface DemoIdentityEntry {
  kind: IdentityKind;
  displayName: string;
  handle: string;
}

/** Every demo identity that can appear as a sender, staffed or not. */
const DEMO_IDENTITY_DIRECTORY: Record<string, DemoIdentityEntry> = {
  [DEMO_IDENTITY.cafeLisboa]: {
    kind: "listing",
    displayName: "Café Lisboa",
    handle: "cafe-lisboa",
  },
  [DEMO_IDENTITY.atelierPulso]: {
    kind: "subprofile",
    displayName: "Atelier Pulso",
    handle: "atelier-pulso",
  },
  [DEMO_IDENTITY.estudioNorte]: {
    kind: "subprofile",
    displayName: "Estúdio Norte",
    handle: "estudio-norte",
  },
  [DEMO_IDENTITY.livrariaAurora]: {
    kind: "listing",
    displayName: "Livraria Aurora",
    handle: "livraria-aurora",
  },
};

/** The demo viewer's switcher, before Task 4 derives live unread counts from
 *  the seeded threads. Profile first, as the backend orders it. */
export const DEMO_MAILBOX_SUMMARIES: MailboxSummary[] = [
  {
    identityId: DEMO_IDENTITY.viewerProfile,
    kind: "profile",
    displayName: "Tiago Costa",
    handle: "tiago",
    avatarUrl: null,
    unreadCount: 0,
    isOwner: true,
    isReadOnly: false,
    shouldShowStaffNames: null,
    shouldAllowMyName: null,
  },
  {
    identityId: DEMO_IDENTITY.cafeLisboa,
    kind: "listing",
    displayName: "Café Lisboa",
    handle: "cafe-lisboa",
    avatarUrl: null,
    unreadCount: 0,
    isOwner: true,
    isReadOnly: false,
    shouldShowStaffNames: true,
    shouldAllowMyName: true,
  },
  {
    identityId: DEMO_IDENTITY.atelierPulso,
    kind: "subprofile",
    displayName: "Atelier Pulso",
    handle: "atelier-pulso",
    avatarUrl: null,
    unreadCount: 0,
    isOwner: true,
    isReadOnly: false,
    shouldShowStaffNames: false,
    shouldAllowMyName: true,
  },
  // A co-owned persona moderation removed: shows the read-only states.
  {
    identityId: DEMO_IDENTITY.estudioNorte,
    kind: "subprofile",
    displayName: "Estúdio Norte",
    handle: "estudio-norte",
    avatarUrl: null,
    unreadCount: 0,
    isOwner: false,
    isReadOnly: true,
    shouldShowStaffNames: true,
    shouldAllowMyName: true,
  },
];

export const DEMO_STAFFED_IDENTITY_IDS: ReadonlySet<string> = new Set([
  DEMO_IDENTITY.cafeLisboa,
  DEMO_IDENTITY.atelierPulso,
  DEMO_IDENTITY.estudioNorte,
]);

/** The sender a demo message sent AS an identity renders under, in the
 *  shape `buildAuthorSummary` gives it on the server. An unknown id reads as
 *  a deleted business, with the server's English fallback name. */
export function demoIdentityAuthor(
  identityId: string,
  staffFirstName?: string,
): AuthorSummary {
  const entry = DEMO_IDENTITY_DIRECTORY[identityId];
  if (!entry) {
    return {
      handle: "",
      displayName: "Former business",
      avatarUrl: null,
      isFormerIdentity: true,
    };
  }
  return {
    handle: entry.handle,
    displayName: entry.displayName,
    avatarUrl: null,
    identityId,
    identityKind: entry.kind,
    ...(staffFirstName ? { staffFirstName } : {}),
  };
}
