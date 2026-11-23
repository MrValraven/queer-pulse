import { act, fireEvent, render, screen } from "@testing-library/react";
import { Route, Routes, useParams } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { awaitCatalogUnderFakeTimers } from "../../../test/awaitCatalogUnderFakeTimers";
import { ApiError } from "../../../shared/api/client";
import type { AuthUser } from "../../auth/api/auth.api";
import type { CreateCommunityDto } from "../api/communities.api";
import type { CreatorDraftSaveStatus } from "../../creatorDrafts/api/useCreatorDraftAutosave";
import type { CommunityDraft } from "./startCommunity.data";
import type { StoredCommunityDraft } from "./communityDraftStorage";
import { emptyDraft, ownerStewardFrom } from "./useCommunityForm";
import type {
  StartCommunityAutosaveOptions,
  StartCommunityDraftLoad,
} from "./useStartCommunityDraft";
import { QUICK_START_LAYOUT_QUERY } from "./useQuickStartLayout";
import { StartCommunityPage } from "./StartCommunityPage";

interface CreateCallbacks {
  onSuccess?: (dto: { slug: string; name: string } | null) => void;
  onError?: (error: Error) => void;
}

const mocks = vi.hoisted(() => {
  const fakeAutosave = {
    status: { kind: "idle" } as CreatorDraftSaveStatus,
    conflict: null,
    isConflictBusy: false,
    loadNewer: vi.fn(() => Promise.resolve(null)),
    keepThisVersion: vi.fn<() => void>(),
    discard: vi.fn(() => Promise.resolve()),
    forget: vi.fn<() => void>(),
  };
  const draftLoad: { value: StartCommunityDraftLoad } = {
    value: { isLoading: false, initial: null, source: null },
  };
  return {
    fakeAutosave,
    autosaveCalls: [] as StartCommunityAutosaveOptions[],
    draftLoad,
    createMutate:
      vi.fn<(dto: CreateCommunityDto, callbacks: CreateCallbacks) => void>(),
    showToast: vi.fn<(message: unknown, type?: string) => number>(() => 1),
    /** When set, every `useDemoMode` reader sees this mode. */
    demoOverride: { demoMode: null as boolean | null },
    /** When set, every `useAuth` reader sees this member and checking state. */
    authOverride: {
      value: null as { user: AuthUser | null; checking: boolean } | null,
    },
  };
});

vi.mock("./useStartCommunityDraft", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./useStartCommunityDraft")>()),
  useStartCommunityDraftLoad: () => mocks.draftLoad.value,
  useStartCommunityAutosave: (options: StartCommunityAutosaveOptions) => {
    mocks.autosaveCalls.push(options);
    return mocks.fakeAutosave;
  },
}));

vi.mock("../api/useCommunityMutations", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/useCommunityMutations")>()),
  useCreateCommunity: () => ({ mutate: mocks.createMutate }),
}));

vi.mock("./useHandleTaken", () => ({ useHandleTaken: () => false }));

vi.mock(
  "../../../shared/components/feedback/useToast",
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import("../../../shared/components/feedback/useToast")
      >();
    return {
      ...original,
      useToast: () => ({ ...original.useToast(), showToast: mocks.showToast }),
    };
  },
);

vi.mock("../../../app/providers/authContext", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../../../app/providers/authContext")>();
  return {
    ...original,
    useAuth: () => {
      const value = original.useAuth();
      const override = mocks.authOverride.value;
      return override === null ? value : { ...value, ...override };
    },
  };
});

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("../../../app/providers/DemoModeProvider")
    >();
  return {
    ...original,
    useDemoMode: () => {
      const value = original.useDemoMode();
      const overrideMode = mocks.demoOverride.demoMode;
      return overrideMode === null
        ? value
        : { ...value, demoMode: overrideMode };
    },
  };
});

const { autosaveCalls, createMutate, showToast, demoOverride, authOverride } =
  mocks;

