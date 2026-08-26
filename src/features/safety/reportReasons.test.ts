import { describe, expect, it } from "vitest";
import { SUBJECT_REASONS, type ReportSubjectType } from "./reportReasons";

/**
 * This map is what members actually see. Nothing reads `GET /reports/reasons`
 * on the frontend today, so the backend's `reason-catalogue.ts` is a contract
 * this file mirrors rather than a source it fetches, and a drift between them
 * is invisible until somebody cannot report what happened to them.
 *
 * That is not hypothetical. `listing_public_question` was missing from
 * `ReportSubjectType` entirely, so its form rendered the REVIEW list, which
 * carries neither `outing` nor `doxxing`, the only two codes the backend's
 * `deriveSeverity` maps to emergency.
 */

/** Mirrors `SUBJECT_REASONS[ReportSubjectType.ListingPublicQuestion]`. */
const BACKEND_QUESTION_REASONS = [
  "outing",
  "doxxing",
  "harassment",
  "hate_speech",
  "discrimination",
  "spam",
  "off_topic",
  "other",
];

/** Mirrors `SUBJECT_REASONS[ReportSubjectType.Review]`. */
const BACKEND_REVIEW_REASONS = [
  "harassment",
  "hate_speech",
  "discrimination",
  "housing_scam",
  "spam",
  "other",
];

describe("SUBJECT_REASONS", () => {
  it("mirrors the backend catalogue for a public listing question", () => {
    expect(SUBJECT_REASONS.listing_public_question).toEqual(
      BACKEND_QUESTION_REASONS,
    );
  });

  it("mirrors the backend catalogue for a listing review", () => {
    expect(SUBJECT_REASONS.review).toEqual(BACKEND_REVIEW_REASONS);
  });

  // The safety-critical half. A question box on a venue's page is where
  // somebody gets asked, in public, whether they were at a place or who they
  // went with. Losing these two sends an outing report to the ordinary queue
  // as "Something else".
  it.each(["outing", "doxxing"])(
    "lets somebody report %s in a public question, so it derives emergency severity",
    (code) => {
      expect(SUBJECT_REASONS.listing_public_question).toContain(code);
    },
  );

  // A star review is not that surface, and the backend deliberately shapes it
  // differently. Guards against the two sets being "unified" back together.
  it("keeps a review's reason set distinct from a question's", () => {
    expect(SUBJECT_REASONS.review).not.toContain("outing");
    expect(SUBJECT_REASONS.review).not.toContain("doxxing");
    expect(SUBJECT_REASONS.listing_public_question).not.toContain(
      "housing_scam",
    );
  });

  // `listing_dispute` and `listing_owner_notify` exist in `ReasonCode` only so
  // the label tables can resolve a system-filed report the moderation queue
  // shows. The backend keeps them out of the `REASON_CODES` list `POST
  // /reports` validates against, so offering one to a member would build a
  // form whose submission the server rejects.
  it.each(["listing_dispute", "listing_owner_notify"])(
    "never offers the system-filed code %s to a member",
    (systemCode) => {
      for (const [subjectType, codes] of Object.entries(SUBJECT_REASONS)) {
        expect(
          codes,
          `${subjectType} must not offer ${systemCode}`,
        ).not.toContain(systemCode);
      }
    },
  );

  // Every subject offers a free-text escape hatch, so no reporter is ever
  // stuck without a way to say what happened.
  it("offers `other` on every subject type", () => {
    for (const [subjectType, codes] of Object.entries(SUBJECT_REASONS)) {
      expect(codes, `${subjectType} must offer "other"`).toContain("other");
    }
  });

  // The union and the map are checked against each other by the compiler, but
  // only this asserts the union actually grew: a `Record` is satisfied just as
  // happily by a union that is missing a member.
  it("covers every subject type the backend enum can send", () => {
    const backendSubjectTypes: ReportSubjectType[] = [
      "member",
      "post",
      "reply",
      "venue",
      "message",
      "community",
      "housing",
      "flatmate",
      "landlord",
      "listing",
      "event",
      "business",
      "company",
      "job",
      "subprofile",
      "review",
      "magazine_comment",
      "listing_public_question",
    ];
    expect(Object.keys(SUBJECT_REASONS).sort()).toEqual(
      [...backendSubjectTypes].sort(),
    );
  });
});
