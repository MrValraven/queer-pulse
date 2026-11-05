import type { ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { SubprofileCardDTO } from "./api/subprofiles.api";
import {
  SUBPROFILE_WALL_QUERY_ROOT,
  subprofileWallKey,
} from "./api/useSubprofileWall";
import {
  demoAdminPersonaWall,
  demoReorderPersonaWallPicks,
  resetDemoPersonaWall,
} from "./personaWallDemoStore";
import {
  useSubprofileCreditsWall,
  type CreditsWallState,
} from "./useSubprofileCreditsWall";

// Unrun per repo policy (`do-not-run-tests-unless-asked`): verified statically.
// TestProviders runs in demo mode, so the wall reads the demo persona wall
// store; jsdom's matchMedia stub reports a desktop viewport.

type ReadyWall = Extract<CreditsWallState, { status: "ready" }>;

const tileKeysOf = (wall: CreditsWallState) =>
  (wall as ReadyWall).tiles.map((tile) => tile.key);

beforeEach(() => {
  window.localStorage.clear();
  resetDemoPersonaWall();
});

describe("useSubprofileCreditsWall", () => {
  it("puts the picks first, in pick order", async () => {
    const { result } = renderHook(() => useSubprofileCreditsWall(), {
      wrapper: TestProviders,
    });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    const ready = result.current as ReadyWall;
    expect(ready.tiles.slice(0, 3).map((tile) => tile.key)).toEqual([
      "sp-diogo-nightform",
      "sp-vera-bloco",
      "sp-bea-cadeira",
    ]);
    expect(ready.tiles).toHaveLength(9);
  });

  it("leaves a draft pick off the wall", async () => {
    const { result } = renderHook(() => useSubprofileCreditsWall(), {
      wrapper: TestProviders,
    });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(tileKeysOf(result.current)).not.toContain("sp-tiago-draft");
  });

  it("keeps the latched faces when the wall changes underneath", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TestProviders queryClient={queryClient}>{children}</TestProviders>
    );
    const { result } = renderHook(() => useSubprofileCreditsWall(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    const latchedKeys = tileKeysOf(result.current);

    const reversedPickIds = demoAdminPersonaWall()
      .picks.map((pick) => pick.id)
      .reverse();
    await act(async () => {
      demoReorderPersonaWallPicks(reversedPickIds);
      await queryClient.invalidateQueries({
        queryKey: SUBPROFILE_WALL_QUERY_ROOT,
      });
    });

    // The cached wall did change: its first card is now the last shown pick.
    const refetchedCards = queryClient.getQueryData<SubprofileCardDTO[]>(
      subprofileWallKey(true),
    );
    expect(refetchedCards?.[0]?.id).toBe("sp-bea-cadeira");
    // The faces on screen stayed put.
    expect(result.current.status).toBe("ready");
    expect(tileKeysOf(result.current)).toEqual(latchedKeys);
  });
});
