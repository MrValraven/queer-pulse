/**
 * Issue-production demo data — ported from the DesignSync prototype's
 * `mag-issue.jsx` design notes (`RUNORDER`/`DIGEST`/`ARCHIVE` + the
 * coverlines/theme called out on the cover-and-contents tab). Mirrors the
 * shape `useIssueProduction` returns in live mode
 * (`GET /magazine/admin/issues/:number`).
 *
 * The running order resolves each design `pieceId` (`p1`/`p2`/`p9`/`p4`/
 * `p5`/`p10`/`p12`) against `DEMO_PIECES` (`desk.data.ts`) — same pieces the
 * desk pipeline/board already show, so opening a running-order row and the
 * desk's piece record agree on title/section/byline/stage.
 */

import type {
  IssueDigestItemDto,
  IssueProductionDto,
  IssueRunOrderEntryDto,
} from "../api/issueProduction.api";
import type { ArchiveEntryDto, PieceListItemDto } from "../api/pieces.api";
import { STAGE_VIEW_TO_DTO } from "../api/pieces.adapters";
import { DEMO_PIECES, type Piece } from "./desk.data";

/** The fabricated `issueId` demo pieces carry on their `IssueRunOrderEntryDto.piece` — there's no real issue uuid in demo mode. */
const DEMO_ISSUE_ID = "demo-issue-14";

/** Maps a `desk.data.ts` `Piece` (the desk's view shape) to the `PieceListItemDto` the running-order/digest/social UI expects. */
function toPieceListItemDto(piece: Piece): PieceListItemDto {
  return {
    id: piece.id,
    format: piece.format,
    title: piece.title,
    section: piece.section,
    kind: piece.kind,
    byline: piece.byline,
    editorId: piece.editorId,
    writerId: null,
    stage: STAGE_VIEW_TO_DTO[piece.stage],
    due: piece.due,
    late: piece.late ?? false,
    waitingOn: piece.wait ?? "nobody",
    words: piece.words ?? null,
    slides: piece.slides ?? null,
    art: piece.art,
    fresh: piece.fresh ?? false,
    issueId: DEMO_ISSUE_ID,
    articleId: null,
    deckId: null,
    contentsBlurb: piece.contentsBlurb ?? "",
  };
}

/** Looks up a `desk.data.ts` demo piece by id — every `RUN_ORDER_ENTRIES` id is a known-good `DEMO_PIECES` id. */
function findDemoPiece(pieceId: string): Piece {
  const piece = DEMO_PIECES.find((candidate) => candidate.id === pieceId);
  if (!piece)
    throw new Error(`issueProduction.data: unknown demo piece id "${pieceId}"`);
  return piece;
}

/** Running order, per the design's `RUNORDER` array: pieceId, planned page range (or "deck" for a slide deck), and whether it's laid out yet. */
const RUN_ORDER_ENTRIES: {
  pieceId: string;
  pages: string;
  laidOut: boolean;
}[] = [
  { pieceId: "p1", pages: "4–11", laidOut: false },
  { pieceId: "p2", pages: "12–16", laidOut: false },
  { pieceId: "p9", pages: "deck", laidOut: true },
  { pieceId: "p4", pages: "18–22", laidOut: false },
  { pieceId: "p5", pages: "24–26", laidOut: true },
  { pieceId: "p10", pages: "27", laidOut: false },
  { pieceId: "p12", pages: "28", laidOut: false },
];

const DEMO_RUN_ORDER: IssueRunOrderEntryDto[] = RUN_ORDER_ENTRIES.map(
  ({ pieceId, pages, laidOut }) => ({
    piece: toPieceListItemDto(findDemoPiece(pieceId)),
    pages,
    laidOut,
  }),
);

/** Members' digest, per the design's `DIGEST` array — order here is the order in the email. */
const DEMO_DIGEST: IssueDigestItemDto[] = [
  {
    pieceId: "p1",
    blurb:
      "Six people, one kitchen table, and the question nobody had said out loud in twenty years.",
    on: true,
  },
  {
    pieceId: "p9",
    blurb:
      "We asked 412 of you what care costs. The answer is 19 hours a week.",
    on: true,
  },
  {
    pieceId: "p5",
    blurb: "An essay about leaving, and about the friend who drove.",
    on: true,
  },
  {
    pieceId: "p10",
    blurb: "Ten years on, the book that named it.",
    on: false,
  },
];

export const DEMO_ISSUE_PRODUCTION: IssueProductionDto = {
  number: "14",
  theme: "Aftercare",
  title: "The Aftercare issue",
  publishedOn: "2026-09-01",
  coverUrl:
    "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=800&auto=format&fit=crop",
  coverlines: [
    "What we owe old friends",
    "19 hours a week, unpaid",
    "A reading list, by the therapist who wrote it",
  ],
  runOrder: DEMO_RUN_ORDER,
  digest: DEMO_DIGEST,
  digestSendOnPublish: true,
  digestSentAt: null,
  // Matches the design's ship modal note ("two pieces are still behind the
  // publish gate") — the whole-issue gate check reads false while the other
  // per-issue checks reflect what's already been done.
  shipChecklist: [
    { label: "Every piece past the publish gate", done: false },
    { label: "Cover art licensed and credited", done: true },
    { label: "Coverlines proofed by two people", done: true },
    { label: "Contents blurbs written", done: false },
    { label: "Digest scheduled", done: true },
    { label: "Corrections from issue 13 carried over", done: true },
  ],
  pages: { editorial: 22, total: 28, max: 30 },
};

/**
 * Demo fixture for `useArchive` — the "have we run this before?" search,
 * mirroring the design's `ARCHIVE` array. `issue` is the issue's display
 * number as a string (matching `ArchiveEntryDto.issue`/`Issue.number`), or
 * `null` for a deck (decks don't carry an issue number on the backend).
 */
export const DEMO_ARCHIVE: ArchiveEntryDto[] = [
  {
    title: "The friends who became a household",
    issue: "9",
    by: "Marta Cruz",
    tags: ["Chosen family", "Ageing"],
  },
  {
    title: "Who signs the form",
    issue: "4",
    by: "Rui Alves",
    tags: ["Health", "Legal"],
  },
  {
    title: "On grief and group chats",
    issue: "12",
    by: "Sara Pinheiro",
    tags: ["Chosen family"],
  },
];
