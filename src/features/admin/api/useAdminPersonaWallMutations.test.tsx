import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { personaWallReasonOf } from "../../subprofiles/api/personaWall.api";
import { useSubprofileWall } from "../../subprofiles/api/useSubprofileWall";
import { resetDemoPersonaWall } from "../../subprofiles/personaWallDemoStore";
import { useAdminPersonaWall } from "./useAdminPersonaWall";
import {
  useAddPersonaWallPick,
  usePersonaWallIsWriting,
  useRemovePersonaWallPick,
  useReorderPersonaWallPicks,
  useSetPersonaWallFillOrder,
} from "./useAdminPersonaWallMutations";

// TestProviders forces demo mode, so every hook here reads and writes the
// shared demo persona wall store.

const reorderHold: { pending: Promise<void> | null } = vi.hoisted(() => ({
  pending: null,
}));

// The real store, with its reorder able to wait on `reorderHold.pending`.
// The hooks load the store through a dynamic import, which this mock covers.
vi.mock("../../subprofiles/personaWallDemoStore", async (importOriginal) => {
  const actualStore =
    await importOriginal<
      typeof import("../../subprofiles/personaWallDemoStore")
    >();
  return {
    ...actualStore,
    demoReorderPersonaWallPicks: async (ids: readonly string[]) => {
      if (reorderHold.pending) await reorderHold.pending;
      return actualStore.demoReorderPersonaWallPicks(ids);
    },
  };
});

/** The seed's picks, in position order (`personaWallDemoSeed.data.ts`). */
const SEED_PERSONA_IDS = [
  "sp-diogo-nightform",
  "sp-vera-bloco",
  "sp-bea-cadeira",
  "sp-tiago-draft",
];

function renderWallHooks() {
  return renderHook(
    () => ({
      admin: useAdminPersonaWall(),
      publicWall: useSubprofileWall(),
      isWriting: usePersonaWallIsWriting(),
      add: useAddPersonaWallPick(),
      reorder: useReorderPersonaWallPicks(),
      remove: useRemovePersonaWallPick(),
      setFillOrder: useSetPersonaWallFillOrder(),
    }),
    { wrapper: TestProviders },
  );
}

type WallHooks = ReturnType<typeof renderWallHooks>["result"];

async function waitForSeed(result: WallHooks) {
  await waitFor(() => expect(result.current.admin.data?.picks).toHaveLength(4));
}

function pickedPersonaIdsOf(result: WallHooks): string[] {
  return (result.current.admin.data?.picks ?? []).map(
    ({ persona }) => persona.id,
  );
}

function positionsOf(result: WallHooks): number[] {
  return (result.current.admin.data?.picks ?? []).map(
    ({ position }) => position,
  );
}

/** Holds the demo store's reorder answer until the test releases it, so a
 *  test can read the cache while the mutation is still pending. */
function openReorderGate() {
  let releaseGate = (): void => undefined;
  reorderHold.pending = new Promise<void>((resolve) => {
    releaseGate = resolve;
  });
  return { release: () => releaseGate() };
}

beforeEach(() => {
  reorderHold.pending = null;
  resetDemoPersonaWall();
});

describe("persona wall mutations (demo)", () => {
  it("adds a pick to the admin wall and the public wall", async () => {
    const { result } = renderWallHooks();
    await waitFor(() =>
      expect(result.current.publicWall.cards).toHaveLength(9),
    );
    await waitForSeed(result);
    await act(() =>
      result.current.add.mutateAsync({
        subprofileId: "sp-ines-fonseca-vanda-diesel",
      }),
    );
    expect(result.current.admin.data?.picks.at(-1)?.persona.id).toBe(
      "sp-ines-fonseca-vanda-diesel",
    );
    await waitFor(() =>
      expect(
        result.current.publicWall.cards.slice(0, 4).map((card) => card.id),
      ).toContain("sp-ines-fonseca-vanda-diesel"),
    );
  });

  it("moves picks at once on reorder", async () => {
    const { result } = renderWallHooks();
    await waitForSeed(result);
    const reversedIds = (result.current.admin.data?.picks ?? [])
      .map(({ id }) => id)
      .reverse();
    const reorderGate = openReorderGate();
    let reorderPromise: Promise<unknown> = Promise.resolve();
    await act(async () => {
      reorderPromise = result.current.reorder.mutateAsync({
        ids: reversedIds,
      });
      // One microtask lets onMutate start; the gate keeps the store waiting.
      await Promise.resolve();
    });
    // The store has not answered yet, so this order is the optimistic write.
    await waitFor(() =>
      expect(pickedPersonaIdsOf(result)).toEqual(
        [...SEED_PERSONA_IDS].reverse(),
      ),
    );
    expect(result.current.reorder.isPending).toBe(true);
    expect(positionsOf(result)).toEqual([1, 2, 3, 4]);
    await act(async () => {
      reorderGate.release();
      await reorderPromise;
    });
    expect(result.current.reorder.isSuccess).toBe(true);
    expect(pickedPersonaIdsOf(result)).toEqual([...SEED_PERSONA_IDS].reverse());
    expect(positionsOf(result)).toEqual([1, 2, 3, 4]);
  });

  it("rolls back a reorder the store refuses", async () => {
    const { result } = renderWallHooks();
    await waitForSeed(result);
    const idsMissingOne = (result.current.admin.data?.picks ?? [])
      .map(({ id }) => id)
      .slice(1);
    let caughtError: unknown = null;
    await act(async () => {
      try {
        await result.current.reorder.mutateAsync({ ids: idsMissingOne });
      } catch (error) {
        caughtError = error;
      }
    });
    expect(personaWallReasonOf(caughtError)).toBe(
      "PERSONA_WALL_REORDER_MISMATCH",
    );
    await waitFor(() =>
      expect(pickedPersonaIdsOf(result)).toEqual(SEED_PERSONA_IDS),
    );
    expect(positionsOf(result)).toEqual([1, 2, 3, 4]);
  });

  it("removes a pick and closes the gap", async () => {
    const { result } = renderWallHooks();
    await waitForSeed(result);
    await act(() =>
      result.current.remove.mutateAsync({
        pickId: "demo-wall-pick-sp-bea-cadeira",
      }),
    );
    expect(result.current.admin.data?.picks).toHaveLength(3);
    expect(positionsOf(result)).toEqual([1, 2, 3]);
    expect(pickedPersonaIdsOf(result)).not.toContain("sp-bea-cadeira");
  });

  it("saves the fill order", async () => {
    const { result } = renderWallHooks();
    await waitForSeed(result);
    await act(() =>
      result.current.setFillOrder.mutateAsync({ fillOrder: "followed" }),
    );
    expect(result.current.admin.data?.fillOrder).toBe("followed");
  });

  it("reports a write in flight", async () => {
    const { result } = renderWallHooks();
    await waitForSeed(result);
    expect(result.current.isWriting).toBe(false);
    const reorderGate = openReorderGate();
    let reorderPromise: Promise<unknown> = Promise.resolve();
    await act(async () => {
      reorderPromise = result.current.reorder.mutateAsync({
        ids: (result.current.admin.data?.picks ?? []).map(({ id }) => id),
      });
      await Promise.resolve();
    });
    await waitFor(() => expect(result.current.isWriting).toBe(true));
    await act(async () => {
      reorderGate.release();
      await reorderPromise;
    });
    await waitFor(() => expect(result.current.isWriting).toBe(false));
  });
});
