import { QueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { studioErrorCodeOf } from "./studio.api";
import { toPersonaRefView, type StudioTrackView } from "./studio.adapters";
import {
  toCreditInboxView,
  toPersonaCreditOwnerRows,
  type StudioPersonaCreditOwnerRowView,
} from "./studioDiscovery.adapters";
import { demoStudioTrack } from "./studioDemoApi";
import { resetDemoCreditLedger } from "./studioDemoCreditLedger";
import {
  demoStudioCreditInbox,
  demoStudioCreditPendingCount,
  demoStudioTrackPersonaCredits,
} from "./studioDemoCreditReads";
import { studioKeys } from "./studioQueryKeys";
import {
  useAcceptStudioCredit,
  useDeclineStudioCredit,
} from "./useStudioCreditInboxMutations";
import {
  useAddStudioPersonaCredit,
  useRemoveStudioPersonaCredit,
} from "./useStudioPersonaCreditMutations";

const nightform = toPersonaRefView({
  id: "sp-diogo-nightform",
  handle: "nightform",
  name: "NIGHTFORM",
  kind: "musician",
  avatarUrl: null,
  isListenable: true,
});

const CIDADE = "demo-release-cidade-dos-santos";
const CIDADE_ONE = "demo-track-cidade-dos-santos-01";
const CIDADE_SIX = "demo-track-cidade-dos-santos-06";
const MARIANA_ID = "demo-persona-mariana-sol";

const chipsOf = (trackId: string) =>
  demoStudioTrack(trackId).personaCredits.map((credit) => [
    credit.persona.id,
    credit.role,
  ]);

beforeEach(() => resetDemoCreditLedger());

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );
  return { queryClient, wrapper };
}

describe("persona credit writes (demo)", () => {
  it("adds a pending row and refuses the same persona and role twice", async () => {
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(studioKeys.personaCredits(true, CIDADE_ONE), []);
    const { result } = renderHook(() => useAddStudioPersonaCredit(), {
      wrapper,
    });
    const variables = {
      trackId: CIDADE_ONE,
      releaseId: CIDADE,
      handle: "nightform",
      role: "producer" as const,
    };
    await act(() => result.current.mutateAsync(variables));
    const rows = queryClient.getQueryData<StudioPersonaCreditOwnerRowView[]>(
      studioKeys.personaCredits(true, CIDADE_ONE),
    );
    expect(rows?.map((row) => [row.persona.name, row.status])).toEqual([
      ["NIGHTFORM", "pending"],
    ]);
    const error = await result.current
      .mutateAsync(variables)
      .catch((caught: unknown) => caught);
    expect(studioErrorCodeOf(error)).toBe("studio_credit_already_requested");
  });

  it("keeps a removed declined credit blocking a repeat request", async () => {
    const { queryClient, wrapper } = setup();
    // demo-credit-4: Vanda Diesel, featured, declined on track six.
    const seeded = toPersonaCreditOwnerRows(
      demoStudioTrackPersonaCredits(CIDADE_SIX).items,
    );
    queryClient.setQueryData(studioKeys.personaCredits(true, CIDADE_SIX), [
      ...seeded,
    ]);
    const { result } = renderHook(
      () => ({
        add: useAddStudioPersonaCredit(),
        remove: useRemoveStudioPersonaCredit(),
      }),
      { wrapper },
    );
    await act(() =>
      result.current.remove.mutateAsync({
        trackId: CIDADE_SIX,
        releaseId: CIDADE,
        creditId: "demo-credit-4",
      }),
    );
    expect(
      queryClient.getQueryData(studioKeys.personaCredits(true, CIDADE_SIX)),
    ).toEqual(seeded.filter((row) => row.id !== "demo-credit-4"));
    const error = await result.current.add
      .mutateAsync({
        trackId: CIDADE_SIX,
        releaseId: CIDADE,
        handle: "vanda-diesel",
        role: "featured",
      })
      .catch((caught: unknown) => caught);
    expect(studioErrorCodeOf(error)).toBe("studio_credit_already_requested");
  });

  it("removes a row and its chip from the cached track", async () => {
    const { queryClient, wrapper } = setup();
    // demo-credit-1: NIGHTFORM, producer, accepted on track six.
    const row: StudioPersonaCreditOwnerRowView = {
      id: "demo-credit-1",
      persona: nightform,
      role: "producer",
      roleLabelKey: "studio:credits.role.producer",
      status: "accepted",
      statusLabelKey: "studio:credits.status.accepted",
      isPersonaPublic: true,
      createdAt: "2026-10-01T10:00:00.000Z",
    };
    queryClient.setQueryData(studioKeys.personaCredits(true, CIDADE_SIX), [
      row,
    ]);
    queryClient.setQueryData(studioKeys.track(true, CIDADE_SIX), {
      personaCredits: [
        {
          persona: nightform,
          role: "producer",
          roleLabelKey: "studio:credits.role.producer",
        },
      ],
    });
    const { result } = renderHook(() => useRemoveStudioPersonaCredit(), {
      wrapper,
    });
    await act(() =>
      result.current.mutateAsync({
        trackId: CIDADE_SIX,
        releaseId: CIDADE,
        creditId: "demo-credit-1",
      }),
    );
    expect(
      queryClient.getQueryData(studioKeys.personaCredits(true, CIDADE_SIX)),
    ).toEqual([]);
    expect(
      queryClient.getQueryData<StudioTrackView>(
        studioKeys.track(true, CIDADE_SIX),
      )?.personaCredits,
    ).toEqual([]);
  });

  it("takes a removed credit off the demo track page", async () => {
    const { wrapper } = setup();
    expect(chipsOf(CIDADE_SIX)).toContainEqual([nightform.id, "producer"]);
    const { result } = renderHook(() => useRemoveStudioPersonaCredit(), {
      wrapper,
    });
    await act(() =>
      result.current.mutateAsync({
        trackId: CIDADE_SIX,
        releaseId: CIDADE,
        creditId: "demo-credit-1",
      }),
    );
    expect(chipsOf(CIDADE_SIX)).not.toContainEqual([nightform.id, "producer"]);
  });

  it("keeps a dismissed declined credit after the cache is cleared", async () => {
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(
      () => ({
        add: useAddStudioPersonaCredit(),
        remove: useRemoveStudioPersonaCredit(),
      }),
      { wrapper },
    );
    await act(() =>
      result.current.remove.mutateAsync({
        trackId: CIDADE_SIX,
        releaseId: CIDADE,
        creditId: "demo-credit-4",
      }),
    );
    queryClient.clear();
    expect(
      demoStudioTrackPersonaCredits(CIDADE_SIX).items.map((row) => row.id),
    ).not.toContain("demo-credit-4");
    const error = await result.current.add
      .mutateAsync({
        trackId: CIDADE_SIX,
        releaseId: CIDADE,
        handle: "vanda-diesel",
        role: "featured",
      })
      .catch((caught: unknown) => caught);
    expect(studioErrorCodeOf(error)).toBe("studio_credit_already_requested");
  });
});

