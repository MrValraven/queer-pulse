import { act, renderHook, waitFor } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import type { CreatorDraftResponse } from "../../../creatorDrafts/api/creatorDrafts.types";
import type {
  CreatorDraftAutosave,
  CreatorDraftAutosaveOptions,
  LoadNewerOptions,
} from "../../../creatorDrafts/api/useCreatorDraftAutosave";
import {
  ANCHOR,
  type ListingDraft,
  type MissingField,
} from "../listBusiness.data";
import type { ManagedListingDTO } from "../api/listings.api";
import { blankDraft } from "../listingFormDraft";
import type { ListingForm } from "../useListingForm";
import {
  fingerprint as fingerprintOf,
  isListingEditPayload,
  useListingEditorAutosave,
} from "./useListingEditorAutosave";
import { useListingEditorSave } from "./useListingEditorSave";

/**
 * The listing editor's autosave on the shared creator draft engine. The
 * engine is a fake whose fields each test sets, so every option the hook
 * hands it can be read back.
 */

const engine = vi.hoisted(() => ({
  fake: null as FakeAutosave | null,
  calls: [] as CreatorDraftAutosaveOptions[],
  showToast: vi.fn(),
}));

vi.mock("../../../creatorDrafts/api/useCreatorDraftAutosave", () => ({
  useCreatorDraftAutosave: (options: CreatorDraftAutosaveOptions) => {
    engine.calls.push(options);
    return engine.fake;
  },
}));
vi.mock("../../../../app/providers/useStorageScope", () => ({
  useStorageScope: () => "user-1",
}));
vi.mock("../../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("../../../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: engine.showToast }),
}));
const editSave = vi.hoisted(() => ({
  saveEdit: vi.fn<() => Promise<void>>(),
  showSaveError: vi.fn<() => void>(),
}));
vi.mock("../useEditListingSave", () => ({
  useEditListingSave: () => editSave,
}));

const LEGACY_KEY = "qp-listing-edit-draft.v1.tasca.u.user-1";
const initialDraft: ListingDraft = { ...blankDraft(), name: "Tasca" };
const editedDraft: ListingDraft = { ...initialDraft, name: "Tasca do Bairro" };

type FakeAutosave = Omit<
  CreatorDraftAutosave,
  "loadNewer" | "keepThisVersion" | "discard" | "forget"
> & {
  loadNewer: Mock<
    (options?: LoadNewerOptions) => Promise<CreatorDraftResponse | null>
  >;
  keepThisVersion: Mock<() => void>;
  discard: Mock<() => Promise<void>>;
  forget: Mock<() => void>;
};

function freshFake(): FakeAutosave {
  return {
    status: { kind: "idle" },
    conflict: null,
    isConflictBusy: false,
    serverDraft: null,
    isServerDraftLoading: false,
    loadNewer: vi.fn<
      (options?: LoadNewerOptions) => Promise<CreatorDraftResponse | null>
    >(() => Promise.resolve(null)),
    keepThisVersion: vi.fn<() => void>(),
    discard: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    forget: vi.fn<() => void>(),
  };
}
let fakeAutosave = freshFake();

function serverCopy({
  name = "Tasca nova",
  baseline = fingerprintOf(initialDraft),
}: { name?: string; baseline?: string } = {}): CreatorDraftResponse {
  return {
    payload: { draft: { ...initialDraft, name }, baseline },
    payloadVersion: 1,
    revision: 2,
    savedAt: "2026-10-19T10:00:00.000Z",
  };
}

function lastAutosaveOptions(): CreatorDraftAutosaveOptions {
  const last = engine.calls.at(-1);
  if (!last) throw new Error("the engine was never called");
  return last;
}

interface HookProps {
  draft: ListingDraft;
  isDirty: boolean;
  missing?: MissingField[];
}

const applyDraft = vi.fn<(nextDraft: ListingDraft) => void>();

function renderAutosaveHook(initialProps: HookProps) {
  return renderHook(
    ({ draft, isDirty, missing }: HookProps) =>
      useListingEditorAutosave({
        listingRef: "tasca",
        draft,
        initialDraft,
        isDirty,
        missing,
        applyDraft,
      }),
    { initialProps },
  );
}

