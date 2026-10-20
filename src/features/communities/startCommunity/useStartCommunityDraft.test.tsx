import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type {
  CreatorDraftAutosave,
  CreatorDraftAutosaveOptions,
  CreatorDraftSaveStatus,
  LoadNewerOptions,
} from "../../creatorDrafts/api/useCreatorDraftAutosave";
import type { CreatorDraftRead } from "../../creatorDrafts/api/useCreatorDraft";
import type { CreatorDraftResumeSource } from "../../creatorDrafts/api/useCreatorDraftResumeSource";
import type {
  CreatorDraftConflict,
  CreatorDraftResponse,
} from "../../creatorDrafts/api/creatorDrafts.types";
import type { AuthUser } from "../../auth/api/auth.api";
import {
  emptyDraft,
  ownerStewardFrom,
  useCommunityForm,
} from "./useCommunityForm";
import {
  useStartCommunityAutosave,
  useStartCommunityDraftLoad,
  type StartCommunityAutosaveOptions,
} from "./useStartCommunityDraft";
import { StartCommunityPage } from "./StartCommunityPage";

const mocks = vi.hoisted(() => {
  const fakeAutosave = {
    status: { kind: "idle" } as CreatorDraftSaveStatus,
    conflict: null as CreatorDraftConflict | null,
    isConflictBusy: false,
    serverDraft: null as CreatorDraftResponse | null,
    isServerDraftLoading: false,
    loadNewer:
      vi.fn<
        (options?: LoadNewerOptions) => Promise<CreatorDraftResponse | null>
      >(),
    keepThisVersion: vi.fn<() => void>(),
    discard: vi.fn<() => Promise<void>>(),
    forget: vi.fn<() => void>(),
  };
  const fakeRead = {
    draft: null as CreatorDraftResponse | null,
    /** When set with a demo override, each mode reads its own cached slot. */
    draftsByMode: null as {
      demo: CreatorDraftResponse | null;
      live: CreatorDraftResponse | null;
    } | null,
    isLoading: false,
  };
  const autosaveCalls: CreatorDraftAutosaveOptions[] = [];
  /** When set, every `useDemoMode` reader sees this mode. */
  const demoOverride = { demoMode: null as boolean | null };
  /** When set, every `useAuth` reader sees this member and checking state. */
  const authOverride = {
    value: null as { user: AuthUser | null; checking: boolean } | null,
  };
  /** The member the real AuthProvider holds, as of the latest `useAuth` read. */
  const realAuth = { user: null as AuthUser | null };
  /** When set, the wizard's resume read answers this; else the real hook runs. */
  const resumeOverride = { value: null as CreatorDraftResumeSource | null };
  return {
    fakeAutosave,
    fakeRead,
    autosaveCalls,
    demoOverride,
    authOverride,
    realAuth,
    resumeOverride,
  };
});
const {
  fakeAutosave,
  fakeRead,
  autosaveCalls,
  demoOverride,
  authOverride,
  resumeOverride,
} = mocks;

vi.mock(
  "../../creatorDrafts/api/useCreatorDraftResumeSource",
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import("../../creatorDrafts/api/useCreatorDraftResumeSource")
      >();
    return {
      ...original,
      useCreatorDraftResumeSource: (
        ...args: Parameters<typeof original.useCreatorDraftResumeSource>
      ): CreatorDraftResumeSource => {
        // Always call the real hook so the hook order stays the same.
        const real = original.useCreatorDraftResumeSource(...args);
        return mocks.resumeOverride.value ?? real;
      },
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
      mocks.realAuth.user = value.user;
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

vi.mock(
  "../../creatorDrafts/api/useCreatorDraftAutosave",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../creatorDrafts/api/useCreatorDraftAutosave")
    >()),
    useCreatorDraftAutosave: (
      options: CreatorDraftAutosaveOptions,
    ): CreatorDraftAutosave => {
      mocks.autosaveCalls.push(options);
      return mocks.fakeAutosave;
    },
  }),
);

vi.mock("../../creatorDrafts/api/useCreatorDraft", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../creatorDrafts/api/useCreatorDraft")
  >()),
  useCreatorDraft: (): CreatorDraftRead => {
    const { draftsByMode } = mocks.fakeRead;
    const overrideMode = mocks.demoOverride.demoMode;
    const draft =
      draftsByMode !== null && overrideMode !== null
        ? draftsByMode[overrideMode ? "demo" : "live"]
        : mocks.fakeRead.draft;
    return {
      draft,
      isLoading: mocks.fakeRead.isLoading,
      isError: false,
      readFresh: () => Promise.resolve(draft),
    };
  },
}));

