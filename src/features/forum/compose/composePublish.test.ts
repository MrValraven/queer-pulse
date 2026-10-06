import { describe, expect, it } from "vitest";
import { toCreateThreadDto } from "./composePublish";
import {
  EMPTY_COMPOSE_THREAD_STATE,
  type ComposeThreadState,
} from "./composeThread.types";
import { EMPTY_COMPOSE_FUNDING } from "./composeFunding";

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
  funding: null,
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

const CALL_STATE: ComposeThreadState = {
  ...EMPTY_COMPOSE_THREAD_STATE,
  kind: "call",
  category: "funding",
  title: "Fundação Maré opens its 2026 project support",
  body: "Who it is for and what it funds, in my own words.",
  funding: {
    ...EMPTY_COMPOSE_FUNDING,
    linkUrl: "https://example.org/mare/apoio-projetos-2026",
    funderName: "Fundação Maré",
    deadlineLocal: "2026-11-30T17:00",
    scope: "national",
  },
};

describe("toCreateThreadDto funding", () => {
  it("sends a call's details with its kind", () => {
    const dto = toCreateThreadDto({
      state: CALL_STATE,
      mode: "now",
      canPostAsOfficial: false,
    });
    expect(dto.kind).toBe("call");
    expect(dto.funding).toMatchObject({
      funderName: "Fundação Maré",
      deadline: "2026-11-30T17:00:00.000Z",
      scope: "national",
    });
  });

  it("leaves typed details behind once the kind is no funding kind", () => {
    const dto = toCreateThreadDto({
      state: { ...CALL_STATE, kind: "question" },
      mode: "now",
      canPostAsOfficial: false,
    });
    expect(dto).not.toHaveProperty("funding");
  });

  it("always sends a fundraiser for review and always signed", () => {
    const dto = toCreateThreadDto({
      state: {
        ...CALL_STATE,
        kind: "ask",
        isAnonymous: true,
        funding: {
          ...EMPTY_COMPOSE_FUNDING,
          linkUrl: "https://gofundme.com/f/x",
          goalAmount: "900",
          askPurpose: "housing",
          beneficiary: "self",
        },
      },
      mode: "now",
      canPostAsOfficial: false,
    });
    expect(dto.submitForReview).toBe(true);
    expect(dto).not.toHaveProperty("isAnonymous");
  });
});
