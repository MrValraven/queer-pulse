import type { SavedItemDTO } from "./api/saved.api";
import type { SavedListDTO } from "./api/SavedLists.api";

/**
 * Demo fixtures for the saved-lists surfaces.
 *
 * THESE ARE HONEST ABOUT SHARING, which the collections fixtures they replace
 * were not: `collections.data.tsx` shipped a folder labelled "Shared with 4
 * people" for a capability the platform did not have. Live collections were
 * hardcoded owner-private, so no member could ever reach that state, and the
 * demo was advertising a promise the product could not keep.
 *
 * Sharing is now real, and it works one way: a list is private, or it has a
 * link, and anyone holding that link can open it without an account. There is
 * no "shared with 4 people", because the platform does not track who opened a
 * link and deliberately never will. So exactly one list below carries a link,
 * its label says what a link means, and every other list is private.
 *
 * The demo token is the same 64-hex shape the backend mints, so
 * `/lists/<token>` resolves against these fixtures in demo mode and a member
 * clicking through sees the real shared-list page rather than a dead end.
 */
export const DEMO_SHARE_TOKEN =
  "3f9c1d7a4b2e86051c93af7d2e408b6614d5a09c73e2b81f406da95c37e1b284";

const DEMO_DEFAULT_LIST_ID = "demo-list-saved";
const DEMO_LISBON_LIST_ID = "demo-list-lisbon";
const DEMO_THERAPY_LIST_ID = "demo-list-therapy";
const DEMO_READING_LIST_ID = "demo-list-reading";

export const DEMO_SAVED_LISTS: SavedListDTO[] = [
  {
    id: DEMO_DEFAULT_LIST_ID,
    name: "Saved",
    isDefault: true,
    itemCount: 31,
    isShared: false,
    shareToken: null,
    sharedAt: null,
    createdAt: "2026-02-04T09:12:00.000Z",
    updatedAt: "2026-08-24T18:40:00.000Z",
  },
  {
    id: DEMO_LISBON_LIST_ID,
    name: "Lisbon recs",
    isDefault: false,
    itemCount: 8,
    isShared: true,
    shareToken: DEMO_SHARE_TOKEN,
    sharedAt: "2026-08-19T14:05:00.000Z",
    createdAt: "2026-05-02T11:30:00.000Z",
    updatedAt: "2026-08-25T08:15:00.000Z",
  },
  {
    id: DEMO_THERAPY_LIST_ID,
    name: "Bring to therapy",
    isDefault: false,
    itemCount: 6,
    isShared: false,
    shareToken: null,
    sharedAt: null,
    createdAt: "2026-03-18T20:00:00.000Z",
    updatedAt: "2026-08-23T19:22:00.000Z",
  },
  {
    id: DEMO_READING_LIST_ID,
    name: "Reading list",
    isDefault: false,
    itemCount: 4,
    isShared: false,
    shareToken: null,
    sharedAt: null,
    createdAt: "2026-01-09T07:45:00.000Z",
    updatedAt: "2026-08-11T12:00:00.000Z",
  },
];

const LISBON_ITEMS: SavedItemDTO[] = [
  {
    id: "listing:clinica-arco-iris",
    kind: "listing",
    title: "Clínica Arco-Íris",
    meta: "Trans-affirming GP and hormone care · Anjos",
    savedAt: "2026-08-25T08:15:00.000Z",
  },
  {
    id: "listing:cafe-da-esquina",
    kind: "listing",
    title: "Café da Esquina",
    meta: "Pastelaria with a community room · Arroios",
    savedAt: "2026-08-21T10:02:00.000Z",
  },
  {
    id: "listing:livraria-margem",
    kind: "listing",
    title: "Livraria Margem",
    meta: "Queer bookshop, open until 22h · Príncipe Real",
    savedAt: "2026-08-14T17:41:00.000Z",
  },
  {
    id: "article:navigating-lisbon-trans-health",
    kind: "article",
    title: "Five things I learned navigating Lisbon's trans health system",
    meta: "By Rita Salgueiro",
    readTime: "9 min",
    savedAt: "2026-07-30T09:20:00.000Z",
  },
];

const THERAPY_ITEMS: SavedItemDTO[] = [
  {
    id: "article:talking-to-a-therapist-about-transition",
    kind: "article",
    title: "How to bring transition up with a therapist who is new to it",
    meta: "By Nuno Aguiar",
    readTime: "7 min",
    savedAt: "2026-08-23T19:22:00.000Z",
  },
  {
    id: "post:the-week-i-stopped-explaining",
    kind: "post",
    title: "The week I stopped explaining myself at work",
    meta: "Forum · Working life",
    savedAt: "2026-08-12T21:10:00.000Z",
  },
];

const READING_ITEMS: SavedItemDTO[] = [
  {
    id: "article:a-history-of-the-lisbon-scene",
    kind: "article",
    title: "A short history of the Lisbon scene, told by the people in it",
    meta: "Issue 8",
    readTime: "18 min",
    savedAt: "2026-08-11T12:00:00.000Z",
  },
  {
    id: "film:pele-de-verao",
    kind: "film",
    title: "Pele de Verão",
    meta: "Cinema · 94 min",
    savedAt: "2026-06-28T20:30:00.000Z",
  },
];

/** Items per demo list. The default list is the union, matching the live
 *  invariant that everything saved is also in the default list. */
export const DEMO_SAVED_LIST_ITEMS: Record<string, SavedItemDTO[]> = {
  [DEMO_DEFAULT_LIST_ID]: [...LISBON_ITEMS, ...THERAPY_ITEMS, ...READING_ITEMS],
  [DEMO_LISBON_LIST_ID]: LISBON_ITEMS,
  [DEMO_THERAPY_LIST_ID]: THERAPY_ITEMS,
  [DEMO_READING_LIST_ID]: READING_ITEMS,
};

/** What `/lists/<token>` shows in demo mode. Only the one demo list that
 *  actually carries a link resolves; every other token is "not available",
 *  which is what a revoked link does live. */
export function demoSharedSavedList(token: string) {
  if (token !== DEMO_SHARE_TOKEN) return null;
  return {
    name: "Lisbon recs",
    itemCount: LISBON_ITEMS.length,
    items: LISBON_ITEMS,
  };
}