const emptyCommunity = emptyDraft(ownerStewardFrom(null));
const LEGACY_KEY = "qp.community-draft.marta";

function serverDraftNamed(name: string, step = 4): CreatorDraftResponse {
  return {
    payload: { draft: { ...emptyCommunity, name }, step },
    payloadVersion: 1,
    revision: 3,
    savedAt: "2026-10-19T10:00:00.000Z",
  };
}

/** The owner steward names every engine call since `fromIndex` carried. */
function ownerNamesSince(fromIndex: number): (string | null)[] {
  return autosaveCalls.slice(fromIndex).map((call) => {
    const payload = call.payload as {
      draft?: { stewards?: { key: string; name: string }[] };
    } | null;
    const owner = payload?.draft?.stewards?.find(
      (steward) => steward.key === "owner",
    );
    return owner?.name ?? null;
  });
}

/** The nearest ancestor of `element` that holds a status region. */
function closestRowWithStatus(element: HTMLElement): HTMLElement {
  let ancestor = element.parentElement;
  while (ancestor !== null && within(ancestor).queryByRole("status") === null) {
    ancestor = ancestor.parentElement;
  }
  if (ancestor === null) throw new Error("no status region near the note");
  return ancestor;
}

/** Moves the wizard back one chapter, the founder's first edit in these tests. */
function moveBackOneChapter() {
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
}

/** The community names every engine call since `fromIndex` carried. */
function savedNamesSince(fromIndex: number): (string | null)[] {
  return autosaveCalls.slice(fromIndex).map((call) => {
    const payload = call.payload as { draft?: { name?: string } } | null;
    return payload?.draft?.name ?? null;
  });
}

function lastAutosaveOptions(): CreatorDraftAutosaveOptions {
  const lastCall = autosaveCalls.at(-1);
  if (lastCall === undefined) throw new Error("the engine never ran");
  return lastCall;
}

function renderAutosave(overrides: Partial<StartCommunityAutosaveOptions>) {
  const options: StartCommunityAutosaveOptions = {
    ownerSlug: "marta",
    draft: emptyCommunity,
    step: 0,
    missingByStep: {},
    isDirty: false,
    hasEdited: false,
    isEnabled: true,
    source: null,
    ...overrides,
  };
  return renderHook(() => useStartCommunityAutosave(options), {
    wrapper: TestProviders,
  });
}

beforeEach(() => {
  window.sessionStorage.clear();
  autosaveCalls.length = 0;
  demoOverride.demoMode = null;
  authOverride.value = null;
  resumeOverride.value = null;
  fakeRead.draft = null;
  fakeRead.draftsByMode = null;
  fakeRead.isLoading = false;
  fakeAutosave.status = { kind: "idle" };
  fakeAutosave.conflict = null;
  fakeAutosave.isConflictBusy = false;
  fakeAutosave.serverDraft = null;
  fakeAutosave.loadNewer.mockReset();
  fakeAutosave.loadNewer.mockResolvedValue(null);
  fakeAutosave.keepThisVersion.mockReset();
  fakeAutosave.discard.mockReset();
  fakeAutosave.discard.mockResolvedValue(undefined);
  fakeAutosave.forget.mockReset();
});

