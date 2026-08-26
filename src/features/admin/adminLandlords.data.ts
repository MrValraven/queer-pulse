import type {
  AdminLandlordDTO,
  LandlordIntroRequestDTO,
} from "./api/adminLandlords.api";

/**
 * Demo-mode fixtures for the landlord directory console, so both panes render
 * fully with no backend behind them. Fabricated data: the hooks only serve this
 * while `demoMode` is on, and it must never surface as platform truth in live
 * mode. Mirrors {@link AdminLandlordDTO} and {@link LandlordIntroRequestDTO}.
 */
export const ADMIN_LANDLORDS_DEMO: AdminLandlordDTO[] = [
  {
    id: "ll_7001",
    slug: "casa-do-monte",
    name: "Casa do Monte",
    initials: "CM",
    tint: "jade",
    photo: null,
    hood: "Graça",
    note: "Two members have rented here and stayed on good terms.",
    tagline: "Family-run, three buildings around Graça",
    rating: { score: "4.6", count: 5 },
    status: "review",
    submittedBy: {
      slug: "ana-ferreira",
      firstName: "Ana",
      lastName: "Ferreira",
      pronouns: "ela/dela",
      avatarUrl: null,
    },
    decidedAt: null,
    decidedBy: null,
    decisionReason: null,
    createdAt: "2026-08-20T14:25:00.000Z",
  },
  {
    id: "ll_7002",
    slug: "quinta-verde",
    name: "Quinta Verde",
    initials: "QV",
    tint: "coral",
    photo: null,
    hood: "Alvalade",
    note: "Contracts in writing, deposits returned in full so far.",
    tagline: "Small landlord, one building",
    rating: { score: "4.2", count: 3 },
    status: "live",
    submittedBy: {
      slug: "pedro-nunes",
      firstName: "Pedro",
      lastName: "Nunes",
      pronouns: "ele/dele",
      avatarUrl: null,
    },
    decidedAt: "2026-08-12T09:15:00.000Z",
    decidedBy: "usr_moderator_demo",
    decisionReason: null,
    createdAt: "2026-08-10T18:02:00.000Z",
  },
];

export const ADMIN_LANDLORD_INTRO_REQUESTS_DEMO: LandlordIntroRequestDTO[] = [
  {
    id: "ir_5001",
    landlordSlug: "quinta-verde",
    landlordName: "Quinta Verde",
    name: "Mariana",
    note: "Looking for a one-bedroom from October. Two cats, both quiet.",
    contactEmail: "mariana@example.org",
    status: "pending",
    createdAt: "2026-08-22T10:40:00.000Z",
    requester: {
      slug: "mariana-dias",
      firstName: "Mariana",
      lastName: "Dias",
      pronouns: "ela/dela",
      avatarUrl: null,
    },
    decidedAt: null,
    decidedBy: null,
    decisionReason: null,
  },
  {
    id: "ir_5002",
    landlordSlug: "quinta-verde",
    landlordName: "Quinta Verde",
    name: "Kai",
    note: null,
    contactEmail: null,
    status: "accepted",
    createdAt: "2026-08-16T08:10:00.000Z",
    requester: {
      slug: "kai-santos",
      firstName: "Kai",
      lastName: "Santos",
      pronouns: "elu/delu",
      avatarUrl: null,
    },
    decidedAt: "2026-08-17T11:00:00.000Z",
    decidedBy: "usr_moderator_demo",
    decisionReason: "Passed your note on. They will write this week.",
  },
];

/**
 * Where a published directory entry lives for a member. Not in `routeMap` yet:
 * the public route is declared as the literal `/work/landlord/:slug` in
 * `features/economy/routes.tsx` and linked the same way from `HousingSections`,
 * so this console follows the existing precedent rather than inventing a
 * competing source of truth.
 */
export const LANDLORD_DETAIL_PATH = "/work/landlord";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days an entry or a request has been waiting on somebody. */
export function daysWaiting(createdAt: string): number {
  const submitted = Date.parse(createdAt);
  if (Number.isNaN(submitted)) return 0;
  return Math.max(0, Math.floor((Date.now() - submitted) / DAY_MS));
}

/** Past this many days undecided, the age reads as a warning rather than a
 *  fact. One working week is the promise this console is keeping. */
export const LANDLORD_STALE_DAYS = 7;
