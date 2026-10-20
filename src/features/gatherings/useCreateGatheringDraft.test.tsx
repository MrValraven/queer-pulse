import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type {
  CreatorDraftConflict,
  CreatorDraftResponse,
} from "../creatorDrafts/api/creatorDrafts.types";
import {
  CreatorDraftDiscardError,
  type CreatorDraftAutosave,
  type CreatorDraftAutosaveOptions,
  type CreatorDraftSaveStatus,
} from "../creatorDrafts/api/useCreatorDraftAutosave";
import { GATE_ANCHOR } from "./createGathering.data";
import { createGatheringDraftKey } from "./createGatheringDraftStorage";
import { CreateGatheringPage } from "./CreateGatheringPage";
import { useCreateGatheringDraft } from "./useCreateGatheringDraft";
import {
  useGatheringForm,
  type GatheringDraftSnapshot,
} from "./useGatheringForm";

const mocks = vi.hoisted(() => {
  const fakeAutosave = {
    status: { kind: "idle" } as CreatorDraftSaveStatus,
    conflict: null as CreatorDraftConflict | null,
    isConflictBusy: false,
    serverDraft: null as CreatorDraftResponse | null,
    isServerDraftLoading: false,
    loadNewer:
      vi.fn<
        (options?: {
          isReadable?: (payload: Record<string, unknown>) => boolean;
        }) => Promise<CreatorDraftResponse | null>
      >(),
    keepThisVersion: vi.fn<() => void>(),
    discard: vi.fn<() => Promise<void>>(),
    forget: vi.fn<() => void>(),
  };
  const autosaveCalls: CreatorDraftAutosaveOptions[] = [];
  /** When set, every `useDemoMode` reader sees this mode. */
  const demoOverride = { demoMode: null as boolean | null };
  return { fakeAutosave, autosaveCalls, demoOverride };
});
const { fakeAutosave, autosaveCalls, demoOverride } = mocks;

vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("../../app/providers/DemoModeProvider")
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
  "../creatorDrafts/api/useCreatorDraftAutosave",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../creatorDrafts/api/useCreatorDraftAutosave")
    >()),
    useCreatorDraftAutosave: (
      options: CreatorDraftAutosaveOptions,
    ): CreatorDraftAutosave => {
      mocks.autosaveCalls.push(options);
      return mocks.fakeAutosave;
    },
  }),
);

const MEMBER_DRAFT_KEY = createGatheringDraftKey("member-1");

/** A clean wizard's snapshot, read from a real form that is then unmounted. */
function buildEmptySnapshot(): GatheringDraftSnapshot {
  const { result, unmount } = renderHook(() => useGatheringForm(), {
    wrapper: TestProviders,
  });
  const snapshot = result.current.draftSnapshot;
  unmount();
  return snapshot;
}

let emptySnapshot: GatheringDraftSnapshot;

const DISCARD_FAILED_KEY = "gatherings:create.v2.toast.draftDiscardFailed";
const DISCARD_FAILED_TEXT =
  "We couldn't delete your old draft. It's still saved";