describe("start community draft", () => {
  it("loads the server draft first and reports it as the source", () => {
    fakeRead.draft = {
      payload: {
        draft: { ...emptyCommunity, name: "Trans Book Club" },
        step: 4,
      },
      payloadVersion: 1,
      revision: 3,
      savedAt: "2026-10-19T10:00:00.000Z",
    };
    const { result } = renderHook(() => useStartCommunityDraftLoad("marta"), {
      wrapper: TestProviders,
    });
    expect(result.current).toMatchObject({
      isLoading: false,
      source: "server",
      initial: { step: 4, draft: { name: "Trans Book Club" } },
    });
  });

  it("falls back to the old tab copy when the server slot is empty", () => {
    fakeRead.draft = null;
    window.sessionStorage.setItem(
      "qp.community-draft.marta",
      JSON.stringify({
        draft: { ...emptyCommunity, name: "Local club" },
        step: 2,
      }),
    );
    const { result } = renderHook(() => useStartCommunityDraftLoad("marta"), {
      wrapper: TestProviders,
    });
    expect(result.current.source).toBe("legacy");
    expect(result.current.initial?.draft.name).toBe("Local club");
  });

  it("waits while the server read is loading", () => {
    fakeRead.isLoading = true;
    const { result } = renderHook(() => useStartCommunityDraftLoad("marta"), {
      wrapper: TestProviders,
    });
    expect(result.current.isLoading).toBe(true);
  });

  it("saves the draft with its step, progress and missing panels", () => {
    renderAutosave({
      draft: { ...emptyCommunity, name: "Club" },
      step: 2,
      isDirty: true,
      hasEdited: true,
    });
    expect(lastAutosaveOptions()).toMatchObject({
      slot: { kind: "community", listingRef: null },
      payload: { draft: { name: "Club" }, step: 2 },
      progress: { done: 3, total: 9 },
    });
  });

  it("removes the old tab copy once the first save lands", () => {
    window.sessionStorage.setItem(LEGACY_KEY, "{}");
    const { rerender } = renderAutosave({ source: "legacy", isDirty: true });
    expect(window.sessionStorage.getItem("qp.community-draft.marta")).toBe(
      "{}",
    );
    fakeAutosave.status = {
      kind: "saved",
      savedAt: "2026-10-19T10:01:00.000Z",
    };
    rerender();
    expect(
      window.sessionStorage.getItem("qp.community-draft.marta"),
    ).toBeNull();
  });

  it("keeps the founder's words through a conflict", async () => {
    fakeAutosave.conflict = {
      revision: 6,
      savedAt: "2026-10-19T10:04:00.000Z",
    };
    fakeAutosave.status = { kind: "conflict" };
    const { result } = renderAutosave({
      draft: { ...emptyCommunity, name: "My words" },
      isDirty: true,
      hasEdited: true,
    });
    expect(result.current.status.kind).toBe("conflict");
    expect(lastAutosaveOptions().payload).toMatchObject({
      draft: { name: "My words" },
    });
    fakeAutosave.loadNewer.mockResolvedValue({
      payload: { draft: { ...emptyCommunity, name: "Other tab" }, step: 5 },
      payloadVersion: 1,
      revision: 6,
      savedAt: "2026-10-19T10:04:00.000Z",
    });
    await expect(result.current.loadNewer()).resolves.toMatchObject({
      step: 5,
      draft: { name: "Other tab" },
    });
  });

  it("shows the note beside the wizard's save line", () => {
    render(
      <TestProviders>
        <StartCommunityPage />
      </TestProviders>,
    );
    const note = screen.getByText(
      /communities:creatorDraftNote\.body|Our team can see this draft of your community page/,
    );
    const draftStatusRow = closestRowWithStatus(note);
    const saveLine = within(draftStatusRow).getByRole("status");
    // The save line sits directly in the row that holds the note.
    expect(saveLine.parentElement).toBe(draftStatusRow);
  });

  it("prefers the server copy when an old tab copy is also there", () => {
    fakeRead.draft = serverDraftNamed("Server club");
    window.sessionStorage.setItem(
      LEGACY_KEY,
      JSON.stringify({
        draft: { ...emptyCommunity, name: "Tab club" },
        step: 1,
      }),
    );
    const { result } = renderHook(() => useStartCommunityDraftLoad("marta"), {
      wrapper: TestProviders,
    });
    expect(result.current).toMatchObject({
      source: "server",
      initial: { step: 4, draft: { name: "Server club" } },
    });
  });

  it("leaves the tab key alone when the draft came from the server", () => {
    window.sessionStorage.setItem(LEGACY_KEY, "{}");
    const { rerender } = renderAutosave({
      source: "server",
      isDirty: true,
      hasEdited: true,
    });
    fakeAutosave.status = {
      kind: "saved",
      savedAt: "2026-10-19T10:01:00.000Z",
    };
    rerender();
    expect(window.sessionStorage.getItem(LEGACY_KEY)).toBe("{}");
  });

  it("asks the engine to refuse a newer draft the wizard cannot read", async () => {
    const { result } = renderAutosave({
      draft: { ...emptyCommunity, name: "My words" },
      isDirty: true,
      hasEdited: true,
    });
    // The engine keeps the conflict open and resolves null for an unreadable payload.
    fakeAutosave.loadNewer.mockResolvedValue(null);
    await expect(result.current.loadNewer()).resolves.toBeNull();

    const isReadable = fakeAutosave.loadNewer.mock.calls[0]?.[0]?.isReadable;
    if (isReadable === undefined) throw new Error("no readability check");
    expect(isReadable({ draft: "unreadable", step: 2 })).toBe(false);
    expect(isReadable({ draft: { ...emptyCommunity } })).toBe(false);
    expect(isReadable({ draft: { ...emptyCommunity }, step: 2 })).toBe(true);
    expect(fakeAutosave.keepThisVersion).not.toHaveBeenCalled();
    expect(lastAutosaveOptions().payload).toMatchObject({
      draft: { name: "My words" },
    });
  });
});

