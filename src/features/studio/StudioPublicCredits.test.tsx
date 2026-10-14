import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toTrackView } from "./api/studio.adapters";
import type { StudioTrackDTO } from "./api/studio.types";
import { resetDemoCreditLedger } from "./api/studioDemoCreditLedger";
import { StudioAlbumPage } from "./StudioAlbumPage";
import { StudioTrackSidebar } from "./StudioTrackSidebar";

vi.mock("./useStudioShowcase", () => ({ useStudioShowcase: () => false }));

const trackDto: StudioTrackDTO = {
  id: "track-6",
  position: 6,
  title: "Carta para a santa",
  durationSeconds: 258,
  isExplicit: false,
  hasAudio: true,
  releaseId: "release-1",
  credits: [{ name: "Ana", role: "cello" }],
  lyrics: null,
  syncedLyrics: null,
  chapters: null,
  release: {
    id: "release-1",
    title: "Cidade dos santos",
    type: "album",
    coverUrl: null,
    releasedOn: "2026-04-12",
    trackCount: 11,
    totalDurationSeconds: 2400,
    artist: {
      id: "persona-mariana",
      handle: "",
      name: "Mariana Sol",
      kind: "musician",
      avatarUrl: null,
    },
    publishedAt: "2026-04-12T10:00:00.000Z",
    genre: "fado",
    mood: null,
    scene: null,
  },
  personaCredits: [
    {
      persona: {
        id: "sp-nightform",
        handle: "nightform",
        name: "NIGHTFORM",
        kind: "musician",
        avatarUrl: null,
        isListenable: true,
      },
      role: "producer",
    },
    {
      persona: {
        id: "sp-grain",
        handle: "grain-studio",
        name: "GRAIN",
        kind: "visual_artist",
        avatarUrl: null,
        isListenable: false,
      },
      role: "cover-art",
    },
    {
      persona: {
        id: "sp-coro",
        handle: "",
        name: "Coro de Outubro",
        kind: "musician",
        avatarUrl: null,
        isListenable: false,
      },
      role: "featured",
    },
  ],
};

function renderSidebar(dto: StudioTrackDTO) {
  render(
    <TestProviders>
      <StudioTrackSidebar track={toTrackView(dto)} />
    </TestProviders>,
  );
}

beforeEach(() => resetDemoCreditLedger());

describe("public persona credits", () => {
  it("leads the track's credits with linked persona chips, then the free-text rows", async () => {
    renderSidebar(trackDto);
    const chips = await screen.findByRole("list", {
      name: "Credited personas",
    });
    expect(
      within(chips).getByRole("link", { name: /NIGHTFORM/ }),
    ).toHaveAttribute("href", "/studio/artist?id=sp-nightform");
    expect(within(chips).getByRole("link", { name: /GRAIN/ })).toHaveAttribute(
      "href",
      "/p/grain-studio",
    );
    expect(within(chips).getByText("Cover art")).toBeInTheDocument();
    expect(
      within(chips).queryByRole("link", { name: /Coro de Outubro/ }),
    ).toBeNull();
    expect(within(chips).getByText("Coro de Outubro")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.queryByText("No credits yet")).toBeNull();
  });

  it("says No credits yet when the track has neither kind", async () => {
    renderSidebar({ ...trackDto, credits: [], personaCredits: [] });
    expect(await screen.findByText("No credits yet")).toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "Credited personas" }),
    ).toBeNull();
  });

  it("sums the release's accepted credits on the album page", async () => {
    render(
      <TestProviders
        initialEntries={["/studio/album?id=demo-release-cidade-dos-santos"]}
      >
        <StudioAlbumPage />
      </TestProviders>,
    );
    const summary = await screen.findByRole("region", { name: "Credits" });
    expect(
      within(summary).getByRole("link", { name: "NIGHTFORM" }),
    ).toHaveAttribute("href", "/studio/artist?id=sp-diogo-nightform");
    expect(within(summary).getByText("Producer")).toBeInTheDocument();
    expect(within(summary).getByText("Cover art")).toBeInTheDocument();
  });
});
