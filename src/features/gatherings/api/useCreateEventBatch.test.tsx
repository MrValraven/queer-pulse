import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetDemoEventBatch } from "../addMonth/eventBatchDemo";
import * as eventBatchApi from "./eventBatch.api";
import type { CreateEventBatchDto } from "./eventBatch.api";
import { useCreateEventBatch } from "./useCreateEventBatch";

const mocks = vi.hoisted(() => ({ isDemoMode: false }));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: mocks.isDemoMode }),
}));

/** One date, a week out from whenever the suite runs, so the demo stand-in
 *  never refuses it as past or too far ahead. */
function weekAheadDate(): string {
  const weekAhead = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return weekAhead.toISOString().slice(0, 10);
}

function batch(): CreateEventBatchDto {
  return {
    templateSlug: "newcomers-mixer-july",
    shared: { startTime: "18:30", endTime: "21:00" },
    rows: [
      {
        date: weekAheadDate(),
        title: "Newcomers Mixer: next week",
        description: "A low-key evening to meet people.",
      },
    ],
  };
}

function renderCreate() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const rendered = renderHook(() => useCreateEventBatch(), { wrapper });
  return { ...rendered, invalidateSpy };
}

beforeEach(() => {
  mocks.isDemoMode = false;
});

afterEach(() => {
  resetDemoEventBatch();
  vi.restoreAllMocks();
});

describe("useCreateEventBatch", () => {
  it("calls POST /events/batch in live mode and refreshes the hosting lists", async () => {
    const createSpy = vi
      .spyOn(eventBatchApi, "createEventBatch")
      .mockResolvedValue({ events: [] });
    const { result, invalidateSpy } = renderCreate();
    const payload = batch();

    await act(async () => {
      await result.current.mutateAsync(payload);
    });

    expect(createSpy).toHaveBeenCalledWith(payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["events"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["my-events"] });
  });

  it("serves the demo stand-in without a request in demo mode", async () => {
    mocks.isDemoMode = true;
    const createSpy = vi.spyOn(eventBatchApi, "createEventBatch");
    const { result, invalidateSpy } = renderCreate();

    let created: Awaited<ReturnType<typeof result.current.mutateAsync>> = {
      events: [],
    };
    await act(async () => {
      created = await result.current.mutateAsync(batch());
    });

    expect(createSpy).not.toHaveBeenCalled();
    expect(created.events).toHaveLength(1);
    expect(created.events[0]!.title).toBe("Newcomers Mixer: next week");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["my-events"] });
  });

  it("refreshes nothing when the server refuses the month", async () => {
    vi.spyOn(eventBatchApi, "createEventBatch").mockRejectedValue(
      new Error("refused"),
    );
    const { result, invalidateSpy } = renderCreate();

    await act(async () => {
      await result.current.mutateAsync(batch()).catch(() => undefined);
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
