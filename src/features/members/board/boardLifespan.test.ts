import { describe, expect, it } from "vitest";
import type { BoardItem } from "../data/members";
import { boardLifespan, EXPIRY_WARNING_DAYS } from "./boardLifespan";

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-09-12T12:00:00.000Z").getTime();

function item(over: Partial<BoardItem> = {}): BoardItem {
  return {
    kind: "looking",
    title: "A collaborator for a queer zine",
    slug: "zine-collab",
    status: "open",
    createdAt: new Date(NOW - 25 * DAY).toISOString(),
    expiresAt: new Date(NOW + 5 * DAY).toISOString(),
    ...over,
  };
}

describe("boardLifespan", () => {
  it("reads the window from the post kind", () => {
    expect(boardLifespan(item({ kind: "looking" }), NOW).windowDays).toBe(30);
    expect(boardLifespan(item({ kind: "offering" }), NOW).windowDays).toBe(90);
  });

  it("counts whole days remaining, rounding up", () => {
    expect(boardLifespan(item(), NOW).daysLeft).toBe(5);
  });

  it("treats a post expiring later today as having one day left", () => {
    const lifespan = boardLifespan(
      item({ expiresAt: new Date(NOW + 6 * 60 * 60 * 1000).toISOString() }),
      NOW,
    );
    expect(lifespan.daysLeft).toBe(1);
    expect(lifespan.isExpired).toBe(false);
  });

  it("marks a post that expired yesterday as expired with no days left", () => {
    const lifespan = boardLifespan(
      item({ expiresAt: new Date(NOW - DAY).toISOString() }),
      NOW,
    );
    expect(lifespan.isExpired).toBe(true);
    expect(lifespan.daysLeft).toBe(0);
    expect(lifespan.fractionLeft).toBe(0);
  });

  it("flags expiring-soon exactly at the threshold", () => {
    const atThreshold = boardLifespan(
      item({
        expiresAt: new Date(NOW + EXPIRY_WARNING_DAYS * DAY).toISOString(),
      }),
      NOW,
    );
    const justOver = boardLifespan(
      item({
        expiresAt: new Date(
          NOW + (EXPIRY_WARNING_DAYS + 1) * DAY,
        ).toISOString(),
      }),
      NOW,
    );
    expect(atThreshold.isExpiringSoon).toBe(true);
    expect(justOver.isExpiringSoon).toBe(false);
  });

  it("never reports a closed post as expiring", () => {
    const lifespan = boardLifespan(
      item({ status: "closed", expiresAt: new Date(NOW - DAY).toISOString() }),
      NOW,
    );
    expect(lifespan.isExpired).toBe(false);
    expect(lifespan.isExpiringSoon).toBe(false);
  });

  it("clamps the fraction between 0 and 1", () => {
    expect(boardLifespan(item(), NOW).fractionLeft).toBeCloseTo(5 / 30, 5);
    const overdue = boardLifespan(
      item({ expiresAt: new Date(NOW + 400 * DAY).toISOString() }),
      NOW,
    );
    expect(overdue.fractionLeft).toBe(1);
  });

  it("survives a missing or unparseable expiry without throwing", () => {
    const lifespan = boardLifespan(item({ expiresAt: "not-a-date" }), NOW);
    expect(lifespan.isExpired).toBe(false);
    expect(lifespan.daysLeft).toBe(0);
  });
});
