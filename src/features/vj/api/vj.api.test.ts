import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  CreateVjClipBody,
  CreateVjSetlistBody,
  SetVjSetlistItemsBody,
} from "../../../shared/contracts/vj";

const client = vi.hoisted(() => ({
  apiGet: vi.fn<(path: string) => Promise<unknown>>(),
  apiPost: vi.fn<(path: string, body?: unknown) => Promise<unknown>>(),
  apiPatch: vi.fn<(path: string, body?: unknown) => Promise<unknown>>(),
  apiPut: vi.fn<(path: string, body?: unknown) => Promise<unknown>>(),
  apiDelete: vi.fn<(path: string) => Promise<unknown>>(),
}));

vi.mock("../../../shared/api/client", () => ({
  apiGet: (path: string) => client.apiGet(path),
  apiPost: (path: string, body?: unknown) => client.apiPost(path, body),
  apiPatch: (path: string, body?: unknown) => client.apiPatch(path, body),
  apiPut: (path: string, body?: unknown) => client.apiPut(path, body),
  apiDelete: (path: string) => client.apiDelete(path),
}));

import {
  createVjClip,
  createVjSetlist,
  getVjClipsMedia,
  getVjPackEvent,
  getVjPackMedia,
  removeVjPackClip,
  renameVjPack,
  reorderVjScenes,
  reorderVjSetlists,
  setVjClipPreview,
  setVjPackEvent,
  setVjSetlistItems,
  updateVjClip,
  updateVjSetlist,
} from "./vj.api";

describe("vj.api", () => {
  beforeEach(() => {
    client.apiGet.mockReset().mockResolvedValue({ packId: "p", items: [] });
    client.apiPost.mockReset().mockResolvedValue({});
    client.apiPatch.mockReset().mockResolvedValue({});
    client.apiPut.mockReset().mockResolvedValue({});
    client.apiDelete.mockReset().mockResolvedValue({});
  });

  it("asks for the media of listed clips only", async () => {
    await getVjPackMedia("p 1", ["a", "b"]);
    expect(client.apiGet).toHaveBeenLastCalledWith(
      "/admin/vj/packs/p%201/media?clipIds=a,b",
    );
    await getVjPackMedia("p 1", null);
    expect(client.apiGet).toHaveBeenLastCalledWith(
      "/admin/vj/packs/p%201/media",
    );
    await getVjPackMedia("p 1", []);
    expect(client.apiGet).toHaveBeenLastCalledWith(
      "/admin/vj/packs/p%201/media",
    );
  });

  it("sends the clip create body as declared", async () => {
    const body: CreateVjClipBody = {
      title: "Neon grid",
      storageKey: "vj/clips/a.mp4",
      thumbnailStorageKey: "vj/thumbnails/a.webp",
      width: 1920,
      height: 1080,
      durationMs: 4000,
      fitMode: "fill",
      packId: null,
    };
    await createVjClip(body);
    expect(client.apiPost).toHaveBeenCalledWith("/admin/vj/clips", body);
    const sent = client.apiPost.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(Object.keys(sent).sort()).toEqual(
      [
        "durationMs",
        "fitMode",
        "height",
        "packId",
        "storageKey",
        "thumbnailStorageKey",
        "title",
        "width",
      ].sort(),
    );
  });

  it("encodes ids in nested routes", async () => {
    await removeVjPackClip("p/1", "c/2");
    expect(client.apiDelete).toHaveBeenCalledWith(
      "/admin/vj/packs/p%2F1/clips/c%2F2",
    );
    await renameVjPack("p/1", { name: "Encore" });
    expect(client.apiPatch).toHaveBeenCalledWith("/admin/vj/packs/p%2F1", {
      name: "Encore",
    });
  });

  it("sends every clip default field the caller sets", async () => {
    await updateVjClip("c 1", { defaultSpeed: 2, loopInMs: null });
    expect(client.apiPatch).toHaveBeenCalledWith("/admin/vj/clips/c%201", {
      defaultSpeed: 2,
      loopInMs: null,
    });
  });

  it("puts a preview key on the clip", async () => {
    const previewStorageKey = "vj/previews/a.webm";
    await setVjClipPreview("c1", { previewStorageKey });
    expect(client.apiPut).toHaveBeenCalledWith("/admin/vj/clips/c1/preview", {
      previewStorageKey,
    });
  });

  it("asks for the media of the listed clips", async () => {
    await getVjClipsMedia(["a/1", "b"]);
    expect(client.apiGet).toHaveBeenLastCalledWith(
      "/admin/vj/clips/media?clipIds=a%2F1,b",
    );
  });

  it("reads and writes a pack's event link", async () => {
    await getVjPackEvent("p1");
    expect(client.apiGet).toHaveBeenLastCalledWith("/admin/vj/packs/p1/event");
    await setVjPackEvent("p1", { eventId: null });
    expect(client.apiPatch).toHaveBeenLastCalledWith(
      "/admin/vj/packs/p1/event",
      { eventId: null },
    );
  });

  it("reorders scenes and set lists on their literal routes", async () => {
    await reorderVjScenes({ sceneIds: ["s1", "s2"] });
    expect(client.apiPatch).toHaveBeenLastCalledWith(
      "/admin/vj/scenes/reorder",
      { sceneIds: ["s1", "s2"] },
    );
    await reorderVjSetlists({ setlistIds: ["l1", "l2"] });
    expect(client.apiPatch).toHaveBeenLastCalledWith(
      "/admin/vj/setlists/reorder",
      { setlistIds: ["l1", "l2"] },
    );
  });

  it("writes a set list's steps with PUT, ids kept and lengths as given", async () => {
    const body: SetVjSetlistItemsBody = {
      items: [
        { id: "item-1", kind: "scene", sceneId: "scene-1", duration: null },
        {
          kind: "clip",
          clipId: "clip-1",
          duration: { kind: "beats", value: 16 },
        },
        { kind: "scene", sceneId: "scene-1" },
      ],
    };
    await setVjSetlistItems("s/1", body);
    expect(client.apiPut).toHaveBeenCalledWith(
      "/admin/vj/setlists/s%2F1/items",
      body,
    );
    const sent = client.apiPut.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(Object.keys(sent)).toEqual(["items"]);
  });

  it("patches a set list with only the fields the caller sets", async () => {
    await updateVjSetlist("s/1", { isLooping: true });
    expect(client.apiPatch).toHaveBeenLastCalledWith(
      "/admin/vj/setlists/s%2F1",
      { isLooping: true },
    );
    await updateVjSetlist("s1", {
      name: "Late set",
      stepDuration: { kind: "seconds", value: 12 },
    });
    expect(client.apiPatch).toHaveBeenLastCalledWith("/admin/vj/setlists/s1", {
      name: "Late set",
      stepDuration: { kind: "seconds", value: 12 },
    });
  });

  it("creates a set list from steps with Loop and a default length", async () => {
    const body: CreateVjSetlistBody = {
      name: "Friday set",
      items: [{ kind: "clip", clipId: "clip-1", duration: null }],
      isLooping: true,
      stepDuration: { kind: "beats", value: 8 },
    };
    await createVjSetlist(body);
    expect(client.apiPost).toHaveBeenCalledWith("/admin/vj/setlists", body);
    await createVjSetlist({ name: "From scenes", sceneIds: ["scene-1"] });
    expect(client.apiPost).toHaveBeenLastCalledWith("/admin/vj/setlists", {
      name: "From scenes",
      sceneIds: ["scene-1"],
    });
  });
});