beforeEach(() => {
  fakeAutosave = freshFake();
  engine.fake = fakeAutosave;
  engine.calls = [];
  engine.showToast.mockClear();
  applyDraft.mockReset();
  editSave.saveEdit.mockReset();
  editSave.showSaveError.mockReset();
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("useListingEditorAutosave on the server", () => {
  it("offers the server copy through the existing restore banner", () => {
    fakeAutosave.serverDraft = {
      payload: {
        draft: { ...initialDraft, name: "Tasca nova" },
        baseline: fingerprintOf(initialDraft),
      },
      payloadVersion: 1,
      revision: 2,
      savedAt: "2026-10-19T10:00:00.000Z",
    };
    const { result } = renderAutosaveHook({
      draft: initialDraft,
      isDirty: false,
    });
    expect(result.current.restorable).toMatchObject({
      hasServerChanged: false,
      savedAt: Date.parse("2026-10-19T10:00:00.000Z"),
    });
    expect(result.current.restorable?.draft.name).toBe("Tasca nova");
  });

  it("says the listing changed since when the stored baseline differs", () => {
    fakeAutosave.serverDraft = serverCopy({ baseline: "older" });
    const { result } = renderAutosaveHook({
      draft: initialDraft,
      isDirty: false,
    });
    expect(result.current.restorable?.hasServerChanged).toBe(true);
  });

  it("offers nothing while the server read is still loading", () => {
    fakeAutosave.isServerDraftLoading = true;
    const { result } = renderAutosaveHook({
      draft: initialDraft,
      isDirty: false,
    });
    expect(result.current.restorable).toBeNull();
  });

  it("holds saving until the first server read settles", () => {
    fakeAutosave.isServerDraftLoading = true;
    const { rerender } = renderAutosaveHook({
      draft: editedDraft,
      isDirty: true,
    });
    expect(lastAutosaveOptions().isEnabled).toBe(false);
    fakeAutosave.isServerDraftLoading = false;
    rerender({ draft: editedDraft, isDirty: true });
    expect(lastAutosaveOptions()).toMatchObject({
      payload: { draft: editedDraft },
      isEnabled: true,
    });
  });

  it("offers the stored copy when the owner typed before the read settled and holds saving while it is open", () => {
    fakeAutosave.isServerDraftLoading = true;
    const { result, rerender } = renderAutosaveHook({
      draft: editedDraft,
      isDirty: true,
    });
    expect(result.current.restorable).toBeNull();
    fakeAutosave.isServerDraftLoading = false;
    fakeAutosave.serverDraft = serverCopy();
    rerender({ draft: editedDraft, isDirty: true });
    expect(result.current.restorable?.draft.name).toBe("Tasca nova");
    expect(lastAutosaveOptions().isEnabled).toBe(false);
    act(() => result.current.dismissRestorable());
    expect(result.current.restorable).toBeNull();
    expect(lastAutosaveOptions()).toMatchObject({
      payload: { draft: editedDraft },
      isEnabled: true,
    });
  });

  it("saves the typing once the owner discards a copy that arrived after it", () => {
    fakeAutosave.isServerDraftLoading = true;
    const { result, rerender } = renderAutosaveHook({
      draft: editedDraft,
      isDirty: true,
    });
    fakeAutosave.isServerDraftLoading = false;
    fakeAutosave.serverDraft = serverCopy();
    rerender({ draft: editedDraft, isDirty: true });
    expect(lastAutosaveOptions().isEnabled).toBe(false);
    act(() => result.current.discardRestorable());
    expect(fakeAutosave.discard).not.toHaveBeenCalled();
    expect(lastAutosaveOptions()).toMatchObject({
      payload: { draft: editedDraft },
      isEnabled: true,
    });
  });

  it("saves the edit with its baseline and public missing codes", () => {
    const { result } = renderAutosaveHook({
      draft: editedDraft,
      isDirty: true,
      missing: [{ labelKey: "x", anchor: ANCHOR.hours }],
    });
    expect(lastAutosaveOptions()).toMatchObject({
      slot: { kind: "listing_edit", listingRef: "tasca" },
      payload: { draft: editedDraft, baseline: fingerprintOf(initialDraft) },
      progress: null,
      missing: ["hours"],
      isEnabled: true,
    });
    expect(result.current.status.kind).toBe("idle");
  });

  it("sends nothing while the owner has not edited", () => {
    renderAutosaveHook({ draft: initialDraft, isDirty: false });
    expect(lastAutosaveOptions().payload).toBeNull();
  });

  it("writes no draft content to browser storage", () => {
    renderAutosaveHook({ draft: editedDraft, isDirty: true });
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
  });

  it("deletes the old local copy once the first save after a restore lands", () => {
    window.localStorage.setItem(
      LEGACY_KEY,
      JSON.stringify({ draft: editedDraft, savedAt: 1, baseline: "b" }),
    );
    fakeAutosave.serverDraft = null;
    const { result, rerender } = renderAutosaveHook({
      draft: initialDraft,
      isDirty: false,
    });
    expect(result.current.restorable?.draft).toEqual(editedDraft);
    act(() => result.current.dismissRestorable());
    expect(window.localStorage.getItem(LEGACY_KEY)).not.toBeNull();
    fakeAutosave.status = { kind: "saving" };
    rerender({ draft: editedDraft, isDirty: true });
    expect(window.localStorage.getItem(LEGACY_KEY)).not.toBeNull();
    fakeAutosave.status = {
      kind: "saved",
      savedAt: "2026-10-19T10:02:00.000Z",
    };
    rerender({ draft: editedDraft, isDirty: true });
    expect(window.localStorage.getItem(LEGACY_KEY)).toBeNull();
  });

  it("keeps the old local copy through a save already out at the restore", () => {
    window.localStorage.setItem(
      LEGACY_KEY,
      JSON.stringify({ draft: editedDraft, savedAt: 1, baseline: "b" }),
    );
    const { result, rerender } = renderAutosaveHook({
      draft: initialDraft,
      isDirty: false,
    });
    fakeAutosave.status = { kind: "saving" };
    rerender({ draft: initialDraft, isDirty: false });
    act(() => result.current.dismissRestorable());
    fakeAutosave.status = {
      kind: "saved",
      savedAt: "2026-10-19T10:01:00.000Z",
    };
    rerender({ draft: editedDraft, isDirty: true });
    expect(window.localStorage.getItem(LEGACY_KEY)).not.toBeNull();
    fakeAutosave.status = { kind: "saving" };
    rerender({ draft: editedDraft, isDirty: true });
    expect(window.localStorage.getItem(LEGACY_KEY)).not.toBeNull();
    fakeAutosave.status = {
      kind: "saved",
      savedAt: "2026-10-19T10:02:00.000Z",
    };
    rerender({ draft: editedDraft, isDirty: true });
    expect(window.localStorage.getItem(LEGACY_KEY)).toBeNull();
  });

  it("discards through the server and removes the old local copy", () => {
    window.localStorage.setItem(
      LEGACY_KEY,
      JSON.stringify({ draft: editedDraft, savedAt: 1, baseline: "b" }),
    );
    const { result } = renderAutosaveHook({
      draft: initialDraft,
      isDirty: false,
    });
    act(() => result.current.discardRestorable());
    expect(fakeAutosave.discard).toHaveBeenCalledTimes(1);
    expect(result.current.restorable).toBeNull();
    expect(window.localStorage.getItem(LEGACY_KEY)).toBeNull();
  });

  it("offers the copy again and says so when the discard fails", async () => {
    fakeAutosave.serverDraft = serverCopy();
    fakeAutosave.discard.mockRejectedValue(new Error("offline"));
    const { result } = renderAutosaveHook({
      draft: initialDraft,
      isDirty: false,
    });
    await act(async () => {
      result.current.discardRestorable();
      await Promise.resolve();
    });
    expect(engine.showToast).toHaveBeenCalledWith(
      "marketing:listBusiness.editor.restore.discardError",
      "error",
    );
    expect(result.current.restorable?.draft.name).toBe("Tasca nova");
  });
});

describe("useListingEditorAutosave after the full save and on a conflict", () => {
  it("deletes the server draft once the full save goes out and sends no more", () => {
    const { result } = renderAutosaveHook({
      draft: editedDraft,
      isDirty: true,
    });
    act(() => result.current.clearAutosave());
    expect(fakeAutosave.discard).toHaveBeenCalledTimes(1);
    expect(fakeAutosave.forget).not.toHaveBeenCalled();
    expect(lastAutosaveOptions()).toMatchObject({
      payload: null,
      isEnabled: false,
    });
  });

  it("saves again when the owner edits after the full save", () => {
    const { result, rerender } = renderAutosaveHook({
      draft: editedDraft,
      isDirty: true,
    });
    act(() => result.current.clearAutosave());
    const fixedDraft: ListingDraft = { ...editedDraft, name: "Tasca fixed" };
    rerender({ draft: fixedDraft, isDirty: true });
    expect(lastAutosaveOptions()).toMatchObject({
      payload: { draft: fixedDraft },
      isEnabled: true,
    });
  });

  it("says so when the draft does not clear after a save", async () => {
    fakeAutosave.discard.mockRejectedValue(new Error("offline"));
    const { result } = renderAutosaveHook({
      draft: editedDraft,
      isDirty: true,
    });
    await act(async () => {
      result.current.clearAutosave();
      await Promise.resolve();
    });
    expect(engine.showToast).toHaveBeenCalledWith(
      "marketing:listBusiness.editor.draftClearError",
      "error",
    );
  });

  it("forgets the draft with no request once the listing is deleted", () => {
    const { result } = renderAutosaveHook({
      draft: editedDraft,
      isDirty: true,
    });
    act(() => result.current.forgetAutosave());
    expect(fakeAutosave.forget).toHaveBeenCalledTimes(1);
    expect(fakeAutosave.discard).not.toHaveBeenCalled();
    expect(lastAutosaveOptions().isEnabled).toBe(false);
  });

  it("puts the newer copy into the form after a conflict", async () => {
    fakeAutosave.conflict = {
      revision: 5,
      savedAt: "2026-10-19T10:05:00.000Z",
    };
    fakeAutosave.loadNewer.mockResolvedValue(serverCopy({ name: "Other tab" }));
    const { result } = renderAutosaveHook({
      draft: editedDraft,
      isDirty: true,
    });
    act(() => result.current.loadNewer());
    expect(fakeAutosave.loadNewer).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(applyDraft).toHaveBeenCalledTimes(1));
    expect(applyDraft.mock.calls[0]?.[0].name).toBe("Other tab");
    expect(result.current.restorable).toBeNull();
  });

  it("drops the offer with no delete once the owner has typed", () => {
    fakeAutosave.serverDraft = serverCopy();
    const { result, rerender } = renderAutosaveHook({
      draft: initialDraft,
      isDirty: false,
    });
    expect(result.current.restorable?.draft.name).toBe("Tasca nova");
    rerender({ draft: editedDraft, isDirty: true });
    act(() => result.current.discardRestorable());
    expect(fakeAutosave.discard).not.toHaveBeenCalled();
    expect(result.current.restorable).toBeNull();
    expect(lastAutosaveOptions().payload).toMatchObject({ draft: editedDraft });
  });

  it("keeps the edit as typed when the newer draft is gone", async () => {
    fakeAutosave.conflict = { revision: null, savedAt: null };
    fakeAutosave.loadNewer.mockResolvedValue(null);
    const { result } = renderAutosaveHook({
      draft: editedDraft,
      isDirty: true,
    });
    await act(async () => {
      result.current.loadNewer();
      await fakeAutosave.loadNewer.mock.results[0]?.value;
    });
    expect(result.current.restorable).toBeNull();
    expect(applyDraft).not.toHaveBeenCalled();
    expect(lastAutosaveOptions().payload).toMatchObject({ draft: editedDraft });
  });

  it("asks the engine to keep the pause for a copy it cannot read", async () => {
    fakeAutosave.conflict = {
      revision: 5,
      savedAt: "2026-10-19T10:05:00.000Z",
    };
    // The engine answers null for an unreadable copy and keeps the 409.
    fakeAutosave.loadNewer.mockResolvedValue(null);
    const { result } = renderAutosaveHook({
      draft: editedDraft,
      isDirty: true,
    });
    await act(async () => {
      result.current.loadNewer();
      await fakeAutosave.loadNewer.mock.results[0]?.value;
    });
    const isReadable = fakeAutosave.loadNewer.mock.calls[0]?.[0]?.isReadable;
    expect(isReadable).toBe(isListingEditPayload);
    expect(isReadable?.(serverCopy().payload)).toBe(true);
    expect(isReadable?.({ draft: "Tasca", baseline: "b" })).toBe(false);
    expect(isReadable?.({ draft: { ...editedDraft } })).toBe(false);
    expect(isReadable?.({ title: "Picnic" })).toBe(false);
    expect(applyDraft).not.toHaveBeenCalled();
    expect(lastAutosaveOptions().payload).toMatchObject({ draft: editedDraft });
  });
});

const savedListing = {
  ref: "tasca",
  slug: "tasca",
  status: "live",
} as unknown as ManagedListingDTO;

/** The editor's autosave and save flow together, as `ListingEditor` wires them. */
function renderSaveFlow() {
  const form = {
    draft: editedDraft,
    setRejectedPhotoSlots: vi.fn(),
  } as unknown as ListingForm;
  return renderHook(() => {
    const autosave = useListingEditorAutosave({
      listingRef: "tasca",
      draft: editedDraft,
      initialDraft,
      isDirty: true,
      applyDraft,
    });
    return useListingEditorSave({
      listing: savedListing,
      form,
      missing: [],
      clearAutosave: autosave.clearAutosave,
    });
  });
}

describe("useListingEditorSave and the server draft", () => {
  it("keeps the server draft when the save fails", async () => {
    editSave.saveEdit.mockRejectedValue(new Error("offline"));
    const { result } = renderSaveFlow();
    await act(async () => {
      await result.current.save();
    });
    expect(editSave.showSaveError).toHaveBeenCalledTimes(1);
    expect(fakeAutosave.discard).not.toHaveBeenCalled();
    expect(lastAutosaveOptions()).toMatchObject({
      payload: { draft: editedDraft },
      isEnabled: true,
    });
  });

  it("deletes the draft once, after the save succeeds", async () => {
    let finishSave: () => void = () => undefined;
    editSave.saveEdit.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishSave = resolve;
        }),
    );
    const { result } = renderSaveFlow();
    let savePromise: Promise<void> = Promise.resolve();
    act(() => {
      savePromise = result.current.save();
    });
    expect(editSave.saveEdit).toHaveBeenCalledTimes(1);
    expect(fakeAutosave.discard).not.toHaveBeenCalled();
    await act(async () => {
      finishSave();
      await savePromise;
    });
    expect(fakeAutosave.discard).toHaveBeenCalledTimes(1);
  });

  it("keeps the draft when save and leave fails", async () => {
    editSave.saveEdit.mockRejectedValue(new Error("offline"));
    const { result } = renderSaveFlow();
    let hasLeft = true;
    await act(async () => {
      hasLeft = await result.current.saveAndLeave();
    });
    expect(hasLeft).toBe(false);
    expect(fakeAutosave.discard).not.toHaveBeenCalled();
  });

  it("deletes the draft once when save and leave succeeds", async () => {
    editSave.saveEdit.mockResolvedValue(undefined);
    const { result } = renderSaveFlow();
    let hasLeft = false;
    await act(async () => {
      hasLeft = await result.current.saveAndLeave();
    });
    expect(hasLeft).toBe(true);
    expect(editSave.saveEdit).toHaveBeenCalledTimes(1);
    expect(fakeAutosave.discard).toHaveBeenCalledTimes(1);
  });
});
