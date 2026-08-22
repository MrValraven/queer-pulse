import type { AvatarTint } from "../../shared/components/ui/Avatar";
import { MEMBERS, memberName } from "../members/data/members";
import type { BarterProposalStatus } from "./api/barter.api";
import type { Mode } from "./barter.data";

/**
 * One of your own swap listings as the proposal inbox lists it
 * (`GET /barter/mine`): enough to recognise the post, plus how many proposals
 * are still waiting on your answer.
 */
export interface MyBarterListingRow {
  id: string;
  mode: Mode;
  category: string;
  offer: string;
  want: string;
  /** Whole days since the swap was posted, floored at 1 (see `daysSince`). */
  days: number;
  pendingProposalCount: number;
}

/** The line that names one of your swaps in the picker: what you offered, or
 *  what you asked for when the post only makes a request. */
export function listingLabel(listing: MyBarterListingRow): string {
  return listing.offer || listing.want;
}

/**
 * One proposal on a listing you posted (`GET /barter/:id/proposals`).
 * Deliberately close to the backend DTO: who proposed, what they wrote, when it
 * landed, and where it stands. Nothing else exists on the API to show.
 */
export interface BarterProposalRow {
  id: string;
  listingId: string;
  name: string;
  initials: string;
  tint: AvatarTint;
  avatarUrl: string | null;
  /** Profile slug, when the proposer still has a profile to link to. */
  profileSlug: string | null;
  message: string;
  /** ISO timestamp the proposal was sent. */
  createdAt: string;
  decidedAt: string | null;
  status: BarterProposalStatus;
}

/**
 * Demo fixture: two of "your" swaps, one with proposals waiting and one already
 * settled, so the prototype exercises the whole inbox with no backend. Live mode
 * never reads these.
 */
export const DEMO_MY_BARTER_LISTINGS: MyBarterListingRow[] = [
  {
    id: "demo-swap-brand",
    mode: "both",
    category: "creative",
    offer: "Brand identity design",
    want: "Portuguese tax return help",
    days: 3,
    pendingProposalCount: 2,
  },
  {
    id: "demo-swap-portraits",
    mode: "offering",
    category: "creative",
    offer: "Portrait session: analog, medium format",
    want: "",
    days: 12,
    pendingProposalCount: 0,
  },
];

/**
 * Demo proposals, keyed by the listing they landed on. Covers the three states
 * the inbox renders: waiting on you, accepted, and declined.
 */
export const DEMO_BARTER_PROPOSALS: Record<string, BarterProposalRow[]> = {
  "demo-swap-brand": [
    {
      id: "demo-proposal-rui",
      listingId: "demo-swap-brand",
      name: memberName("rui"),
      initials: MEMBERS.rui!.initials,
      tint: MEMBERS.rui!.tint,
      avatarUrl: MEMBERS.rui!.photo ?? null,
      profileSlug: "rui",
      message:
        "I do the IRS for three freelancers every year and yours would be quick. In return I would love a proper identity for the little studio I am starting.",
      createdAt: "2026-08-20T08:45:00.000Z",
      decidedAt: null,
      status: "pending",
    },
    {
      id: "demo-proposal-mariana",
      listingId: "demo-swap-brand",
      name: memberName("mariana"),
      initials: MEMBERS.mariana!.initials,
      tint: MEMBERS.mariana!.tint,
      avatarUrl: MEMBERS.mariana!.photo ?? null,
      profileSlug: "mariana",
      message:
        "Not tax help, but I can offer two therapy sessions on a barter basis if that is any use to you. Happy to talk it through first.",
      createdAt: "2026-08-19T16:10:00.000Z",
      decidedAt: null,
      status: "pending",
    },
    {
      id: "demo-proposal-sofia",
      listingId: "demo-swap-brand",
      name: memberName("sofia"),
      initials: MEMBERS.sofia!.initials,
      tint: MEMBERS.sofia!.tint,
      avatarUrl: MEMBERS.sofia!.photo ?? null,
      profileSlug: "sofia",
      message:
        "I can edit a short film for you instead, if that is closer to what you need this month.",
      createdAt: "2026-08-14T12:00:00.000Z",
      decidedAt: "2026-08-15T09:30:00.000Z",
      status: "declined",
    },
  ],
  "demo-swap-portraits": [
    {
      id: "demo-proposal-tomas",
      listingId: "demo-swap-portraits",
      name: memberName("tomas"),
      initials: MEMBERS.tomas!.initials,
      tint: MEMBERS.tomas!.tint,
      avatarUrl: MEMBERS.tomas!.photo ?? null,
      profileSlug: "tomas",
      message:
        "I would cook you a dinner for two in exchange for a portrait. Seasonal, wine included, whenever suits you.",
      createdAt: "2026-08-09T19:25:00.000Z",
      decidedAt: "2026-08-10T07:40:00.000Z",
      status: "accepted",
    },
  ],
};
