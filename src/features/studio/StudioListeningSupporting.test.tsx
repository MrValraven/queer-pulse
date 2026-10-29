import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioSupportingView } from "./api/studioListening.adapters";
import { resetDemoYourListening } from "./api/studioDemoYourListening";
import type { StudioLoadState } from "./api/studioLoadState";
import { StudioListeningSupporting } from "./StudioListeningSupporting";

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
      <StudioListeningSupporting />
    </TestProviders>
  );
}

function renderMocked() {
  mocks.isMocked = true;
  return render(supportingTree());
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
  it("lists the artists the demo listener supports with how each sees them", async () => {
    render(supportingTree());
    const rows = await findSupportingRows();
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Vanda Diesel");
    expect(rows[0]).toHaveTextContent("Shown as Mariana Sol");
    expect(rows[1]).toHaveTextContent("Shown as Tiago Costa");
    expect(
      within(rows[1]!).getByRole("list", { name: "Ways to support NIGHTFORM" }),
    ).toBeInTheDocument();
    expect(within(rows[1]!).getByText(/^Showing since /)).toBeInTheDocument();
    expect(
      within(rows[1]!).getByRole("link", { name: "NIGHTFORM" }),
    ).toHaveAttribute("href", expect.stringMatching(/^\/studio\//));
  });

  it("offers Follow with the row's state", async () => {
    render(supportingTree());
    const rows = await findSupportingRows();
    expect(
      within(rows[1]!).getByRole("button", { name: /follow/i }),
    ).toHaveAttribute("aria-pressed");
  });

  it("shows the empty line and the error panel with its reason", () => {
    mocks.supporting = { items: [], loadState: loadStateOf() };
    const { unmount } = renderMocked();
    expect(
      screen.getByText(
        "Turn on Show me among the top listeners on an artist's page to add them here",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: LIST_NAME })).toBeNull();
    unmount();
    mocks.supporting = {
      items: null,
      loadState: errorLoadState({ reason: "server" }),
    };
    renderMocked();
    expect(
      screen.getByText(/the artists who see your name/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Turn on Show me among the top listeners on an artist's page to add them here",
      ),
    ).toBeNull();
  });

  it("takes the row out on Stop showing my name and moves focus to the next row", async () => {
    render(supportingTree());
    const rows = await findSupportingRows();
    fireEvent.click(
      within(rows[0]!).getByRole("button", {
        name: "Stop showing your name to Vanda Diesel",
      }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "Vanda Diesel" })).toBeNull(),
    );
    expect(screen.getByRole("link", { name: "NIGHTFORM" })).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Vanda Diesel no longer sees you among their top listeners",
    );
  });

  it("says paused history keeps the listener out of top listeners", () => {
    mocks.supporting = { items: [], loadState: loadStateOf() };
    mocks.isHistoryOn = false;
    renderMocked();
    expect(
      screen.getByText(
        "While your history is paused, you don't appear among their top listeners",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the row and names the reason when Stop showing my name fails", async () => {
    mocks.shouldFailRemoval = true;
    render(supportingTree());
    const rows = await findSupportingRows();
    fireEvent.click(
      within(rows[0]!).getByRole("button", {
        name: "Stop showing your name to Vanda Diesel",
      }),
    );
    expect(await within(rows[0]!).findByRole("alert")).toHaveTextContent(
      "We couldn't turn off Show me among the top listeners. We couldn't reach Studio, so this wasn't saved. Check your connection, or try again in a moment",
    );
    expect(screen.getByRole("link", { name: "Vanda Diesel" })).toBeVisible();
  });
});
