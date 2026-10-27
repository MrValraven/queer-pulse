import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { toArtistRefView } from "../api/studio.adapters";
import type {
  StudioMilestoneCardView,
  StudioMilestoneView,
} from "../api/studioDashboard.adapters";
import type { StudioLoadState } from "../api/studioLoadState";
import { studioArtistPath } from "../studioPaths";
import { StudioShareCard } from "./StudioShareCard";
import { studioMilestoneTarget } from "./studioLinkTarget";

function loadState(overrides: Partial<StudioLoadState> = {}): StudioLoadState {
  return {
    isLoading: false,
    isError: false,
    isRetrying: false,
    isNotFound: false,
    isWithdrawn: false,
    retry: () => {},
    ...overrides,
  };
}

const mocks = vi.hoisted(() => ({
  access: {
    status: "granted",
    hasAccess: true,
    isPending: false,
    uploadablePersonas: [] as unknown[],
  },
  card: null as StudioMilestoneCardView | null,
  cardState: null as StudioLoadState | null,
  useStudioMilestoneCard: vi.fn(),
}));

vi.mock("../api/useStudioAccess", () => ({
  useStudioAccess: () => mocks.access,
}));
vi.mock("../api/useStudioMilestoneCard", () => ({
  useStudioMilestoneCard: (milestoneId: string) => {
    mocks.useStudioMilestoneCard(milestoneId);
    return { card: mocks.card, loadState: mocks.cardState };
  },
}));

/** One milestone card of persona p1, reached on 20 Oct 2026. */
function cardView({
  personaName,
  kind,
  threshold,
}: {
  personaName: string;
  kind: StudioMilestoneView["kind"];
  threshold: number;
}): StudioMilestoneCardView {
  return {
    milestone: {
      id: "m1",
      kind,
      threshold,
      track: null,
      reachedAt: new Date("2026-10-20T12:00:00.000Z"),
    },
    artist: toArtistRefView({
      id: "p1",
      handle: "midnight-static",
      name: personaName,
      kind: "musician",
      avatarUrl: null,
    }),
  };
}

function renderCard() {
  return render(
    <TestProviders>
      <StudioShareCard
        target={studioMilestoneTarget("p1", "m1")}
        surface="chat"
      />
    </TestProviders>,
  );
}

beforeEach(() => {
  mocks.access = {
    status: "granted",
    hasAccess: true,
    isPending: false,
    uploadablePersonas: [],
  };
  mocks.card = cardView({
    personaName: "Midnight Static",
    kind: "followers",
    threshold: 100,
  });
  mocks.cardState = loadState();
  mocks.useStudioMilestoneCard.mockClear();
});

describe("StudioShareMilestoneCard", () => {
  it("shows the milestone sentence and links to the artist page", async () => {
    mocks.card = cardView({
      personaName: "Midnight Static",
      kind: "followers",
      threshold: 100,
    });
    renderCard();
    const link = await screen.findByRole("link", {
      name: "Open Midnight Static passed 100 followers in Studio",
    });
    expect(link).toHaveAttribute("href", studioArtistPath("p1"));
    expect(screen.getByText("Studio milestone")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /play/i })).toBeNull();
    expect(mocks.useStudioMilestoneCard).toHaveBeenCalledWith("m1");
  });

  it("shows the sentence on up to three lines with no byline or date", async () => {
    mocks.card = cardView({
      personaName: "Midnight Static",
      kind: "artist_plays",
      threshold: 10000,
    });
    renderCard();
    const link = await screen.findByRole("link", {
      name: "Open Midnight Static passed 10,000 plays in Studio",
    });
    expect(link).toHaveAttribute("data-title-lines", "3");
    expect(link).toHaveTextContent("Midnight Static passed 10,000 plays");
    expect(screen.queryByText("By Midnight Static")).toBeNull();
    expect(screen.queryByText(/Reached/)).toBeNull();
    expect(screen.queryByText(/2026/)).toBeNull();
  });

  it("says Not available for a refused card and offers no retry", async () => {
    mocks.card = null;
    mocks.cardState = loadState({ isNotFound: true });
    renderCard();
    expect(await screen.findByText("Not available")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });

  it("shows the teaser without a grant and reads nothing", () => {
    mocks.access = { ...mocks.access, hasAccess: false };
    renderCard();
    expect(
      screen.getByText("From QueerPulse Studio, open to members with access"),
    ).toBeInTheDocument();
    expect(mocks.useStudioMilestoneCard).not.toHaveBeenCalled();
  });
});
