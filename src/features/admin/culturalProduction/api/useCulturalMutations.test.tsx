import type { ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { resetDemoCulturalProduction } from "../culturalProductionDemoStore";
import type {
  CulturalIdeaDTO,
  CulturalTaskDTO,
} from "./culturalProduction.types";
import { culturalKeys } from "./culturalProductionKeys";
import { useCulturalIdeas } from "./useCulturalIdeas";
import {
  useToggleCulturalIdeaBacking,
  useUpdateCulturalIdea,
} from "./useCulturalIdeaMutations";
import { useCulturalTaskDueCount } from "./useCulturalTaskDueCount";
import { useCulturalTasks } from "./useCulturalTasks";
import {
  useAssignCulturalTask,
  useIsCulturalWriteInFlight,
  useUpdateCulturalTask,
} from "./useCulturalTaskMutations";
import { useCreateCulturalTaskBatch } from "./useCulturalGuideMutations";

// TestProviders forces demo mode, so every hook here reads and writes the
// demo cultural production store. The seeded badge reads 2: the viewer's
// open tasks due today or earlier are the bingo venue and the picnic permit.

interface BackingHold {
  pending: Promise<void> | null;
  callCount: number;
}

const backingHold: BackingHold = vi.hoisted(() => ({
  pending: null,
  callCount: 0,
}));

// The real store, with its backing write counted and able to wait on
// `backingHold.pending`. The hooks load the store through a dynamic import,
// which this mock covers.
vi.mock("../culturalProductionDemoStore", async (importOriginal) => {
  const actualStore =
    await importOriginal<typeof import("../culturalProductionDemoStore")>();
  return {
    ...actualStore,
    demoBackCulturalIdea: async (ideaId: string) => {
      backingHold.callCount += 1;
      if (backingHold.pending) await backingHold.pending;
      return actualStore.demoBackCulturalIdea(ideaId);
    },
  };
});

const BINGO_IDEA_ID = "demo-idea-drag-bingo";
const FILM_IDEA_ID = "demo-idea-film-qa";
const BINGO_TASK_ID = "demo-task-bingo-venue";
const POSTER_TASK_ID = "demo-task-poster";
const QUIZ_GUIDE_ID = "demo-guide-quiz-en";
const FORMER_STAFF_ID = "demo-cp-dani";
const EVERYONE_ALL_STATUSES = { assignedTo: null, status: null } as const;

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );
  return { queryClient, wrapper };
}

beforeEach(() => {
  backingHold.pending = null;
  backingHold.callCount = 0;
  resetDemoCulturalProduction();
});

