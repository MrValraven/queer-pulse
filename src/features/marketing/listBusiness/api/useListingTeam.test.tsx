import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DemoModeProvider } from "../../../../app/providers/DemoModeProvider";
import { AuthProvider } from "../../../../app/providers/AuthProvider";
import { DIRECTORY_KEY } from "../../api/directoryQueryKey";
import { resetListingTeamDemo } from "./listingTeam.demo";
import { listingTeamQueryKeys } from "./listingTeamQueryKeys";
import { useListingTeam, useListingTeamCandidates } from "./useListingTeam";
import { useListingTeamMutations } from "./useListingTeamMutations";
import { useMemberTeamLinkMutations } from "./useMemberTeamLinkMutations";
import { useMemberTeamLinks } from "./useMemberTeamLinks";
import { usePersonaTeamLinks } from "./usePersonaTeamLinks";
import { usePersonaTeamLinkMutations } from "./usePersonaTeamLinkMutations";
import type { ListingTeamManagerListView } from "./listingTeam.types";

/**
 * "Meet the team" hooks in DEMO mode (the suite default): every read and
 * write goes through the in-memory store and the same adapters as live.
 */

const TINTA_VIVA_REF = "QPL-DEMO-0201";
const NAVALHA_REF = "QPL-DEMO-0202";
const DEMO_PERSONA_ID = "sp-tiago-agulha-lenta";

beforeEach(() => {
  window.localStorage.clear();
  resetListingTeamDemo();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <DemoModeProvider>
        <AuthProvider>{children}</AuthProvider>
      </DemoModeProvider>
    </QueryClientProvider>
  );
  return { queryClient, wrapper };
}

