import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_STORAGE_KEY } from "../../marketing/cookies.data";
import { TestProviders } from "../../../test/TestProviders";
import {
  toStudioLandingView,
  type StudioLandingView,
} from "../api/studioLanding.adapters";
import type {
  StudioLandingArtistCardDTO,
  StudioLandingDTO,
} from "../api/studioLanding.types";
import { StudioLandingArtists } from "./StudioLandingArtists";

const mocks: { landing: StudioLandingView | null; isDemo: boolean } =
  vi.hoisted(() => ({ landing: null, isDemo: false }));

vi.mock("../api/useStudioLanding", () => ({
  useStudioLanding: () => ({
    landing: mocks.landing,
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({
    demoMode: mocks.isDemo,
    available: false,
    setDemoMode: () => undefined,
    toggle: () => undefined,
  }),
}));

function cardOf(
  id: string,
  overrides: Partial<StudioLandingArtistCardDTO> = {},
  handle = id,
): StudioLandingArtistCardDTO {
  return {
    id,
    artist: {
      name: `Artist ${id}`,
      handle,
      kind: "musician",
      avatarUrl: null,
    },
    quote: null,
    isFoundingArtist: false,
    ...overrides,
  };
}

function setCards(cards: StudioLandingArtistCardDTO[]) {
  const dto: StudioLandingDTO = {
    counts: { artists: null, releases: null, eventsThisMonth: null },
    nextEvent: null,
    previews: [],
    artists: cards,
    photos: { hero: null, manifesto: null },
  };
  mocks.landing = toStudioLandingView(dto);
}

function renderSection() {
  return render(
    <TestProviders>
      <StudioLandingArtists />
    </TestProviders>,
  );
}

beforeEach(() => {
  mocks.landing = null;
  mocks.isDemo = false;
});

afterEach(() => {
  localStorage.clear();
});

describe("StudioLandingArtists", () => {
  it("hides the section with one card and shows it with two", async () => {
    setCards([cardOf("one")]);
    const { unmount } = renderSection();
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
    unmount();

    setCards([cardOf("one"), cardOf("two")]);
    renderSection();
    expect(
      await screen.findByRole("heading", { level: 2, name: /on Studio/ }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
  });

  it("gives a visitor's card no link", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    setCards([cardOf("one"), cardOf("two")]);
    renderSection();
    await screen.findByRole("heading", { level: 3, name: "Artist one" });
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("links a member's card name to the persona page, one link per card", async () => {
    setCards([cardOf("one"), cardOf("two", {}, "")]);
    renderSection();
    const linkedCard = (
      await screen.findByRole("heading", { level: 3, name: "Artist one" })
    ).closest("li") as HTMLElement;
    const links = within(linkedCard).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/p/one");
    expect(links[0]).toHaveTextContent("Artist one");

    const unlinkedCard = screen
      .getByRole("heading", { level: 3, name: "Artist two" })
      .closest("li") as HTMLElement;
    expect(within(unlinkedCard).queryAllByRole("link")).toHaveLength(0);
  });

  it("keeps the read's order and marks the founding card", async () => {
    setCards([
      cardOf("first", { isFoundingArtist: true }),
      cardOf("second"),
      cardOf("third"),
    ]);
    renderSection();
    const names = (await screen.findAllByRole("heading", { level: 3 })).map(
      (heading) => heading.textContent,
    );
    expect(names).toEqual(["Artist first", "Artist second", "Artist third"]);
    expect(screen.getAllByText("Founding artist")).toHaveLength(1);
    const firstCard = screen
      .getByRole("heading", { level: 3, name: "Artist first" })
      .closest("li") as HTMLElement;
    expect(within(firstCard).getByText("Founding artist")).toBeInTheDocument();
  });

  it("renders a quote inside a blockquote", async () => {
    setCards([
      cardOf("one", { quote: "we found each other through the music" }),
      cardOf("two"),
    ]);
    renderSection();
    const quote = await screen.findByText(
      "we found each other through the music",
    );
    expect(quote.closest("blockquote")).not.toBeNull();
    expect(document.querySelectorAll("blockquote")).toHaveLength(1);
  });

  it("renders no kind line for a null kind and no city anywhere", async () => {
    setCards([
      cardOf("one", {
        artist: {
          name: "Mara Voss",
          handle: "mara",
          kind: "unknown_kind",
          avatarUrl: null,
        },
      }),
      cardOf("two"),
    ]);
    renderSection();
    const kindlessCard = (
      await screen.findByRole("heading", { level: 3, name: "Mara Voss" })
    ).closest("li") as HTMLElement;
    expect(kindlessCard.textContent).toBe("MVMara Voss");

    const kindCard = screen
      .getByRole("heading", { level: 3, name: "Artist two" })
      .closest("li") as HTMLElement;
    expect(kindCard.textContent).toBe("ATArtist twoMusician");
    expect(kindCard.textContent).not.toMatch(/Lisbon|Porto|city/i);
  });

  it("shows the sample note in demo and never in live", async () => {
    setCards([cardOf("one"), cardOf("two")]);
    mocks.isDemo = true;
    const { unmount } = renderSection();
    expect(await screen.findByText(/artists, tracks, quotes/)).toBeTruthy();
    unmount();

    mocks.isDemo = false;
    renderSection();
    await screen.findByRole("heading", { level: 2 });
    expect(screen.queryByText(/artists, tracks, quotes/)).toBeNull();
  });
});
