import type { AvatarTint } from "../../shared/components/ui/Avatar";
import { MEMBERS, memberName } from "../members/data/members";
import type {
  BarterListingStatus,
  BarterProposalStatus,
} from "./api/barter.api";
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
  /** Open or closed. A closed swap stays readable and keeps its proposals; it
   *  simply takes no new ones. */
  status: BarterListingStatus;
}

/**
 * One proposal the reader SENT (`GET /barter/mine/proposals`), as their own
 * half of the board lists it: what they offered, where it stands, and which
 * swap it was against.
 */
export interface MySentBarterProposalRow {
  id: string;
  listingId: string;
  /** The swap this was an offer against. `null` when the post is gone, or when
   *  the reader and its poster have since blocked each other. */
  listing: {
    id: string;
    mode: Mode;
    category: string;
    offer: string;
    want: string;
    status: BarterListingStatus;
    /** The poster, empty when their profile could not be resolved. */
    name: string;
  } | null;
  /** What the reader wrote when they proposed. */
  message: string;
  createdAt: string;
  decidedAt: string | null;
  status: BarterProposalStatus;
  /** True when the poster changed the swap after this offer was sent. */
  wasListingEditedAfterProposal: boolean;
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
    status: "open",
  },
  {
    id: "demo-swap-portraits",
    mode: "offering",
    category: "creative",
    offer: "Portrait session: analog, medium format",
    want: "",
    days: 12,
    pendingProposalCount: 0,
    status: "closed",
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

/**
 * Demo fixture: proposals "you" sent on other members' swaps. Covers all three
 * outcomes plus the two edge shapes the page has to render honestly: a swap
 * the poster materially changed after the offer went out, and a swap that is
 * gone entirely. Live mode never reads these.
 */
export const DEMO_MY_SENT_BARTER_PROPOSALS: MySentBarterProposalRow[] = [
  {
    id: "demo-sent-ceramics",
    listingId: "demo-swap-ceramics",
    listing: {
      id: "demo-swap-ceramics",
      mode: "both",
      category: "creative",
      offer: "Wheel-throwing lessons, four evenings",
      want: "Help rebuilding a shop website",
      status: "open",
      name: memberName("mariana"),
    },
    message:
      "I build small shop sites for a living and yours would take me a weekend. Four evenings at the wheel would be a fair trade for me.",
    createdAt: "2026-08-28T18:20:00.000Z",
    decidedAt: null,
    status: "pending",
    wasListingEditedAfterProposal: true,
  },
  {
    id: "demo-sent-legal",
    listingId: "demo-swap-legal",
    listing: {
      id: "demo-swap-legal",
      mode: "offering",
      category: "legal",
      offer: "An hour on a rental contract, in plain Portuguese",
      want: "",
      status: "open",
      name: memberName("rui"),
    },
    message:
      "My landlord sent a renewal I do not understand. I can trade a full day of photography, or a set of portraits if that is more useful.",
    createdAt: "2026-08-22T09:05:00.000Z",
    decidedAt: "2026-08-23T11:40:00.000Z",
    status: "accepted",
    wasListingEditedAfterProposal: false,
  },
  {
    id: "demo-sent-bikes",
    listingId: "demo-swap-bikes",
    listing: {
      id: "demo-swap-bikes",
      mode: "both",
      category: "body",
      offer: "Bike servicing, gears and brakes",
      want: "Someone to walk a nervous dog",
      status: "closed",
      name: memberName("tomas"),
    },
    message:
      "I walk my neighbour's dog most mornings and would happily add yours. My bike is also very much in need of you.",
    createdAt: "2026-08-11T07:15:00.000Z",
    decidedAt: "2026-08-12T20:00:00.000Z",
    status: "declined",
    wasListingEditedAfterProposal: false,
  },
  {
    id: "demo-sent-gone",
    listingId: "demo-swap-gone",
    listing: null,
    message:
      "I can trade an evening of translation for the studio time, if that still works for you.",
    createdAt: "2026-07-30T13:00:00.000Z",
    decidedAt: null,
    status: "pending",
    wasListingEditedAfterProposal: false,
  },
];
