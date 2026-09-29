import { afterEach, describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import {
  demoAcceptPair,
  demoAnswerHostQuestions,
  demoCard,
  demoDeclinePair,
  demoWithdraw,
  resetDemoGoTogetherState,
} from "./goTogether.mock";

/**
 * `demoCard`'s `?goTogetherDemo=<value>` override (final-wave finding I5):
 * the natural demo registry only ever produces `questionnaireNeeded`,
 * `notOptedIn`, `waiting` and `feedbackDue`, so this is the only way a
 * design/QA walk reaches `pairInvite`, an incoming pair invite (C1),
 * `unmatched`, `closed`, `unavailable`, either `ineligible` reason, or
 * `grouped`. Each case pushes a fresh URL with `history.pushState`, which
 * jsdom keeps `window.location` in sync with, so no mock of
 * `window.location` itself is needed.
 */
function setDemoSearch(search: string) {
  window.history.pushState({}, "", `/gatherings/pride-picnic${search}`);
}

afterEach(() => {
  resetDemoGoTogetherState();
  setDemoSearch("");
});

describe("demoCard state override", () => {
  it("walks the natural registry when the param is absent or unrecognised", () => {
    setDemoSearch("");
    expect(demoCard("pride-picnic").state).toBe("questionnaireNeeded");

    setDemoSearch("?goTogetherDemo=notARealState");
    expect(demoCard("pride-picnic").state).toBe("questionnaireNeeded");
  });

  it("pins to a pair invite, direction received (re-review NEW-7: this state is always the invitee's own unanswered invite)", () => {
    setDemoSearch("?goTogetherDemo=pairInvite");
    const card = demoCard("pride-picnic");
    expect(card.state).toBe("pairInvite");
    expect(card.pair).toMatchObject({
      status: "pending",
      direction: "received",
    });
  });

  it("pins to a received pair invite, the waiting member's C1 Accept/Decline path", () => {
    setDemoSearch("?goTogetherDemo=pairInviteReceived");
    const card = demoCard("pride-picnic");
    expect(card.state).toBe("waiting");
    expect(card.pair).toMatchObject({
      status: "pending",
      direction: "received",
    });
  });

  it("pins to unmatched, closed and unavailable", () => {
    setDemoSearch("?goTogetherDemo=unmatched");
    expect(demoCard("pride-picnic").state).toBe("unmatched");

    setDemoSearch("?goTogetherDemo=closed");
    expect(demoCard("pride-picnic").state).toBe("closed");

    setDemoSearch("?goTogetherDemo=unavailable");
    expect(demoCard("pride-picnic").state).toBe("unavailable");
  });

  it("pins to both ineligible panels", () => {
    setDemoSearch("?goTogetherDemo=ineligibleRestricted");
    expect(demoCard("pride-picnic")).toMatchObject({
      state: "ineligible",
      ineligibleReason: "restricted",
    });

    setDemoSearch("?goTogetherDemo=ineligibleVerify");
    expect(demoCard("pride-picnic")).toMatchObject({
      state: "ineligible",
      ineligibleReason: "notVerified",
    });
  });

  it("pins to grouped with a groupId the group query can resolve", () => {
    setDemoSearch("?goTogetherDemo=grouped");
    const card = demoCard("pride-picnic");
    expect(card.state).toBe("grouped");
    expect(card.groupId).toBe("demo-go-together-pride-picnic");
  });
});

/**
 * Re-review NEW-8: every demo mutation ends by calling `demoCard` again, so
 * on a `?goTogetherDemo=` URL the override used to keep answering the same
 * pinned state forever, making Accept, Decline and "Stop looking for a
 * group" look like no-ops. Each demo transition now calls
 * `consumeDemoCardStateOverride` first, so these actions advance the card
 * the same way they would with no override on the URL at all.
 */
describe("demoCard state override, consumed by the first real action", () => {
  it("Decline (demoDeclinePair) stops the pin immediately, for every later read too", () => {
    setDemoSearch("?goTogetherDemo=pairInviteReceived");
    expect(demoCard("pride-picnic").state).toBe("waiting");

    const afterDecline = demoDeclinePair("pride-picnic");
    expect(afterDecline.state).not.toBe("waiting");
    // The same URL is still there, but a later read on this session now
    // agrees with the action's own answer: the pin is gone for the whole
    // session, confirmed by this second, separate read.
    expect(demoCard("pride-picnic").state).toBe(afterDecline.state);
  });

  it('"Stop looking for a group" (demoWithdraw) stops the pin immediately', () => {
    setDemoSearch("?goTogetherDemo=unmatched");
    expect(demoCard("pride-picnic").state).toBe("unmatched");

    const afterWithdraw = demoWithdraw("pride-picnic");
    expect(afterWithdraw.state).not.toBe("unmatched");
    expect(demoCard("pride-picnic").state).toBe(afterWithdraw.state);
  });

  it("Accept (demoAcceptPair) answers from real demoState after it runs", () => {
    setDemoSearch("?goTogetherDemo=pairInviteReceived");
    expect(demoCard("pride-picnic").state).toBe("waiting");

    const afterAccept = demoAcceptPair("pride-picnic", {
      hostAnswers: {},
      lens: null,
      lensConsent: true,
    });
    // A real accepted pair entry reports its own direction as "sent" (see
    // `demoCard`'s natural-registry branch): the override's own pinned
    // direction was "received", so this confirms the read came from real
    // `demoState`.
    expect(afterAccept.pair?.direction).toBe("sent");
    expect(afterAccept.pair?.status).toBe("accepted");
  });
});

/** The hosts changed a question after this demo member opted in: the card
 *  asks it again until they answer. */
describe("demoCard hostQuestionChanged walk", () => {
  it("pins a waiting card that asks one host question again", () => {
    setDemoSearch("?goTogetherDemo=hostQuestionChanged");
    const card = demoCard("pride-picnic");
    expect(card.state).toBe("waiting");
    expect(card.unansweredHostQuestionIds).toHaveLength(1);
    expect(card.hostQuestions.map((question) => question.id)).toEqual(
      card.unansweredHostQuestionIds,
    );
  });

  it("keeps the member waiting with nothing left to answer once they answer", () => {
    setDemoSearch("?goTogetherDemo=hostQuestionChanged");
    const [question] = demoCard("pride-picnic").hostQuestions;
    const afterAnswer = demoAnswerHostQuestions("pride-picnic", {
      hostAnswers: { [question?.id ?? ""]: question?.options[0]?.id ?? "" },
    });
    expect(afterAnswer.state).toBe("waiting");
    expect(afterAnswer.unansweredHostQuestionIds).toEqual([]);
    expect(demoCard("pride-picnic").state).toBe("waiting");
  });

  it("refuses a blank answer with the backend's typed code", () => {
    setDemoSearch("?goTogetherDemo=hostQuestionChanged");
    expect(() =>
      demoAnswerHostQuestions("pride-picnic", { hostAnswers: { q1: "" } }),
    ).toThrow(ApiError);
    expect(demoCard("pride-picnic").unansweredHostQuestionIds).toHaveLength(1);
  });

  it("gives every natural demo card an empty list", () => {
    expect(demoCard("pride-picnic").unansweredHostQuestionIds).toEqual([]);
  });
});

/**
 * Re-review N4: the cutoff/opt-in-close times used to be anchored to a
 * fixed fallback regardless of which gathering the card was shown for, so a
 * demo reveal time could land after that gathering's own, real date had
 * already passed. `supper-club-12` is dated 2026-06-06 in
 * `gatherings/data.ts` (the exact date the design review's example named),
 * so its card now derives its cutoff from that real date.
 */
describe("demoCard cutoff, anchored to the real demo gathering's own date (N4)", () => {
  it("derives cutoffAt from the gathering's own date when the slug is a known demo gathering", () => {
    const gatheringStartMs = new Date(2026, 5, 6).getTime();
    const expectedCutoffMs = gatheringStartMs - 48 * 60 * 60 * 1000;

    const card = demoCard("supper-club-12");
    expect(Date.parse(card.cutoffAt!)).toBe(expectedCutoffMs);
  });

  it("falls back to the shared anchor for a slug this registry doesn't know", () => {
    // Not asserting an exact value, since that anchor moves with
    // `Date.now()` at module load: this only checks that an unknown slug
    // still gets a well-formed, parseable cutoff, with no throw and no
    // `NaN`.
    const card = demoCard("not-a-real-demo-gathering");
    expect(Number.isNaN(Date.parse(card.cutoffAt!))).toBe(false);
  });
});