describe("start community draft before the first edit", () => {
  it("sends nothing when a server draft opens without an edit", () => {
    fakeRead.draft = serverDraftNamed("Server club");
    render(<StartCommunityPage />, { wrapper: TestProviders });
    // The owner steward sync rewrote the draft on open, and still nothing goes out.
    expect(autosaveCalls.length).toBeGreaterThan(0);
    expect(autosaveCalls.every((call) => call.payload === null)).toBe(true);
  });

  it("sends the draft on the founder's first chapter move", () => {
    fakeRead.draft = serverDraftNamed("Server club");
    render(<StartCommunityPage />, { wrapper: TestProviders });
    expect(lastAutosaveOptions().payload).toBeNull();
    moveBackOneChapter();
    expect(lastAutosaveOptions().payload).toMatchObject({
      draft: { name: "Server club" },
      step: 3,
    });
  });

  it("holds the payload until the first edit", () => {
    const { result, rerender } = renderHook(
      (options: StartCommunityAutosaveOptions) =>
        useStartCommunityAutosave(options),
      {
        wrapper: TestProviders,
        initialProps: {
          ownerSlug: "marta",
          draft: { ...emptyCommunity, name: "Server club" },
          step: 4,
          missingByStep: {},
          isDirty: true,
          hasEdited: false,
          isEnabled: true,
          source: "server",
        },
      },
    );
    expect(result.current.status.kind).toBe("idle");
    expect(lastAutosaveOptions().payload).toBeNull();
    rerender({
      ownerSlug: "marta",
      draft: { ...emptyCommunity, name: "Server club, renamed" },
      step: 4,
      missingByStep: {},
      isDirty: true,
      hasEdited: true,
      isEnabled: true,
      source: "server",
    });
    expect(lastAutosaveOptions().payload).toMatchObject({
      draft: { name: "Server club, renamed" },
    });
  });

  it("uploads the old tab copy once without an edit", () => {
    const { rerender } = renderAutosave({
      draft: { ...emptyCommunity, name: "Tab club" },
      step: 2,
      isDirty: true,
      source: "legacy",
    });
    rerender();
    rerender();
    const firstPayload = autosaveCalls[0]?.payload;
    expect(firstPayload).toMatchObject({
      draft: { name: "Tab club" },
      step: 2,
    });
    // One payload across every render, so the engine uploads it once.
    expect(autosaveCalls.every((call) => call.payload === firstPayload)).toBe(
      true,
    );
  });

  it("opens the old tab copy with a payload ready to upload", () => {
    window.sessionStorage.setItem(
      LEGACY_KEY,
      JSON.stringify({
        draft: { ...emptyCommunity, name: "Tab club" },
        step: 2,
      }),
    );
    render(<StartCommunityPage />, { wrapper: TestProviders });
    expect(lastAutosaveOptions().payload).toMatchObject({
      draft: { name: "Tab club" },
      step: 2,
    });
  });

  it("counts form setters as edits and the owner sync as none", () => {
    const { result } = renderHook(
      () => useCommunityForm({ ...emptyCommunity, name: "Server club" }),
      { wrapper: TestProviders },
    );
    const ownerName = result.current.draft.stewards.find(
      (steward) => steward.key === "owner",
    )?.name;
    // The sync replaced the blank owner with the signed-in member.
    expect(ownerName).toBeTruthy();
    expect(result.current.hasEdited).toBe(false);
    act(() => result.current.prefill({ handle: "server-club" }));
    expect(result.current.hasEdited).toBe(false);
    act(() => result.current.set({ purpose: "Reading together" }));
    expect(result.current.hasEdited).toBe(true);
  });
});

