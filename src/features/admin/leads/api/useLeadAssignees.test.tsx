import type { ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { leadRefusal, resetDemoLeads } from "../leadsDemoStore";
import { DEMO_LEAD_VIEWER_ID } from "../leadsDemoViewer";
import { useLeadViewerId } from "../useLeadViewerId";
import { leadKeys } from "./leadKeys";
import { EMPTY_LEAD_FILTERS, type LeadDTO } from "./leads.types";
import { useLeadDueCount } from "./useLeadDueCount";
import { useLeadList } from "./useLeadList";
import { useAssignLeadStaff, useUnassignLeadStaff } from "./useLeadMutations";
import { useLeadStaffSearch } from "./useLeadStaffSearch";

// TestProviders forces demo mode, so every hook here reads and writes the
// demo leads store.

interface RefusalQueue {
  next: Error | null;
}

const refusals: RefusalQueue = vi.hoisted(() => ({ next: null }));

// The real store, with its assign able to throw `refusals.next` once. The
// hooks load the store through a dynamic import, which this mock covers.
vi.mock("../leadsDemoStore", async (importOriginal) => {
  const actualStore =
    await importOriginal<typeof import("../leadsDemoStore")>();
  return {
    ...actualStore,
    demoAssignLeadStaff: (
      leadId: string,
      body: { userId: string },
      today?: string,
    ) => {
      const refusal = refusals.next;
      if (refusal !== null) {
        refusals.next = null;
        throw refusal;
      }
      return actualStore.demoAssignLeadStaff(leadId, body, today);
    },
  };
});

const KAI_ID = "demo-lead-kai-duarte";
const LUA_ID = "demo-lead-lua-marques";
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

const keysInvalidatedBy = (invalidate: {
  mock: { calls: unknown[][] };
}): unknown[] =>
  invalidate.mock.calls.map(
    (call) => (call[0] as { queryKey?: unknown } | undefined)?.queryKey,
  );

beforeEach(() => {
  refusals.next = null;
  resetDemoLeads();
});

describe("lead assignee hooks in demo", () => {
  it("assigns, writes the lead to its cache and the badge follows", async () => {
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(
      () => ({
        assign: useAssignLeadStaff(KAI_ID),
        dueCount: useLeadDueCount({ isEnabled: true }),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.dueCount.data).toBe(3));
    await act(async () => {
      await result.current.assign.mutateAsync({ userId: DEMO_LEAD_VIEWER_ID });
    });
    await waitFor(() => expect(result.current.dueCount.data).toBe(4));
    expect(
      queryClient
        .getQueryData<LeadDTO>(leadKeys.detail(KAI_ID, true))
        ?.assignees.map((assignee) => assignee.id),
    ).toEqual(["demo-staff-rafa", DEMO_LEAD_VIEWER_ID]);
  });

  it("unassigns and the Assigned to me list follows", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        unassign: useUnassignLeadStaff(LUA_ID),
        list: useLeadList({ ...EMPTY_LEAD_FILTERS, assignedTo: "me" }),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(rowNamesOf(result.current.list.rows)).toContain("Lua Marques"),
    );
    await act(async () => {
      await result.current.unassign.mutateAsync({
        userId: DEMO_LEAD_VIEWER_ID,
      });
    });
    await waitFor(() =>
      expect(rowNamesOf(result.current.list.rows)).not.toContain("Lua Marques"),
    );
  });

  it("refreshes the staff search after a not-staff refusal", async () => {
    refusals.next = leadRefusal("LEAD_ASSIGNEE_NOT_STAFF", 400, {
      reason: "suspended",
    });
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useAssignLeadStaff(CAVE_ID), {
      wrapper,
    });
    await act(async () => {
      await result.current
        .mutateAsync({ userId: "demo-staff-bea" })
        .catch(() => undefined);
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: leadKeys.staffSearchRoot,
    });
  });

  it("refreshes the staff search after a not-found refusal", async () => {
    refusals.next = leadRefusal("LEAD_ASSIGNEE_NOT_FOUND", 404);
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useAssignLeadStaff(CAVE_ID), {
      wrapper,
    });
    await act(async () => {
      await result.current
        .mutateAsync({ userId: "demo-staff-bea" })
        .catch(() => undefined);
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: leadKeys.staffSearchRoot,
    });
  });

  it("re-reads the lead after a too-many refusal", async () => {
    refusals.next = leadRefusal("LEAD_TOO_MANY_ASSIGNEES", 409);
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useAssignLeadStaff(CAVE_ID), {
      wrapper,
    });
    await act(async () => {
      await result.current
        .mutateAsync({ userId: "demo-staff-bea" })
        .catch(() => undefined);
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: [...leadKeys.detailRoot, CAVE_ID],
    });
    expect(keysInvalidatedBy(invalidate)).not.toContainEqual(
      leadKeys.staffSearchRoot,
    );
  });

  it("leaves the staff search alone after an assign", async () => {
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useAssignLeadStaff(CAVE_ID), {
      wrapper,
    });
    await act(async () => {
      await result.current.mutateAsync({ userId: "demo-staff-bea" });
    });
    const invalidatedKeys = keysInvalidatedBy(invalidate);
    expect(invalidatedKeys).toContainEqual(leadKeys.listRoot);
    expect(invalidatedKeys).not.toContainEqual(leadKeys.staffSearchRoot);
  });

  it("loads the five-row preview for a blank search", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useLeadStaffSearch(""), { wrapper });
    await waitFor(() => expect(result.current.results).toHaveLength(5));
    expect(result.current.term).toBe("");
  });

  it("searches the trimmed term and empties at once when cleared", async () => {
    const { wrapper } = setup();
    const { result, rerender } = renderHook(
      ({ query }) => useLeadStaffSearch(query),
      { wrapper, initialProps: { query: "  ines " } },
    );
    await waitFor(() =>
      expect(
        result.current.results.map((person) => person.displayName),
      ).toEqual(["Inês Barros"]),
    );
    expect(result.current.term).toBe("ines");
    rerender({ query: "" });
    expect(result.current.term).toBe("");
    expect(
      result.current.results.map((person) => person.displayName),
    ).not.toContain("Inês Barros");
  });

  it("answers the demo viewer id in demo", () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useLeadViewerId(), { wrapper });
    expect(result.current).toBe(DEMO_LEAD_VIEWER_ID);
    expect(result.current).not.toBe("demo");
  });
});
