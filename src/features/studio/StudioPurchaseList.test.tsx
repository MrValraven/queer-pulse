import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { resetDemoPurchases } from "./api/studioDemoPurchaseStore";
import type { StudioLoadState } from "./api/studioLoadState";
import type { StudioBuyerPurchaseView } from "./api/studioPurchases.adapters";
import type { StudioCursorPagesResult } from "./api/useStudioCursorPages";
import { StudioPurchaseList } from "./StudioPurchaseList";

const mocks: {
  pager: StudioCursorPagesResult<StudioBuyerPurchaseView> | null;
} = vi.hoisted(() => ({ pager: null }));

vi.mock("./api/useStudioPurchaseLists", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioPurchaseLists")>();
  return {
    ...original,
    useStudioMyPurchases: (status: "all" | "confirmed") =>
      mocks.pager ?? original.useStudioMyPurchases(status),
  };
});

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

function pagerWith(
  loadState: StudioLoadState,
): StudioCursorPagesResult<StudioBuyerPurchaseView> {
  return {
    items: [],
    loadState,
    hasMore: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    fetchNextPage: () => undefined,
  };
}

function renderList({
  status,
  isStudioContext,
}: {
  status: "all" | "confirmed";
  isStudioContext: boolean;
}) {
  return render(
    <TestProviders>
      <StudioPurchaseList
        status={status}
        isStudioContext={isStudioContext}
        headingLevel={3}
      />
    </TestProviders>,
  );
}

beforeEach(() => {
  mocks.pager = null;
  resetDemoPurchases();
});

describe("StudioPurchaseList (demo)", () => {
  it("lists every purchase with its status, amount and date, newest first", async () => {
    renderList({ status: "all", isStudioContext: true });
    const list = await screen.findByRole("list", { name: "Your purchases" });
    await within(list).findByText("Cassete perdida");
    const rows = Array.from(list.children);
    expect(rows).toHaveLength(5);
    expect(rows[0]).toHaveTextContent("Último elétrico");
    expect(rows[0]).toHaveTextContent("Waiting for the artist");
    expect(screen.getByText("Paid €4")).toBeInTheDocument();
    expect(screen.getAllByText(/^Bought /)).toHaveLength(5);
  });

  it("shows the unlinked artist as text and keeps that purchase's downloads", async () => {
    renderList({ status: "all", isStudioContext: true });
    const row = (await screen.findByText("Cassete perdida")).closest("li")!;
    expect(within(row).getByText("by Maré Funda").closest("a")).toBeNull();
    expect(within(row).queryByRole("link")).toBeNull();
    expect(
      within(row).getByText(
        "This music is no longer on Studio. Your downloads stay",
      ),
    ).toBeInTheDocument();
    expect(
      within(row).queryByRole("switch", {
        name: "Show me on the supporter wall",
      }),
    ).toBeNull();
    const toggle = within(row).getByRole("button", { name: "Download tracks" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveTextContent("Hide downloads");
    expect(
      within(row).getByRole("button", { name: "Download Lado A" }),
    ).toBeInTheDocument();
    expect(
      within(row).getByText(
        "We are preparing this file for you. Try again in a few minutes",
      ),
    ).toBeInTheDocument();
  });

  it("cancels a pending claim from its row and folds it into Cancelled", async () => {
    renderList({ status: "all", isStudioContext: true });
    const row = (await screen.findByText("Último elétrico")).closest("li")!;
    expect(within(row).getByText("QP7K3F")).toBeInTheDocument();
    fireEvent.click(
      within(row).getByRole("button", { name: "Cancel this purchase" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Cancel purchase" }),
    );
    expect(await within(row).findByText("Cancelled")).toBeInTheDocument();
    expect(within(row).getByText("Purchase cancelled")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(row).queryByRole("button", { name: "Cancel this purchase" }),
      ).toBeNull(),
    );
    expect(within(row).queryByText("Waiting for the artist")).toBeNull();
  });

  it("leaves Studio-only controls out of the account context", async () => {
    renderList({ status: "confirmed", isStudioContext: false });
    await screen.findByText("Cassete perdida");
    expect(
      screen.queryByRole("switch", { name: "Show me on the supporter wall" }),
    ).toBeNull();
    expect(screen.queryByRole("link", { name: /Coro de Outubro/ })).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByText("Waiting for the artist")).toBeNull();
    expect(screen.getByText("by Coro de Outubro")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Download tracks" }),
    ).toHaveLength(2);
  });

  it("reserves no empty live region in an account row, and keeps one in Studio", async () => {
    const account = renderList({ status: "all", isStudioContext: false });
    const accountRow = (await screen.findByText("Último elétrico")).closest(
      "li",
    )!;
    expect(accountRow.querySelector('[role="status"]')).toBeNull();
    account.unmount();
    renderList({ status: "all", isStudioContext: true });
    const studioRow = (await screen.findByText("Último elétrico")).closest(
      "li",
    )!;
    expect(studioRow.querySelector('[role="status"]')).not.toBeNull();
  });

  it("shows the empty line and a load error with its reason", () => {
    mocks.pager = pagerWith(loadStateOf());
    const { unmount } = renderList({ status: "all", isStudioContext: true });
    expect(
      screen.getByText(
        "Nothing bought yet. A release or track with a price has a Buy button on its page",
      ),
    ).toBeInTheDocument();
    unmount();

    mocks.pager = pagerWith(loadStateOf());
    const confirmedList = renderList({
      status: "confirmed",
      isStudioContext: false,
    });
    expect(screen.getByText("No confirmed purchases yet")).toBeInTheDocument();
    confirmedList.unmount();

    mocks.pager = pagerWith(loadStateOf({ isError: true, reason: "offline" }));
    renderList({ status: "all", isStudioContext: true });
    expect(screen.getByText("your purchases")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You're offline. Check your Wi-Fi or mobile data and try again",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Nothing bought yet/)).toBeNull();
  });
});