/** A live member built from the demo member's shape. */
function liveMemberFrom(demoUser: AuthUser): AuthUser {
  return {
    ...demoUser,
    id: "member-7",
    profile: {
      ...demoUser.profile,
      slug: "lee",
      firstName: "Lee",
      lastName: "Live",
      avatarUrl: null,
    },
  };
}

/**
 * Renders the wizard in demo, then walks a switch to live the way the app
 * does: the session still holds the demo member, then /auth/me is checking,
 * then the live member lands.
 */
function renderAcrossDemoSwitch() {
  demoOverride.demoMode = true;
  fakeRead.draftsByMode = {
    demo: serverDraftNamed("Demo club"),
    live: serverDraftNamed("Live club"),
  };
  const view = render(<StartCommunityPage />, { wrapper: TestProviders });
  const demoUser = mocks.realAuth.user;
  if (demoUser === null) throw new Error("the demo member never signed in");
  expect(lastAutosaveOptions().payload).toBeNull();
  moveBackOneChapter();
  expect(lastAutosaveOptions().payload).toMatchObject({
    draft: { name: "Demo club" },
  });
  const demoOwnerName = ownerNamesSince(0).at(-1) ?? null;
  const callsBeforeSwitch = autosaveCalls.length;

  demoOverride.demoMode = false;
  authOverride.value = { user: demoUser, checking: false };
  view.rerender(<StartCommunityPage />);
  const callsWhileStale = autosaveCalls.length;
  authOverride.value = { user: demoUser, checking: true };
  view.rerender(<StartCommunityPage />);
  const callsWhileChecking = autosaveCalls.length;
  authOverride.value = { user: liveMemberFrom(demoUser), checking: false };
  view.rerender(<StartCommunityPage />);
  // The re-seeded wizard saves nothing until the founder edits it.
  expect(lastAutosaveOptions().payload).toBeNull();
  moveBackOneChapter();
  return {
    callsBeforeSwitch,
    callsWhileStale,
    callsWhileChecking,
    demoOwnerName,
  };
}

describe("start community draft resume", () => {
  it("opens on a closed wizard's in-flight save once it lands", () => {
    // The cache still holds the copy from before the closed wizard's last save.
    fakeRead.draft = serverDraftNamed("Cached words");
    resumeOverride.value = { draft: null, isSettled: false };
    const view = render(<StartCommunityPage />, { wrapper: TestProviders });
    // The skeleton holds the place while that save is on the wire.
    expect(autosaveCalls).toHaveLength(0);
    expect(screen.queryByText("Cached words")).toBeNull();

    resumeOverride.value = {
      draft: serverDraftNamed("Words in flight", 6),
      isSettled: true,
    };
    view.rerender(<StartCommunityPage />);
    expect(screen.getAllByText("Words in flight").length).toBeGreaterThan(0);
    expect(screen.queryByText("Cached words")).toBeNull();
    // Seeding is no edit, so the wizard sends nothing yet.
    expect(lastAutosaveOptions().payload).toBeNull();
    moveBackOneChapter();
    expect(lastAutosaveOptions().payload).toMatchObject({
      draft: { name: "Words in flight" },
      step: 5,
    });
  });
});

describe("StartCommunityPage across a demo switch", () => {
  it("re-seeds the wizard so the old mode's words never save into the new mode", () => {
    const { callsBeforeSwitch } = renderAcrossDemoSwitch();
    const namesAfterSwitch = savedNamesSince(callsBeforeSwitch);
    expect(namesAfterSwitch).toContain("Live club");
    expect(namesAfterSwitch).not.toContain("Demo club");
    expect(screen.getByText("Live club")).toBeInTheDocument();
    expect(screen.queryByText("Demo club")).toBeNull();
  });

  it("waits for the live member so the demo member never saves as the owner", () => {
    const {
      callsBeforeSwitch,
      callsWhileStale,
      callsWhileChecking,
      demoOwnerName,
    } = renderAcrossDemoSwitch();
    expect(demoOwnerName).toBeTruthy();
    // No wizard runs while the session still holds the other mode's member.
    expect(callsWhileStale).toBe(callsBeforeSwitch);
    expect(callsWhileChecking).toBe(callsBeforeSwitch);
    const ownersAfterSwitch = ownerNamesSince(callsBeforeSwitch);
    expect(ownersAfterSwitch).toContain("Lee Live");
    expect(ownersAfterSwitch).not.toContain(demoOwnerName);
  });
});
