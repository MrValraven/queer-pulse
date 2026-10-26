import { describe, expect, it } from "vitest";
import {
  diffMeta,
  diffRows,
  rowDiffToChange,
  type MetaSnapshot,
  type PendingArea,
} from "./subprofileEditorDiff";
import {
  withUid,
  type SubprofileEditorRow,
} from "./subprofileSectionEditorRows";
import {
  buildMetaPatchFrom,
  shouldShowStudioHeroControl,
} from "./subprofileMetaEditor.helpers";
import type { SubprofileItemView } from "./api/subprofiles.adapters";

/**
 * Pure diff logic for the editor's global-save "pending changes" list — no
 * providers, no network. Locks down `diffMeta`'s per-field itemization,
 * `diffRows`'s `_uid`-identity add/remove/edit/reorder counting (edited via
 * the same `itemsToInputDto` shaping the save path sends), and
 * `rowDiffToChange`'s null-when-unchanged fold.
 */

function makeMeta(overrides: Partial<MetaSnapshot> = {}): MetaSnapshot {
  return {
    displayName: "NIGHTFORM",
    tagline: "After-hours electronics",
    bio: "Producer, DJ",
    avatarUrl: "https://img.test/a.jpg",
    coverUrl: "https://img.test/cover.jpg",
    slug: "nightform",
    handle: "nightform",
    link: "unlinked",
    visibility: "open",
    accent: "violet",
    availability: "booking",
    ctaLabel: "Book a set",
    ctaUrl: "https://x.test/book",
    coverBleed: false,
    studioHero: "full-bleed",
    ...overrides,
  };
}

/** Minimal `SubprofileItemView` — every field the type requires, defaulted to
 *  its "empty" shape (mirrors `emptyItem` in `subprofileSectionEditorRows.ts`)
 *  so fixtures only need to override what a given test cares about. */
function makeItemView(
  overrides: Partial<SubprofileItemView> & Pick<SubprofileItemView, "section">,
): SubprofileItemView {
  return {
    id: "item-test",
    title: "",
    createdAt: "2025-01-01T00:00:00.000Z",
    subtitle: "",
    description: "",
    url: "",
    imageUrl: "",
    date: "",
    meta: "",
    tags: [],
    isFeatured: false,
    collaborators: [],
    venue: null,
    doors: null,
    ticketUrl: null,
    gigState: null,
    medium: null,
    dimensions: null,
    edition: null,
    workState: null,
    structured: null,
    ...overrides,
  };
}

function makeRow(
  overrides: Partial<SubprofileItemView> & Pick<SubprofileItemView, "section">,
): SubprofileEditorRow {
  return withUid(makeItemView(overrides));
}

