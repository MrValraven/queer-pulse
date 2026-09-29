import { describe, expect, it } from "vitest";
import { DEMO_PIECES, type Piece } from "./desk.data";
import { DEMO_RECORD, demoRecordForPiece } from "./pieceRecord.data";

/** Looks a demo piece up by id the same way `usePieceRecord`'s demo branch
 *  does (`DEMO_PIECES.find(...)`). Throws loudly if a fixture id drifts out
 *  from under this test, so the failure names the missing id instead of
 *  quietly exercising the `undefined` branch instead. */
function findDemoPiece(id: string): Piece {
  const piece = DEMO_PIECES.find((candidate) => candidate.id === id);
  if (!piece) throw new Error(`fixture drift: no DEMO_PIECES entry "${id}"`);
  return piece;
}

/** Narrows a record's `brief`, which is `PieceBrief | null` on the type (the
 *  live API DTO allows a piece to carry none yet); every demo record here is
 *  known to have one, so a `null` here is a genuine test failure worth
 *  throwing loudly over. */
function requireBrief(brief: (typeof DEMO_RECORD)["brief"], label: string) {
  if (!brief) throw new Error(`expected ${label} to carry a brief`);
  return brief;
}

describe("demoRecordForPiece", () => {
  it("returns DEMO_RECORD verbatim for its own piece", () => {
    const p1 = findDemoPiece("p1");
    expect(p1.id).toBe(DEMO_RECORD.id);
    expect(demoRecordForPiece(p1)).toBe(DEMO_RECORD);
  });

  it("returns DEMO_RECORD for an unknown id", () => {
    expect(demoRecordForPiece(undefined)).toBe(DEMO_RECORD);
  });

  it("gives an article its own word count, on target, in place of the shared over-length pair", () => {
    const p7 = findDemoPiece("p7"); // article, words: 800, paymentStatus: "none"
    const record = demoRecordForPiece(p7);
    const brief = requireBrief(record.brief, "p7's record.brief");
    expect(record.words).toBe(800);
    expect(brief.wordCount).toBe(800);
    expect(brief.filedWords).toBe(800);
    // On target: the filed count matches the target, unlike DEMO_RECORD's
    // own authored over-length scenario.
    expect(brief.filedWords).toBe(brief.wordCount);
  });

  it("keeps the shared word count for a slide deck, which has no `words` field to derive from", () => {
    const p9 = findDemoPiece("p9"); // deck, no `words`, paymentStatus: "none"
    expect(p9.words).toBeUndefined();
    const record = demoRecordForPiece(p9);
    const recordBrief = requireBrief(record.brief, "p9's record.brief");
    const demoBrief = requireBrief(DEMO_RECORD.brief, "DEMO_RECORD.brief");
    expect(record.words).toBe(DEMO_RECORD.words);
    expect(recordBrief.wordCount).toBe(demoBrief.wordCount);
    expect(recordBrief.filedWords).toBe(demoBrief.filedWords);
  });

  it("still derives a deck's own money status independent of its missing word count", () => {
    const p9 = findDemoPiece("p9"); // deck, paymentStatus: "none"
    const record = demoRecordForPiece(p9);
    expect(record.payment?.status).toBe("agreed");
    expect(record.payment?.status).not.toBe(DEMO_RECORD.payment?.status);
  });

  it("maps every PiecePaymentStatus to its own PaymentStatus", () => {
    expect(demoRecordForPiece(findDemoPiece("p7")).payment?.status).toBe(
      "agreed",
    ); // "none"
    expect(demoRecordForPiece(findDemoPiece("p8")).payment?.status).toBe(
      "approved_unpaid",
    ); // "owed"
    expect(demoRecordForPiece(findDemoPiece("p10")).payment?.status).toBe(
      "paid",
    ); // "paid"
  });

  it("never mutates DEMO_RECORD", () => {
    const demoBrief = requireBrief(DEMO_RECORD.brief, "DEMO_RECORD.brief");
    const beforeWordCount = demoBrief.wordCount;
    const beforeFiledWords = demoBrief.filedWords;
    const beforeStatus = DEMO_RECORD.payment?.status;

    demoRecordForPiece(findDemoPiece("p7"));
    demoRecordForPiece(findDemoPiece("p8"));
    demoRecordForPiece(findDemoPiece("p10"));

    expect(demoBrief.wordCount).toBe(beforeWordCount);
    expect(demoBrief.filedWords).toBe(beforeFiledWords);
    expect(DEMO_RECORD.payment?.status).toBe(beforeStatus);
  });

  it("carries a scheduled piece's publish instant and keeps it unpublished", () => {
    const p5 = findDemoPiece("p5"); // Ready, on the demo issue, scheduled
    const record = demoRecordForPiece(p5);
    expect(p5.publishedAt).toBeTruthy();
    expect(record.publishedAt).toBe(p5.publishedAt);
    expect(record.isPublished).toBe(false);
  });

  it("leaves the publish instant empty for a piece with none", () => {
    expect(demoRecordForPiece(findDemoPiece("p7")).publishedAt).toBeNull();
  });
});
