import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { createFormatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { GuestCommunityDraftEntry } from "./api/eventCommunities.api";
import type { useUpdateEvent } from "./api/useEventMutations";
import type { GatheringDetail } from "./data";
import {
  editDraftFromState,
  liveInitialState,
  type GatheringState,
} from "./manageGatheringState";
import { useGatheringEditSave } from "./useGatheringEditSave";

vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));
vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ language: "en", t: (key: string) => key }),
}));
// Real formatters, so a save that folds into live state can render its
// date rows.
vi.mock("../../shared/i18n/format", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../../shared/i18n/format")>();
  return {
    ...original,
    useFormat: () => original.createFormatters("en-GB"),
  };
});

const t: TFunction = (key) => key;
const fmt = createFormatters("en-GB");

const joined: GuestCommunityDraftEntry = {
  slug: "trans-hub",
  name: "Trans & Non-Binary Hub",
  accessTier: "request",
  status: "accepted",
};
const added: GuestCommunityDraftEntry = {
  slug: "queer-elders",
  name: "Queer Elders",
  accessTier: "public",
  status: "unsent",
};

const gathering = {
  slug: "end-of-month-run",
  title: "End-of-Month Run",
  body: "A flat, friendly 5K.",
  date: new Date("2026-11-01T09:00:00"),
  hood: "Tejo path",
  communitySlug: "queer-runners",
} as unknown as GatheringDetail;

function savedState(): GatheringState {
  return {
    ...liveInitialState(gathering, fmt, t),
    guestCommunities: [joined],
  };
}

function updateEventWith(mutateAsync: (patch: unknown) => Promise<unknown>) {
  return { mutateAsync } as unknown as ReturnType<typeof useUpdateEvent>;
}

function renderSave({
  isSeries = false,
  mutateAsync = vi.fn().mockResolvedValue({ notifiedCount: 0 }),
}: {
  isSeries?: boolean;
  mutateAsync?: (patch: unknown) => Promise<unknown>;
} = {}) {
  const onSaveGuestCommunities = vi.fn();
  const gatheringState = savedState();
  const { result } = renderHook(() =>
    useGatheringEditSave({
      isSeries,
      gatheringState,
      setGatheringState: vi.fn(),
      updateEvent: updateEventWith(mutateAsync),
      onChooseCancelScope: vi.fn(),
      onSaveGuestCommunities,
    }),
  );
  const draft = {
    ...editDraftFromState(gatheringState),
    guestCommunities: [joined, added],
  };
  return { result, onSaveGuestCommunities, draft };
}

