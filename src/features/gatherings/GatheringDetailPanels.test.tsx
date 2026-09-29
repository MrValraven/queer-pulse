import { fireEvent, render, screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { GatheringDetailPanels } from "./GatheringDetailPanels";
import type { GatheringDetail } from "./data";

/**
 * `?share=plans` opens Share plans on arrival (the Go together group sheet
 * links there), and closing it takes the parameter back off the URL. The
 * sibling panels and the modal itself are stubbed: only the open and close
 * wiring is under test here.
 */

vi.mock("./GatheringAnnouncements", () => ({
  GatheringAnnouncements: () => null,
}));
vi.mock("./GatheringWherePanel", () => ({
  GatheringWherePanel: () => null,
}));
vi.mock("./GatheringAccessPanel", () => ({
  GatheringAccessPanel: () => null,
}));
const STUB_DIALOG_NAME = "Share plans stub";
const STUB_CLOSE_NAME = "Close stub";

vi.mock("./SharePlansModal", () => ({
  SharePlansModal: ({ onClose }: { onClose: () => void }) => (
    <div role="dialog" aria-label={STUB_DIALOG_NAME}>
      <button type="button" onClick={onClose}>
        {STUB_CLOSE_NAME}
      </button>
    </div>
  ),
}));

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

function renderPanels(
  myRsvpStatus: GatheringDetail["myRsvpStatus"],
  initialEntry: string,
) {
  const gathering = {
    slug: "pride-picnic",
    myRsvpStatus,
    announcements: [],
  } as unknown as GatheringDetail;
  render(
    <TestProviders initialEntries={[initialEntry]}>
      <GatheringDetailPanels gathering={gathering} demoMode={false} />
      <LocationProbe />
    </TestProviders>,
  );
}

describe("GatheringDetailPanels share plans parameter", () => {
  it("opens Share plans from ?share=plans and removes the parameter on close", () => {
    renderPanels("going", "/gatherings/pride-picnic?share=plans&tab=about");
    expect(
      screen.getByRole("dialog", { name: STUB_DIALOG_NAME }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: STUB_CLOSE_NAME }));

    expect(
      screen.queryByRole("dialog", { name: STUB_DIALOG_NAME }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "?tab=about",
    );
  });

  it("ignores the parameter for a member who is not going", () => {
    renderPanels(null, "/gatherings/pride-picnic?share=plans");
    expect(
      screen.queryByRole("dialog", { name: STUB_DIALOG_NAME }),
    ).not.toBeInTheDocument();
  });
});
