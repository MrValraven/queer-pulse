import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toArtistRefView } from "./api/studio.adapters";
import type { StudioArtistRefDTO } from "./api/studio.types";
import type { StudioMilestoneView } from "./api/studioDashboard.adapters";
import type { StudioLoadState } from "./api/studioLoadState";
import { DEMO_ARTIST_MARIANA } from "./api/studioDemoMe.data";
import { StudioMilestonesCard } from "./StudioMilestonesCard";

/** The demo hook runs unless a test sets `milestones`, which then replaces
 *  what it returns, so a test can hold any list the demo seeds lack. */
const mocks = vi.hoisted(() => ({
  milestones: undefined as StudioMilestoneView[] | undefined,
}));

vi.mock("./api/useStudioMilestones", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./api/useStudioMilestones")>();
  return {
    useStudioMilestones: (subprofileId: string) => {
      const demoResult = actual.useStudioMilestones(subprofileId);
      if (mocks.milestones === undefined) return demoResult;
      return { milestones: mocks.milestones, loadState: settledLoadState() };
    },
  };
});

function settledLoadState(): StudioLoadState {
  return {
    isLoading: false,
    isError: false,
    isRetrying: false,
    isNotFound: false,
    isWithdrawn: false,
    retry: () => {},
  };
}

/** Follower milestones from 10 up, newest first, all reached last year. */
function followerMilestones(count: number): StudioMilestoneView[] {
  return Array.from({ length: count }, (_unused, position) => ({
    id: `milestone-${position}`,
    kind: "followers" as const,
    threshold: (count - position) * 10,
    track: null,
    reachedAt: new Date(Date.UTC(2025, 0, count - position)),
  }));
}

beforeEach(() => {
  mocks.milestones = undefined;
});

/** Demo mode through TestProviders: the demo seeds are relative to now. */
function renderCard(persona: StudioArtistRefDTO) {
  return render(
    <TestProviders>
      <StudioMilestonesCard persona={toArtistRefView(persona)} />
    </TestProviders>,
  );
}

describe("StudioMilestonesCard", () => {
  it("lists Mariana's milestones newest first with a New marker on the recent one", async () => {
    renderCard(DEMO_ARTIST_MARIANA);
    const items = await screen.findAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Mariana Sol passed 1,000 followers");
    expect(within(items[0]!).getByText("New")).toBeInTheDocument();
    expect(within(items[1]!).queryByText("New")).toBeNull();
    expect(
      screen.getByText(
        "Mariana Sol landed on a public playlist for the first time",
      ),
    ).toBeInTheDocument();
  });

  it("opens the share dialog for one milestone, its card included", async () => {
    renderCard(DEMO_ARTIST_MARIANA);
    const [firstShare] = await screen.findAllByRole("button", {
      name: "Share milestone",
    });
    expect(firstShare).toHaveAccessibleDescription(
      "Mariana Sol passed 1,000 followers",
    );
    fireEvent.click(firstShare!);
    expect(
      await screen.findByRole("dialog", { name: "Share milestone" }),
    ).toBeInTheDocument();
  });

  it("tells a persona with none when the first milestone comes", async () => {
    mocks.milestones = [];
    renderCard(DEMO_ARTIST_MARIANA);
    expect(
      await screen.findByText("Your first milestone comes at 10 followers"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).toBeNull();
  });

  it("shows the first four milestones and folds the rest behind a toggle", async () => {
    mocks.milestones = followerMilestones(6);
    renderCard(DEMO_ARTIST_MARIANA);
    expect(await screen.findAllByRole("listitem")).toHaveLength(4);
    expect(screen.queryByText("Mariana Sol passed 20 followers")).toBeNull();

    const showAll = screen.getByRole("button", { name: "Show all milestones" });
    expect(showAll).toHaveAttribute("aria-expanded", "false");
    const restId = showAll.getAttribute("aria-controls");
    expect(restId).toBeTruthy();
    fireEvent.click(showAll);

    const showFewer = await screen.findByRole("button", {
      name: "Show fewer milestones",
    });
    expect(showFewer).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    const rest = document.getElementById(restId!);
    expect(rest).toHaveTextContent("Mariana Sol passed 20 followers");
    expect(rest).toHaveTextContent("Mariana Sol passed 10 followers");

    fireEvent.click(showFewer);
    await waitFor(() =>
      expect(screen.getAllByRole("listitem")).toHaveLength(4),
    );
    expect(
      screen.getByRole("button", { name: "Show all milestones" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("offers no toggle when four milestones or fewer are reached", async () => {
    mocks.milestones = followerMilestones(4);
    renderCard(DEMO_ARTIST_MARIANA);
    expect(await screen.findAllByRole("listitem")).toHaveLength(4);
    expect(
      screen.queryByRole("button", { name: "Show all milestones" }),
    ).toBeNull();
  });
});
