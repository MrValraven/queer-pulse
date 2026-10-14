import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { studioErrorCodeOf } from "../../studio/api/studio.api";
import {
  DEMO_ADMIN_EVENT_OPTIONS,
  demoAdminReleaseSearch,
} from "../StudioAdmin.data";
import type { AdminStudioSceneEventDTO } from "./studioDiscoveryAdmin.api";
import {
  useAddAdminStudioPick,
  useAdminStudioCuration,
  useRemoveAdminStudioPick,
  useReorderAdminStudioPicks,
} from "./StudioAdminCurationHooks";
import {
  useAdminStudioSceneEvents,
  useAdminStudioScenes,
  usePinAdminStudioSceneEvent,
  useSaveAdminStudioScene,
  useSetAdminStudioSceneArchived,
} from "./StudioAdminSceneHooks";

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );
  return { wrapper };
}

describe("admin curation hooks (demo)", () => {
  it("appends to a shelf and refuses the same release twice", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        curation: useAdminStudioCuration(),
        add: useAddAdminStudioPick(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.curation.data).toBeDefined());
    const release = result.current.curation.data?.newThisWeek[0]?.release;
    if (!release) throw new Error("the demo has a New this week pick");
    await act(() =>
      result.current.add.mutateAsync({
        shelf: "staff_picks",
        release,
        note: "Play it loud",
      }),
    );
    // The cache patch re-renders the hook after act returns, so each read
    // after a write waits for it.
    await waitFor(() =>
      expect(result.current.curation.data?.staffPicks).toHaveLength(4),
    );
    expect(result.current.curation.data?.staffPicks[3]).toMatchObject({
      position: 4,
      note: "Play it loud",
    });
    const error = await result.current.add
      .mutateAsync({ shelf: "staff_picks", release, note: null })
      .catch((caught: unknown) => caught);
    expect(studioErrorCodeOf(error)).toBe("studio_curation_already_on_shelf");
  });

  it("replaces the featured pick", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        curation: useAdminStudioCuration(),
        add: useAddAdminStudioPick(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.curation.data).toBeDefined());
    const release = result.current.curation.data?.staffPicks[0]?.release;
    if (!release) throw new Error("the demo has a Staff pick");
    await act(() =>
      result.current.add.mutateAsync({
        shelf: "featured",
        release,
        note: null,
      }),
    );
    await waitFor(() =>
      expect(
        result.current.curation.data?.featured.map((pick) => pick.release.id),
      ).toEqual([release.id]),
    );
  });

  it("reorders a shelf and renumbers it after a removal", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        curation: useAdminStudioCuration(),
        reorder: useReorderAdminStudioPicks(),
        remove: useRemoveAdminStudioPick(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.curation.data).toBeDefined());
    const ids = (result.current.curation.data?.staffPicks ?? []).map(
      (pick) => pick.id,
    );
    const reversed = [...ids].reverse();
    await act(() =>
      result.current.reorder.mutateAsync({
        shelf: "staff_picks",
        pickIds: reversed,
      }),
    );
    await waitFor(() =>
      expect(
        result.current.curation.data?.staffPicks.map((pick) => pick.id),
      ).toEqual(reversed),
    );
    const first = result.current.curation.data?.staffPicks[0];
    if (!first) throw new Error("the shelf has picks");
    await act(() => result.current.remove.mutateAsync({ pick: first }));
    await waitFor(() =>
      expect(
        result.current.curation.data?.staffPicks.map((pick) => pick.position),
      ).toEqual([1, 2]),
    );
  });
});

