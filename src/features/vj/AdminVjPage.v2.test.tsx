import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "../../app/routeMap";
import { TestProviders } from "../../test/TestProviders";
import { AdminVjPage } from "./AdminVjPage";
import { createVjDemoChannelHub } from "./demo/vjDemoChannel";
import { VJ_DEMO_EVENT_IDS } from "./demo/vjDemoEvents.data";
import {
  configureVjDemoStore,
  demoGetVjClips,
  demoGetVjPacks,
  resetVjDemoLibrary,
} from "./demo/vjDemoStore";

const SLOW_STEP = { timeout: 4000 };
const PORTFOLIO_NIGHT = "Portfolio Night: Designers & Photographers";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

function renderPage(search = "") {
  return render(
    <TestProviders initialEntries={[`${routes.adminVj}${search}`]}>
      <Routes>
        <Route
          path={routes.adminVj}
          element={
            <>
              <AdminVjPage />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </TestProviders>,
  );
}

function locationSearch(): URLSearchParams {
  return new URLSearchParams(
    screen.getByTestId("location-search").textContent ?? "",
  );
}

function storedClipNamed(title: string) {
  const clip = demoGetVjClips().items.find(
    (candidate) => candidate.title === title,
  );
  if (clip === undefined) throw new Error(`No seeded clip named ${title}`);
  return clip;
}

function storedPackNamed(name: string) {
  const pack = demoGetVjPacks().items.find(
    (candidate) => candidate.name === name,
  );
  if (pack === undefined) throw new Error(`No seeded pack named ${name}`);
  return pack;
}

const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(
  URL,
  "createObjectURL",
);

beforeEach(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(() => "blob:vj-test"),
  });
  configureVjDemoStore({
    storage: createMemoryStorage(),
    channel: createVjDemoChannelHub().open(),
  });
  resetVjDemoLibrary();
});

afterEach(() => {
  if (originalCreateObjectUrl) {
    Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
  } else {
    Reflect.deleteProperty(URL, "createObjectURL");
  }
});

describe("AdminVjPage v2 (demo)", () => {
  it("opens on the clips view with both tabs", async () => {
    renderPage();
    const tablist = await screen.findByRole("tablist", {
      name: "Library sections",
    });
    const clipsTab = within(tablist).getByRole("tab", { name: "Clips" });
    const showTab = within(tablist).getByRole("tab", {
      name: "Scenes and set lists",
    });
    expect(clipsTab).toHaveAttribute("aria-selected", "true");
    expect(showTab).toHaveAttribute("aria-selected", "false");

    const panel = await screen.findByRole("tabpanel", { name: "Clips" });
    expect(
      await within(panel).findByRole("heading", { name: "Warm-up" }),
    ).toBeInTheDocument();
    expect(locationSearch().has("view")).toBe(false);
  });

  it("switches to Scenes and set lists and keeps the choice in the URL", async () => {
    const user = userEvent.setup();
    const { unmount } = renderPage();
    await screen.findByRole("heading", { name: "Warm-up" });

    await user.click(
      await screen.findByRole("tab", { name: "Scenes and set lists" }),
    );

    await waitFor(() => expect(locationSearch().get("view")).toBe("show"));
    expect(
      await screen.findByRole("tabpanel", { name: "Scenes and set lists" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Scenes" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: "Warm-up" })).toBeNull(),
    );

    // A reload opens on the same section.
    unmount();
    renderPage("?view=show");
    expect(
      await screen.findByRole("tab", { name: "Scenes and set lists" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(
      await screen.findByRole("heading", { name: "Set lists" }),
    ).toBeInTheDocument();
  });

  it("keeps the pack choice when switching views", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole("heading", { name: "Warm-up" });
    await user.click(screen.getByRole("button", { name: "Show Peak hour" }));
    const peakHourId = storedPackNamed("Peak hour").id;
    await waitFor(() => expect(locationSearch().get("pack")).toBe(peakHourId));

    await user.click(screen.getByRole("tab", { name: "Scenes and set lists" }));
    await waitFor(() => expect(locationSearch().get("view")).toBe("show"));
    expect(locationSearch().get("pack")).toBe(peakHourId);

    await user.click(screen.getByRole("tab", { name: "Clips" }));
    await waitFor(() => expect(locationSearch().has("view")).toBe(false));
    expect(locationSearch().get("pack")).toBe(peakHourId);
    expect(
      await screen.findByRole("heading", { name: "Peak hour" }),
    ).toBeInTheDocument();
  });

  it("shows the Make previews panel while clips lack previews", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Warm-up" });
    const missingCount = demoGetVjClips().items.filter(
      (clip) => clip.previewUrl === null,
    ).length;
    expect(missingCount).toBeGreaterThan(0);

    expect(
      await screen.findByText(
        `${missingCount} clips in your library have no animated preview yet`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Make previews" }),
    ).toBeInTheDocument();
  });

  it("stars a clip from the grid", async () => {
    expect(storedClipNamed("Warm haze").isFavorite).toBe(false);
    const user = userEvent.setup();
    renderPage();
    const grid = await screen.findByRole("list", { name: "Clips in Warm-up" });

    await user.click(
      await within(grid).findByRole("button", {
        name: "Add Warm haze to favorites",
      }),
    );

    expect(
      await within(grid).findByRole("button", {
        name: "Remove Warm haze from favorites",
      }),
    ).toHaveAttribute("aria-pressed", "true");
    await waitFor(() =>
      expect(storedClipNamed("Warm haze").isFavorite).toBe(true),
    );
  });

  it("edits a clip's speed from Edit clip", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(
      await screen.findByRole("button", { name: "Edit Neon grid" }),
    );
    const dialog = await screen.findByRole("dialog");

    await user.click(await within(dialog).findByRole("button", { name: "2x" }));

    expect(within(dialog).getByRole("button", { name: "2x" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await waitFor(() =>
      expect(storedClipNamed("Neon grid").defaultSpeed).toBe(2),
    );
  });

  it("links the pack to an event from the pack header", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole("heading", { name: "Warm-up" });
    await user.click(screen.getByRole("button", { name: "Show Peak hour" }));
    await screen.findByRole("heading", { name: "Peak hour" });

    await user.click(
      await screen.findByRole("button", { name: "Link event" }, SLOW_STEP),
    );
    const picker = await screen.findByRole("group", { name: "Upcoming event" });
    await user.click(
      within(picker).getByRole("button", { name: "Upcoming event" }),
    );
    await user.click(
      await screen.findByRole("option", { name: new RegExp(PORTFOLIO_NIGHT) }),
    );
    await user.click(
      within(picker).getByRole("button", { name: "Link event" }),
    );

    expect(
      await screen.findByText(`Peak hour now links to ${PORTFOLIO_NIGHT}`),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(storedPackNamed("Peak hour").event?.id).toBe(
        VJ_DEMO_EVENT_IDS.portfolioNight,
      ),
    );
  });

  it("shows the seeded scenes and the Friday set list", async () => {
    renderPage("?view=show");
    const scenes = await screen.findByRole(
      "list",
      { name: "Scenes in order" },
      SLOW_STEP,
    );
    expect(await within(scenes).findByText("Warm up")).toBeInTheDocument();
    expect(within(scenes).getByText("Peak")).toBeInTheDocument();

    const setlists = await screen.findByRole(
      "list",
      { name: "Set lists in order" },
      SLOW_STEP,
    );
    expect(within(setlists).getByText("Friday set")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Show Peak hour" })).toBeNull();
  });
});
