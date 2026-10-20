import { act, renderHook, waitFor } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "../../../../test/msw/server";
import { API, API_V1 } from "../../../../test/msw/handlers";
import type {
  ListingTeamManagerListDTO,
  ListingTeamManagerRowDTO,
} from "./listingTeam.types";

/**
 * "Meet the team" hooks in LIVE mode through MSW: the routes they call, the
 * query and body they send, and the typed refusal they hand back.
 */

const LISTING_REF = "QPL-2026-0042";
const TEAM = `${API_V1}/listings/${LISTING_REF}/team`;

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => {
  window.localStorage.clear();
});
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
  vi.doUnmock("../../../../app/providers/authContext");
});
afterAll(() => server.close());

const ROW: ListingTeamManagerRowDTO = {
  id: "member-1",
  status: "accepted",
  initiatedBy: "listing",
  roleLabel: "Resident artist",
  position: 0,
  persona: {
    id: "sp-1",
    handle: "agulha-lenta",
    displayName: "Agulha Lenta",
    kind: "tattoo_artist",
    avatarUrl: null,
  },
  createdAt: "2026-09-01T09:00:00.000Z",
  answeredAt: "2026-09-02T09:00:00.000Z",
};

const MANAGER_LIST: ListingTeamManagerListDTO = {
  awaitingYouCount: 0,
  requestsReceived: [],
  invitesSent: [],
  accepted: [ROW],
};

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  vi.doMock("../../../../app/providers/authContext", () => ({
    useAuth: () => ({ loggedIn: true, user: null }),
  }));
  const reads = await import("./useListingTeam");
  const writes = await import("./useListingTeamMutations");
  const personaWrites = await import("./usePersonaTeamLinkMutations");
  const adapters = await import("./listingTeam.adapters");
  const client = await import("../../../../shared/api/client");
  const { DemoModeProvider } =
    await import("../../../../app/providers/DemoModeProvider");
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <DemoModeProvider>{children}</DemoModeProvider>
    </QueryClientProvider>
  );
  return {
    reads,
    writes,
    personaWrites,
    adapters,
    ApiError: client.ApiError,
    wrapper,
  };
}

describe("listing team hooks (live mode via MSW)", () => {
  it("reads the team from the listing's team route", async () => {
    server.use(http.get(TEAM, () => HttpResponse.json(MANAGER_LIST)));
    const { reads, adapters, wrapper } = await loadLive();
    const { result } = renderHook(() => reads.useListingTeam(LISTING_REF), {
      wrapper,
    });
    await waitFor(() =>
      expect(result.current.team).toEqual(
        adapters.toListingTeamManagerListView(MANAGER_LIST),
      ),
    );
    expect(result.current.team?.accepted[0]?.persona?.href).toBe(
      "/p/agulha-lenta",
    );
  });

  it("drops the leading at sign from the query it sends", async () => {
    const sentQueries: (string | null)[] = [];
    server.use(
      http.get(`${TEAM}/candidates`, ({ request }) => {
        sentQueries.push(new URL(request.url).searchParams.get("q"));
        return HttpResponse.json({ items: [] });
      }),
    );
    const { reads, wrapper } = await loadLive();
    const { result } = renderHook(
      () => reads.useListingTeamCandidates(LISTING_REF, "@agu"),
      { wrapper },
    );
    await waitFor(() => expect(sentQueries).toEqual(["agu"]));
    await waitFor(() => expect(result.current.isSearching).toBe(false));
    expect(result.current.candidates).toEqual([]);
  });

  it("posts the invite body as typed", async () => {
    const sentBodies: unknown[] = [];
    server.use(
      http.post(`${TEAM}/invites`, async ({ request }) => {
        sentBodies.push(await request.json());
        return HttpResponse.json(
          { ...ROW, status: "pending", position: null, answeredAt: null },
          { status: 201 },
        );
      }),
    );
    const { writes, wrapper } = await loadLive();
    const { result } = renderHook(
      () => writes.useListingTeamMutations(LISTING_REF),
      { wrapper },
    );
    await act(async () => {
      await result.current.invite.mutateAsync({
        subprofileId: "sp-1",
        roleLabel: "Resident artist",
      });
    });
    expect(sentBodies).toEqual([
      { subprofileId: "sp-1", roleLabel: "Resident artist" },
    ]);
  });

  it("hands a cooldown refusal back with its date", async () => {
    server.use(
      http.post(`${TEAM}/invites`, () =>
        HttpResponse.json(
          {
            statusCode: 409,
            code: "listing_team_cooldown",
            message: "x",
            retryAt: "2026-11-02T10:00:00.000Z",
          },
          { status: 409 },
        ),
      ),
    );
    const { writes, ApiError, wrapper } = await loadLive();
    const { result } = renderHook(
      () => writes.useListingTeamMutations(LISTING_REF),
      { wrapper },
    );
    let caught: unknown;
    await act(async () => {
      try {
        await result.current.invite.mutateAsync({ subprofileId: "sp-1" });
      } catch (error) {
        caught = error;
      }
    });
    expect(caught).toBeInstanceOf(ApiError);
    expect(caught).toMatchObject({
      status: 409,
      data: {
        code: "listing_team_cooldown",
        retryAt: "2026-11-02T10:00:00.000Z",
      },
    });
  });

  it("leaves through the persona's team link route", async () => {
    let hitCount = 0;
    server.use(
      http.delete(`${API_V1}/subprofiles/sp-1/team-links/link-9`, () => {
        hitCount += 1;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { personaWrites, wrapper } = await loadLive();
    const { result } = renderHook(
      () => personaWrites.usePersonaTeamLinkMutations("sp-1"),
      { wrapper },
    );
    await act(async () => {
      await result.current.leave.mutateAsync({ linkId: "link-9" });
    });
    expect(hitCount).toBe(1);
  });
});