describe("diffMeta", () => {
  it("returns no changes for identical snapshots", () => {
    const meta = makeMeta();
    expect(diffMeta(meta, meta)).toEqual([]);
  });

  it("emits one metaEdited change for a single edited text field", () => {
    const baseline = makeMeta();
    const current = makeMeta({ tagline: "New tagline" });
    const changes = diffMeta(current, baseline);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toEqual({
      area: { kind: "meta" },
      areaLabelKey: "subprofiles:pending.area.meta",
      summaryKey: "subprofiles:pending.metaEdited",
      params: { field: "subprofiles:pending.field.tagline" },
    });
  });

  it("emits a plain metaEdited change for an enum field (no raw value leak)", () => {
    const baseline = makeMeta();
    const current = makeMeta({ visibility: "closed" });
    const changes = diffMeta(current, baseline);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toEqual({
      area: { kind: "meta" },
      areaLabelKey: "subprofiles:pending.area.meta",
      summaryKey: "subprofiles:pending.metaEdited",
      params: { field: "subprofiles:pending.field.visibility" },
    });
  });

  it("emits metaImageRemoved when an image field is cleared to empty", () => {
    const baseline = makeMeta();
    const current = makeMeta({ avatarUrl: "" });
    const changes = diffMeta(current, baseline);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toEqual({
      area: { kind: "meta" },
      areaLabelKey: "subprofiles:pending.area.meta",
      summaryKey: "subprofiles:pending.metaImageRemoved",
      params: { field: "subprofiles:pending.field.avatarUrl" },
    });
  });

  it("emits metaImage when an image field is set to a new url", () => {
    const baseline = makeMeta({ coverUrl: "" });
    const current = makeMeta({ coverUrl: "https://img.test/new-cover.jpg" });
    const changes = diffMeta(current, baseline);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toEqual({
      area: { kind: "meta" },
      areaLabelKey: "subprofiles:pending.area.meta",
      summaryKey: "subprofiles:pending.metaImage",
      params: { field: "subprofiles:pending.field.coverUrl" },
    });
  });

  it("emits a plain metaEdited change for a toggled boolean field", () => {
    const baseline = makeMeta({ coverBleed: false });
    const current = makeMeta({ coverBleed: true });
    const changes = diffMeta(current, baseline);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toEqual({
      area: { kind: "meta" },
      areaLabelKey: "subprofiles:pending.area.meta",
      summaryKey: "subprofiles:pending.metaEdited",
      params: { field: "subprofiles:pending.field.coverBleed" },
    });
  });

  it("itemizes a changed Studio page layout as a plain metaEdited change", () => {
    const changes = diffMeta(
      makeMeta({ studioHero: "avatar" }),
      makeMeta({ studioHero: "full-bleed" }),
    );
    expect(changes).toEqual([
      {
        area: { kind: "meta" },
        areaLabelKey: "subprofiles:pending.area.meta",
        summaryKey: "subprofiles:pending.metaEdited",
        params: { field: "subprofiles:pending.field.studioHero" },
      },
    ]);
  });

  it("reports no Studio layout change when it is unchanged", () => {
    expect(diffMeta(makeMeta(), makeMeta())).toEqual([]);
  });

  it("emits one change per diverged field when several change at once", () => {
    const baseline = makeMeta();
    const current = makeMeta({
      displayName: "NEW NAME",
      slug: "new-slug",
      accent: "coral",
    });
    const changes = diffMeta(current, baseline);
    expect(changes).toHaveLength(3);
    expect(changes.map((change) => change.params?.field)).toEqual([
      "subprofiles:pending.field.displayName",
      "subprofiles:pending.field.slug",
      "subprofiles:pending.field.accent",
    ]);
  });
});

describe("diffRows", () => {
  it("returns all zeros / not reordered for identical rows", () => {
    const rows = [
      makeRow({ section: "discography", title: "Threshold EP" }),
      makeRow({ section: "discography", title: "Static Bloom" }),
    ];
    expect(diffRows(rows, rows)).toEqual({
      added: 0,
      removed: 0,
      edited: 0,
      reordered: false,
    });
  });

  it("returns all zeros for two empty lists", () => {
    expect(diffRows([], [])).toEqual({
      added: 0,
      removed: 0,
      edited: 0,
      reordered: false,
    });
  });

  it("counts added rows", () => {
    const baseline = [
      makeRow({ section: "discography", title: "Threshold EP" }),
    ];
    const current = [
      ...baseline,
      makeRow({ section: "discography", title: "New Track A" }),
      makeRow({ section: "discography", title: "New Track B" }),
    ];
    expect(diffRows(current, baseline)).toEqual({
      added: 2,
      removed: 0,
      edited: 0,
      reordered: false,
    });
  });

  it("counts removed rows", () => {
    const first = makeRow({ section: "discography", title: "Threshold EP" });
    const second = makeRow({ section: "discography", title: "Static Bloom" });
    const baseline = [first, second];
    const current = [first];
    expect(diffRows(current, baseline)).toEqual({
      added: 0,
      removed: 1,
      edited: 0,
      reordered: false,
    });
  });

  it("counts an edited row's content change", () => {
    const baseline = [
      makeRow({ section: "discography", title: "Threshold EP" }),
    ];
    const current = [{ ...baseline[0]!, title: "Threshold EP (Remaster)" }];
    expect(diffRows(current, baseline)).toEqual({
      added: 0,
      removed: 0,
      edited: 1,
      reordered: false,
    });
  });

  it("detects a reorder when membership is unchanged but order differs", () => {
    const first = makeRow({ section: "discography", title: "Threshold EP" });
    const second = makeRow({ section: "discography", title: "Static Bloom" });
    const baseline = [first, second];
    const current = [second, first];
    expect(diffRows(current, baseline)).toEqual({
      added: 0,
      removed: 0,
      edited: 0,
      reordered: true,
    });
  });
});