describe("cultural production mutations in demo", () => {
  it("writes the answered idea to its detail key and invalidates the ideas list", async () => {
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(
      () => ({
        update: useUpdateCulturalIdea(BINGO_IDEA_ID),
        ideas: useCulturalIdeas(),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.ideas.data?.items).toHaveLength(6),
    );
    await act(async () => {
      await result.current.update.mutateAsync({ title: "Drag bingo night" });
    });
    expect(
      queryClient.getQueryData<CulturalIdeaDTO>(
        culturalKeys.idea(BINGO_IDEA_ID, true),
      )?.title,
    ).toBe("Drag bingo night");
    await waitFor(() =>
      expect(
        result.current.ideas.data?.items.find(
          (idea) => idea.id === BINGO_IDEA_ID,
        )?.title,
      ).toBe("Drag bingo night"),
    );
  });

  it("shows a renamed idea's new title on its linked task row and detail", async () => {
    const { queryClient, wrapper } = setup();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(
      () => ({
        update: useUpdateCulturalIdea(BINGO_IDEA_ID),
        tasks: useCulturalTasks(EVERYONE_ALL_STATUSES),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.tasks.data?.items).toHaveLength(8),
    );
    await act(async () => {
      await result.current.update.mutateAsync({ title: "Drag bingo night" });
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: culturalKeys.tasksRoot,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: culturalKeys.taskRoot,
    });
    await waitFor(() =>
      expect(
        result.current.tasks.data?.items.find(
          (task) => task.id === BINGO_TASK_ID,
        )?.idea?.title,
      ).toBe("Drag bingo night"),
    );
  });

  it("invalidates the due count after a task status change", async () => {
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(
      () => ({
        update: useUpdateCulturalTask(BINGO_TASK_ID),
        dueCount: useCulturalTaskDueCount({ isEnabled: true }),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.dueCount.data).toBe(2));
    await act(async () => {
      await result.current.update.mutateAsync({ status: "done" });
    });
    await waitFor(() => expect(result.current.dueCount.data).toBe(1));
    expect(
      queryClient.getQueryData<CulturalTaskDTO>(
        culturalKeys.task(BINGO_TASK_ID, true),
      )?.status,
    ).toBe("done");
  });

  it("invalidates tasks and the due count after a batch", async () => {
    const { queryClient, wrapper } = setup();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(
      () => ({
        batch: useCreateCulturalTaskBatch(QUIZ_GUIDE_ID),
        tasks: useCulturalTasks(EVERYONE_ALL_STATUSES),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.tasks.data?.items).toHaveLength(8),
    );
    let createdCount = 0;
    await act(async () => {
      const batch = await result.current.batch.mutateAsync({
        eventOn: "2099-06-20",
      });
      createdCount = batch.items.length;
    });
    expect(createdCount).toBeGreaterThan(0);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: culturalKeys.tasksRoot,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: culturalKeys.dueCountRoot,
    });
    await waitFor(() =>
      expect(result.current.tasks.data?.items).toHaveLength(8 + createdCount),
    );
  });

  it("refreshes the staff search after a not-staff refusal", async () => {
    const { queryClient, wrapper } = setup();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useAssignCulturalTask(POSTER_TASK_ID), {
      wrapper,
    });
    await act(async () => {
      await expect(
        result.current.mutateAsync({ userId: FORMER_STAFF_ID }),
      ).rejects.toMatchObject({
        data: { code: "CULTURAL_ASSIGNEE_NOT_STAFF", reason: "no_access" },
      });
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: culturalKeys.staffSearchRoot,
    });
  });

  it("removes the detail key on a not-found refusal", async () => {
    const { queryClient, wrapper } = setup();
    const goneTaskId = "demo-task-gone";
    const goneKey = culturalKeys.task(goneTaskId, true);
    queryClient.setQueryData(goneKey, { id: goneTaskId });
    const { result } = renderHook(() => useUpdateCulturalTask(goneTaskId), {
      wrapper,
    });
    await act(async () => {
      await expect(
        result.current.mutateAsync({ status: "done" }),
      ).rejects.toMatchObject({ data: { code: "CULTURAL_TASK_NOT_FOUND" } });
    });
    expect(queryClient.getQueryData(goneKey)).toBeUndefined();
  });

  it("sends one write when a second toggle is pressed while the first is in flight", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => {
        const toggle = useToggleCulturalIdeaBacking(FILM_IDEA_ID);
        const isWriteInFlight = useIsCulturalWriteInFlight();
        // The idea drawer's guard: a press while a write is in flight is ignored.
        const press = () => {
          if (isWriteInFlight) return;
          toggle.mutate({ isBacking: true });
        };
        return { toggle, isWriteInFlight, press };
      },
      { wrapper },
    );
    let releaseBacking = (): void => undefined;
    backingHold.pending = new Promise<void>((resolve) => {
      releaseBacking = resolve;
    });
    act(() => result.current.press());
    await waitFor(() => expect(result.current.isWriteInFlight).toBe(true));
    act(() => result.current.press());
    await act(async () => {
      releaseBacking();
      await backingHold.pending;
    });
    await waitFor(() => expect(result.current.isWriteInFlight).toBe(false));
    expect(backingHold.callCount).toBe(1);
    expect(result.current.toggle.data?.isBackedByMe).toBe(true);
  });
});
