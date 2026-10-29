import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_STORAGE_KEY } from "../../marketing/cookies.data";
import { TestProviders } from "../../../test/TestProviders";
import type {
  StudioLandingPersonaView,
  StudioLandingPhotoView,
  StudioLandingView,
} from "../api/studioLanding.adapters";
import {
  STUDIO_LANDING_LISTEN_ID,
  STUDIO_LANDING_STORY_HEADING_ID,
  STUDIO_LANDING_STORY_ID,
  type StudioLandingAudience,
} from "./studioLanding.data";
import { StudioLandingHero } from "./StudioLandingHero";

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

const STATUS_TEXT = "Free for members. Our team opens access in waves.";
const LISTEN_HEADING = "Hear it first stub";
const STORY_HEADING = "How it works stub";

const PERSONA: StudioLandingPersonaView = {
  name: "Mar Salgado",
  handle: "mar-salgado",
  kindLabelKey: null,
  avatarUrl: null,
  initials: "MS",
  tint: "coral",
  personaHref: null,
};

const HERO_PHOTO: StudioLandingPhotoView = {
  url: "https://media.example/hero.jpg",
  altText: {
    en: "Mar Salgado singing at a QueerPulse event",
    pt: "Mar Salgado a cantar num evento QueerPulse",
  },
  credit: "Rita Lopes",
};

function landingWith({
  hasPreviews = false,
  heroPhoto = null,
}: {
  hasPreviews?: boolean;
  heroPhoto?: StudioLandingPhotoView | null;
}): StudioLandingView {
  return {
    counts: { artists: null, releases: null, eventsThisMonth: null },
    isProofShown: false,
    nextEvent: null,
    previews: hasPreviews
      ? [
          {
            id: "preview-1",
            trackTitle: "Maré",
            durationSeconds: 30,
            coverUrl: null,
            coverTint: "coral",
            artist: PERSONA,
          },
        ]
      : [],
    artists: [],
    isArtistsShown: false,
    photos: { hero: heroPhoto, manifesto: null },
  };
}

function renderHero({
  isSignedIn = false,
  audience = "listener",
}: { isSignedIn?: boolean; audience?: StudioLandingAudience } = {}) {
  if (!isSignedIn) localStorage.setItem(AUTH_STORAGE_KEY, "false");
  const onAudienceChange = vi.fn<(next: StudioLandingAudience) => void>();
  render(
    <TestProviders>
      <StudioLandingHero
        audience={audience}
        onAudienceChange={onAudienceChange}
      />
      <section id={STUDIO_LANDING_LISTEN_ID}>
        <h2 id={`${STUDIO_LANDING_LISTEN_ID}-heading`} tabIndex={-1}>
          {LISTEN_HEADING}
        </h2>
      </section>
      <section id={STUDIO_LANDING_STORY_ID}>
        <h2 id={STUDIO_LANDING_STORY_HEADING_ID} tabIndex={-1}>
          {STORY_HEADING}
        </h2>
      </section>
    </TestProviders>,
  );
  return { onAudienceChange };
}

beforeEach(() => {
  mocks.landing = null;
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("StudioLandingHero", () => {
  it("has the page's one h1", async () => {
    renderHero();
    expect(await screen.findAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("the listener audience reads the listener title and lede", async () => {
    renderHero();
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /The queer music scene of Lisbon/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Hear the artists you'll see on Friday/),
    ).toBeInTheDocument();
  });

  it("the artist audience swaps the title and lede", async () => {
    renderHero({ audience: "artist" });
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /Release your music where your community already is/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /release under a stage name no other member can tie to you/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Hear the artists you'll see on Friday/),
    ).toBeNull();
  });

  it("the switch is a named group whose other option calls back", async () => {
    const { onAudienceChange } = renderHero();
    expect(
      await screen.findByRole("group", { name: "What brings you to Studio" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "I listen" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "I make music" }));
    expect(onAudienceChange).toHaveBeenCalledWith("artist");
  });

  it("a signed-out visitor sees the access status", async () => {
    renderHero();
    expect(await screen.findByText(STATUS_TEXT)).toBeInTheDocument();
  });

  it("a signed-in member sees the access request and no status pill", async () => {
    renderHero({ isSignedIn: true });
    expect(
      await screen.findByRole("button", { name: "Request Studio access" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(STATUS_TEXT)).toBeNull();
  });

  it("Hear it first points at the previews when there are some", async () => {
    mocks.landing = landingWith({ hasPreviews: true });
    renderHero();
    expect(
      await screen.findByRole("link", { name: "Hear it first" }),
    ).toHaveAttribute("href", "#studio-hear-it-first");
  });

  it("See inside points at the story without previews", async () => {
    mocks.landing = landingWith({ hasPreviews: false });
    renderHero();
    expect(
      await screen.findByRole("link", { name: "See inside" }),
    ).toHaveAttribute("href", "#studio-how-it-works");
  });

  it("See inside scrolls to the story and focuses its heading", async () => {
    // src/test/setup.ts stubs scrollIntoView on Element.prototype; the spy
    // wraps that stub and vi.restoreAllMocks() puts it back after the test.
    const scrollIntoView = vi
      .spyOn(Element.prototype, "scrollIntoView")
      .mockImplementation(() => undefined);
    renderHero();
    fireEvent.click(await screen.findByRole("link", { name: "See inside" }));
    expect(scrollIntoView).toHaveBeenCalled();
    expect(document.getElementById(STUDIO_LANDING_STORY_HEADING_ID)).toBe(
      document.activeElement,
    );
  });

  it("Hear it first focuses the previews heading", async () => {
    vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(
      () => undefined,
    );
    mocks.landing = landingWith({ hasPreviews: true });
    renderHero();
    fireEvent.click(await screen.findByRole("link", { name: "Hear it first" }));
    expect(screen.getByText(LISTEN_HEADING)).toBe(document.activeElement);
  });

  it("with a hero photo, shows the photo with its alt text and credit", async () => {
    mocks.landing = landingWith({ heroPhoto: HERO_PHOTO });
    renderHero();
    const photo = await screen.findByRole("img", {
      name: "Mar Salgado singing at a QueerPulse event",
    });
    expect(photo).toHaveAttribute("src", HERO_PHOTO.url);
    expect(await screen.findByText("Photo: Rita Lopes")).toBeInTheDocument();
  });

  it("with a hero photo in Portuguese, reads the pt alt text", async () => {
    localStorage.setItem("qp.lang", "pt");
    mocks.landing = landingWith({ heroPhoto: HERO_PHOTO });
    renderHero();
    expect(
      await screen.findByRole("img", {
        name: "Mar Salgado a cantar num evento QueerPulse",
      }),
    ).toBeInTheDocument();
  });
});