describe("rowDiffToChange", () => {
  const area: PendingArea = { kind: "section", section: "discography" };
  const areaLabelKey = "subprofiles:pending.area.section.discography";

  it("returns null when nothing changed", () => {
    expect(
      rowDiffToChange(area, areaLabelKey, {
        added: 0,
        removed: 0,
        edited: 0,
        reordered: false,
      }),
    ).toBeNull();
  });

  it("returns a PendingChange with the row-summary params when something changed", () => {
    const change = rowDiffToChange(area, areaLabelKey, {
      added: 2,
      removed: 1,
      edited: 0,
      reordered: false,
    });
    expect(change).toEqual({
      area,
      areaLabelKey,
      summaryKey: "subprofiles:pending.rowSummary",
      params: { added: 2, removed: 1, edited: 0, reordered: 0 },
    });
  });

  it("marks reordered:1 in params when only the order changed", () => {
    const change = rowDiffToChange(area, areaLabelKey, {
      added: 0,
      removed: 0,
      edited: 0,
      reordered: true,
    });
    expect(change?.params).toEqual({
      added: 0,
      removed: 0,
      edited: 0,
      reordered: 1,
    });
  });
});

describe("buildMetaPatchFrom studioHero", () => {
  it("omits skinData when neither bleed nor layout changed", () => {
    const patch = buildMetaPatchFrom(
      makeMeta({ displayName: "Renamed" }),
      makeMeta(),
      { coverOffsetY: 40 },
    );
    expect(patch).not.toBeNull();
    expect(patch).not.toHaveProperty("skinData");
  });

  it("includes studioHero merged onto existing skinData when changed", () => {
    const patch = buildMetaPatchFrom(
      makeMeta({ studioHero: "avatar" }),
      makeMeta({ studioHero: "full-bleed" }),
      { coverOffsetY: 40 },
    );
    expect(patch?.skinData).toEqual({
      coverOffsetY: 40,
      studioHero: "avatar",
    });
  });

  it("sends both keys when bleed and layout change together", () => {
    const patch = buildMetaPatchFrom(
      makeMeta({ studioHero: "avatar", coverBleed: true }),
      makeMeta(),
      null,
    );
    expect(patch?.skinData).toEqual({ coverBleed: true, studioHero: "avatar" });
  });

  it("does not send studioHero when only the bleed changed", () => {
    const patch = buildMetaPatchFrom(
      makeMeta({ coverBleed: true }),
      makeMeta(),
      null,
    );
    expect(patch?.skinData).toEqual({ coverBleed: true });
  });
});

describe("shouldShowStudioHeroControl", () => {
  it("shows for an artist kind with a cover", () => {
    expect(shouldShowStudioHeroControl("musician", "cover.jpg")).toBe(true);
    expect(shouldShowStudioHeroControl("drag", "cover.jpg")).toBe(true);
  });

  it("hides for an artist kind without a cover", () => {
    expect(shouldShowStudioHeroControl("musician", "")).toBe(false);
  });

  it("hides for non-artist personas even with a cover", () => {
    expect(shouldShowStudioHeroControl("therapist", "cover.jpg")).toBe(false);
    expect(shouldShowStudioHeroControl("developer", "cover.jpg")).toBe(false);
    expect(shouldShowStudioHeroControl(undefined, "cover.jpg")).toBe(false);
  });
});
