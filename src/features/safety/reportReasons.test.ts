import { describe, expect, it } from "vitest";
import {
  REASON_LABEL_KEYS,
  REASON_LABELS,
  SUBJECT_REASONS,
  type ReportSubjectType,
} from "./reportReasons";

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

/** Mirrors `SUBJECT_REASONS[ReportSubjectType.Community]`. */
const BACKEND_COMMUNITY_REASONS = [
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

  it("mirrors the backend catalogue for a whole community", () => {
    expect(SUBJECT_REASONS.community).toEqual(BACKEND_COMMUNITY_REASONS);
  });

  // A community organised around harm is the case this subject exists for, and
  // the two codes that reach the one-hour emergency band are the two it used
  // to be missing.
  it.each(["outing", "doxxing"])(
    "lets somebody report %s about a community, so it derives emergency severity",
    (code) => {
      expect(SUBJECT_REASONS.community).toContain(code);
    },
  );

  // Reporting a PERSON for a slur used to have no code, so it was filed as
  // `discrimination` and the taxonomy read as though no hate speech was ever
  // reported about people.
  it("lets somebody report a member for hate speech", () => {
    expect(SUBJECT_REASONS.member).toContain("hate_speech");
  });

  // The three housing subjects were the last ones that could not reach the
  // one-hour emergency band. A landlord threatening to tell a tenant's family,
  // or a flatmate posting somebody's address or transition status, is the
  // central physical danger in queer housing, and until these codes were added
  // the reporter had no word for it.
  it.each(["housing", "flatmate", "landlord"] as const)(
    "lets somebody report outing and doxxing about %s",
    (subjectType) => {
      expect(SUBJECT_REASONS[subjectType]).toContain("outing");
      expect(SUBJECT_REASONS[subjectType]).toContain("doxxing");
    },
  );

  // Every subject whose report is about a PERSON rather than a piece of
  // content. `hate_speech` reached these one at a time, and each time it was
  // added to the backend catalogue first, so this asserts the whole class at
  // once rather than waiting for the next one to be noticed.
  it.each(["member", "flatmate", "landlord"] as const)(
    "lets somebody report %s for hate speech",
    (subjectType) => {
      expect(SUBJECT_REASONS[subjectType]).toContain("hate_speech");
    },
  );

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

  // PRD-376: a business, persona or company, reported by its customer from
  // their thread with it. Mirrors the backend's
  // `SUBJECT_REASONS[ReportSubjectType.Identity]` exactly.
  it("offers a customer the thread codes first when reporting a business", () => {
    expect(SUBJECT_REASONS.identity).toEqual([
      "harassment",
      "hate_speech",
      "unwanted_contact",
      "housing_scam",
      "spam",
      "venue_safety",
      "discrimination",
      "other",
    ]);
  });

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
      "event_photo",
      "landlord_recommendation",
      "volunteering",
      "conversation",
      "identity",
      "group_listing",
      "studio_release",
      "persona_post",
      "studio_track",
    ];
    expect(Object.keys(SUBJECT_REASONS).sort()).toEqual(
      [...backendSubjectTypes].sort(),
    );
  });
});

describe("SUBJECT_REASONS for Studio (safety and moderation contract)", () => {
  it("mirrors the backend catalogue for a Studio track", () => {
    expect(SUBJECT_REASONS.studio_track).toEqual([
      "hateful_lyrics",
      "untagged_explicit",
      "impersonation",
      "harassment",
      "outing",
      "spam",
      "copyright",
      "other",
    ]);
  });

  it("offers untagged_explicit on a release, with other last", () => {
    expect(SUBJECT_REASONS.studio_release).toContain("untagged_explicit");
    expect(SUBJECT_REASONS.studio_release.at(-1)).toBe("other");
  });
});

describe("SUBJECT_REASONS for Pulse Live", () => {
  it("offers the Pulse Live answer reasons in the backend's order", () => {
    expect(SUBJECT_REASONS.quizshow_answer).toEqual([
      "outing",
      "doxxing",
      "harassment",
      "hate_speech",
      "discrimination",
      "spam",
      "other",
    ]);
  });
});

describe("SUBJECT_REASONS for Pulse Live games", () => {
  it("offers the game reasons in the backend's order", () => {
    expect(SUBJECT_REASONS.quizshow_game).toEqual([
      "hate_speech",
      "harassment",
      "discrimination",
      "outing",
      "doxxing",
      "untagged_explicit",
      "spam",
      "other",
    ]);
  });
});

describe("SUBJECT_REASONS for Studio purchases", () => {
  it("offers payment_never_confirmed on a persona, just before other", () => {
    const options = SUBJECT_REASONS.subprofile;
    expect(options).toContain("payment_never_confirmed");
    expect(options.indexOf("payment_never_confirmed")).toBe(
      options.indexOf("other") - 1,
    );
  });

  it("names the code in the catalog and the plain label", () => {
    expect(REASON_LABEL_KEYS.payment_never_confirmed).toBe(
      "safety:reason.paymentNeverConfirmed",
    );
    expect(REASON_LABELS.payment_never_confirmed).toBe(
      "Took my payment and did not confirm it",
    );
  });

  it("keeps the code off post and reply reports", () => {
    expect(SUBJECT_REASONS.post).not.toContain("payment_never_confirmed");
    expect(SUBJECT_REASONS.reply).not.toContain("payment_never_confirmed");
  });
});
