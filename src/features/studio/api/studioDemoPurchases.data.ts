import { studioShowcase } from "../../../shared/i18n/catalogs/en/studioShowcase";
import {
  DEMO_PENDING_CLAIMS,
  coroSales,
  marianaSales,
} from "./studioDemoPurchases.sales.data";
import type { StudioPriceInput } from "./studio.types";
import {
  DEMO_ARTIST_LATE_BLOOMERS,
  DEMO_ARTIST_MARIANA,
  DEMO_DEFAULT_RELEASE_ID,
  DEMO_DEFAULT_TRACK_ID,
} from "./studioDemoMe.data";
import type {
  StudioPaymentMethodKind,
  StudioPurchaseDeclineReason,
  StudioPurchaseDownloadTrackDTO,
  StudioPurchaseStatusValue,
} from "./studioPurchases.types";

// The fictional shop behind the demo's purchase surfaces. Proper nouns stay
// here; the sentences (decline note, method notes, a method label) are the
// stored values the server would hold, read from the studioShowcase EN keys.

const DAY_MILLISECONDS = 86_400_000;
const showcase = (key: string): string => studioShowcase[key] ?? key;

export const RITA_ID = "demo-persona-rita-ferreira";
export const CORO_ID = "demo-persona-coro-de-outubro";
const LUA_ID = "demo-persona-lua-cardoso";

/** Release and track prices, keyed by id. */
export const DEMO_RELEASE_PRICES: Record<string, StudioPriceInput> = {
  [DEMO_DEFAULT_RELEASE_ID]: { mode: "fixed", amountCents: 800 },
  "demo-release-home-1": { mode: "fixed", amountCents: 300 },
  "demo-release-home-3": { mode: "name_your_price", amountCents: 200 },
  "demo-release-lua-ultimo-eletrico": {
    mode: "name_your_price",
    amountCents: 500,
  },
};
export const DEMO_TRACK_PRICES: Record<string, StudioPriceInput> = {
  [DEMO_DEFAULT_TRACK_ID]: { mode: "fixed", amountCents: 150 },
  "demo-track-lua-01": { mode: "fixed", amountCents: 100 },
};

/** Tracks stored as AAC; every other track with audio is an MP3. */
export const DEMO_TRACK_AUDIO_TYPES: Record<string, string> = {
  "demo-track-lua-02": "audio/mp4",
};

export interface DemoMethodSeed {
  kind: StudioPaymentMethodKind;
  label: string | null;
  value: string;
  note: string | null;
}
const IBAN_METHOD: DemoMethodSeed = {
  kind: "iban",
  label: null,
  value: "PT50000201231234567890154",
  note: showcase("purchases.methodNote.iban"),
};
/** Per persona id; Late Bloomers has none. */
export const DEMO_PAYMENT_METHODS: Record<string, DemoMethodSeed[]> = {
  [DEMO_ARTIST_MARIANA.id]: [
    {
      kind: "link",
      label: showcase("purchases.methodLabel.bandcamp"),
      value: "https://marianasol-demo.bandcamp.com",
      note: null,
    },
    {
      kind: "mbway",
      label: null,
      value: "912345678",
      note: showcase("purchases.methodNote.mbway"),
    },
    IBAN_METHOD,
  ],
  [RITA_ID]: [
    {
      kind: "link",
      label: null,
      value: "https://ko-fi.com/ritaferreira-demo",
      note: null,
    },
    { kind: "mbway", label: null, value: "913456789", note: null },
  ],
  [CORO_ID]: [IBAN_METHOD],
  [LUA_ID]: [
    {
      kind: "link",
      label: null,
      value: "https://ko-fi.com/luacardoso-demo",
      note: null,
    },
    { kind: "mbway", label: null, value: "914567890", note: null },
  ],
  [DEMO_ARTIST_LATE_BLOOMERS.id]: [],
};

/** One purchase as the demo store keeps it. */
export interface DemoPurchaseRow {
  id: string;
  status: StudioPurchaseStatusValue;
  kind: "release" | "track";
  /** Catalogue id; null once the item is gone. */
  itemId: string | null;
  /** Null once the artist persona is gone. */
  artistId: string | null;
  /** The snapshot a purchase keeps after its artist and item are gone. */
  gone: {
    title: string;
    artistName: string;
    downloads: StudioPurchaseDownloadTrackDTO[];
  } | null;
  amountCents: number;
  referenceCode: string;
  payerName: string | null;
  /** The demo viewer, a named member, or a deleted account (null). */
  buyer: "viewer" | { name: string } | null;
  declineReason: StudioPurchaseDeclineReason | null;
  declineNote: string | null;
  createdAt: string;
  decidedAt: string | null;
  isOnWall: boolean;
  shownAsSubprofileId: string | null;
}

