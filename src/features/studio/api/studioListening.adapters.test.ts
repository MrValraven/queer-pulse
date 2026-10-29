import { describe, expect, it } from "vitest";
import type {
  StudioArtistRefDTO,
  StudioPlaylistTrackDTO,
  StudioReleaseCardDTO,
} from "./studio.types";
import {
  SUPPORTER_ACCOUNT_KEY,
  listensPageOf,
  toListenView,
  toListeningSummaryView,
  toSupporterIdentityView,
  toSupporterStateView,
  toSupportingViews,
} from "./studioListening.adapters";
import type {
  StudioListeningSummaryDTO,
  StudioSupporterIdentityDTO,
  StudioSupporterStateDTO,
  StudioSupportingItemDTO,
} from "./studioListening.types";

const artistRefDto: StudioArtistRefDTO = {
  id: "persona-mariana",
  handle: "mariana-sol",
  name: "Mariana Sol",
  kind: "musician",
  avatarUrl: null,
};

const releaseCardDto: StudioReleaseCardDTO = {
  id: "release-7",
  title: "Cartas",
  type: "single",
  coverUrl: "https://files.example/cartas.webp",
  releasedOn: "2026-03-01",
  trackCount: 1,
  totalDurationSeconds: 200,
  artist: artistRefDto,
  publishedAt: "2026-03-01T10:00:00.000Z",
  genre: "fado",
  genres: ["fado"],
  mood: null,
  scene: null,
};

const trackDto: StudioPlaylistTrackDTO = {
  id: "track-7",
  position: 1,
  title: "Cartas",
  durationSeconds: 200,
  isExplicit: false,
  hasAudio: true,
  release: releaseCardDto,
};

const summaryDto: StudioListeningSummaryDTO = {
  range: "4w",
  totalListens: 5,
  listeningDays: 3,
  topArtists: [{ artist: artistRefDto, listens: 3 }],
  topTracks: [{ track: trackDto, listens: 2 }],
};

const elevenArtists: StudioListeningSummaryDTO["topArtists"] = Array.from(
  { length: 11 },
  (_entry, index) => ({
    artist: { ...artistRefDto, id: `persona-${index}` },
    listens: 11 - index,
  }),
);

const supportingDto: StudioSupportingItemDTO = {
  artist: artistRefDto,
  since: "2026-10-12T09:30:00.000Z",
  shownAs: {
    kind: "account",
    member: { slug: "tiago", displayName: "Tiago Costa", avatarUrl: null },
  },
  supportLinks: [
    { platform: "bandcamp", urlOrHandle: "https://marianasol.bandcamp.com" },
    { platform: "kofi", urlOrHandle: "@marianasol" },
    { platform: "patreon", urlOrHandle: "http://patreon.com/marianasol" },
  ],
  isFollowing: true,
};

const stateDto: StudioSupporterStateDTO = {
  isSupporting: false,
  shownAsSubprofileId: null,
  shownAs: null,
  since: null,
  options: [
    {
      shownAsSubprofileId: null,
      identity: {
        kind: "account",
        member: { slug: "tiago", displayName: "Tiago Costa", avatarUrl: null },
      },
    },
    {
      shownAsSubprofileId: "sp-late-bloomers",
      identity: {
        kind: "persona",
        persona: {
          id: "sp-late-bloomers",
          handle: "late-bloomers",
          name: "Late Bloomers",
          kind: "band",
          avatarUrl: null,
          isLinkable: true,
        },
      },
    },
    {
      shownAsSubprofileId: "sp-unknown",
      identity: { kind: "team" } as unknown as StudioSupporterIdentityDTO,
    },
    {
      shownAsSubprofileId: "sp-mariana",
      identity: {
        kind: "persona",
        persona: {
          id: "sp-mariana",
          handle: "mariana-sol",
          name: "Mariana Sol",
          kind: "musician",
          avatarUrl: null,
          isLinkable: true,
        },
      },
    },
  ],
};

