import type { ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { demoGetLead, resetDemoLeads } from "../leadsDemoStore";
import { leadKeys } from "./leadKeys";
import {
  EMPTY_LEAD_FILTERS,
  type CreateLeadBody,
  type LeadDTO,
} from "./leads.types";
import { useLeadDueCount } from "./useLeadDueCount";
import { useLeadList } from "./useLeadList";
import {
  useCreateLead,
  useDeleteLead,
  useLeadIsWriting,
  useUpdateLead,
} from "./useLeadMutations";

// TestProviders forces demo mode, so every hook here reads and writes the
// demo leads store.

interface CreateHold {
  pending: Promise<void> | null;
}

const createHold: CreateHold = vi.hoisted(() => ({ pending: null }));

// The real store, with its create able to wait on `createHold.pending`. The
// hooks load the store through a dynamic import, which this mock covers.
vi.mock("../leadsDemoStore", async (importOriginal) => {
  const actualStore =
    await importOriginal<typeof import("../leadsDemoStore")>();
  return {
    ...actualStore,
    demoCreateLead: async (body: CreateLeadBody) => {
      if (createHold.pending) await createHold.pending;
      return actualStore.demoCreateLead(body);
    },
  };
});

const CAVE_ID = "demo-lead-cave-23";

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );
  return { queryClient, wrapper };
}

const rowNamesOf = (rows: readonly { name: string }[]) =>
  rows.map((row) => row.name);

beforeEach(() => {
  createHold.pending = null;
  resetDemoLeads();
});

describe("useLeadMutations in demo", () => {
  it("writes the created lead to its detail cache and lists it", async () => {
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(
      () => ({
        create: useCreateLead(),
        list: useLeadList(EMPTY_LEAD_FILTERS),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.rows).toHaveLength(12));
    let created: LeadDTO | undefined;
    await act(async () => {
      created = await result.current.create.mutateAsync({
        name: "Nova Onda",
        type: "dj",
      });
    });
    await waitFor(() =>
      expect(rowNamesOf(result.current.list.rows)).toContain("Nova Onda"),
    );
    const leadId = created?.id ?? "";
    expect(
      queryClient.getQueryData<LeadDTO>(leadKeys.detail(leadId, true))?.name,
    ).toBe("Nova Onda");
  });

  it("puts the stage change in the history and the badge follows", async () => {
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(
      () => ({
        update: useUpdateLead(CAVE_ID),
        dueCount: useLeadDueCount({ isEnabled: true }),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.dueCount.data).toBe(4));
    await act(async () => {
      await result.current.update.mutateAsync({ stage: "on_board" });
    });
    await waitFor(() => expect(result.current.dueCount.data).toBe(3));
    const cached = queryClient.getQueryData<LeadDTO>(
      leadKeys.detail(CAVE_ID, true),
    );
    expect(cached?.entries[0]).toMatchObject({
      kind: "stage_changed",
      fromStage: "in_talks",
      toStage: "on_board",
    });
  });

  it("drops the detail query after a delete", async () => {
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(
      () => ({
        remove: useDeleteLead(),
        list: useLeadList(EMPTY_LEAD_FILTERS),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(rowNamesOf(result.current.list.rows)).toContain("Cave 23"),
    );
    queryClient.setQueryData(
      leadKeys.detail(CAVE_ID, true),
      demoGetLead(CAVE_ID),
    );
    await act(async () => {
      await result.current.remove.mutateAsync({ leadId: CAVE_ID });
    });
    expect(
      queryClient.getQueryData(leadKeys.detail(CAVE_ID, true)),
    ).toBeUndefined();
    await waitFor(() =>
      expect(rowNamesOf(result.current.list.rows)).not.toContain("Cave 23"),
    );
  });

  it("reports a write in flight", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({ create: useCreateLead(), isWriting: useLeadIsWriting() }),
      { wrapper },
    );
    expect(result.current.isWriting).toBe(false);
    let releaseCreate = (): void => undefined;
    createHold.pending = new Promise<void>((resolve) => {
      releaseCreate = resolve;
    });
    act(() => {
      result.current.create.mutate({ name: "Held", type: "band" });
    });
    await waitFor(() => expect(result.current.isWriting).toBe(true));
    await act(async () => {
      releaseCreate();
      await createHold.pending;
    });
    await waitFor(() => expect(result.current.isWriting).toBe(false));
    expect(result.current.create.data?.name).toBe("Held");
  });

  it("keeps a newer cached lead when an older answer settles", async () => {
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(() => useUpdateLead(CAVE_ID), { wrapper });
    queryClient.setQueryData(leadKeys.detail(CAVE_ID, true), {
      ...demoGetLead(CAVE_ID),
      name: "Cave 23 newer",
      updatedAt: "2999-01-01T00:00:00.000Z",
    });
    await act(async () => {
      await result.current.mutateAsync({ stage: "on_board" });
    });
    expect(
      queryClient.getQueryData<LeadDTO>(leadKeys.detail(CAVE_ID, true))?.name,
    ).toBe("Cave 23 newer");
  });
});
