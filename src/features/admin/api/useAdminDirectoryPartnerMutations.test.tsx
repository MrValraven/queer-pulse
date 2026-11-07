import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { directoryPartnerRefusalOf } from "../../marketing/api/directoryPartners.api";
import { useDirectoryPartners } from "../../marketing/api/useDirectoryPartners";
import { resetDemoDirectoryPartners } from "../../marketing/directoryPartnersDemoStore";
import {
  useAddDirectoryPartner,
  useRemoveDirectoryPartner,
  useReorderDirectoryPartners,
  useUpdateDirectoryPartnerNote,
} from "./useAdminDirectoryPartnerMutations";
import { useAdminDirectoryPartners } from "./useAdminDirectoryPartners";

// TestProviders forces demo mode, so every hook here reads and writes the
// shared demo store.

const reorderHold: { pending: Promise<void> | null } = vi.hoisted(() => ({
  pending: null,
}));

// The real store, with its reorder able to wait on `reorderHold.pending`.
// The hooks load the store through a dynamic import, which this mock covers.
vi.mock(
  "../../marketing/directoryPartnersDemoStore",
  async (importOriginal) => {
    const actualStore =
      await importOriginal<
        typeof import("../../marketing/directoryPartnersDemoStore")
      >();
    return {
      ...actualStore,
      demoReorderDirectoryPartners: async (ids: readonly string[]) => {
        if (reorderHold.pending) await reorderHold.pending;
        return actualStore.demoReorderDirectoryPartners(ids);
      },
    };
  },
);

const SEED_SLUGS = [
  "livraria-bertha",
  "queer-supper-club",
  "fio-solto",
  "noite-aberta",
];

function renderPartnerHooks() {
  return renderHook(
    () => ({
      admin: useAdminDirectoryPartners(),
      publicRow: useDirectoryPartners(),
      add: useAddDirectoryPartner(),
      updateNote: useUpdateDirectoryPartnerNote(),
      reorder: useReorderDirectoryPartners(),
      remove: useRemoveDirectoryPartner(),
    }),
    { wrapper: TestProviders },
  );
}

type PartnerHooks = ReturnType<typeof renderPartnerHooks>["result"];

async function waitForSeed(result: PartnerHooks) {
  await waitFor(() => expect(result.current.admin.data).toHaveLength(4));
}

function adminSlugsOf(result: PartnerHooks): string[] {
  return (result.current.admin.data ?? []).map(({ slug }) => slug);
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
  resetDemoDirectoryPartners();
});

describe("directory partner mutations (demo)", () => {
  it("adds a partner to the admin list and the public row", async () => {
    const { result } = renderPartnerHooks();
    await waitFor(() =>
      expect(result.current.publicRow.partners).toHaveLength(3),
    );
    await waitForSeed(result);
    await act(() =>
      result.current.add.mutateAsync({ listingId: "navalha", note: null }),
    );
    await waitFor(() =>
      expect(result.current.admin.data?.at(-1)?.slug).toBe("navalha"),
    );
    await waitFor(() =>
      expect(
        result.current.publicRow.partners.map(({ place }) => place.slug),
      ).toContain("navalha"),
    );
  });

  it("moves a partner at once on reorder", async () => {
    const { result } = renderPartnerHooks();
    await waitForSeed(result);
    const reversedIds = (result.current.admin.data ?? [])
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
      expect(adminSlugsOf(result)).toEqual([...SEED_SLUGS].reverse()),
    );
    expect(result.current.reorder.isPending).toBe(true);
    expect(
      (result.current.admin.data ?? []).map(({ position }) => position),
    ).toEqual([1, 2, 3, 4]);
    await act(async () => {
      reorderGate.release();
      await reorderPromise;
    });
    await waitFor(() => expect(result.current.reorder.isSuccess).toBe(true));
    expect(adminSlugsOf(result)).toEqual([...SEED_SLUGS].reverse());
    expect(
      (result.current.admin.data ?? []).map(({ position }) => position),
    ).toEqual([1, 2, 3, 4]);
  });

  it("rolls back a reorder the store refuses", async () => {
    const { result } = renderPartnerHooks();
    await waitForSeed(result);
    const idsMissingOne = (result.current.admin.data ?? [])
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
    expect(directoryPartnerRefusalOf(caughtError)).toBe("order_mismatch");
    expect(adminSlugsOf(result)).toEqual(SEED_SLUGS);
  });

  it("removes a partner and closes the gap", async () => {
    const { result } = renderPartnerHooks();
    await waitForSeed(result);
    await act(() =>
      result.current.remove.mutateAsync({ pickId: "demo-partner-fio-solto" }),
    );
    await waitFor(() => expect(result.current.admin.data).toHaveLength(3));
    expect(
      (result.current.admin.data ?? []).map(({ position }) => position),
    ).toEqual([1, 2, 3]);
    expect(adminSlugsOf(result)).not.toContain("fio-solto");
  });

  it("saves a note edit", async () => {
    const { result } = renderPartnerHooks();
    await waitForSeed(result);
    await act(() =>
      result.current.updateNote.mutateAsync({
        pickId: "demo-partner-fio-solto",
        note: "Ships free to members",
      }),
    );
    await waitFor(() =>
      expect(
        result.current.admin.data?.find(({ slug }) => slug === "fio-solto")
          ?.note,
      ).toBe("Ships free to members"),
    );
  });

  it("refuses a note longer than 140 characters a person sees", async () => {
    const { result } = renderPartnerHooks();
    await waitForSeed(result);
    const rainbow = String.fromCodePoint(0x1f308);
    let caughtError: unknown = null;
    await act(async () => {
      try {
        await result.current.updateNote.mutateAsync({
          pickId: "demo-partner-fio-solto",
          note: rainbow.repeat(141),
        });
      } catch (error) {
        caughtError = error;
      }
    });
    expect(directoryPartnerRefusalOf(caughtError)).toBe("note_too_long");
  });
});