describe("admin scene hooks (demo)", () => {
  it("creates a scene with a slug built from its name, suffixes a taken one and refuses a taken explicit slug", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        scenes: useAdminStudioScenes(),
        save: useSaveAdminStudioScene(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.scenes.data).toBeDefined());
    await act(() =>
      result.current.save.mutateAsync({
        sceneId: null,
        body: { name: "Café Nights", city: "Porto" },
      }),
    );
    await waitFor(() =>
      expect(
        result.current.scenes.data?.find(
          (scene) => scene.slug === "cafe-nights",
        ),
      ).toMatchObject({ status: "active", position: 3 }),
    );
    await act(() =>
      result.current.save.mutateAsync({
        sceneId: null,
        body: { name: "Mouraria Fado", city: "Lisboa" },
      }),
    );
    await waitFor(() =>
      expect(
        result.current.scenes.data?.some(
          (scene) => scene.slug === "mouraria-fado-2",
        ),
      ).toBe(true),
    );
    const error = await result.current.save
      .mutateAsync({
        sceneId: null,
        body: { name: "Again", city: "Porto", slug: "mouraria-fado" },
      })
      .catch((caught: unknown) => caught);
    expect(studioErrorCodeOf(error)).toBe("studio_scene_slug_taken");
  });

  it("archives a scene and pins an event on another", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        scenes: useAdminStudioScenes(),
        archive: useSetAdminStudioSceneArchived(),
        events: useAdminStudioSceneEvents("demo-scene-porto-warehouse"),
        pin: usePinAdminStudioSceneEvent(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.scenes.data).toBeDefined());
    const mouraria = result.current.scenes.data?.find(
      (scene) => scene.slug === "mouraria-fado",
    );
    if (!mouraria) throw new Error("the demo has Mouraria fado");
    await act(() =>
      result.current.archive.mutateAsync({ scene: mouraria, isArchived: true }),
    );
    await waitFor(() =>
      expect(
        result.current.scenes.data?.find((scene) => scene.id === mouraria.id)
          ?.status,
      ).toBe("archived"),
    );
    await waitFor(() => expect(result.current.events.data).toEqual([]));
    const event = DEMO_ADMIN_EVENT_OPTIONS[0];
    if (!event) throw new Error("the demo has event options");
    await act(() =>
      result.current.pin.mutateAsync({
        sceneId: "demo-scene-porto-warehouse",
        event,
      }),
    );
    await waitFor(() =>
      expect(result.current.events.data?.map((pinned) => pinned.slug)).toEqual([
        event.slug,
      ]),
    );
    expect(
      result.current.scenes.data?.find(
        (scene) => scene.id === "demo-scene-porto-warehouse",
      )?.pinnedEventCount,
    ).toBe(1);
  });
});

describe("admin curation hooks refuse what the server refuses (demo)", () => {
  function renderCuration() {
    const { wrapper } = setup();
    return renderHook(
      () => ({
        curation: useAdminStudioCuration(),
        add: useAddAdminStudioPick(),
        reorder: useReorderAdminStudioPicks(),
      }),
      { wrapper },
    );
  }

  it("rejects a reorder that misses a pick and leaves the shelf as it was", async () => {
    const { result } = renderCuration();
    await waitFor(() => expect(result.current.curation.data).toBeDefined());
    const before = result.current.curation.data?.staffPicks ?? [];
    const error = await result.current.reorder
      .mutateAsync({
        shelf: "staff_picks",
        pickIds: before.slice(1).map((pick) => pick.id),
      })
      .catch((caught: unknown) => caught);
    expect(studioErrorCodeOf(error)).toBe("studio_curation_order_mismatch");
    expect(result.current.curation.data?.staffPicks).toEqual(before);
  });

  it("refuses a 13th pick on a full shelf", async () => {
    const { result } = renderCuration();
    await waitFor(() => expect(result.current.curation.data).toBeDefined());
    const seedRelease = result.current.curation.data?.staffPicks[0]?.release;
    if (!seedRelease) throw new Error("the demo has a Staff pick");
    const seededCount = result.current.curation.data?.staffPicks.length ?? 0;
    for (let index = seededCount; index < 12; index += 1) {
      await act(() =>
        result.current.add.mutateAsync({
          shelf: "staff_picks",
          release: { ...seedRelease, id: `demo-release-fill-${index}` },
          note: null,
        }),
      );
    }
    await waitFor(() =>
      expect(result.current.curation.data?.staffPicks).toHaveLength(12),
    );
    const error = await result.current.add
      .mutateAsync({
        shelf: "staff_picks",
        release: { ...seedRelease, id: "demo-release-fill-13" },
        note: null,
      })
      .catch((caught: unknown) => caught);
    expect(studioErrorCodeOf(error)).toBe("studio_curation_shelf_full");
  });

  it("refuses to feature the release that is already featured", async () => {
    const { result } = renderCuration();
    await waitFor(() => expect(result.current.curation.data).toBeDefined());
    const featured = result.current.curation.data?.featured[0]?.release;
    if (!featured) throw new Error("the demo has a featured pick");
    const error = await result.current.add
      .mutateAsync({ shelf: "featured", release: featured, note: null })
      .catch((caught: unknown) => caught);
    expect(studioErrorCodeOf(error)).toBe("studio_curation_already_on_shelf");
  });

  it("refuses a release that is not published", async () => {
    const { result } = renderCuration();
    await waitFor(() => expect(result.current.curation.data).toBeDefined());
    const release = result.current.curation.data?.staffPicks[0]?.release;
    if (!release) throw new Error("the demo has a Staff pick");
    const error = await result.current.add
      .mutateAsync({
        shelf: "new_this_week",
        release: { ...release, id: "demo-release-draft", status: "draft" },
        note: null,
      })
      .catch((caught: unknown) => caught);
    expect(studioErrorCodeOf(error)).toBe(
      "studio_curation_release_not_published",
    );
  });

  it("searches published releases only", () => {
    expect(demoAdminReleaseSearch("Cartas ao mar")).toEqual([]);
    expect(demoAdminReleaseSearch("Bairro antigo")).toEqual([]);
    const marianaReleases = demoAdminReleaseSearch("Mariana");
    expect(marianaReleases.length).toBeGreaterThan(0);
    expect(
      marianaReleases.every((release) => release.status === "published"),
    ).toBe(true);
  });
});