/** A controllable `matchMedia` whose mobile query flips on `setIsMobile`. */
function installMatchMedia(isMobile: boolean) {
  let isMatching = isMobile;
  const changeListeners = new Set<() => void>();
  vi.stubGlobal("matchMedia", (query: string) => {
    const isLayoutQuery = query === QUICK_START_LAYOUT_QUERY;
    return {
      get matches() {
        return isLayoutQuery && isMatching;
      },
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (_type: string, listener: () => void) => {
        if (isLayoutQuery) changeListeners.add(listener);
      },
      removeEventListener: (_type: string, listener: () => void) => {
        changeListeners.delete(listener);
      },
      dispatchEvent: () => false,
    };
  });
  return {
    setIsMobile(nextIsMobile: boolean) {
      act(() => {
        isMatching = nextIsMobile;
        changeListeners.forEach((listener) => listener());
      });
    },
  };
}

function CommunityProbe() {
  const { slug } = useParams();
  return <p data-testid="community-probe">{slug}</p>;
}

function renderStartPage() {
  return render(
    <TestProviders initialEntries={["/communities/start"]}>
      <Routes>
        <Route path="/communities/start" element={<StartCommunityPage />} />
        <Route path="/community/:slug" element={<CommunityProbe />} />
      </Routes>
    </TestProviders>,
  );
}

const blankDraft = emptyDraft(ownerStewardFrom(null));

function draftWith(patch: Partial<CommunityDraft>): CommunityDraft {
  return { ...blankDraft, ...patch };
}

/** A draft with every field the quick flow asks for. */
const completeDraft = draftWith({
  name: "Sunday Swim",
  type: "social",
  tagline: "Laps and coffee after",
  purpose: "Swimming together every Sunday",
  whoFor: "Queer swimmers of every pace",
  accessTier: "public",
  handle: "sunday-swim",
  consent: true,
});

function seedDraft(stored: StoredCommunityDraft | null) {
  mocks.draftLoad.value = {
    isLoading: false,
    initial: stored,
    source: stored === null ? null : "server",
  };
}

function lastAutosaveOptions(): StartCommunityAutosaveOptions {
  const last = autosaveCalls.at(-1);
  if (last === undefined) throw new Error("autosave never ran");
  return last;
}

/** The founding-thread rail the desktop wizard shows. */
function queryWizardRail() {
  return screen.queryByRole("navigation", { name: /^Step \d+ of \d+ · / });
}

function goLive() {
  demoOverride.demoMode = false;
  authOverride.value = { user: null, checking: false };
}

