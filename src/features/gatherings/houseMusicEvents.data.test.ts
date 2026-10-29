import { describe, expect, it } from "vitest";
import { demoEventLineup } from "./api/eventLineup.mock";
import {
  HOUSE_DEMO_LINEUPS,
  HOUSE_MUSIC_DEMO_DETAILS,
  HOUSE_MUSIC_DEMO_SLUGS,
  houseDemoMessages,
} from "./houseMusicEvents.data";

const EXPECTED_LINEUP_COUNTS = {
  [HOUSE_MUSIC_DEMO_SLUGS.clubNight]: { accepted: 3, pending: 2, declined: 1 },
  [HOUSE_MUSIC_DEMO_SLUGS.liveSession]: {
    accepted: 2,
    pending: 1,
    declined: 0,
  },
  [HOUSE_MUSIC_DEMO_SLUGS.listeningParty]: {
    accepted: 3,
    pending: 0,
    declined: 0,
  },
  [HOUSE_MUSIC_DEMO_SLUGS.jamSession]: { accepted: 1, pending: 1, declined: 1 },
};

describe("house music demo events", () => {
  it("derives the spots left from one capacity and the going count", () => {
    for (const detail of Object.values(HOUSE_MUSIC_DEMO_DETAILS)) {
      expect(detail.capacity).toBe(20);
      expect(detail.spots.key).toBe("gatherings:spots.spotsLeft");
      expect(detail.spots.values?.count).toBe(20 - (detail.goingCount ?? 0));
    }
  });

  it("gives each event a lineup matching its admin list row", () => {
    for (const [slug, counts] of Object.entries(EXPECTED_LINEUP_COUNTS)) {
      const entries = demoEventLineup(slug).entries;
      for (const status of ["accepted", "pending", "declined"] as const) {
        expect(entries.filter((entry) => entry.status === status)).toHaveLength(
          counts[status],
        );
      }
    }
    expect(Object.keys(HOUSE_DEMO_LINEUPS)).toHaveLength(4);
  });

  it("keeps Inês, the staff member, among the club night's confirmed", () => {
    const confirmed = demoEventLineup(HOUSE_MUSIC_DEMO_SLUGS.clubNight)
      .entries.filter((entry) => entry.status === "accepted")
      .map((entry) => entry.slug);
    expect(confirmed).toContain("ines");
  });

  it("names each event's own venue in its demo messages", () => {
    for (const [slug, detail] of Object.entries(HOUSE_MUSIC_DEMO_DETAILS)) {
      const [venueMessage] = houseDemoMessages(slug);
      expect(venueMessage?.preview).toContain(detail.venue);
      expect(venueMessage?.preview).not.toContain("Cevicheria");
    }
    expect(houseDemoMessages("pride-brunch")).toEqual([]);
  });
});
