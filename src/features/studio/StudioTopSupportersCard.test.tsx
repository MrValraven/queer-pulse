import { render, screen, within } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioCountView } from "./api/studio.adapters";
import type { StudioTopSupportersView } from "./api/studioDashboardPlays.adapters";
import { DEMO_ARTIST_MARIANA } from "./api/studioDemoMe.data";
import type { StudioLoadState } from "./api/studioLoadState";
import { StudioTopSupportersCard } from "./StudioTopSupportersCard";

interface SupportersResult {
  supporters: StudioTopSupportersView | null;
  loadState: StudioLoadState;
}

const mocks: { isMocked: boolean; supporters: SupportersResult | null } =
  vi.hoisted(() => ({ isMocked: false, supporters: null }));

vi.mock("./api/useStudioTopSupporters", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioTopSupporters")>();
  return {
    ...original,
    useStudioTopSupporters: (
      ...args: Parameters<typeof original.useStudioTopSupporters>
    ) =>
      mocks.isMocked && mocks.supporters
        ? mocks.supporters
        : original.useStudioTopSupporters(...args),
  };
});

const withheld: StudioCountView = { value: null, isBelowThreshold: true };

function loadedState(): StudioLoadState {
  return {
    isLoading: false,
    isError: false,
    isRetrying: false,
    isNotFound: false,
    isWithdrawn: false,
    isTrackWithheld: false,
    reason: "unknown",
    retry: () => undefined,
  };
}

/** One client per test, so a test never reads another's cache. */
let testQueryClient = new QueryClient();

function renderMocked() {
  mocks.isMocked = true;
  return render(
    <TestProviders queryClient={testQueryClient}>
      <StudioTopSupportersCard subprofileId="persona-1" personaName="Rui" />
    </TestProviders>,
  );
}

beforeEach(() => {
  testQueryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  mocks.isMocked = false;
  mocks.supporters = null;
});

describe("StudioTopSupportersCard", () => {
  it("ranks Mariana's supporters with the identity each chose, linked where it may be", async () => {
    render(
      <TestProviders>
        <StudioTopSupportersCard
          subprofileId={DEMO_ARTIST_MARIANA.id}
          personaName="Mariana Sol"
        />
      </TestProviders>,
    );
    const list = await screen.findByRole("list", {
      name: "Top supporters of Mariana Sol",
    });
    const items = within(list).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Vanda Diesel");
    expect(
      items
        .slice(0, 1)
        .map((item) =>
          within(item)
            .getByRole("link", { name: "Vanda Diesel" })
            .getAttribute("href"),
        ),
    ).toEqual(["/p/vanda-diesel"]);
    expect(
      within(list).getByRole("link", { name: "Anika Kovač" }),
    ).toHaveAttribute("href", "/members/anika");
    expect(within(list).getByText("Pátio Coletivo").closest("a")).toBeNull();
    expect(list.textContent).not.toMatch(/\d+ (plays|listens)/);
    expect(
      screen.getByText("Showing themselves as supporters: 7"),
    ).toBeInTheDocument();
  });

  it("renders two account supporters with the same name and no link without a duplicate key", () => {
    const sameAccount = {
      kind: "account" as const,
      key: "account",
      name: "Sam",
      avatarUrl: null,
      initials: "S",
      tint: "plum" as never,
      href: null,
    };
    mocks.supporters = {
      supporters: {
        identities: [sameAccount, { ...sameAccount }],
        optedInCount: { value: 2, isBelowThreshold: false },
      },
      loadState: loadedState(),
    };
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    renderMocked();
    const keyWarnings = consoleError.mock.calls.filter((call) =>
      String(call[0]).includes("same key"),
    );
    consoleError.mockRestore();
    expect(keyWarnings).toHaveLength(0);
    expect(screen.getAllByText("Sam")).toHaveLength(2);
  });

  it("floors the opted-in count and shows the empty line", () => {
    mocks.supporters = {
      supporters: { identities: [], optedInCount: withheld },
      loadState: loadedState(),
    };
    renderMocked();
    expect(
      screen.getByText(
        "When a listener turns on Show me as a supporter, they show up here",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Showing themselves as supporters: Fewer than 5"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("shows not found with no Retry", () => {
    mocks.supporters = {
      supporters: null,
      loadState: { ...loadedState(), isNotFound: true, reason: "notFound" },
    };
    renderMocked();
    expect(
      screen.getByText(
        "This isn't available anymore. It may have moved or been taken down",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /retry/i })).toBeNull();
  });
});
