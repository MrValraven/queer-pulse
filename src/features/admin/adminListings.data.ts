import {
  countListingsByStatus,
  type AdminListingsPageVM,
  type ListingHistoryDTO,
  type ListingQueueRow,
  type ListingQueueSort,
} from "./api/adminListings.api";
import type { ListingDTO } from "../marketing/listBusiness/api/listings.api";
import type { ListingStatus } from "../marketing/listBusiness/listBusiness.data";
import type { MemberRefDTO } from "../../shared/api/refs";

/** Build a demo ListingDTO with sensible defaults, overridden per fixture. */
function demoListing(overrides: Partial<ListingDTO> & Pick<
  ListingDTO,
  "ref" | "slug" | "name" | "hood" | "status"
>): ListingDTO {
  return {
    path: "claim",
    badge: "owned",
    evidence: "",
    cats: ["food"],
    price: "€€",
    blurb: "",
    tagline: "",
    whatItIs: [],
    tags: [],
    goodFor: [],
    langs: ["pt", "en"],
    online: false,
    address: "",
    geocoded: false,
    latitude: null,
    longitude: null,
    hours: {},
    hoursNote: "",
    hoursExceptions: [],
    social: { instagram: "", website: "", email: "", phone: "" },
    photos: { wide: null, d1: null, d2: null, vibe: null },
    alt: { wide: "", d1: "", d2: "", vibe: "" },
    rel: "own",
    ownerName: "",
    ownerRole: "",
    ownerBio: "",
    visibility: "public",
    linkToProfile: true,
    contactEmail: "",
    operatingState: {
      state: "open",
      note: null,
      setAt: null,
      movedToAddress: null,
    },
    movedToListingId: null,
    detailsConfirmedAt: null,
    consentOuting: false,
    consentGuide: false,
    queerOwnedVerified: false,
    submittedBy: null,
    createdAt: overrides.createdAt ?? "2026-07-28T10:00:00.000Z",
    ...overrides,
  };
}

/** Demo-only moderation queue. Moderator/Admin endpoint 403s for anyone else,
 * so this fabricated data must never appear as platform truth in live mode. */