describe("inbox writes (demo)", () => {
  it("accepts a request, moves it to Accepted and lowers the count", async () => {
    const { queryClient, wrapper } = setup();
    const inbox = toCreditInboxView(demoStudioCreditInbox());
    queryClient.setQueryData(studioKeys.creditInbox(true), inbox);
    queryClient.setQueryData(studioKeys.creditPendingCount(true), 2);
    const request = inbox.requests[0];
    if (!request) throw new Error("the demo inbox has a request");
    const { result } = renderHook(() => useAcceptStudioCredit(), { wrapper });
    await act(() => result.current.mutateAsync({ row: request }));
    const after = queryClient.getQueryData<typeof inbox>(
      studioKeys.creditInbox(true),
    );
    expect(after?.requests.map((row) => row.id)).not.toContain(request.id);
    expect(after?.accepted[0]?.id).toBe(request.id);
    expect(queryClient.getQueryData(studioKeys.creditPendingCount(true))).toBe(
      1,
    );
  });

  it("puts an accepted credit on the demo track page", async () => {
    const { wrapper } = setup();
    // demo-credit-5: Mariana Sol, featured on home-2's first track.
    const request = toCreditInboxView(demoStudioCreditInbox()).requests.find(
      (row) => row.id === "demo-credit-5",
    );
    if (!request) throw new Error("the demo inbox has demo-credit-5");
    expect(chipsOf("demo-track-home-2-01")).not.toContainEqual([
      MARIANA_ID,
      "featured",
    ]);
    const { result } = renderHook(() => useAcceptStudioCredit(), { wrapper });
    await act(() => result.current.mutateAsync({ row: request }));
    expect(chipsOf("demo-track-home-2-01")).toContainEqual([
      MARIANA_ID,
      "featured",
    ]);
  });

  it("keeps an accepted credit after the cache is cleared", async () => {
    const { queryClient, wrapper } = setup();
    const request = toCreditInboxView(demoStudioCreditInbox()).requests[0];
    if (!request) throw new Error("the demo inbox has a request");
    const { result } = renderHook(() => useAcceptStudioCredit(), { wrapper });
    await act(() => result.current.mutateAsync({ row: request }));
    queryClient.clear();
    const inbox = demoStudioCreditInbox();
    expect(inbox.requests.map((row) => row.id)).not.toContain(request.id);
    expect(inbox.accepted.map((row) => row.id)).toContain(request.id);
    expect(demoStudioCreditPendingCount()).toEqual({ count: 1 });
  });

  it("declines a request and drops it", async () => {
    const { queryClient, wrapper } = setup();
    const inbox = toCreditInboxView(demoStudioCreditInbox());
    queryClient.setQueryData(studioKeys.creditInbox(true), inbox);
    queryClient.setQueryData(studioKeys.creditPendingCount(true), 2);
    const request = inbox.requests[1];
    if (!request) throw new Error("the demo inbox has two requests");
    const { result } = renderHook(() => useDeclineStudioCredit(), { wrapper });
    await act(() => result.current.mutateAsync({ row: request }));
    const after = queryClient.getQueryData<typeof inbox>(
      studioKeys.creditInbox(true),
    );
    expect(after?.requests).toHaveLength(1);
    expect(after?.accepted.map((row) => row.id)).not.toContain(request.id);
    expect(queryClient.getQueryData(studioKeys.creditPendingCount(true))).toBe(
      1,
    );
  });
});
