import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import type { ManagedListingItem } from "../../marketing/listBusiness/api/managedListings.api";
import type { GatheringForm } from "../useGatheringForm";
import { GatheringPreviewCard } from "./GatheringPreviewCard";

const managed = vi.hoisted(() => ({
  items: [] as ManagedListingItem[],
  isResolving: false,
}));
vi.mock("../../marketing/listBusiness/api/useManagedListings", () => ({
  useManagedListings: () => managed,
}));
vi.mock("../gatheringOccurrences", () => ({ gatheringOccurrences: () => [] }));
vi.mock("./gatheringPreviewReading", () => ({
  previewSchedule: () => null,
  previewSignature: () => "signature",
}));
vi.mock("./PreviewCardSections", () => ({
  PreviewCover: () => null,
  PreviewDateBlock: () => null,
  PreviewMetaRow: () => null,
  PreviewTagRows: () => null,
  PreviewTopRow: () => null,
}));
vi.mock("./PreviewHostRow", () => ({ PreviewHostRow: () => null }));
vi.mock("./PreviewAttendeesBlock", () => ({
  PreviewAttendeesBlock: () => null,
}));

const walks: ManagedListingItem = {
  id: "listing-uuid-1",
  ref: "QPL-2026-0101",
  slug: "lisboa-arco-iris-walks",
  name: "Lisboa Arco-Íris Walks",
  kind: "mobile",
  meetingPoint: null,
};

/** Only the members the card itself reads. */
function formWith(runByListingId: string | null): GatheringForm {
  return {
    title: "Sunset walk",
    description: "",
    runByListingId,
  } as unknown as GatheringForm;
}

function renderCard(runByListingId: string | null) {
  return render(
    <I18nProvider>
      <GatheringPreviewCard form={formWith(runByListingId)} mode="board" />
    </I18nProvider>,
  );
}

describe("GatheringPreviewCard run-by line", () => {
  it("names the picked business under the title", async () => {
    managed.items = [walks];
    renderCard("listing-uuid-1");
    expect(
      await screen.findByText("Run by Lisboa Arco-Íris Walks"),
    ).toBeInTheDocument();
  });

  it("shows no run-by line when no business is picked", () => {
    managed.items = [walks];
    renderCard(null);
    expect(screen.queryByText(/^Run by/)).not.toBeInTheDocument();
  });
});
