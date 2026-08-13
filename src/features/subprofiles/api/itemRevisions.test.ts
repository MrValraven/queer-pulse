import { describe, expect, it } from "vitest";
import {
  getDemoRevision,
  listDemoRevisions,
  recordDemoRevision,
} from "./itemRevisions";

/**
 * Pure demo-overlay logic for saved item revision history, no providers, no
 * network. Each test uses its own itemId so cases never collide with each
 * other or with the module's seeded fixtures (see `itemRevisions.ts`).
 */
describe("itemRevisions demo overlay", () => {
  it("lists a recorded revision, newest first", () => {
    const itemId = "item-test-newest-first";
    recordDemoRevision(itemId, { title: "First draft" });
    recordDemoRevision(itemId, { title: "Second draft" });

    const revisions = listDemoRevisions(itemId);

    expect(revisions).toHaveLength(2);
    expect(revisions[0].title).toBe("Second draft");
    expect(revisions[1].title).toBe("First draft");
  });

  it("returns an empty list for an item with no recorded revisions", () => {
    expect(listDemoRevisions("item-test-empty")).toEqual([]);
  });

  it("caps recorded revisions at 30, dropping the oldest first", () => {
    const itemId = "item-test-cap";
    for (let revisionIndex = 0; revisionIndex < 35; revisionIndex += 1) {
      recordDemoRevision(itemId, { title: `Draft ${revisionIndex}` });
    }

    const revisions = listDemoRevisions(itemId);

    expect(revisions).toHaveLength(30);
    // Newest recorded (index 34) stays at the front; the oldest five
    // (indices 0-4) were dropped to make room.
    expect(revisions[0].title).toBe("Draft 34");
    expect(revisions[29].title).toBe("Draft 5");
  });

  it("returns a revision's full snapshot by id via getDemoRevision", () => {
    const itemId = "item-test-detail";
    recordDemoRevision(itemId, {
      title: "Snapshot title",
      description: "Snapshot body",
    });

    const [summary] = listDemoRevisions(itemId);
    const detail = getDemoRevision(itemId, summary.id);

    expect(detail?.snapshot).toEqual({
      title: "Snapshot title",
      description: "Snapshot body",
    });
  });

  it("returns undefined from getDemoRevision for an unknown revisionId", () => {
    expect(getDemoRevision("item-test-unknown", "rev-does-not-exist")).toBeUndefined();
  });
});
