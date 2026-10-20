import { describe, expect, it } from "vitest";
import { chapterKeyForPath } from "../../skinFieldAnchor";
import { TATTOO_CHAPTERS } from "../../tattooEditorChapters.data";
import { TATTOO_EDIT_TARGETS, tattooEditHref } from "./tattooEditLinks.data";

describe("tattoo edit links", () => {
  it("opens the Booking chapter on the books status", () => {
    expect(tattooEditHref("sp-1", TATTOO_EDIT_TARGETS.status)).toBe(
      "/account/subprofiles/sp-1/edit?pane=skinBlocks&chapter=booking&field=tattoo.status",
    );
  });

  it("points every block at the chapter that edits its field", () => {
    const pageBlockTargets = Object.values(TATTOO_EDIT_TARGETS).filter(
      (target) => target.pane === "skinBlocks" && target.field,
    );
    expect(pageBlockTargets.length).toBeGreaterThan(0);
    for (const target of pageBlockTargets) {
      if (target.pane !== "skinBlocks" || !target.field) continue;
      expect(chapterKeyForPath(TATTOO_CHAPTERS, target.field)).toBe(
        target.chapter,
      );
    }
  });
});