export const ADMIN_LISTINGS_QUEUE: ListingQueueRow[] = [
  {
    ref: "QPL-2026-0007",
    slug: "maison-du-tiago",
    name: "Maison Du Tiago",
    hood: "Príncipe Real",
    status: "review",
    submitterName: "Tiago Costa",
    submitterSlug: "tiago",
    createdAt: "2026-07-28T10:00:00.000Z",
    detail: demoListing({
      ref: "QPL-2026-0007",
      slug: "maison-du-tiago",
      name: "Maison Du Tiago",
      hood: "Príncipe Real",
      status: "review",
      createdAt: "2026-07-28T10:00:00.000Z",
      cats: ["food"],
      price: "€€€",
      blurb:
        "A candle-lit natural-wine room in Príncipe Real, cooking a short seasonal menu for people who want to linger.",
      tagline: "The little wine room that wants you to stay one more glass.",
      whatItIs: [
        { id: "wit-d1", text:
          "Maison Du Tiago is a small natural-wine bar and kitchen: a handful of tables, an opinionated list, and a menu that changes with the market." },
        { id: "wit-d2", text:
          "It's built for the slow evening: a second date, a birthday for six, or a Tuesday that quietly becomes something. Tell the room what you like and let them pour." },
      ],
      tags: ["Natural wine", "Small plates", "Step-free entrance"],
      goodFor: ["A great second date", "Natural wine guidance", "Celebrating something"],
      hoursNote: "Evenings, Tue–Sun. Closed Mondays.",
      social: { instagram: "@maisondutiago", website: "maisondutiago.pt", email: "ola@maisondutiago.pt", phone: "" },
      photos: {
        wide: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1600&auto=format&fit=crop",
        d1: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
        d2: null,
        vibe: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=1200&auto=format&fit=crop",
      },
      alt: { wide: "The wine room", d1: "The bar", d2: "Small plates", vibe: "Príncipe Real window" },
      address: "R. da Escola Politécnica 60 · Príncipe Real",
      ownerName: "Tiago Costa",
      ownerRole: "Owner · host",
      ownerBio: "Left a restaurant kitchen to open the room he wanted to drink in.",
      visibility: "public",
      linkToProfile: true,
    }),
  },
  {
    ref: "QPL-2026-0006",
    slug: "casa-viva",
    name: "Casa Viva",
    hood: "Arroios",
    status: "question",
    submitterName: "Inês Marques",
    submitterSlug: "ines",
    createdAt: "2026-07-27T14:30:00.000Z",
    detail: demoListing({
      ref: "QPL-2026-0006",
      slug: "casa-viva",
      name: "Casa Viva",
      hood: "Arroios",
      status: "question",
      createdAt: "2026-07-27T14:30:00.000Z",
      cats: ["culture"],
      price: "€",
      blurb:
        "A community culture house in Arroios: readings, workshops, and a free-entry programme that bets on queer artists early.",
      tagline: "A house that keeps the door, and the programme, open.",
      whatItIs: [
        { id: "wit-c1", text:
          "Casa Viva is an artist-run culture house: a reading room, a small hall for workshops and launches, and a programme that leans toward emerging queer and feminist work." },
        { id: "wit-c2", text:
          "Entry is free wherever it can be, and the space is often someone's first-ever public reading. It works hand in hand with the neighbourhood." },
      ],
      tags: ["Events space", "Free entry", "Step-free"],
      goodFor: ["Readings and launches", "A first public reading", "Meeting other makers"],
      hoursNote: "Open Wed–Sun afternoons. Event nights run later.",
      social: { instagram: "@casaviva.lisboa", website: "casaviva.pt", email: "ola@casaviva.pt", phone: "" },
      photos: {
        wide: "https://images.unsplash.com/photo-1521123845560-14093637aa7d?q=80&w=1600&auto=format&fit=crop",
        d1: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop",
        d2: null,
        vibe: "https://images.unsplash.com/photo-1526243741027-444d633d7365?q=80&w=1200&auto=format&fit=crop",
      },
      alt: { wide: "The hall", d1: "Reading room", d2: "Workshop night", vibe: "Arroios courtyard" },
      address: "R. de Arroios 120 · Arroios",
      ownerName: "Inês Marques",
      ownerRole: "Founder",
      ownerBio: "Runs Casa Viva as a quietly social place rather than a sealed venue.",
      visibility: "public",
      linkToProfile: true,
    }),
  },
  {
    ref: "QPL-2026-0005",
    slug: "cafe-aurora",
    name: "Café Aurora",
    hood: "Graça",
    status: "live",
    submitterName: "Rui Tavares",
    submitterSlug: "rui",
    createdAt: "2026-07-25T09:15:00.000Z",
    detail: demoListing({
      ref: "QPL-2026-0005",
      slug: "cafe-aurora",
      name: "Café Aurora",
      hood: "Graça",
      status: "live",
      createdAt: "2026-07-25T09:15:00.000Z",
      cats: ["food"],
      price: "€",
      blurb:
        "A sunlit corner café in Graça: good coffee, better pastéis, and a room that never makes anyone feel like a question mark.",
      tagline: "Your morning table in Graça, held for you.",
      whatItIs: [
        { id: "wit-a1", text:
          "Café Aurora is a small neighbourhood café that got adopted by the community for the simplest reason: it's reliably, unremarkably kind to everyone who walks in." },
        { id: "wit-a2", text:
          "A galão, a warm pastel de nata, and staff who remember your order. Sometimes the bar is exactly that." },
      ],
      tags: ["Café · pastelaria", "Daily", "Ground floor"],
      goodFor: ["A no-stress neighbourhood coffee", "Bringing visiting family", "Cheap, excellent pastéis"],
      hoursNote: "Open daily, early. Closes by evening.",
      social: { instagram: "@cafeaurora.graca", website: "", email: "", phone: "+351 21 887 4400" },
      photos: {
        wide: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=1600&auto=format&fit=crop",
        d1: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1200&auto=format&fit=crop",
        d2: null,
        vibe: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
      },
      alt: { wide: "The counter", d1: "Tiled interior", d2: "Pastéis tray", vibe: "Graça street tables" },
      address: "R. da Graça 42 · Graça",
      ownerName: "Rui Tavares",
      ownerRole: "Owner",
      ownerBio: "Third-generation café owner who put the neighbourhood first.",
      visibility: "public",
      linkToProfile: true,
    }),
  },
];

/**
 * A demo-session-only mutation overlay, keyed by `ref`. `ADMIN_LISTINGS_QUEUE`
 * itself is never mutated (a page reload must reset demo state), but a status
 * move/ask/remove needs to survive a fresh `filterDemoListingQueue()` call for
 * a status/q/sort combination the moderator hasn't visited yet this session —
 * without this overlay, switching to a not-yet-cached tab would re-derive
 * straight from the untouched fixture and the row would revert to its
 * pre-mutation status. `patchListingInCache` (see `api/useAdminListings.ts`)
 * separately patches whatever queries are ALREADY cached, for instant
 * same-tab feedback; this module-level `Map` is the durability layer that
 * covers every other (cached-later-or-never) query for the rest of the demo
 * session. Module-level, not `useState`/context, on purpose: it must survive
 * remounts of every hook/component reading the queue, and reset only on a
 * full page reload (real demo-state semantics), not on navigation.
 */
