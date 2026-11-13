import { describe, expect, it } from "vitest";
import {
  VJ_LIBRARY_CHANGE_KINDS,
  type VjLibraryChangeKind,
} from "../../../shared/contracts/vj";
import {
  vjInvalidationTargetsOf,
  vjLibraryChangeOf,
} from "./vjLibraryInvalidation";

function targetsOfKind(kind: VjLibraryChangeKind) {
  return vjInvalidationTargetsOf(vjLibraryChangeOf({ kind }));
}

describe("vjInvalidationTargetsOf", () => {
  it("a null change reads the whole library again", () => {
    expect(vjInvalidationTargetsOf(null)).toEqual([{ kind: "root" }]);
  });

  it("a pack's clip list change touches only the packs it names, then packs and clips", () => {
    const targets = vjInvalidationTargetsOf(
      vjLibraryChangeOf({
        kind: "pack_clips_changed",
        packId: "pack-b",
        packIds: ["pack-a", "pack-b"],
      }),
    );
    expect(targets).toEqual([
      { kind: "packClips", packId: "pack-a" },
      { kind: "packClips", packId: "pack-b" },
      { kind: "packs" },
      { kind: "clips" },
    ]);
  });

  it.each([
    "pack_created",
    "pack_renamed",
    "pack_deleted",
    "packs_reordered",
    "clip_created",
    "clip_updated",
    "clip_deleted",
  ] as const)("each v1 kind reads the whole library again (%s)", (kind) => {
    expect(targetsOfKind(kind)).toEqual([{ kind: "root" }]);
  });

  it.each(["clip_favorite_changed", "clip_defaults_changed"] as const)(
    "a favorite or defaults change refreshes clips and every pack's clip list (%s)",
    (kind) => {
      expect(targetsOfKind(kind)).toEqual([
        { kind: "clips" },
        { kind: "packClipsRoot" },
      ]);
    },
  );

  it("a preview change also refreshes the pack covers", () => {
    expect(targetsOfKind("clip_preview_changed")).toEqual([
      { kind: "clips" },
      { kind: "packClipsRoot" },
      { kind: "packs" },
    ]);
  });

  it("a pack event change refreshes packs and every pack event card", () => {
    const targets = vjInvalidationTargetsOf(
      vjLibraryChangeOf({
        kind: "pack_event_changed",
        packId: "pack-a",
        eventId: "event-1",
      }),
    );
    expect(targets).toEqual([{ kind: "packs" }, { kind: "packEventRoot" }]);
  });

  it("scene kinds refresh scenes, and a scene delete refreshes set lists too", () => {
    expect(targetsOfKind("scene_created")).toEqual([{ kind: "scenes" }]);
    expect(targetsOfKind("scene_updated")).toEqual([{ kind: "scenes" }]);
    expect(targetsOfKind("scenes_reordered")).toEqual([{ kind: "scenes" }]);
    expect(
      vjInvalidationTargetsOf(
        vjLibraryChangeOf({
          kind: "scene_deleted",
          sceneId: "scene-1",
          setlistIds: ["setlist-1"],
        }),
      ),
    ).toEqual([{ kind: "scenes" }, { kind: "setlists" }]);
  });

  it("set list kinds refresh set lists; creates, item changes and deletes refresh scenes, clips and pack clip lists too", () => {
    const withCounts = [
      { kind: "setlists" },
      { kind: "scenes" },
      { kind: "clips" },
      { kind: "packClipsRoot" },
    ];
    expect(targetsOfKind("setlist_updated")).toEqual([{ kind: "setlists" }]);
    expect(targetsOfKind("setlists_reordered")).toEqual([{ kind: "setlists" }]);
    expect(targetsOfKind("setlist_created")).toEqual(withCounts);
    expect(targetsOfKind("setlist_items_changed")).toEqual(withCounts);
    expect(targetsOfKind("setlist_deleted")).toEqual(withCounts);
  });

  it("a Loop or default length change reads set lists again (setlist_updated)", () => {
    expect(
      vjInvalidationTargetsOf(
        vjLibraryChangeOf({
          kind: "setlist_updated",
          setlistId: "setlist-1",
          setlistIds: ["setlist-1"],
        }),
      ),
    ).toEqual([{ kind: "setlists" }]);
  });

  it("a clip delete that removed clip steps reads the whole library, set lists included", () => {
    expect(
      vjInvalidationTargetsOf(
        vjLibraryChangeOf({
          kind: "clip_deleted",
          clipId: "clip-1",
          packIds: ["pack-1"],
          setlistIds: ["setlist-1", "setlist-2"],
        }),
      ),
    ).toEqual([{ kind: "root" }]);
  });

  it("covers every kind the contract lists", () => {
    expect(VJ_LIBRARY_CHANGE_KINDS).toHaveLength(21);
    for (const kind of VJ_LIBRARY_CHANGE_KINDS) {
      expect(targetsOfKind(kind).length).toBeGreaterThan(0);
    }
  });
});

describe("vjLibraryChangeOf", () => {
  it("fills the fields a writer leaves out", () => {
    expect(
      vjLibraryChangeOf({ kind: "scene_updated", sceneId: "scene-1" }),
    ).toEqual({
      kind: "scene_updated",
      packId: null,
      clipId: null,
      packIds: [],
      sceneId: "scene-1",
      setlistId: null,
      setlistIds: [],
      eventId: null,
    });
  });
});
