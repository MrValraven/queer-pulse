import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ItemRevisionHistoryModal } from "./ItemRevisionHistoryModal";

/**
 * `ItemRevisionHistoryModal` is the "Version history" list + view + restore
 * modal opened from the item editor drawer (Task 10). This item id
 * ("item-1") is deliberately absent from `itemRevisions.ts`'s
 * `SEED_REVISIONS` demo fixture, so `listDemoRevisions` resolves to an empty
 * array and the modal renders its heading plus the empty state. Only
 * `TestProviders` for the lazy `subprofiles` catalog, demo mode, and the
 * toast context, so the translated text comes via `findBy*`.
 */
describe("ItemRevisionHistoryModal", () => {
  it("shows the history heading and an empty state when there are no revisions", async () => {
    render(
      <ItemRevisionHistoryModal
        subprofileId="p1"
        itemId="item-1"
        section="poems"
        onClose={() => {}}
      />,
      { wrapper: TestProviders },
    );

    expect(await screen.findByText(/Version history/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/No earlier versions yet/i),
    ).toBeInTheDocument();
  });
});