export type DemoListingMutation = { status?: ListingStatus; removed?: true };
const demoListingMutations = new Map<string, DemoListingMutation>();

/** Record a demo-mode moderation action against `ref` so every subsequent
 *  `filterDemoListingQueue()` call — including for a filter combo that has
 *  never been fetched — reflects it. Demo-only; live mode must never call
 *  this (it relies on server truth + `invalidateQueries` instead). */
export function recordDemoListingMutation(
  ref: string,
  patch: DemoListingMutation,
) {
  demoListingMutations.set(ref, {
    ...demoListingMutations.get(ref),
    ...patch,
  });
}

/** Read `ref`'s current overlay entry, if any — for a mutation's `onMutate`
 *  to snapshot before calling `recordDemoListingMutation`, so a (currently
 *  hypothetical, since no demo `mutationFn` rejects) `onError` can undo
 *  exactly what it overwrote via `restoreDemoListingMutation` below, keeping
 *  this registry symmetric with the react-query cache snapshot/restore right
 *  next to it in every call site. */
export function getDemoListingMutation(
  ref: string,
): DemoListingMutation | undefined {
  return demoListingMutations.get(ref);
}

/** The `onError` counterpart to `recordDemoListingMutation`: restore `ref`'s
 *  overlay entry to what `getDemoListingMutation` captured before the failed
 *  mutation's `onMutate` patch — or clear the entry entirely if there wasn't
 *  one yet. */
export function restoreDemoListingMutation(
  ref: string,
  previousMutation: DemoListingMutation | undefined,
) {
  if (previousMutation) {
    demoListingMutations.set(ref, previousMutation);
  } else {
    demoListingMutations.delete(ref);
  }
}

/** Reset the demo-session mutation overlay. Nothing in the app calls this
 *  today (a page reload already clears the in-memory `Map`); kept for
 *  completeness and for tests that want a clean slate between cases. */
export function clearDemoListingMutations() {
  demoListingMutations.clear();
}

/** Apply the demo-session overlay on top of the immutable fixture: drop rows
 *  marked `removed`, and re-status rows with a recorded `status` override.
 *  Must run BEFORE search/status filtering and counting, so every derived
 *  view (the visible list, the tab counts) agrees with prior mutations. */
function applyDemoListingMutations(
  rows: ListingQueueRow[],
): ListingQueueRow[] {
  const overlaidRows: ListingQueueRow[] = [];
  for (const row of rows) {
    const mutation = demoListingMutations.get(row.ref);
    if (!mutation) {
      overlaidRows.push(row);
      continue;
    }
    if (mutation.removed) continue;
    overlaidRows.push(
      mutation.status ? { ...row, status: mutation.status } : row,
    );
  }
  return overlaidRows;
}

const DEMO_LISTING_SORTS: Record<
  ListingQueueSort,
  (rowA: ListingQueueRow, rowB: ListingQueueRow) => number
> = {
  newest: (rowA, rowB) => rowB.createdAt.localeCompare(rowA.createdAt),
  oldest: (rowA, rowB) => rowA.createdAt.localeCompare(rowB.createdAt),
  name: (rowA, rowB) => rowA.name.localeCompare(rowB.name),
};

/** Case-insensitive substring match across name / submitter / ref, mirroring
 *  the backend's `q ILIKE` search across `l.name` / submitter first name /
 *  `l.ref` — so the demo queue's search stays honest once the search input
 *  lands (W1-2) rather than silently no-op'ing in demo mode. */
function matchesListingQuery(row: ListingQueueRow, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    row.name.toLowerCase().includes(needle) ||
    row.submitterName.toLowerCase().includes(needle) ||
    row.ref.toLowerCase().includes(needle)
  );
}