export type DemoPurchaseSeed = Pick<
  DemoPurchaseRow,
  | "id"
  | "kind"
  | "itemId"
  | "artistId"
  | "amountCents"
  | "referenceCode"
  | "buyer"
> &
  Partial<Omit<DemoPurchaseRow, "createdAt" | "decidedAt">> & {
    createdDaysAgo: number;
    decidedDaysAgo?: number;
  };

function rowOf(seed: DemoPurchaseSeed, nowMilliseconds: number) {
  const { createdDaysAgo, decidedDaysAgo, ...fields } = seed;
  const isoOf = (days: number) =>
    new Date(nowMilliseconds - days * DAY_MILLISECONDS).toISOString();
  const row: DemoPurchaseRow = {
    status: "pending",
    gone: null,
    payerName: null,
    declineReason: null,
    declineNote: null,
    isOnWall: false,
    shownAsSubprofileId: null,
    ...fields,
    createdAt: isoOf(createdDaysAgo),
    decidedAt: decidedDaysAgo === undefined ? null : isoOf(decidedDaysAgo),
  };
  return row;
}

/** The demo viewer as buyer. The wall shows them as Late Bloomers, so
 *  screenshots carry no real name. */
const DEMO_VIEWER_PURCHASES: DemoPurchaseSeed[] = [
  {
    id: "demo-purchase-coro",
    kind: "release",
    itemId: "demo-release-home-3",
    artistId: CORO_ID,
    amountCents: 400,
    referenceCode: "CQ4H8W",
    buyer: "viewer",
    status: "confirmed",
    createdDaysAgo: 13,
    decidedDaysAgo: 12,
    isOnWall: true,
    shownAsSubprofileId: DEMO_ARTIST_LATE_BLOOMERS.id,
  },
  {
    id: "demo-purchase-lua-ep",
    kind: "release",
    itemId: "demo-release-lua-ultimo-eletrico",
    artistId: LUA_ID,
    amountCents: 500,
    referenceCode: "QP7K3F",
    buyer: "viewer",
    createdDaysAgo: 2,
  },
  {
    id: "demo-purchase-rita",
    kind: "release",
    itemId: "demo-release-home-1",
    artistId: RITA_ID,
    amountCents: 200,
    referenceCode: "RT6D2N",
    buyer: "viewer",
    status: "declined",
    declineReason: "amount_different",
    declineNote: showcase("purchases.declineNote.rita"),
    createdDaysAgo: 21,
    decidedDaysAgo: 20,
  },
  {
    id: "demo-purchase-lua-track",
    kind: "track",
    itemId: "demo-track-lua-02",
    artistId: LUA_ID,
    amountCents: 100,
    referenceCode: "XB5J9M",
    buyer: "viewer",
    status: "expired",
    createdDaysAgo: 70,
    decidedDaysAgo: 40,
  },
  {
    id: "demo-purchase-mare-funda",
    kind: "release",
    itemId: null,
    artistId: null,
    amountCents: 600,
    referenceCode: "KM3Y7V",
    buyer: "viewer",
    status: "confirmed",
    createdDaysAgo: 71,
    decidedDaysAgo: 70,
    gone: {
      title: "Cassete perdida",
      artistName: "Maré Funda",
      downloads: [
        {
          trackId: "demo-kept-1",
          position: 1,
          title: "Lado A",
          durationSeconds: 200,
          format: "mp3",
          unavailableReason: null,
        },
        {
          trackId: "demo-kept-2",
          position: 2,
          title: "Lado B",
          durationSeconds: 215,
          format: "m4a",
          unavailableReason: "studio_download_track_preparing",
        },
      ],
    },
  },
];

/** The server pages 30; the demo pages 8 so Show more can be reviewed. */
export const DEMO_SALES_PAGE_SIZE = 8;

export function demoPurchaseRows(nowMilliseconds: number): DemoPurchaseRow[] {
  return [
    ...DEMO_VIEWER_PURCHASES,
    ...DEMO_PENDING_CLAIMS,
    ...marianaSales(),
    ...coroSales(),
  ].map((seed) => rowOf(seed, nowMilliseconds));
}
