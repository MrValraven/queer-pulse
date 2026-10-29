import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { AUTH_STORAGE_KEY } from "../../marketing/cookies.data";
import type {
  StudioLandingNextEventView,
  StudioLandingView,
} from "../api/studioLanding.adapters";
import { StudioLandingProof } from "./StudioLandingProof";

const mocks: { landing: StudioLandingView | null } = vi.hoisted(() => ({
  landing: null,
}));

vi.mock("../api/useStudioLanding", () => ({
  useStudioLanding: () => ({
    landing: mocks.landing,
    isLoading: false,
    isError: false,
  }),
}));

function nextEventOf(
  overrides: Partial<StudioLandingNextEventView> = {},
): StudioLandingNextEventView {
  return {
    slug: "friday-night-lisbon",
    title: "Friday Night Lisbon",
    // 22:00 on a Lisbon summer evening (UTC+1) is 21:00 UTC.
    startAt: new Date("2026-07-10T21:00:00Z"),
    timezone: "Europe/Lisbon",
    area: "Principe Real",
    isOnline: false,
    artist: {
      name: "Lua Cardoso",
      handle: "lua-cardoso",
      kindLabelKey: null,
      avatarUrl: "https://example.test/lua.jpg",
      initials: "LC",
      tint: "plum",
      personaHref: "/p/lua-cardoso",
    },
    ...overrides,
  };
}

function landingOf(overrides: {
  counts?: Partial<StudioLandingView["counts"]>;
  nextEvent?: StudioLandingNextEventView | null;
}): StudioLandingView {
  const counts = {
    artists: 14,
    releases: 37,
    eventsThisMonth: 6,
    ...overrides.counts,
  };
  return {
    counts,
    isProofShown: counts.artists !== null,
    nextEvent: overrides.nextEvent ?? null,
    previews: [],
    artists: [],
    isArtistsShown: false,
    photos: { hero: null, manifesto: null },
  };
}

function renderProof() {
  return render(
    <TestProviders>
      <StudioLandingProof />
    </TestProviders>,
  );
}

afterEach(() => {
  vi.unstubAllEnvs();
  mocks.landing = null;
  localStorage.clear();
});

describe("StudioLandingProof strip", () => {
  it("lists the three public counts", async () => {
    mocks.landing = landingOf({});
    renderProof();
    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("14 artists");
    expect(items[1]).toHaveTextContent("37 releases");
    expect(items[2]).toHaveTextContent(
      "6 events with Studio artists this month",
    );
  });

  it("leaves out an item whose count is null", async () => {
    mocks.landing = landingOf({ counts: { releases: null } });
    renderProof();
    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(screen.queryByText(/releases/)).toBeNull();
  });

  it("hides the strip and keeps the next event when the artist count is null", async () => {
    mocks.landing = landingOf({
      counts: { artists: null },
      nextEvent: nextEventOf(),
    });
    renderProof();
    expect(
      await screen.findByRole("heading", {
        level: 3,
        name: "Friday Night Lisbon",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("renders nothing without a strip or a next event", () => {
    mocks.landing = landingOf({ counts: { artists: null } });
    renderProof();
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("labels the section with a hidden heading", async () => {
    mocks.landing = landingOf({});
    renderProof();
    const section = await screen.findByRole("region", {
      name: "Studio in numbers",
    });
    expect(
      within(section).getByRole("heading", { level: 2 }),
    ).toHaveTextContent("Studio in numbers");
  });
});

describe("StudioLandingNextEvent", () => {
  it("sends a visitor to the request-invite path", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    mocks.landing = landingOf({ nextEvent: nextEventOf() });
    renderProof();
    const link = await screen.findByRole("link", {
      name: "Request an invite to see this event",
    });
    expect(link).toHaveAttribute(
      "href",
      "/auth/request-invite?from=studio_landing",
    );
  });

  it("sends a member to the event page", async () => {
    mocks.landing = landingOf({ nextEvent: nextEventOf() });
    renderProof();
    const link = await screen.findByRole("link", { name: "Open the event" });
    expect(link.getAttribute("href")).toMatch(
      /^\/gatherings\/friday-night-lisbon-[0-9a-z]{5}$/,
    );
  });

  it("reads the time in the event's timezone", async () => {
    // The run's own zone is UTC (21:00 here); only the event's timeZone gives 22:00.
    vi.stubEnv("TZ", "UTC");
    mocks.landing = landingOf({ nextEvent: nextEventOf() });
    renderProof();
    expect(await screen.findByText(/22:00/)).toHaveTextContent(/Friday.*22:00/);
  });

  it("shows the area, the artist name and the eyebrow", async () => {
    mocks.landing = landingOf({ nextEvent: nextEventOf() });
    renderProof();
    expect(await screen.findByText("Principe Real")).toBeInTheDocument();
    expect(screen.getByText("With Lua Cardoso")).toBeInTheDocument();
    expect(screen.getByText("Next on stage")).toBeInTheDocument();
  });

  it("reads Online for an online event", async () => {
    mocks.landing = landingOf({
      nextEvent: nextEventOf({ isOnline: true, area: null }),
    });
    renderProof();
    expect(await screen.findByText("Online")).toBeInTheDocument();
    expect(screen.queryByText("Principe Real")).toBeNull();
  });

  it("renders initials for a null avatar and keeps the persona name plain text", async () => {
    mocks.landing = landingOf({
      nextEvent: nextEventOf({
        artist: { ...nextEventOf().artist, avatarUrl: null },
      }),
    });
    renderProof();
    expect(await screen.findByText("LC")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Lua Cardoso/ })).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});
