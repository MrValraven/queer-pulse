import type { RsvpInviteView } from "./memberInvites.adapters";

/**
 * Demo-mode invites the viewer sent from their RSVP: one connection who is
 * already going (too late to withdraw) and one request still waiting for the
 * host on an invite-only event.
 */
export const DEMO_RSVP_INVITES: RsvpInviteView[] = [
  {
    id: "demo-rsvp-invite-1",
    slug: "marisol-reyes",
    name: "Marisol Reyes",
    status: "going",
    canWithdraw: false,
  },
  {
    id: "demo-rsvp-invite-2",
    slug: "theo-almeida",
    name: "Theo Almeida",
    status: "awaiting_host",
    canWithdraw: true,
  },
];