describe("toSupporterIdentityView", () => {
  it("reads an account with its profile link, and no link for an empty slug", () => {
    const view = toSupporterIdentityView({
      kind: "account",
      member: { slug: "anika", displayName: " Anika Kovač ", avatarUrl: null },
    });
    expect(view).toMatchObject({
      kind: "account",
      key: SUPPORTER_ACCOUNT_KEY,
      name: "Anika Kovač",
      href: "/members/anika",
    });
    expect(
      toSupporterIdentityView({
        kind: "account",
        member: { slug: "", displayName: "Rita", avatarUrl: null },
      })?.href,
    ).toBeNull();
  });
  it("links a listenable persona to its page and leaves the rest unlinked", () => {
    const persona = {
      id: "sp-1",
      handle: "vanda-diesel",
      name: "Vanda Diesel",
      kind: "drag",
      avatarUrl: "https://x/a.jpg",
      isLinkable: true,
    };
    expect(toSupporterIdentityView({ kind: "persona", persona })).toMatchObject(
      { key: "sp-1", href: "/p/vanda-diesel", avatarUrl: "https://x/a.jpg" },
    );
    expect(
      toSupporterIdentityView({
        kind: "persona",
        persona: { ...persona, isLinkable: false },
      })?.href,
    ).toBeNull();
    expect(
      toSupporterIdentityView({
        kind: "persona",
        persona: { ...persona, handle: "" },
      })?.href,
    ).toBeNull();
  });
  it("reads an unknown identity kind as nothing", () => {
    expect(
      toSupporterIdentityView({
        kind: "team",
      } as unknown as StudioSupporterIdentityDTO),
    ).toBeNull();
  });
});

describe("toListeningSummaryView", () => {
  it("keeps the listener's own counts exact, small ones included", () => {
    const view = toListeningSummaryView(
      { ...summaryDto, totalListens: 3, listeningDays: 2 },
      "4w",
    );
    expect([view.totalListens, view.listeningDays]).toEqual([3, 2]);
    expect(view.topArtists[0]?.listens).toBe(3);
  });
  it("reads odd counts as whole numbers from 0 and keeps the asked range for an unknown one", () => {
    const view = toListeningSummaryView(
      { ...summaryDto, range: "1y", totalListens: -4, listeningDays: 2.8 },
      "6m",
    );
    expect([view.range, view.totalListens, view.listeningDays]).toEqual([
      "6m",
      0,
      2,
    ]);
  });
  it("caps both lists at ten and calls a range with no listens empty", () => {
    const view = toListeningSummaryView(
      { ...summaryDto, topArtists: elevenArtists },
      "4w",
    );
    expect(view.topArtists).toHaveLength(10);
    expect(
      toListeningSummaryView(
        {
          range: "4w",
          totalListens: 0,
          listeningDays: 0,
          topArtists: [],
          topTracks: [],
        },
        "4w",
      ).isEmpty,
    ).toBe(true);
  });
});

describe("recent listens", () => {
  it("keeps an unavailable row and drops one whose time it cannot read", () => {
    const page = listensPageOf({
      items: [
        { id: "l1", playedAt: "2026-10-20T08:00:00.000Z", track: null },
        { id: "l2", playedAt: "soon", track: trackDto },
      ],
      nextCursor: "c2",
    });
    expect(page.items.map((item) => item.id)).toEqual(["l1"]);
    expect(page.pageInfo).toEqual({ nextCursor: "c2", hasMore: true });
    expect(toListenView(page.items[0]!).track).toBeNull();
  });
});

describe("supporting and the supporter state", () => {
  it("reads support links through the artist page's rule and drops a row with no readable identity", () => {
    const views = toSupportingViews({
      items: [
        supportingDto,
        { ...supportingDto, shownAs: { kind: "team" } as never },
      ],
    });
    expect(views).toHaveLength(1);
    const supportLinks = views[0]?.supportLinks ?? [];
    expect(supportLinks.length).toBeGreaterThan(0);
    expect(
      supportLinks.every((link) => link.href?.startsWith("https://")),
    ).toBe(true);
  });
  it("keeps the options in server order with the account first", () => {
    const view = toSupporterStateView(stateDto);
    expect(view.options.map((option) => option.identity.key)).toEqual([
      "account",
      "sp-late-bloomers",
      "sp-mariana",
    ]);
    expect(view.since).toBeNull();
  });
});
