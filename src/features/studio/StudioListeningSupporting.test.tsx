import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../app/providers/MotionProvider";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import type { StudioSupportingView } from "./api/studioListening.adapters";
import { resetDemoYourListening } from "./api/studioDemoYourListening";
import type { StudioLoadState } from "./api/studioLoadState";
import { StudioListeningSupporting } from "./StudioListeningSupporting";

/** The toast host keeps its own empty status regions mounted, so this is
 *  the one status region that has something to say. */
function announcedStatus(): HTMLElement {
  const announcing = screen
    .getAllByRole("status")
    .filter((region) => region.textContent !== "");
  expect(announcing).toHaveLength(1);
  return announcing[0]!;
}

interface SupportingResult {
  items: StudioSupportingView[] | null;
  loadState: StudioLoadState;
}

interface MocksHolder {
  isMocked: boolean;
  supporting: SupportingResult | null;
  shouldFailRemoval: boolean;
  isHistoryOn: boolean;
}

const mocks: MocksHolder = vi.hoisted<MocksHolder>(() => ({
  isMocked: false,
  supporting: null,
  shouldFailRemoval: false,
  isHistoryOn: true,
}));

vi.mock("./api/studioDemoYourListening", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/studioDemoYourListening")>();
  return {
    ...original,
    demoDeleteStudioSupporter: (subprofileId: string) => {
      if (mocks.shouldFailRemoval) throw new TypeError("Failed to fetch");
      original.demoDeleteStudioSupporter(subprofileId);
    },
  };
});

vi.mock("./api/useStudioListeningHistorySwitch", () => ({
  useStudioListeningHistorySwitch: () => ({
    isOn: mocks.isHistoryOn,
    isAwaitingRow: false,
    setOn: () => undefined,
  }),
}));

vi.mock("./api/useStudioListening", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioListening")>();
  return {
    ...original,
    useStudioListeningSupporting: () =>
      mocks.isMocked && mocks.supporting
        ? mocks.supporting
        : original.useStudioListeningSupporting(),
  };
});

const LIST_NAME = "Artists who see your name";

function loadStateOf(
  overrides: Partial<StudioLoadState> = {},
): StudioLoadState {
  return {
    isLoading: false,
    isError: false,
    isRetrying: false,
    isNotFound: false,
    isWithdrawn: false,
    isTrackWithheld: false,
    reason: "unknown",
    retry: () => undefined,
    ...overrides,
  };
}

function errorLoadState(overrides: Partial<StudioLoadState> = {}) {
  return loadStateOf({ isError: true, reason: "server", ...overrides });
}

/** The supporting list's own rows: each row's support links are a list too. */
async function findSupportingRows(): Promise<HTMLElement[]> {
  const list = await screen.findByRole("list", { name: LIST_NAME });
  await within(list).findAllByRole("listitem");
  return Array.from(list.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.tagName === "LI",
  );
}

let testQueryClient = new QueryClient();

/** One client per test; unmocked, it renders the demo listener. */
function supportingTree() {
  return (
    <TestProviders queryClient={testQueryClient}>
      {/* The app's motion features, so a row's entrance runs to the end. */}
      <MotionProvider>
        <StudioListeningSupporting />
      </MotionProvider>
    </TestProviders>
  );
}

async function renderMocked() {
  mocks.isMocked = true;
  const view = render(supportingTree());
  await awaitCatalog("studio");
  return view;
}

beforeEach(() => {
  testQueryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  mocks.isMocked = false;
  mocks.supporting = null;
  mocks.shouldFailRemoval = false;
  mocks.isHistoryOn = true;
  resetDemoYourListening();
});

describe("StudioListeningSupporting", () => {
  it("lists every artist the demo listener played lately with how each sees them", async () => {
    render(supportingTree());
    await awaitCatalog("studio");
    const rows = await findSupportingRows();
    expect(rows).toHaveLength(6);
    expect(rows[0]).toHaveTextContent("NIGHTFORM");
    expect(rows[0]).toHaveTextContent("Shown as Tiago Costa");
    expect(
      within(rows[0]!).getByRole("list", { name: "Ways to support NIGHTFORM" }),
    ).toBeInTheDocument();
    // Shown by default: no start date to name.
    expect(within(rows[0]!).queryByText(/^Showing since /)).toBeNull();
    expect(
      within(rows[0]!).getByRole("link", { name: "NIGHTFORM" }),
    ).toHaveAttribute("href", expect.stringMatching(/^\/studio\//));
    expect(rows[1]).toHaveTextContent("Vanda Diesel");
    expect(rows[1]).toHaveTextContent("Shown as Mariana Sol");
    expect(within(rows[1]!).getByText(/^Showing since /)).toBeInTheDocument();
  });

  it("offers Follow with the row's state", async () => {
    render(supportingTree());
    await awaitCatalog("studio");
    const rows = await findSupportingRows();
    expect(
      within(rows[0]!).getByRole("button", { name: /follow/i }),
    ).toHaveAttribute("aria-pressed");
  });

  it("shows the empty line and the error panel with its reason", async () => {
    mocks.supporting = { items: [], loadState: loadStateOf() };
    const { unmount } = await renderMocked();
    expect(
      screen.getByText(
        "Play a track for 30 seconds and its artist shows up here. You appear among their top listeners until you turn it off on their page",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: LIST_NAME })).toBeNull();
    unmount();
    mocks.supporting = {
      items: null,
      loadState: errorLoadState({ reason: "server" }),
    };
    await renderMocked();
    expect(
      screen.getByText(/the artists who see your name/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Play a track for 30 seconds and its artist shows up here. You appear among their top listeners until you turn it off on their page",
      ),
    ).toBeNull();
  });

  it("takes the row out on Stop showing my name and moves focus to the next row", async () => {
    render(supportingTree());
    await awaitCatalog("studio");
    const rows = await findSupportingRows();
    fireEvent.click(
      within(rows[1]!).getByRole("button", {
        name: "Stop showing your name to Vanda Diesel",
      }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "Vanda Diesel" })).toBeNull(),
    );
    expect(screen.getByRole("link", { name: "Lua Cardoso" })).toHaveFocus();
    expect(announcedStatus()).toHaveTextContent(
      "Vanda Diesel no longer sees you among their top listeners",
    );
  });

  it("says paused history keeps the listener out of top listeners", async () => {
    mocks.supporting = { items: [], loadState: loadStateOf() };
    mocks.isHistoryOn = false;
    await renderMocked();
    expect(
      screen.getByText(
        "While your history is paused, you don't appear among their top listeners",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the row and names the reason when Stop showing my name fails", async () => {
    mocks.shouldFailRemoval = true;
    render(supportingTree());
    await awaitCatalog("studio");
    const rows = await findSupportingRows();
    fireEvent.click(
      within(rows[1]!).getByRole("button", {
        name: "Stop showing your name to Vanda Diesel",
      }),
    );
    expect(await within(rows[1]!).findByRole("alert")).toHaveTextContent(
      "We couldn't turn off Show me among the top listeners. We couldn't reach Studio, so this wasn't saved. Check your connection, or try again in a moment",
    );
    // The kept row settles back in with a fade.
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Vanda Diesel" })).toBeVisible(),
    );
  });
});
