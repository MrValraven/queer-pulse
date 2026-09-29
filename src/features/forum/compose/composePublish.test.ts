import { describe, expect, it } from "vitest";
import { toCreateThreadDto } from "./composePublish";
import {
  EMPTY_COMPOSE_THREAD_STATE,
  type ComposeThreadState,
} from "./composeThread.types";

/**
 * ENG-423: a thread's auto-close and its poll's deadline count from the moment
 * the thread goes live. A scheduled post counts from its publish time; a post
 * published now counts from the injected clock.
 */

const NOW = new Date("2026-09-29T10:00:00");
const SCHEDULED_LOCAL = "2026-10-20T18:30";

/** The same local-calendar arithmetic the composer does, so the expectation
 *  holds across a daylight-saving change in any test timezone. */
function daysAfter(from: Date, days: number): string {
  const when = new Date(from.getTime());
  when.setDate(when.getDate() + days);
  return when.toISOString();
}

const STATE_WITH_DEADLINES: ComposeThreadState = {
  ...EMPTY_COMPOSE_THREAD_STATE,
  title: "Flatmate wanted in Arroios",
  body: "A sunny room in a queer flat.",
  category: "housing",
  closeAfter: "2w",
  poll: {
    options: ["Yes", "No"],
    allowMultiple: false,
    closes: "1w",
  },
};

describe("toCreateThreadDto deadlines", () => {
  it("closesAt counts from the scheduled publish time", () => {
    const dto = toCreateThreadDto({
      state: STATE_WITH_DEADLINES,
      mode: "schedule",
      scheduledAtLocal: SCHEDULED_LOCAL,
      canPostAsOfficial: false,
      now: NOW,
    });

    expect(dto.publishAt).toBe(new Date(SCHEDULED_LOCAL).toISOString());
    expect(dto.closesAt).toBe(daysAfter(new Date(SCHEDULED_LOCAL), 14));
  });

  it("poll closesAt counts from the scheduled publish time", () => {
    const dto = toCreateThreadDto({
      state: STATE_WITH_DEADLINES,
      mode: "schedule",
      scheduledAtLocal: SCHEDULED_LOCAL,
      canPostAsOfficial: false,
      now: NOW,
    });

    expect(dto.poll?.closesAt).toBe(daysAfter(new Date(SCHEDULED_LOCAL), 7));
  });

  it("publish now still counts from now", () => {
    const dto = toCreateThreadDto({
      state: STATE_WITH_DEADLINES,
      mode: "now",
      scheduledAtLocal: SCHEDULED_LOCAL,
      canPostAsOfficial: false,
      now: NOW,
    });

    expect(dto.publishAt).toBeUndefined();
    expect(dto.closesAt).toBe(daysAfter(NOW, 14));
    expect(dto.poll?.closesAt).toBe(daysAfter(NOW, 7));
  });
});
