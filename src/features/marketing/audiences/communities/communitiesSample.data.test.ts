import { describe, expect, it } from "vitest";
import { LIVING } from "../../../communities/livingCommunities.data";
import { communities } from "../../../homepage/data/communities";
import { loadTestT } from "../shared/testing/audienceTestUtils";
import {
  buildSampleAlbum,
  buildSampleCheckin,
  buildSampleCommunity,
  buildSampleDiscussion,
  buildSampleEvent,
  buildSampleLineup,
  buildSampleTeam,
  SAMPLE_COLLECTIVE_NAME,
} from "./communitiesSample.data";
import {
  buildSampleDoorGuests,
  buildSampleGoing,
  buildSampleJoinRequest,
  buildSampleThreads,
  SAMPLE_GUEST_COMMUNITY,
  SAMPLE_LEAD_COMMUNITY,
} from "./communitiesSteps.data";

const TODAY = new Date(2026, 9, 27, 10, 0);
const DEMO_USER_PHOTO = "photo-1500648767791-00dcc994a43e";
const BANNED_KEY = /^(tips?|sustain\w*|payouts?|listening\w*)$/i;

async function buildEverything(language: "en" | "pt") {
  const t = await loadTestT(language, ["forCommunities", "communities"]);
  return {
    community: buildSampleCommunity(t),
    event: buildSampleEvent(t, TODAY),
    lineup: buildSampleLineup(),
    discussion: buildSampleDiscussion(t),
    team: buildSampleTeam(),
    checkin: buildSampleCheckin(TODAY),
    album: buildSampleAlbum(),
    joinRequest: buildSampleJoinRequest(t),
    threads: buildSampleThreads(t),
    going: buildSampleGoing(),
    doorGuests: buildSampleDoorGuests(TODAY),
    leadCommunity: SAMPLE_LEAD_COMMUNITY,
    guestCommunity: SAMPLE_GUEST_COMMUNITY,
  };
}

function objectKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(objectKeys);
  if (value === null || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => [
    key,
    ...objectKeys(child),
  ]);
}

function stringValues(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringValues);
  if (value === null || typeof value !== "object") return [];
  return Object.values(value).flatMap(stringValues);
}

describe.each(["en", "pt"] as const)(
  "communities sample data (%s)",
  (language) => {
    it("honesty guard: no real people, places or demo money", async () => {
      const everything = await buildEverything(language);
      const serialized = JSON.stringify(everything);
      expect(serialized).not.toMatch(
        /Tiago|ILGA|Trumps|Cevicheria|LX Factory|Pride Brunch/i,
      );
      expect(serialized).not.toContain(DEMO_USER_PHOTO);
      expect(
        objectKeys(everything).filter((key) => BANNED_KEY.test(key)),
      ).toEqual([]);
      const urls = stringValues(everything).filter((text) =>
        text.startsWith("https://"),
      );
      expect(urls.length).toBeGreaterThan(0);
      for (const url of urls) {
        expect(url.startsWith("https://images.unsplash.com/")).toBe(true);
      }
    });

    it("no name or slug matches a demo community", async () => {
      const everything = await buildEverything(language);
      const demoNames = new Set<string>([
        ...Object.keys(LIVING),
        ...communities.map((community) => community.name),
        ...communities.flatMap((community) =>
          community.slug ? [community.slug] : [],
        ),
      ]);
      const sampleNames = [
        SAMPLE_COLLECTIVE_NAME,
        everything.community.name,
        everything.event.org,
        everything.event.hostingCommunity?.name ?? "",
        everything.event.hostingCommunity?.slug ?? "",
        everything.leadCommunity.name,
        everything.leadCommunity.slug,
        everything.guestCommunity.name,
        everything.guestCommunity.slug,
      ];
      expect(sampleNames.filter((name) => demoNames.has(name))).toEqual([]);
    });

    it("the event is coming up and free, run by the sample collective", async () => {
      const { event } = await buildEverything(language);
      expect(event.date.getTime()).toBeGreaterThan(TODAY.getTime());
      expect(event.org).toBe(SAMPLE_COLLECTIVE_NAME);
      expect(event.cost ?? "").toBe("");
      expect(event.ticketed).toBeFalsy();
      expect(event.priceMin).toBeUndefined();
    });

    it("the check-in moment sits inside the doors window", async () => {
      const { checkin } = await buildEverything(language);
      expect(checkin.endAt).not.toBeNull();
      expect(checkin.now.getTime()).toBeGreaterThan(checkin.startAt.getTime());
      expect(checkin.now.getTime()).toBeLessThan(checkin.endAt!.getTime());
    });

    it("the post comes from the co-owner", async () => {
      const { discussion } = await buildEverything(language);
      expect(discussion.role).toBe("co_owner");
      expect(discussion.text.length).toBeGreaterThan(0);
    });
  },
);