describe("listing team hooks (demo store)", () => {
  it("reads Tinta Viva's team from the demo store", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useListingTeam(TINTA_VIVA_REF), {
      wrapper,
    });
    await waitFor(() => expect(result.current.team?.accepted).toHaveLength(5));
    expect(result.current.team?.accepted.map((row) => row.status)).toEqual([
      "accepted",
      "accepted",
      "accepted",
      "accepted",
      "accepted",
    ]);
    expect(result.current.team?.accepted[2]?.kind).toBe("member");
    expect(result.current.isError).toBe(false);
  });

  it("shows a sent invite in the list", async () => {
    // A clock after every seed date, so the new invite sorts first.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-12-01T10:00:00.000Z"));
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => ({
        list: useListingTeam(NAVALHA_REF),
        mutations: useListingTeamMutations(NAVALHA_REF),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.team).toBeDefined());
    await act(async () => {
      await result.current.mutations.invite.mutateAsync({
        subprofileId: "sp-rita-rosa-brava",
        roleLabel: "Guest artist",
      });
    });
    await waitFor(() =>
      expect(result.current.list.team?.invitesSent[0]?.persona?.handle).toBe(
        "rosa-brava",
      ),
    );
    expect(result.current.list.team?.invitesSent[0]?.roleLabel).toBe(
      "Guest artist",
    );
  });

  it("keeps the new order after a move", async () => {
    const { queryClient, wrapper } = createWrapper();
    const { result } = renderHook(
      () => ({
        list: useListingTeam(TINTA_VIVA_REF),
        mutations: useListingTeamMutations(TINTA_VIVA_REF),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.list.team?.accepted).toHaveLength(5),
    );
    const reversedIds = (result.current.list.team?.accepted ?? [])
      .map((row) => row.id)
      .reverse();
    await act(async () => {
      await result.current.mutations.reorder.mutateAsync({
        memberIds: reversedIds,
      });
    });
    const cached = queryClient.getQueryData<ListingTeamManagerListView>(
      listingTeamQueryKeys.manager(TINTA_VIVA_REF, true),
    );
    expect(cached?.accepted.map((row) => row.id)).toEqual(reversedIds);
  });

  it("clears the persona badge once the invite is answered", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => ({
        links: usePersonaTeamLinks(DEMO_PERSONA_ID),
        mutations: usePersonaTeamLinkMutations(DEMO_PERSONA_ID),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.links.links?.awaitingYouCount).toBe(1),
    );
    const linkId = result.current.links.links?.invitesReceived[0]?.id ?? "";
    expect(linkId).not.toBe("");
    await act(async () => {
      await result.current.mutations.accept.mutateAsync({ linkId });
    });
    await waitFor(() =>
      expect(result.current.links.links?.awaitingYouCount).toBe(0),
    );
    expect(result.current.links.links?.accepted).toHaveLength(2);
  });

  it("refreshes both public pages after a leave", async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(
      () => ({
        links: usePersonaTeamLinks(DEMO_PERSONA_ID),
        mutations: usePersonaTeamLinkMutations(DEMO_PERSONA_ID),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.links.links?.accepted).toHaveLength(1),
    );
    const linkId = result.current.links.links?.accepted[0]?.id ?? "";
    await act(async () => {
      await result.current.mutations.leave.mutateAsync({ linkId });
    });
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: [DIRECTORY_KEY, "detail"] }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["subprofile", "public"] }),
    );
  });

  it("refetches the team list after a refusal that proves it stale", async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(
      () => ({
        list: useListingTeam(NAVALHA_REF),
        mutations: useListingTeamMutations(NAVALHA_REF),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.team).toBeDefined());
    await act(async () => {
      await expect(
        result.current.mutations.decline.mutateAsync({
          memberId: "demo-team-link-gone",
        }),
      ).rejects.toThrow();
    });
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: listingTeamQueryKeys.manager(NAVALHA_REF, true),
        exact: true,
      }),
    );
  });

  it("leaves the persona links cached after a missing listing refusal", async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(
      () => ({
        links: usePersonaTeamLinks(DEMO_PERSONA_ID),
        mutations: usePersonaTeamLinkMutations(DEMO_PERSONA_ID),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.links.links).toBeDefined());
    await act(async () => {
      await expect(
        result.current.mutations.request.mutateAsync({
          listingId: "demo-listing-unknown",
        }),
      ).rejects.toThrow();
    });
    expect(invalidateSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: listingTeamQueryKeys.persona(DEMO_PERSONA_ID, true),
      }),
    );
  });

  it("waits for two characters before searching", async () => {
    const { wrapper } = createWrapper();
    const { result, rerender } = renderHook(
      ({ rawQuery }: { rawQuery: string }) =>
        useListingTeamCandidates(NAVALHA_REF, rawQuery),
      { wrapper, initialProps: { rawQuery: "a" } },
    );
    expect(result.current.isQueryReady).toBe(false);
    expect(result.current.candidates).toEqual([]);
    rerender({ rawQuery: "@agu" });
    expect(result.current.isQueryReady).toBe(true);
    await waitFor(() =>
      expect(result.current.candidates[0]?.persona.displayName).toBe(
        "Agulha Lenta",
      ),
    );
    expect(result.current.candidates[0]?.teamStatus).toBe("pending");
  });
});

describe("member team hooks (demo store)", () => {
  it("shows an invited member as a pending member row", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-12-01T10:00:00.000Z"));
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => ({
        list: useListingTeam(NAVALHA_REF),
        mutations: useListingTeamMutations(NAVALHA_REF),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.team).toBeDefined());
    await act(async () => {
      await result.current.mutations.inviteMember.mutateAsync({
        memberSlug: "jonas",
        roleLabel: "Barber",
      });
    });
    await waitFor(() =>
      expect(result.current.list.team?.invitesSent[0]?.member?.slug).toBe(
        "jonas",
      ),
    );
    expect(result.current.list.team?.invitesSent[0]?.kind).toBe("member");
  });

  it("clears the member badge once the invite is answered", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => ({
        links: useMemberTeamLinks(),
        mutations: useMemberTeamLinkMutations(),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.links.links?.awaitingYouCount).toBe(1),
    );
    const linkId = result.current.links.links?.invitesReceived[0]?.id ?? "";
    expect(linkId).not.toBe("");
    await act(async () => {
      await result.current.mutations.accept.mutateAsync({ linkId });
    });
    await waitFor(() =>
      expect(result.current.links.links?.awaitingYouCount).toBe(0),
    );
    expect(result.current.links.links?.accepted).toHaveLength(1);
  });
});
