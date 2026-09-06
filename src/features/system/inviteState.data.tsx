import type { ReactNode } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiHelpCircle,
  FiUserX,
  FiXCircle,
} from "react-icons/fi";
import { routes } from "../../app/routeMap";
import type { InviteView } from "../auth/api/useInvite";

/** Why an invite link can't be used — drives copy, rows, and CTAs. */
export type InviteFailureReason =
  "expired" | "used" | "revoked" | "notFound" | "inviterInactive";

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

// react-icons (Feather), the pack the rest of the app uses. These were
// hand-authored inline <svg> traced from the same set; the CSS that sizes and
// strokes them targets a descendant `svg`, which is what react-icons renders,
// so the styling carries over unchanged.
const ClockStamp = <FiClock aria-hidden />;

const CheckStamp = <FiCheckCircle aria-hidden />;

const RevokedStamp = <FiXCircle aria-hidden />;

const QuestionStamp = <FiHelpCircle aria-hidden />;

const InactiveStamp = <FiUserX aria-hidden />;

export const INVITE_STATE_CONFIG: Record<
  InviteFailureReason,
  InviteStateConfig
> = {
  expired: {
    eyebrowKey: "system:inviteState.expired.eyebrow",
    headingKey: "system:inviteState.expired.heading",
    leadKey: "system:inviteState.expired.lead",
    showExpiry: true,
    showInviter: true,
    // The recipient can't trigger a resend — that lives on the sender's own
    // invite list now — so the honest primary is to request a fresh invite.
    primary: {
      labelKey: "system:inviteState.actions.requestNew",
      to: routes.requestInvite,
    },
    secondary: {
      labelKey: "system:inviteState.actions.contact",
      to: routes.contact,
    },
    stamp: ClockStamp,
  },
  used: {
    eyebrowKey: "system:inviteState.used.eyebrow",
    headingKey: "system:inviteState.used.heading",
    leadKey: "system:inviteState.used.lead",
    showExpiry: false,
    showInviter: true,
    primary: {
      labelKey: "system:inviteState.actions.signIn",
      to: routes.signIn,
    },
    secondary: {
      labelKey: "system:inviteState.actions.contact",
      to: routes.contact,
    },
    stamp: CheckStamp,
  },
  revoked: {
    eyebrowKey: "system:inviteState.revoked.eyebrow",
    headingKey: "system:inviteState.revoked.heading",
    leadKey: "system:inviteState.revoked.lead",
    showExpiry: false,
    showInviter: true,
    primary: {
      labelKey: "system:inviteState.actions.requestNew",
      to: routes.requestInvite,
    },
    secondary: {
      labelKey: "system:inviteState.actions.contact",
      to: routes.contact,
    },
    stamp: RevokedStamp,
  },
  notFound: {
    eyebrowKey: "system:inviteState.notFound.eyebrow",
    headingKey: "system:inviteState.notFound.heading",
    leadKey: "system:inviteState.notFound.lead",
    showExpiry: false,
    showInviter: false,
    primary: {
      labelKey: "system:inviteState.actions.requestNew",
      to: routes.requestInvite,
    },
    secondary: {
      labelKey: "system:inviteState.actions.contact",
      to: routes.contact,
    },
    stamp: QuestionStamp,
  },
  inviterInactive: {
    eyebrowKey: "system:inviteState.inviterInactive.eyebrow",
    headingKey: "system:inviteState.inviterInactive.heading",
    leadKey: "system:inviteState.inviterInactive.lead",
    showExpiry: false,
    // The inviter is gone, so a "Vouched by {name}" row would only confuse.
    showInviter: false,
    primary: {
      labelKey: "system:inviteState.actions.requestNew",
      to: routes.requestInvite,
    },
    secondary: {
      labelKey: "system:inviteState.actions.contact",
      to: routes.contact,
    },
    stamp: InactiveStamp,
  },
};

/**
 * Map a resolved invite to the reason its landing screen should show. A missing
 * invite (bad code / 404 / network error) is `notFound`; an inviter who's no
 * longer active takes precedence over everything (even a `valid` status, since a
 * new member must not join off a ghost); otherwise the backend status decides.
 * `valid` never otherwise reaches this page, so it falls through to `notFound`
 * defensively.
 */
export function reasonFromInvite(
  invite: InviteView | undefined,
): InviteFailureReason {
  if (!invite) return "notFound";
  if (invite.inviterActive === false) return "inviterInactive";
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
  inviterActive: true,
  expiryLabel: "6 June 2026",
  validForDays: 14,
  memberCount: 247,
};