function minutesAgoIso(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function serverDraftWithTitle(title: string): CreatorDraftResponse {
  return {
    payload: { ...emptySnapshot, title },
    payloadVersion: 1,
    revision: 4,
    savedAt: minutesAgoIso(3),
  };
}

/** The old browser copy as earlier releases wrote it. */
function legacyCopy(title: string): string {
  return JSON.stringify({
    version: 1,
    savedAt: Date.now() - 5 * 60_000,
    snapshot: { ...emptySnapshot, title },
  });
}

function lastAutosaveOptions(): CreatorDraftAutosaveOptions {
  const lastCall = autosaveCalls.at(-1);
  if (lastCall === undefined) throw new Error("the engine never ran");
  return lastCall;
}

function renderDraftHook() {
  return renderHook(
    () => {
      const form = useGatheringForm();
      const draft = useCreateGatheringDraft({
        form,
        legacyStorageKey: MEMBER_DRAFT_KEY,
        shouldOfferResume: true,
        communitySlugParam: "",
        isSavingEnabled: true,
      });
      return { form, draft };
    },
    { wrapper: TestProviders },
  );
}

beforeEach(() => {
  window.localStorage.clear();
  demoOverride.demoMode = null;
  emptySnapshot = buildEmptySnapshot();
  autosaveCalls.length = 0;
  fakeAutosave.status = { kind: "idle" };
  fakeAutosave.conflict = null;
  fakeAutosave.isConflictBusy = false;
  fakeAutosave.serverDraft = null;
  fakeAutosave.isServerDraftLoading = false;
  fakeAutosave.loadNewer.mockReset();
  fakeAutosave.loadNewer.mockResolvedValue(null);
  fakeAutosave.keepThisVersion.mockReset();
  fakeAutosave.discard.mockReset();
  fakeAutosave.discard.mockResolvedValue(undefined);
  fakeAutosave.forget.mockReset();
});

describe("useCreateGatheringDraft on the server", () => {
  it("offers the server draft through the resume strip and restores it on resume", () => {
    fakeAutosave.serverDraft = {
      payload: { ...emptySnapshot, title: "Sunday picnic" },
      payloadVersion: 1,
      revision: 4,
      savedAt: minutesAgoIso(12),
    };
    const { result } = renderDraftHook();
    expect(result.current.draft.resumeOffer).toMatchObject({
      label: "Sunday picnic",
      ageMinutes: 12,
    });
    act(() => result.current.draft.resume());
    expect(result.current.form.title).toBe("Sunday picnic");
    expect(result.current.draft.resumeOffer).toBeNull();
  });

  it("holds saving while the offer is unanswered", () => {
    fakeAutosave.serverDraft = serverDraftWithTitle("Old");
    renderDraftHook();
    expect(lastAutosaveOptions().isEnabled).toBe(false);
  });

  it("holds saving while the server read is still loading", () => {
    fakeAutosave.isServerDraftLoading = true;
    renderDraftHook();
    expect(lastAutosaveOptions().isEnabled).toBe(false);
  });

  it("starts fresh by deleting the server draft and the old local copy", () => {
    window.localStorage.setItem(MEMBER_DRAFT_KEY, legacyCopy("Old local"));
    fakeAutosave.serverDraft = serverDraftWithTitle("Old");
    const { result } = renderDraftHook();
    act(() => result.current.draft.startFresh());
    expect(fakeAutosave.discard).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(MEMBER_DRAFT_KEY)).toBeNull();
    expect(result.current.draft.resumeOffer).toBeNull();
    expect(lastAutosaveOptions().isEnabled).toBe(true);
  });

  it("tells the host when the server draft could not be deleted", async () => {
    fakeAutosave.serverDraft = serverDraftWithTitle("Old");
    fakeAutosave.discard.mockRejectedValue(new CreatorDraftDiscardError());
    const { result } = renderDraftHook();
    act(() => result.current.draft.startFresh());
    expect(
      await screen.findByText(
        (text) => text === DISCARD_FAILED_KEY || text === DISCARD_FAILED_TEXT,
      ),
    ).toBeInTheDocument();
  });

  it("offers the server draft over an old local copy and drops the local copy right at resume", () => {
    window.localStorage.setItem(MEMBER_DRAFT_KEY, legacyCopy("Old local"));
    fakeAutosave.serverDraft = serverDraftWithTitle("Account picnic");
    const { result, rerender } = renderDraftHook();
    expect(result.current.draft.resumeOffer?.label).toBe("Account picnic");
    act(() => result.current.draft.resume());
    expect(result.current.form.title).toBe("Account picnic");
    expect(window.localStorage.getItem(MEMBER_DRAFT_KEY)).toBeNull();
    fakeAutosave.status = { kind: "saved", savedAt: minutesAgoIso(0) };
    rerender();
    expect(window.localStorage.getItem(MEMBER_DRAFT_KEY)).toBeNull();
  });

  it("starts fresh from an old local copy with no server delete", () => {
    window.localStorage.setItem(MEMBER_DRAFT_KEY, legacyCopy("Old local"));
    const { result } = renderDraftHook();
    expect(result.current.draft.resumeOffer?.label).toBe("Old local");
    act(() => result.current.draft.startFresh());
    expect(fakeAutosave.discard).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(MEMBER_DRAFT_KEY)).toBeNull();
    expect(result.current.draft.resumeOffer).toBeNull();
  });

  it("offers an old local copy once when the server slot is empty and deletes it on the first save after resume", () => {
    fakeAutosave.serverDraft = null;
    window.localStorage.setItem(MEMBER_DRAFT_KEY, legacyCopy("Local picnic"));
    const { result, rerender } = renderDraftHook();
    expect(result.current.draft.resumeOffer?.label).toBe("Local picnic");
    act(() => result.current.draft.resume());
    expect(window.localStorage.getItem(MEMBER_DRAFT_KEY)).not.toBeNull();
    fakeAutosave.status = { kind: "saving" };
    rerender();
    expect(window.localStorage.getItem(MEMBER_DRAFT_KEY)).not.toBeNull();
    fakeAutosave.status = { kind: "saved", savedAt: minutesAgoIso(0) };
    rerender();
    expect(window.localStorage.getItem(MEMBER_DRAFT_KEY)).toBeNull();
    expect(lastAutosaveOptions().payload).toMatchObject({
      title: "Local picnic",
    });
    expect(lastAutosaveOptions().isEnabled).toBe(true);
  });

  it("sends the snapshot with chapter progress and missing chapters", () => {
    fakeAutosave.serverDraft = null;
    const { result } = renderDraftHook();
    expect(lastAutosaveOptions().payload).toBeNull();
    act(() => result.current.form.setTitle("Picnic"));
    expect(lastAutosaveOptions()).toMatchObject({
      slot: { kind: "event", listingRef: null },
      payload: { title: "Picnic" },
      progress: { total: 5 },
    });
    expect(lastAutosaveOptions().missing).not.toContain("review");
  });

  it("keeps the typed event after a conflict until the host loads the newer draft", async () => {
    fakeAutosave.serverDraft = null;
    const { result, rerender } = renderDraftHook();
    act(() => result.current.form.setTitle("My words"));
    fakeAutosave.status = { kind: "conflict" };
    fakeAutosave.conflict = { revision: 9, savedAt: minutesAgoIso(1) };
    rerender();
    expect(result.current.form.title).toBe("My words");
    expect(result.current.draft.saveStatus.kind).toBe("conflict");
    expect(result.current.draft.conflict).toEqual({
      revision: 9,
      savedAt: expect.any(String) as string,
    });
    fakeAutosave.loadNewer.mockResolvedValue({
      payload: { ...emptySnapshot, title: "Other tab" },
      payloadVersion: 1,
      revision: 9,
      savedAt: minutesAgoIso(1),
    });
    await act(async () => {
      result.current.draft.loadNewer();
      await Promise.resolve();
    });
    await waitFor(() => expect(result.current.form.title).toBe("Other tab"));
  });

  it("keeps the typed event when the newer draft turns out to be gone", async () => {
    fakeAutosave.serverDraft = null;
    const { result } = renderDraftHook();
    act(() => result.current.form.setTitle("My words"));
    fakeAutosave.loadNewer.mockResolvedValue(null);
    await act(async () => {
      result.current.draft.loadNewer();
      await Promise.resolve();
    });
    expect(fakeAutosave.loadNewer).toHaveBeenCalledTimes(1);
    expect(result.current.form.title).toBe("My words");
  });

  it("keeps the old local copy when the upload after a resume fails", () => {
    window.localStorage.setItem(MEMBER_DRAFT_KEY, legacyCopy("Local picnic"));
    const { result, rerender } = renderDraftHook();
    act(() => result.current.draft.resume());
    fakeAutosave.status = { kind: "notSaved" };
    rerender();
    expect(window.localStorage.getItem(MEMBER_DRAFT_KEY)).not.toBeNull();
  });

  it("asks the engine to skip a newer draft the wizard cannot read", async () => {
    const { result } = renderDraftHook();
    act(() => result.current.form.setTitle("My words"));
    fakeAutosave.loadNewer.mockResolvedValue(null);
    await act(async () => {
      result.current.draft.loadNewer();
      await Promise.resolve();
    });
    const options = fakeAutosave.loadNewer.mock.calls[0]?.[0] as
      { isReadable: (payload: Record<string, unknown>) => boolean } | undefined;
    expect(options?.isReadable({ title: "Fine" })).toBe(true);
    expect(options?.isReadable({ unexpected: ["shape"] })).toBe(false);
    expect(result.current.form.title).toBe("My words");
  });

  it("keeps this version through the engine", () => {
    const { result } = renderDraftHook();
    act(() => result.current.draft.keepThisVersion());
    expect(fakeAutosave.keepThisVersion).toHaveBeenCalledTimes(1);
  });

  it("shows the note once the event is for a community or business", () => {
    fakeAutosave.serverDraft = null;
    const { result } = renderDraftHook();
    expect(result.current.draft.isNoteShown).toBe(false);
    act(() => result.current.form.setCommunitySlug("rainbow-runners"));
    expect(result.current.draft.isNoteShown).toBe(true);
  });

  it("forgets after publish and removes the old local copy", () => {
    window.localStorage.setItem(MEMBER_DRAFT_KEY, legacyCopy("Old local"));
    const { result } = renderDraftHook();
    act(() => result.current.draft.forget());
    expect(fakeAutosave.forget).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(MEMBER_DRAFT_KEY)).toBeNull();
  });

  it("words a saved status as minutes ago", () => {
    fakeAutosave.status = { kind: "saved", savedAt: minutesAgoIso(0) };
    const { result } = renderDraftHook();
    expect(result.current.draft.saveStatus).toEqual({
      kind: "saved",
      minutesAgo: 0,
    });
  });
});

describe("CreateGatheringPage across a demo switch", () => {
  it("remounts the wizard so the old mode's form never saves into the new mode", () => {
    demoOverride.demoMode = true;
    const view = render(<CreateGatheringPage />, { wrapper: TestProviders });
    const titleInput = document.querySelector<HTMLInputElement>(
      `#${GATE_ANCHOR.title} input`,
    );
    if (titleInput === null) throw new Error("the title field is missing");
    fireEvent.change(titleInput, { target: { value: "Demo picnic" } });
    expect(lastAutosaveOptions().payload).toMatchObject({
      title: "Demo picnic",
    });
    const callsBeforeSwitch = autosaveCalls.length;
    demoOverride.demoMode = false;
    view.rerender(<CreateGatheringPage />);
    const callsAfterSwitch = autosaveCalls.slice(callsBeforeSwitch);
    expect(callsAfterSwitch.length).toBeGreaterThan(0);
    for (const call of callsAfterSwitch) expect(call.payload).toBeNull();
  });
});