describe("admin scene hooks keep the server's positions and pins (demo)", () => {
  it("restores an archived scene after the last active position", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        scenes: useAdminStudioScenes(),
        archive: useSetAdminStudioSceneArchived(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.scenes.data).toBeDefined());
    const mouraria = result.current.scenes.data?.find(
      (scene) => scene.slug === "mouraria-fado",
    );
    if (!mouraria) throw new Error("the demo has Mouraria fado");
    await act(() =>
      result.current.archive.mutateAsync({ scene: mouraria, isArchived: true }),
    );
    await waitFor(() =>
      expect(
        result.current.scenes.data?.find((scene) => scene.id === mouraria.id)
          ?.status,
      ).toBe("archived"),
    );
    const archived = result.current.scenes.data?.find(
      (scene) => scene.id === mouraria.id,
    );
    if (!archived) throw new Error("the archived scene stays listed");
    await act(() =>
      result.current.archive.mutateAsync({
        scene: archived,
        isArchived: false,
      }),
    );
    // Warehouse nights keeps position 2, so the restore takes 3.
    await waitFor(() =>
      expect(
        result.current.scenes.data?.find((scene) => scene.id === mouraria.id),
      ).toMatchObject({ status: "active", position: 3 }),
    );
  });

  it("keeps the seeded pins when a pin lands before the list is read", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        scenes: useAdminStudioScenes(),
        pin: usePinAdminStudioSceneEvent(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.scenes.data).toBeDefined());
    const event = DEMO_ADMIN_EVENT_OPTIONS.find(
      (option) => option.slug === "portfolio-night",
    );
    if (!event) throw new Error("the demo has Portfolio Night");
    let pinned: AdminStudioSceneEventDTO[] = [];
    await act(async () => {
      pinned = await result.current.pin.mutateAsync({
        sceneId: "demo-scene-mouraria-fado",
        event,
      });
    });
    expect(pinned.map((entry) => entry.slug)).toEqual([
      "supper-club-12",
      "queer-history-walk",
      "portfolio-night",
    ]);
    await waitFor(() =>
      expect(
        result.current.scenes.data?.find(
          (scene) => scene.id === "demo-scene-mouraria-fado",
        )?.pinnedEventCount,
      ).toBe(3),
    );
  });
});