beforeEach(() => {
  autosaveCalls.length = 0;
  createMutate.mockReset();
  showToast.mockClear();
  mocks.fakeAutosave.forget.mockClear();
  demoOverride.demoMode = null;
  authOverride.value = null;
  seedDraft(null);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("StartCommunityPage layouts", () => {
  it("renders the quick flow under the mobile width and the wizard above it", async () => {
    const layout = installMatchMedia(true);
    renderStartPage();
    await awaitCatalog("communities");
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(queryWizardRail()).toBeNull();

    layout.setIsMobile(false);
    expect(queryWizardRail()).toBeInTheDocument();
    expect(screen.queryByText("Step 1 of 3")).toBeNull();
  });

  it("hides the desktop hero on the quick flow", async () => {
    const layout = installMatchMedia(true);
    renderStartPage();
    await awaitCatalog("communities");
    const heroEyebrow = "Communities & Collectives · found a space";
    expect(screen.queryByText(heroEyebrow)).toBeNull();

    layout.setIsMobile(false);
    expect(screen.getByText(heroEyebrow)).toBeInTheDocument();
  });

  it("keeps the typed name when the window crosses the mobile width", async () => {
    const layout = installMatchMedia(true);
    const { container } = renderStartPage();
    await awaitCatalog("communities");
    const quickName =
      container.querySelector<HTMLInputElement>("#quick-start-name");
    if (quickName === null) throw new Error("the quick name field is missing");
    fireEvent.change(quickName, { target: { value: "Sunday Swim" } });

    layout.setIsMobile(false);
    const wizardName = container.querySelector<HTMLInputElement>("#sc-name");
    expect(wizardName?.value).toBe("Sunday Swim");
  });

  it("opens the wizard on the first open chapter after the quick flow", async () => {
    seedDraft({ draft: blankDraft, step: 6 });
    const layout = installMatchMedia(true);
    const { container } = renderStartPage();
    await awaitCatalog("communities");
    const quickName =
      container.querySelector<HTMLInputElement>("#quick-start-name");
    const quickTagline = container.querySelector<HTMLInputElement>(
      "#quick-start-tagline",
    );
    if (quickName === null || quickTagline === null) {
      throw new Error("the quick step one fields are missing");
    }
    fireEvent.change(quickName, { target: { value: "Sunday Swim" } });
    fireEvent.click(
      screen.getByRole("button", { name: /^Social/, pressed: false }),
    );
    fireEvent.change(quickTagline, {
      target: { value: "Laps and coffee after" },
    });

    layout.setIsMobile(false);
    // Chapter 1 still needs the purpose, so the wizard opens there.
    expect(
      screen.getByRole("navigation", { name: /^Step 2 of \d+ · Why$/ }),
    ).toBeInTheDocument();
  });

  it("lands the quick flow on the first step with something missing for a wizard draft", async () => {
    seedDraft({
      draft: draftWith({
        name: "Sunday Swim",
        type: "social",
        tagline: "Laps and coffee after",
        purpose: "Swimming together every Sunday",
        whoFor: "Queer swimmers of every pace",
      }),
      step: 4,
    });
    installMatchMedia(true);
    renderStartPage();
    await awaitCatalog("communities");
    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
  });

  it("resumes the saved quick step", async () => {
    seedDraft({ draft: blankDraft, step: 0, quickStep: 2 });
    installMatchMedia(true);
    renderStartPage();
    await awaitCatalog("communities");
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
  });

  it("saves the first open chapter as the step while the quick flow is open", async () => {
    seedDraft({ draft: blankDraft, step: 6 });
    const layout = installMatchMedia(true);
    renderStartPage();
    await awaitCatalog("communities");
    expect(lastAutosaveOptions().step).toBe(1);
    expect(lastAutosaveOptions().quickStep).toBe(1);

    layout.setIsMobile(false);
    expect(lastAutosaveOptions().quickStep).toBeUndefined();
  });
});

describe("StartCommunityPage quick founding", () => {
  it("opens the new demo community page with a toast after the quick flow", async () => {
    vi.useFakeTimers();
    seedDraft({ draft: completeDraft, step: 8, quickStep: 3 });
    installMatchMedia(true);
    renderStartPage();
    await awaitCatalogUnderFakeTimers("communities");

    fireEvent.click(screen.getByRole("button", { name: /Open community/ }));
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByTestId("community-probe")).toHaveTextContent(
      "sunday-swim",
    );
    expect(showToast).toHaveBeenCalledWith(
      "Sunday Swim is live. Welcome, steward",
      "success",
    );
    expect(mocks.fakeAutosave.forget).toHaveBeenCalledTimes(1);
  });

  it("sends the whole desktop draft from the quick flow", async () => {
    goLive();
    seedDraft({
      draft: {
        ...completeDraft,
        coverImageUrl: "community-cover/abc",
        stewards: [
          ...completeDraft.stewards,
          {
            key: "marta",
            slug: "marta",
            name: "Marta Reis",
            initials: "MR",
            tint: "jade",
            role: "mod",
          },
          {
            key: "lee",
            slug: "lee",
            name: "Lee Park",
            initials: "LP",
            tint: "coral",
            role: "mod",
          },
        ],
      },
      step: 8,
      quickStep: 3,
    });
    installMatchMedia(true);
    renderStartPage();
    await awaitCatalog("communities");

    fireEvent.click(screen.getByRole("button", { name: /Open community/ }));

    expect(createMutate).toHaveBeenCalledTimes(1);
    expect(createMutate.mock.calls[0]?.[0]).toMatchObject({
      name: "Sunday Swim",
      handle: "sunday-swim",
      coverImageUrl: "community-cover/abc",
      stewards: ["marta", "lee"],
    });
  });

  it("returns to step three with the handle-taken line after a 409", async () => {
    goLive();
    seedDraft({ draft: completeDraft, step: 8, quickStep: 3 });
    createMutate.mockImplementation((_dto, callbacks) => {
      callbacks.onError?.(new ApiError(409, "x"));
    });
    installMatchMedia(true);
    renderStartPage();
    await awaitCatalog("communities");

    fireEvent.click(screen.getByRole("button", { name: /Open community/ }));

    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
    expect(
      screen.getByText("That address is already taken. Try another one."),
    ).toBeInTheDocument();
    expect(showToast).not.toHaveBeenCalledWith(expect.anything(), "error");
  });

  it("toasts the new community and opens its page after a live quick founding", async () => {
    goLive();
    seedDraft({ draft: completeDraft, step: 8, quickStep: 3 });
    createMutate.mockImplementation((_dto, callbacks) => {
      // React Query runs onSuccess after the request settles, never inside
      // mutate(): by then the page is on "opening" and its leave guard is off.
      queueMicrotask(() =>
        callbacks.onSuccess?.({ slug: "sunday-swim", name: "Sunday Swim" }),
      );
    });
    installMatchMedia(true);
    renderStartPage();
    await awaitCatalog("communities");

    fireEvent.click(screen.getByRole("button", { name: /Open community/ }));

    expect(await screen.findByTestId("community-probe")).toHaveTextContent(
      "sunday-swim",
    );
    expect(showToast).toHaveBeenCalledWith(
      "Sunday Swim is live. Welcome, steward",
      "success",
    );
    expect(mocks.fakeAutosave.forget).toHaveBeenCalledTimes(1);
  });
});

describe("StartCommunityPage wizard founding", () => {
  it("opens the new community page with no toast after a live wizard founding", async () => {
    goLive();
    seedDraft({ draft: completeDraft, step: 8 });
    createMutate.mockImplementation((_dto, callbacks) => {
      // React Query runs onSuccess after the request settles, never inside
      // mutate(): by then the page is on "opening" and its leave guard is off.
      queueMicrotask(() =>
        callbacks.onSuccess?.({ slug: "sunday-swim", name: "Sunday Swim" }),
      );
    });
    installMatchMedia(false);
    renderStartPage();
    await awaitCatalog("communities");

    fireEvent.click(screen.getByRole("button", { name: /Open the doors/ }));

    expect(await screen.findByTestId("community-probe")).toHaveTextContent(
      "sunday-swim",
    );
    expect(showToast).not.toHaveBeenCalledWith(
      "Sunday Swim is live. Welcome, steward",
      "success",
    );
    expect(mocks.fakeAutosave.forget).toHaveBeenCalledTimes(1);
  });

  it("shows the done panel after a demo wizard founding", async () => {
    vi.useFakeTimers();
    seedDraft({ draft: completeDraft, step: 8 });
    installMatchMedia(false);
    renderStartPage();
    await awaitCatalogUnderFakeTimers("communities");

    fireEvent.click(screen.getByRole("button", { name: /Open the doors/ }));
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(
      screen.getByRole("button", { name: "Start another" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("community-probe")).toBeNull();
    expect(showToast).toHaveBeenCalledWith(
      "Sunday Swim is live. Welcome, steward",
      "success",
    );
  });

  it("returns to chapter eight with the handle-taken line after a wizard 409", async () => {
    goLive();
    seedDraft({ draft: completeDraft, step: 8 });
    createMutate.mockImplementation((_dto, callbacks) => {
      callbacks.onError?.(new ApiError(409, "x"));
    });
    installMatchMedia(false);
    renderStartPage();
    await awaitCatalog("communities");

    fireEvent.click(screen.getByRole("button", { name: /Open the doors/ }));

    // Live hides the invite chapter, so the confirm chapter is 8 of 8.
    expect(
      screen.getByRole("navigation", { name: /^Step 8 of 8 · Confirm$/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("That address is already taken. Try another one."),
    ).toBeInTheDocument();
    expect(showToast).not.toHaveBeenCalledWith(expect.anything(), "error");
  });
});
