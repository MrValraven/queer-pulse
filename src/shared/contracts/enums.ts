// Core domain enums (docs/backend/03 §3.0). Imported by both apps so DB, API, and
// UI agree on the closed sets. Values are the lowercase strings sent over the wire.
//
// Implemented as `const` objects + type aliases (not `enum`) so the syntax is fully
// erasable — the web app's tsconfig sets `erasableSyntaxOnly`.

export const Visibility = {
  Public: "public",
  Members: "members",
  Connections: "connections",
  Private: "private",
  Hidden: "hidden",
} as const;
export type Visibility = (typeof Visibility)[keyof typeof Visibility];

export const UserStatus = {
  PendingReview: "pending_review",
  Active: "active",
  Suspended: "suspended",
  Banned: "banned",
  Locked: "locked",
  Deactivated: "deactivated",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const Role = {
  Member: "member",
  Host: "host",
  Artist: "artist",
  Moderator: "moderator",
  Council: "council",
  Admin: "admin",
  CrisisSupporter: "crisis_supporter",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const MembershipTier = {
  Free: "free",
  Sustaining: "sustaining",
  Solidarity: "solidarity",
  Patron: "patron",
} as const;
export type MembershipTier =
  (typeof MembershipTier)[keyof typeof MembershipTier];

export const ReportStatus = {
  Open: "open",
  Triaged: "triaged",
  Actioned: "actioned",
  Dismissed: "dismissed",
  Appealed: "appealed",
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const RsvpStatus = {
  PendingPayment: "pending_payment",
  Going: "going",
  Waitlist: "waitlist",
  Cancelled: "cancelled",
  Attended: "attended",
  NoShow: "no_show",
} as const;
export type RsvpStatus = (typeof RsvpStatus)[keyof typeof RsvpStatus];

export const SubmissionStatus = {
  Draft: "draft",
  Submitted: "submitted",
  InReview: "in_review",
  Accepted: "accepted",
  Rejected: "rejected",
  Published: "published",
} as const;
export type SubmissionStatus =
  (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

export const PaymentStatus = {
  Pending: "pending",
  Succeeded: "succeeded",
  Failed: "failed",
  Refunded: "refunded",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PayoutStatus = {
  Accruing: "accruing",
  Scheduled: "scheduled",
  Paid: "paid",
  Failed: "failed",
} as const;
export type PayoutStatus = (typeof PayoutStatus)[keyof typeof PayoutStatus];

export const ConnectionState = {
  Pending: "pending",
  Accepted: "accepted",
  Declined: "declined",
} as const;
export type ConnectionState =
  (typeof ConnectionState)[keyof typeof ConnectionState];

export const CommunityType = {
  Support: "support",
  Interest: "interest",
  Identity: "identity",
  Neighbourhood: "neighbourhood",
} as const;
export type CommunityType = (typeof CommunityType)[keyof typeof CommunityType];
