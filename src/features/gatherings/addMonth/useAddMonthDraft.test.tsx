import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ADD_MONTH_DRAFT_SAVE_DELAY_MS } from "./addMonth.data";
import {
  addMonthDraftKey,
  readAddMonthDraft,
  writeAddMonthDraft,
} from "./addMonthDraftStorage";
import { EMPTY_ADD_MONTH_STATE, type AddMonthState } from "./addMonthState";
import { useAddMonthDraft } from "./useAddMonthDraft";

const storageKey = addMonthDraftKey("member-1");

function monthWithDates(dates: string[]): AddMonthState {
  return {
    ...EMPTY_ADD_MONTH_STATE,
    templateSlug: "queer-supper",
    rows: dates.map((date) => ({
      date,
      title: `Supper ${date}`,
      description: "A long table",
      photo: null,
      timeOverride: null,
    })),
  };
}

const storedMonth = monthWithDates(["2026-12-05", "2026-12-12", "2026-12-19"]);

function renderDraft(initialState: AddMonthState) {
  const onRestore = vi.fn<(state: AddMonthState) => void>();
  const hook = renderHook(
    ({ state }) => useAddMonthDraft({ memberId: "member-1", state, onRestore }),
    { initialProps: { state: initialState } },
  );
  return { ...hook, onRestore };
}

function advancePastSaveDelay() {
  act(() => {
    vi.advanceTimersByTime(ADD_MONTH_DRAFT_SAVE_DELAY_MS + 1);
  });
}

describe("useAddMonthDraft", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("offers a stored month and holds saving until the host answers", () => {
    writeAddMonthDraft(storageKey, storedMonth, Date.now() - 5 * 60_000);
    const { result } = renderDraft(EMPTY_ADD_MONTH_STATE);
    expect(result.current.offer).toEqual({ dateCount: 3, ageMinutes: 5 });
    advancePastSaveDelay();
    expect(readAddMonthDraft(storageKey)!.state).toEqual(storedMonth);
  });

  it("makes no offer when nothing is stored", () => {
    const { result } = renderDraft(EMPTY_ADD_MONTH_STATE);
    expect(result.current.offer).toBeNull();
  });

  it("resume hands the stored state to onRestore and clears the offer", () => {
    writeAddMonthDraft(storageKey, storedMonth, Date.now());
    const { result, onRestore } = renderDraft(EMPTY_ADD_MONTH_STATE);
    act(() => result.current.resume());
    expect(onRestore).toHaveBeenCalledWith(storedMonth);
    expect(result.current.offer).toBeNull();
  });

  it("startFresh deletes the stored month and starts saving the new one", () => {
    writeAddMonthDraft(storageKey, storedMonth, Date.now());
    const { result, rerender } = renderDraft(EMPTY_ADD_MONTH_STATE);
    act(() => result.current.startFresh());
    expect(readAddMonthDraft(storageKey)).toBeNull();
    expect(result.current.offer).toBeNull();
    const newMonth = monthWithDates(["2027-01-09"]);
    rerender({ state: newMonth });
    advancePastSaveDelay();
    expect(readAddMonthDraft(storageKey)!.state).toEqual(newMonth);
  });

  it("saves after the page goes quiet for ADD_MONTH_DRAFT_SAVE_DELAY_MS", () => {
    renderDraft(storedMonth);
    expect(readAddMonthDraft(storageKey)).toBeNull();
    act(() => {
      vi.advanceTimersByTime(ADD_MONTH_DRAFT_SAVE_DELAY_MS - 1);
    });
    expect(readAddMonthDraft(storageKey)).toBeNull();
    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(readAddMonthDraft(storageKey)!.state).toEqual(storedMonth);
  });

  it("waits for a quiet page when edits keep arriving", () => {
    const { rerender } = renderDraft(monthWithDates(["2026-12-05"]));
    act(() => {
      vi.advanceTimersByTime(ADD_MONTH_DRAFT_SAVE_DELAY_MS - 100);
    });
    rerender({ state: storedMonth });
    act(() => {
      vi.advanceTimersByTime(ADD_MONTH_DRAFT_SAVE_DELAY_MS - 100);
    });
    expect(readAddMonthDraft(storageKey)).toBeNull();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(readAddMonthDraft(storageKey)!.state).toEqual(storedMonth);
  });

  it("removes the stored month when the state goes back to empty", () => {
    const { rerender } = renderDraft(storedMonth);
    advancePastSaveDelay();
    expect(readAddMonthDraft(storageKey)).not.toBeNull();
    rerender({ state: EMPTY_ADD_MONTH_STATE });
    advancePastSaveDelay();
    expect(readAddMonthDraft(storageKey)).toBeNull();
  });

  it("forget deletes the stored month (publish calls it)", () => {
    const { result } = renderDraft(storedMonth);
    advancePastSaveDelay();
    expect(readAddMonthDraft(storageKey)).not.toBeNull();
    act(() => result.current.forget());
    expect(readAddMonthDraft(storageKey)).toBeNull();
  });

  it("forget keeps a pending save from writing the published month back", () => {
    const { result } = renderDraft(storedMonth);
    act(() => result.current.forget());
    advancePastSaveDelay();
    expect(readAddMonthDraft(storageKey)).toBeNull();
  });

  it("forget covers a state that changed while the publish request was in flight", () => {
    const { result, rerender } = renderDraft(storedMonth);
    const forgetFromPublishStart = result.current.forget;
    rerender({ state: monthWithDates(["2026-12-05", "2026-12-12"]) });
    act(() => forgetFromPublishStart());
    advancePastSaveDelay();
    expect(readAddMonthDraft(storageKey)).toBeNull();
    expect(result.current.forget).toBe(forgetFromPublishStart);
  });

  it("saving resumes when the state changes after forget", () => {
    const { result, rerender } = renderDraft(storedMonth);
    act(() => result.current.forget());
    const nextMonth = monthWithDates(["2027-01-09"]);
    rerender({ state: nextMonth });
    advancePastSaveDelay();
    expect(readAddMonthDraft(storageKey)!.state).toEqual(nextMonth);
  });
});
