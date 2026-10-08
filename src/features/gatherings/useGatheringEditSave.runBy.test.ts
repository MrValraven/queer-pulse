import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import type { useUpdateEvent } from "./api/useEventMutations";
import {
  applyRunBySelection,
  type GatheringState,
} from "./manageGatheringState";
import { useGatheringEditSave } from "./useGatheringEditSave";

vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));
vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ language: "en", t: (key: string) => key }),
}));
vi.mock("../../shared/i18n/format", () => ({ useFormat: () => ({}) }));

const listing = {
  ref: "QPL-2026-0101",
  slug: "lisboa-arco-iris-walks",
  name: "Lisboa Arco-Íris Walks",
};

function renderSave({
  isSeries = false,
  mutateAsync = vi.fn().mockResolvedValue({ notifiedCount: null }),
} = {}) {
  const setGatheringState = vi.fn();
  const { result } = renderHook(() =>
    useGatheringEditSave({
      isSeries,
      gatheringState: { runByListing: null } as GatheringState,
      setGatheringState,
      updateEvent: { mutateAsync } as unknown as ReturnType<
        typeof useUpdateEvent
      >,
      onChooseCancelScope: vi.fn(),
    }),
  );
  return { result, mutateAsync, setGatheringState };
}

describe("saveRunBy", () => {
  it("sends the picked listing id and nothing else, then shows it", async () => {
    const { result, mutateAsync, setGatheringState } = renderSave();
    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.saveRunBy({
        listingId: "listing-uuid-1",
        listing,
      });
    });
    expect(mutateAsync).toHaveBeenCalledWith({
      runByListingId: "listing-uuid-1",
    });
    expect(outcome).toBe("saved");
    expect(setGatheringState).toHaveBeenCalled();
  });

  it("clears the link with null", async () => {
    const { result, mutateAsync } = renderSave();
    await act(async () => {
      await result.current.saveRunBy({ listingId: null, listing: null });
    });
    expect(mutateAsync).toHaveBeenCalledWith({ runByListingId: null });
  });

  it("reads 400 Run by listing not found and 403 RUN_BY_NOT_MANAGER as refused, and shows nothing", async () => {
    for (const error of [
      new ApiError(400, "Run by listing not found"),
      new ApiError(
        403,
        "Only someone who runs this business can name it as running a gathering.",
        {
          code: "RUN_BY_NOT_MANAGER",
        },
      ),
    ]) {
      const { result, setGatheringState } = renderSave({
        mutateAsync: vi.fn().mockRejectedValue(error),
      });
      let outcome: string | undefined;
      await act(async () => {
        outcome = await result.current.saveRunBy({
          listingId: "listing-uuid-1",
          listing,
        });
      });
      expect(outcome).toBe("refused");
      expect(setGatheringState).not.toHaveBeenCalled();
    }
  });

  it("asks a repeating gathering's scope before sending", async () => {
    const { result, mutateAsync } = renderSave({ isSeries: true });
    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.saveRunBy({
        listingId: "listing-uuid-1",
        listing,
      });
    });
    expect(outcome).toBe("awaitingScope");
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(result.current.seriesScopeModal).toBe("editField");
  });
});

describe("applyRunBySelection", () => {
  it("shows the pick, and clears it", () => {
    const state = { runByListing: null } as GatheringState;
    const picked = applyRunBySelection(state, {
      listingId: "listing-uuid-1",
      listing,
    });
    expect(picked.runByListing).toEqual(listing);
    expect(
      applyRunBySelection(picked, { listingId: null, listing: null })
        .runByListing,
    ).toBeNull();
  });
});
