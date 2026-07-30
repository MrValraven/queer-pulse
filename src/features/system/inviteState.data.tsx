import type { ReactNode } from "react";
import { routes } from "../../app/routeMap";
import type { InviteView } from "../auth/api/useInvite";

/** Why an invite link can't be used — drives copy, rows, and CTAs. */
export type InviteFailureReason = "expired" | "used" | "revoked" | "notFound";

/** A single action button on the invite-state card. */
export interface InviteStateCta {
  /** Catalog key under `system:inviteState.actions.*`. */
  labelKey: string;
  /** Destination route. */
  to: string;
  /** When true, the label is interpolated with the inviter's first name. */
  withInviterName?: boolean;
}

/** Everything the card needs to render one reason. */
export interface InviteStateConfig {
  eyebrowKey: string;
  headingKey: string;
  leadKey: string;
  /** Show the "Expired {date}" row (only meaningful when time ran out). */
  showExpiry: boolean;
  /** Show the "Vouched by {inviter}" row + allow the resend CTA. */
  showInviter: boolean;
  primary: InviteStateCta;
  secondary: InviteStateCta;
  /** The inline stamp SVG inside the circle. */
  stamp: ReactNode;
}

const ClockStamp = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 14" />
    <path d="m18 6-2 2" />
  </svg>
);

const CheckStamp = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <polyline points="8.5 12 11 14.5 15.5 9.5" />
  </svg>
);

const RevokedStamp = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
    <line x1="15.5" y1="8.5" x2="8.5" y2="15.5" />
  </svg>
);

const QuestionStamp = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3" />
    <line x1="12" y1="17" x2="12" y2="17.01" />
  </svg>
);

export const INVITE_STATE_CONFIG: Record<InviteFailureReason, InviteStateConfig> = {
  expired: {
    eyebrowKey: "system:inviteState.expired.eyebrow",
    headingKey: "system:inviteState.expired.heading",
    leadKey: "system:inviteState.expired.lead",
    showExpiry: true,
    showInviter: true,
    primary: { labelKey: "system:inviteState.actions.resend", to: routes.contact, withInviterName: true },
    secondary: { labelKey: "system:inviteState.actions.requestNew", to: routes.requestInvite },
    stamp: ClockStamp,
  },
  used: {
    eyebrowKey: "system:inviteState.used.eyebrow",
    headingKey: "system:inviteState.used.heading",
    leadKey: "system:inviteState.used.lead",
    showExpiry: false,
    showInviter: true,
    primary: { labelKey: "system:inviteState.actions.signIn", to: routes.signIn },
    secondary: { labelKey: "system:inviteState.actions.contact", to: routes.contact },
    stamp: CheckStamp,
  },
  revoked: {
    eyebrowKey: "system:inviteState.revoked.eyebrow",
    headingKey: "system:inviteState.revoked.heading",
    leadKey: "system:inviteState.revoked.lead",
    showExpiry: false,
    showInviter: true,
    primary: { labelKey: "system:inviteState.actions.requestNew", to: routes.requestInvite },
    secondary: { labelKey: "system:inviteState.actions.contact", to: routes.contact },
    stamp: RevokedStamp,
  },
  notFound: {
    eyebrowKey: "system:inviteState.notFound.eyebrow",
    headingKey: "system:inviteState.notFound.heading",
    leadKey: "system:inviteState.notFound.lead",
    showExpiry: false,
    showInviter: false,
    primary: { labelKey: "system:inviteState.actions.requestNew", to: routes.requestInvite },
    secondary: { labelKey: "system:inviteState.actions.contact", to: routes.contact },
    stamp: QuestionStamp,
  },
};

/**
 * Map a resolved invite to the reason its landing screen should show. A missing
 * invite (bad code / 404 / network error) is `notFound`; otherwise the backend
 * status decides. `valid` never reaches this page, so it falls through to
 * `notFound` defensively.
 */
export function reasonFromInvite(invite: InviteView | undefined): InviteFailureReason {
  if (!invite) return "notFound";
  switch (invite.status) {
    case "expired":
      return "expired";
    case "used":
      return "used";
    case "revoked":
      return "revoked";
    default:
      return "notFound";
  }
}

/**
 * Propless fallback for the `/system/invite-expired` simulations preview: a
 * representative expired invite so the design panel keeps showing a full card.
 */
export const DEMO_EXPIRED_INVITE: InviteView = {
  code: "PREVIEW",
  status: "expired",
  inviter: {
    slug: "catarina-vaz",
    name: "Catarina Vaz",
    firstName: "Catarina",
    initials: "CV",
    since: "2024",
  },
  expiryLabel: "6 June 2026",
  validForDays: 14,
  memberCount: 247,
};
