import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateVjClipBody } from "../../../shared/contracts/vj";

const client = vi.hoisted(() => ({
  apiGet: vi.fn<(path: string) => Promise<unknown>>(),
  apiPost: vi.fn<(path: string, body?: unknown) => Promise<unknown>>(),
  apiPatch: vi.fn<(path: string, body?: unknown) => Promise<unknown>>(),
  apiDelete: vi.fn<(path: string) => Promise<unknown>>(),
}));

vi.mock("../../../shared/api/client", () => ({
  apiGet: (path: string) => client.apiGet(path),
  apiPost: (path: string, body?: unknown) => client.apiPost(path, body),
  apiPatch: (path: string, body?: unknown) => client.apiPatch(path, body),
  apiDelete: (path: string) => client.apiDelete(path),
}));

import {
  createVjClip,
  getVjPackMedia,
  removeVjPackClip,
  renameVjPack,
} from "./vj.api";

describe("vj.api", () => {
  beforeEach(() => {
    client.apiGet.mockReset().mockResolvedValue({ packId: "p", items: [] });
    client.apiPost.mockReset().mockResolvedValue({});
    client.apiPatch.mockReset().mockResolvedValue({});
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
});