/**
 * Demo-mode equivalent of `GET /listings/admin/queue`: applies the
 * demo-session mutation overlay (`applyDemoListingMutations`) on top of the
 * immutable fixture first, then filters by `q` (name/submitter/ref), derives
 * `counts` from that `q`-filtered set (matching the backend's counts
 * semantics — scoped by search, NOT by status), then filters by `status` and
 * sorts. Always answers a single full page — demo mode never paginates, and
 * `ADMIN_LISTINGS_QUEUE` itself is never mutated.
 *
 * Applying the overlay before filtering/counting is what keeps a
 * never-before-fetched status tab honest: without it, a fresh call here would
 * read the untouched fixture and a just-moved/removed row would reappear at
 * its pre-mutation status the moment the moderator switches to a tab they
 * haven't visited yet this session.
 */
export function filterDemoListingQueue({
  status,
  q = "",
  sort = "newest",
}: {
  status?: ListingStatus;
  q?: string;
  sort?: ListingQueueSort;
}): AdminListingsPageVM {
  const overlaidRows = applyDemoListingMutations(ADMIN_LISTINGS_QUEUE);
  const searchedRows = overlaidRows.filter((row) =>
    matchesListingQuery(row, q),
  );
  const counts = countListingsByStatus(searchedRows);
  const statusFilteredRows = status
    ? searchedRows.filter((row) => row.status === status)
    : searchedRows;
  const sortedRows = [...statusFilteredRows].sort(DEMO_LISTING_SORTS[sort]);
  return {
    rows: sortedRows,
    total: sortedRows.length,
    page: 1,
    pageSize: sortedRows.length,
    counts,
  };
}

/** The demo moderator persona behind every fixture moderation event/question
 *  below — reuses `sofia` from `adminMembers.data.ts` rather than inventing a
 *  one-off name. */
const DEMO_MODERATOR: MemberRefDTO = {
  slug: "sofia",
  firstName: "Sofia",
  lastName: "Almeida",
  avatarUrl: null,
};

/**
 * Demo-only moderation history + Q&A thread, keyed by listing `ref` — the
 * fixture `useListingHistory` reads in demo mode. Deliberately populated for
 * only two of the three demo listings: `QPL-2026-0007` shows a full
 * round-trip (asked → answered → sent back with a reason), `QPL-2026-0006`
 * shows a question still awaiting the submitter's reply. `QPL-2026-0005`
 * (already live, nothing eventful behind it) has no entry, so
 * `useListingHistory` falls back to an empty history for it — exercising
 * `ListingHistoryPanel`'s empty state honestly instead of needing a fourth
 * throwaway listing.
 */
export const DEMO_LISTING_HISTORY: Record<string, ListingHistoryDTO> = {
  "QPL-2026-0007": {
    events: [
      {
        id: "evt-0007-2",
        action: "status_changed",
        fromStatus: "question",
        toStatus: "review",
        reason:
          "Thanks for confirming the street number. Back in the queue for a final look before we publish.",
        actor: DEMO_MODERATOR,
        createdAt: "2026-07-28T16:40:00.000Z",
      },
      {
        id: "evt-0007-1",
        action: "question_asked",
        fromStatus: "review",
        toStatus: "question",
        reason: null,
        actor: DEMO_MODERATOR,
        createdAt: "2026-07-28T14:00:00.000Z",
      },
    ],
    questions: [
      {
        id: "q-0007-1",
        body: "Hi! Before we publish this, could you confirm the street number: R. da Escola Politécnica 60, or 60A?",
        answer: "It's 60, no A. Thanks for double-checking!",
        answeredAt: "2026-07-28T16:35:00.000Z",
        askedBy: DEMO_MODERATOR,
        createdAt: "2026-07-28T14:00:00.000Z",
      },
    ],
  },
  "QPL-2026-0006": {
    events: [
      {
        id: "evt-0006-1",
        action: "question_asked",
        fromStatus: "review",
        toStatus: "question",
        reason: null,
        actor: DEMO_MODERATOR,
        createdAt: "2026-07-27T15:10:00.000Z",
      },
    ],
    questions: [
      {
        id: "q-0006-1",
        body: "Quick one: is entry genuinely free for every event, or just some of the programme?",
        answer: null,
        answeredAt: null,
        askedBy: DEMO_MODERATOR,
        createdAt: "2026-07-27T15:10:00.000Z",
      },
    ],
  },
};

const EMPTY_LISTING_HISTORY: ListingHistoryDTO = { events: [], questions: [] };

/** Demo-mode equivalent of `GET /listings/admin/:ref/history` — a listing
 *  with no fixture entry answers an honest empty history rather than a 404,
 *  since the demo queue's three fixtures aren't all meant to have a story. */
export function getDemoListingHistory(ref: string): ListingHistoryDTO {
  return DEMO_LISTING_HISTORY[ref] ?? EMPTY_LISTING_HISTORY;
}
