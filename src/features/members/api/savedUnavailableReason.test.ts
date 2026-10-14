import { describe, expect, it } from "vitest";
import { dtoToSavedItem, type SavedItemDTO } from "./saved.api";

const plainUnavailableSave: SavedItemDTO = {
  id: "studio_release:release-1",
  kind: "studio_release",
  title: "Bairro antigo",
  href: null,
  meta: "Mariana Sol",
  savedAt: "2026-10-13T10:00:00.000Z",
  availability: "unavailable",
};
// A withdrawn row keeps its stored href (PLAN-1); every other unavailable
// row has href: null.
const withdrawnSave: SavedItemDTO = {
  ...plainUnavailableSave,
  href: "/studio/album?id=release-1",
  unavailableReason: "withdrawn",
};

describe("dtoToSavedItem: why a save cannot be opened", () => {
  it("keeps the withdrawn reason and the stored href on an unavailable Studio save", () => {
    const item = dtoToSavedItem(withdrawnSave);
    expect(item.unavailableReason).toBe("withdrawn");
    expect(item.href).toBe("/studio/album?id=release-1");
  });

  it("drops a reason that arrives on an available save", () => {
    const item = dtoToSavedItem({
      ...withdrawnSave,
      availability: "available",
      href: "/studio/album?id=release-1",
    });
    expect(item.unavailableReason).toBeUndefined();
  });

  it("leaves every other unavailable save without a reason", () => {
    expect(dtoToSavedItem(plainUnavailableSave).unavailableReason).toBe(
      undefined,
    );
  });
});
