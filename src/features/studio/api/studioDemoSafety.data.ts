import { currentUserSlug } from "../../members/data/demoCurrentUser";
import type { ReasonCode } from "../../safety/reportReasons";
import type {
  StudioClaimantRefDTO,
  StudioClaimantRole,
  StudioClaimStatus,
  StudioContentWarningId,
} from "./studioSafety.types";

// The demo's Studio safety data (spec 8): one warned track on the demo
// album, one withheld track on the demo owner's Devoção with an accepted and
// a countered claim, the demo member's own submitted claim, one locked
// explicit mark and one open track report. Ids follow studioDemo.data.ts:
// demo-track-<release slug>-<two-digit position>.

/** Cidade dos santos, track 3: the artist's own warning. */
export const DEMO_WARNED_TRACK_ID = "demo-track-cidade-dos-santos-03";
/** Devoção, track 2 ("Vela acesa"): held offline by two claims. */
export const DEMO_WITHHELD_TRACK_ID = "demo-track-mariana-3-02";
/** A Beja, track 2: explicit, and our team locked the mark. */
export const DEMO_LOCKED_EXPLICIT_TRACK_ID = "demo-track-mariana-2-02";
/** The kitchen in April (another artist): the demo member's own claim. */
export const DEMO_CLAIMED_TRACK_ID = "demo-track-home-1-01";
/** Another artist's single with an open "explicit but not marked" report. */
export const DEMO_REPORTED_TRACK_ID = "demo-track-home-3-01";

export const DEMO_SELF_CLAIMANT: StudioClaimantRefDTO = {
  id: "demo-member-self",
  slug: currentUserSlug,
  displayName: "Tiago",
  avatarUrl: null,
};
const INES: StudioClaimantRefDTO = {
  id: "demo-member-ines",
  slug: "ines-r",
  displayName: "Inês R.",
  avatarUrl: null,
};
const TEO: StudioClaimantRefDTO = {
  id: "demo-member-teo",
  slug: "teo-m",
  displayName: "Téo M.",
  avatarUrl: null,
};

export const DEMO_ARTIST_WARNINGS: Record<string, StudioContentWarningId[]> = {
  [DEMO_WARNED_TRACK_ID]: ["family-rejection"],
};
export const DEMO_STAFF_WARNINGS: Record<string, StudioContentWarningId[]> = {};
export const DEMO_LOCKED_EXPLICIT_TRACK_IDS: readonly string[] = [
  DEMO_LOCKED_EXPLICIT_TRACK_ID,
];

export interface DemoClaimSeed {
  id: string;
  trackId: string;
  claimant: StudioClaimantRefDTO;
  /** Filed by the demo member: it shows on "Your copyright claims". */
  isMine: boolean;
  claimantRole: StudioClaimantRole;
  originalWork: string;
  originalLink: string | null;
  details: string;
  status: StudioClaimStatus;
  counterNote: string | null;
  claimantReply: string | null;
  staffNote: string | null;
  createdAt: string;
  acceptedAt: string | null;
  counteredAt: string | null;
  repliedAt: string | null;
  decidedAt: string | null;
}

export const DEMO_CLAIM_SEEDS: readonly DemoClaimSeed[] = [
  {
    id: "demo-claim-held",
    trackId: DEMO_WITHHELD_TRACK_ID,
    claimant: INES,
    isMine: false,
    claimantRole: "rights_holder",
    originalWork: "Candeia, by Rosa Marinho (1981)",
    originalLink: "https://example.org/rosa-marinho/candeia",
    details:
      "The melody from 0:40 to 1:55 follows the chorus of Candeia note for note",
    status: "accepted",
    counterNote: null,
    claimantReply: null,
    staffNote: null,
    createdAt: "2026-10-09T09:00:00.000Z",
    acceptedAt: "2026-10-10T14:00:00.000Z",
    counteredAt: null,
    repliedAt: null,
    decidedAt: null,
  },
  {
    id: "demo-claim-countered",
    trackId: DEMO_WITHHELD_TRACK_ID,
    claimant: TEO,
    isMine: false,
    claimantRole: "authorised",
    originalWork: "Vela, by the Coro da Ribeira (2019)",
    originalLink: null,
    details: "The field recording from 0:00 to 0:20 is lifted from our album",
    status: "countered",
    counterNote:
      "I made that field recording myself at the Ribeira festival in 2021 and the raw file carries the date",
    claimantReply: null,
    staffNote: null,
    createdAt: "2026-10-08T11:00:00.000Z",
    acceptedAt: "2026-10-09T10:00:00.000Z",
    counteredAt: "2026-10-12T18:30:00.000Z",
    repliedAt: null,
    decidedAt: null,
  },
  {
    id: "demo-claim-mine",
    trackId: DEMO_CLAIMED_TRACK_ID,
    claimant: DEMO_SELF_CLAIMANT,
    isMine: true,
    claimantRole: "rights_holder",
    originalWork: "Kitchen light, by Tiago (2024)",
    originalLink: null,
    details:
      "The guitar loop from 1:10 to the end is my loop from Kitchen light",
    status: "submitted",
    counterNote: null,
    claimantReply: null,
    staffNote: null,
    createdAt: "2026-10-13T20:15:00.000Z",
    acceptedAt: null,
    counteredAt: null,
    repliedAt: null,
    decidedAt: null,
  },
];

export const DEMO_TRACK_REPORT_SEEDS: readonly {
  reportId: string;
  trackId: string;
  reasonCode: ReasonCode;
  createdAt: string;
}[] = [
  {
    reportId: "demo-track-report-1",
    trackId: DEMO_REPORTED_TRACK_ID,
    reasonCode: "untagged_explicit",
    createdAt: "2026-10-13T16:00:00.000Z",
  },
];
