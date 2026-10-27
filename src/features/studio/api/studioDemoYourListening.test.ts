import { beforeEach, describe, expect, it } from "vitest";
import { demoPublishedReleasesOf } from "./studioDemoFormats.data";
import {
  DEMO_ARTIST_LUA_CARDOSO,
  DEMO_ARTIST_VANDA_DIESEL,
  isDemoOwnedPersona,
} from "./studioDemoFormats.data";
import { DEMO_ARTISTS } from "./studioDemo.data";
import {
  DEMO_ARTIST_LATE_BLOOMERS,
  DEMO_ARTIST_MARIANA,
  DEMO_ARTIST_NIGHTFORM,
} from "./studioDemoMe.data";
import {
  DEMO_ACCOUNT_MEMBER,
  DEMO_LISTEN_SEEDS,
  DEMO_RECENT_PAGE_SIZE,
} from "./studioDemoYourListening.data";
import {
  demoClearStudioListening,
  demoDeleteStudioSupporter,
  demoPutStudioSupporter,
  demoStudioListeningRecent,
  demoStudioListeningSummary,
  demoStudioListeningSupporting,
  demoStudioSupporterState,
  resetDemoYourListening,
} from "./studioDemoYourListening";
import { studioErrorCodeOf } from "./studio.api";

const now = new Date("2026-10-27T12:00:00.000Z");

function releaseOfTrack(trackId: string) {
  return [...DEMO_ARTISTS, DEMO_ARTIST_LUA_CARDOSO, DEMO_ARTIST_VANDA_DIESEL]
    .flatMap((artist) => demoPublishedReleasesOf(artist.id))
    .find((release) => release.tracks.some((track) => track.id === trackId));
}

function codeOf(run: () => unknown): string | null {
  try {
    run();
  } catch (error) {
    return studioErrorCodeOf(error);
  }
  return null;
}

describe("studioDemoYourListening", () => {
  beforeEach(resetDemoYourListening);

  it("holds no track of a persona the demo viewer owns, and only published, non-podcast tracks", () => {
    for (const seed of DEMO_LISTEN_SEEDS.filter(
      (candidate) => candidate.trackId !== null,
    )) {
      const release = releaseOfTrack(seed.trackId ?? "");
      expect(release?.status, seed.id).toBe("published");
      expect(release?.type, seed.id).not.toBe("podcast");
      expect(isDemoOwnedPersona(release?.artist.id ?? ""), seed.id).toBe(false);
    }
    expect(DEMO_LISTEN_SEEDS.some((seed) => seed.trackId === null)).toBe(true);
    expect(
      Math.max(...DEMO_LISTEN_SEEDS.map((seed) => seed.hoursAgo)),
    ).toBeLessThan(12 * 30 * 24);
  });

  it("sums each range from the same rows, the longer range holding the shorter", () => {
    const [four, six, twelve] = (["4w", "6m", "12m"] as const).map((range) =>
      demoStudioListeningSummary(range, now),
    );
    expect(four!.totalListens).toBeLessThanOrEqual(six!.totalListens);
    expect(six!.totalListens).toBeLessThanOrEqual(twelve!.totalListens);
    for (const summary of [four!, six!, twelve!]) {
      expect(
        summary.topTracks.reduce((sum, row) => sum + row.listens, 0),
      ).toBeLessThanOrEqual(summary.totalListens);
      expect(summary.listeningDays).toBeLessThanOrEqual(summary.totalListens);
      expect(
        summary.topArtists.every(
          (row, index, rows) =>
            index === 0 || rows[index - 1]!.listens >= row.listens,
        ),
      ).toBe(true);
    }
    expect(four!.topArtists[0]?.artist.id).toBe(DEMO_ARTIST_NIGHTFORM.id);
  });

  it("pages the history newest first with an opaque cursor, garbage reading as page one", () => {
    const first = demoStudioListeningRecent(null, now);
    expect(first.items).toHaveLength(DEMO_RECENT_PAGE_SIZE);
    const second = demoStudioListeningRecent(first.nextCursor, now);
    expect(second.items[0]!.playedAt <= first.items.at(-1)!.playedAt).toBe(
      true,
    );
    expect(demoStudioListeningRecent("garbage", now).items).toEqual(
      first.items,
    );
    expect(first.items.every((item) => /\.\d{3}Z$/.test(item.playedAt))).toBe(
      true,
    );
  });

  it("clears the history and leaves the supporting list", () => {
    demoClearStudioListening();
    expect(demoStudioListeningRecent(null, now).items).toEqual([]);
    expect(demoStudioListeningSummary("12m", now).totalListens).toBe(0);
    expect(demoStudioListeningSupporting().items.length).toBeGreaterThan(0);
  });

  it("reads the seeded opt-ins with the identity each one chose", () => {
    const items = demoStudioListeningSupporting().items;
    expect(items.map((item) => item.artist.id)).toEqual([
      DEMO_ARTIST_VANDA_DIESEL.id,
      DEMO_ARTIST_NIGHTFORM.id,
    ]);
    expect(items[1]?.shownAs).toEqual({
      kind: "account",
      member: DEMO_ACCOUNT_MEMBER,
    });
    expect(items[0]?.shownAs).toMatchObject({
      kind: "persona",
      persona: { id: DEMO_ARTIST_MARIANA.id },
    });
  });

  it("offers the account first, then the viewer's personas by name", () => {
    const state = demoStudioSupporterState(DEMO_ARTIST_LUA_CARDOSO.id);
    expect(state.isSupporting).toBe(false);
    expect(state.options.map((option) => option.shownAsSubprofileId)).toEqual([
      null,
      DEMO_ARTIST_LATE_BLOOMERS.id,
      DEMO_ARTIST_MARIANA.id,
    ]);
  });

  it("refuses with the contract codes, the 404 checked before the own-persona 403", () => {
    expect(codeOf(() => demoStudioSupporterState("demo-persona-unknown"))).toBe(
      "studio_supporter_artist_not_found",
    );
    expect(codeOf(() => demoStudioSupporterState(DEMO_ARTIST_MARIANA.id))).toBe(
      "studio_supporter_own_persona",
    );
    expect(
      codeOf(() =>
        demoPutStudioSupporter(
          DEMO_ARTIST_LUA_CARDOSO.id,
          DEMO_ARTIST_NIGHTFORM.id,
        ),
      ),
    ).toBe("studio_supporter_identity_not_yours");
  });

  it("saves, changes and removes an opt-in, keeping the first since", () => {
    const first = demoPutStudioSupporter(DEMO_ARTIST_LUA_CARDOSO.id, null);
    const changed = demoPutStudioSupporter(
      DEMO_ARTIST_LUA_CARDOSO.id,
      DEMO_ARTIST_LATE_BLOOMERS.id,
    );
    expect(changed.since).toBe(first.since);
    demoDeleteStudioSupporter(DEMO_ARTIST_LUA_CARDOSO.id);
    expect(
      demoStudioSupporterState(DEMO_ARTIST_LUA_CARDOSO.id).isSupporting,
    ).toBe(false);
    expect(() =>
      demoDeleteStudioSupporter(DEMO_ARTIST_LUA_CARDOSO.id),
    ).not.toThrow();
  });
});
