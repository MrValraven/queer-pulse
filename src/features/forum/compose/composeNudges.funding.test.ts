import { describe, expect, it } from "vitest";
import { composeNudges } from "./composeNudges";
import { EMPTY_COMPOSE_THREAD_STATE } from "./composeThread.types";

const BODY_WITH_PHONE = "Help with rent. Call me on 912 345 678 any time.";

describe("composeNudges on a fundraiser", () => {
  it("leaves the phone number to the fundraiser's own payment notice", () => {
    const nudges = composeNudges({
      state: {
        ...EMPTY_COMPOSE_THREAD_STATE,
        kind: "ask",
        body: BODY_WITH_PHONE,
      },
      community: null,
    });
    expect(nudges.map((nudge) => nudge.id)).not.toContain("contact");
  });

  it("keeps the contact row on every other kind", () => {
    const nudges = composeNudges({
      state: {
        ...EMPTY_COMPOSE_THREAD_STATE,
        kind: "question",
        body: BODY_WITH_PHONE,
      },
      community: null,
    });
    expect(nudges.map((nudge) => nudge.id)).toContain("contact");
  });
});