describe("saveEditDraft guest communities", () => {
  it("invites a newly added guest once the PATCH has landed", async () => {
    let resolvePatch: (value: { notifiedCount: number }) => void = () => {};
    const mutateAsync = vi.fn(
      () =>
        new Promise<{ notifiedCount: number }>((resolve) => {
          resolvePatch = resolve;
        }),
    );
    const { result, onSaveGuestCommunities, draft } = renderSave({
      mutateAsync,
    });
    let saved: Promise<number | null> = Promise.resolve(null);
    act(() => {
      saved = result.current.saveEditDraft(draft);
    });
    expect(onSaveGuestCommunities).not.toHaveBeenCalled();
    resolvePatch({ notifiedCount: 0 });
    await act(async () => {
      await saved;
    });
    expect(onSaveGuestCommunities).toHaveBeenCalledWith({
      invites: [added],
      removeSlugs: [],
    });
  });

  it("sends no guest change when the PATCH is refused", async () => {
    const { result, onSaveGuestCommunities, draft } = renderSave({
      mutateAsync: vi.fn().mockRejectedValue(new Error("400")),
    });
    await act(async () => {
      await result.current.saveEditDraft(draft);
    });
    expect(onSaveGuestCommunities).not.toHaveBeenCalled();
  });

  it("holds a repeating gathering's guest changes until a scope is picked", async () => {
    const { result, onSaveGuestCommunities, draft } = renderSave({
      isSeries: true,
    });
    await act(async () => {
      await result.current.saveEditDraft(draft);
    });
    expect(onSaveGuestCommunities).not.toHaveBeenCalled();
    act(() => result.current.askScopeForPendingEdit());
    act(() => result.current.chooseSeriesScope("this"));
    await vi.waitFor(() =>
      expect(onSaveGuestCommunities).toHaveBeenCalledWith({
        invites: [added],
        removeSlugs: [],
      }),
    );
  });

  it("drops a repeating gathering's guest changes when the scope prompt is dismissed", async () => {
    const { result, onSaveGuestCommunities, draft } = renderSave({
      isSeries: true,
    });
    await act(async () => {
      await result.current.saveEditDraft(draft);
    });
    act(() => result.current.askScopeForPendingEdit());
    act(() => result.current.closeSeriesScope());
    expect(onSaveGuestCommunities).not.toHaveBeenCalled();
  });

  it("keeps unsent guests when the save is refused, so the next save still invites them", async () => {
    const mutateAsync = vi
      .fn()
      .mockRejectedValueOnce(new Error("400"))
      .mockResolvedValueOnce({ notifiedCount: 0 });
    const onSaveGuestCommunities = vi.fn();
    // The state lives in the harness, so the refused save's fold reaches the
    // second save the way it does on the page.
    const { result } = renderHook(() => {
      const [gatheringState, setGatheringState] =
        useState<GatheringState>(savedState);
      const editSave = useGatheringEditSave({
        isSeries: false,
        gatheringState,
        setGatheringState,
        updateEvent: updateEventWith(mutateAsync),
        onChooseCancelScope: vi.fn(),
        onSaveGuestCommunities,
      });
      return { gatheringState, editSave };
    });
    const draft = {
      ...editDraftFromState(result.current.gatheringState),
      guestCommunities: [joined, added],
    };

    await act(async () => {
      await result.current.editSave.saveEditDraft(draft);
    });
    expect(onSaveGuestCommunities).not.toHaveBeenCalled();
    expect(result.current.gatheringState.guestCommunities).toEqual([joined]);

    await act(async () => {
      await result.current.editSave.saveEditDraft(draft);
    });
    expect(mutateAsync).toHaveBeenCalledTimes(2);
    expect(onSaveGuestCommunities).toHaveBeenCalledWith({
      invites: [added],
      removeSlugs: [],
    });
  });

  it("reads the host's guest changes against the list the modal opened on", async () => {
    const onSaveGuestCommunities = vi.fn();
    // A refetch after an earlier save brought `added` in while the modal
    // held its opening list.
    const refreshedState: GatheringState = {
      ...savedState(),
      guestCommunities: [joined, { ...added, status: "pending" }],
    };
    const { result } = renderHook(() =>
      useGatheringEditSave({
        isSeries: false,
        gatheringState: refreshedState,
        setGatheringState: vi.fn(),
        updateEvent: updateEventWith(
          vi.fn().mockResolvedValue({ notifiedCount: 0 }),
        ),
        onChooseCancelScope: vi.fn(),
        onSaveGuestCommunities,
      }),
    );
    const openedDraft = editDraftFromState(savedState());
    await act(async () => {
      await result.current.saveEditDraft(
        { ...openedDraft, title: "Renamed run" },
        openedDraft.guestCommunities,
      );
    });
    expect(onSaveGuestCommunities).toHaveBeenCalledWith({
      invites: [],
      removeSlugs: [],
    });
  });

  it("asks for the guest list again after a save that moved the lead", async () => {
    const onLeadCommunityChanged = vi.fn();
    const gatheringState = savedState();
    const { result } = renderHook(() =>
      useGatheringEditSave({
        isSeries: false,
        gatheringState,
        setGatheringState: vi.fn(),
        updateEvent: updateEventWith(
          vi.fn().mockResolvedValue({ notifiedCount: 0 }),
        ),
        onChooseCancelScope: vi.fn(),
        onLeadCommunityChanged,
      }),
    );
    await act(async () => {
      await result.current.saveEditDraft({
        ...editDraftFromState(gatheringState),
        communitySlug: "trans-hub",
      });
    });
    expect(onLeadCommunityChanged).toHaveBeenCalledWith("trans-hub");
  });
});
