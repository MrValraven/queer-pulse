import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { StudioScenePage } from "./StudioScenePage";

const pageControl = vi.hoisted(() => ({
  isSceneEmpty: false,
  shouldReleasesFail: false,
}));
vi.mock("./api/studioDemoDiscovery", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/studioDemoDiscovery")>();
  return {
    ...original,
    demoStudioSceneReleases: (slug: string, cursor: string | null) => {
      if (pageControl.shouldReleasesFail) throw new Error("releases failed");
      if (pageControl.isSceneEmpty)
        return { items: [], pageInfo: { nextCursor: null, hasMore: false } };
      return original.demoStudioSceneReleases(slug, cursor);
    },
  };
});

afterEach(() => {
  pageControl.isSceneEmpty = false;
  pageControl.shouldReleasesFail = false;
});

/** Reads the player's queue, so a test can see what Play scene queued. */
function QueueProbe() {
  const player = useStudioPlayer();
  const queuedItems = [
    ...(player.queue.current ? [player.queue.current] : []),
    ...player.queue.upcomingSourceItems,
  ];
  const releaseCount = new Set(queuedItems.map((item) => item.releaseId)).size;
  return <p data-testid="queued-releases">{releaseCount}</p>;
}

function renderAt(path: string) {
  render(
    <TestProviders initialEntries={[path]}>
      <StudioScenePage />
      <QueueProbe />
    </TestProviders>,
  );
}

describe("StudioScenePage (demo)", () => {
  it("shows the scene, its releases, its artists and its upcoming events", async () => {
    renderAt("/studio/scene?slug=mouraria-fado");
    expect(
      await screen.findByRole("heading", { level: 1, name: "Mouraria fado" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/tascas and kitchens/)).toBeInTheDocument();
    const releases = await screen.findByRole("region", { name: "Releases" });
    expect(
      within(releases).getByRole("link", { name: "Cidade dos santos" }),
    ).toHaveAttribute(
      "href",
      "/studio/album?id=demo-release-cidade-dos-santos",
    );
    const artists = screen.getByRole("region", {
      name: /artists in this scene/i,
    });
    expect(
      within(artists).getByRole("link", { name: /Mariana Sol/ }),
    ).toBeInTheDocument();
    const events = screen.getByRole("region", { name: "Upcoming events" });
    expect(
      within(events).getByRole("link", { name: /Queer Supper Club/ }),
    ).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/gatherings\/supper-club-12-/),
    );
  });

  it("queues every loaded release from Play scene", async () => {
    renderAt("/studio/scene?slug=mouraria-fado");
    await screen.findByRole("link", { name: "Cidade dos santos" });
    fireEvent.click(screen.getByRole("button", { name: "Play scene" }));
    await waitFor(() =>
      expect(screen.getByTestId("queued-releases")).toHaveTextContent("3"),
    );
  });

  it("folds the events section for a scene with none", async () => {
    renderAt("/studio/scene?slug=porto-warehouse");
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Warehouse nights",
      }),
    ).toBeInTheDocument();
    // Events come with the scene itself, so once the scene and its
    // releases are on screen the fold below is settled.
    await screen.findByRole("region", { name: "Releases" });
    await screen.findByRole("link", { name: "Bicha, with love" });
    expect(
      screen.queryByRole("region", { name: "Upcoming events" }),
    ).toBeNull();
  });

  it("says so when a scene has no releases yet and holds Play scene", async () => {
    pageControl.isSceneEmpty = true;
    renderAt("/studio/scene?slug=porto-warehouse");
    expect(
      await screen.findByText("No releases in this scene yet"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play scene" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("offers Retry when the releases cannot load", async () => {
    pageControl.shouldReleasesFail = true;
    renderAt("/studio/scene?slug=mouraria-fado");
    expect(
      await screen.findByRole("button", { name: /try again|retry/i }),
    ).toBeInTheDocument();
  });

  it.each([
    "/studio/scene?slug=sintra-choirs",
    "/studio/scene?slug=nowhere",
    "/studio/scene",
  ])("says the scene cannot be found for %s", async (path) => {
    renderAt(path);
    expect(
      await screen.findByText("We can't find that scene"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to Studio home" }),
    ).toHaveAttribute("href", "/studio");
  });
});
