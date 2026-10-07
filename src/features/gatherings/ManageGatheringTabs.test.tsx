import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ManageGatheringTabs } from "./ManageGatheringTabs";

vi.mock("./checkin/CheckinTab", () => ({
  CheckinTab: () => <div>check-in panel</div>,
}));

type TabsProps = ComponentProps<typeof ManageGatheringTabs>;

const requiredProps = {
  slug: "supper-club",
  onCancel: vi.fn(),
  onDelete: vi.fn(),
  details: [],
  description: "",
  venueListingId: null,
  venueListing: null,
  buildEditDraft: vi.fn(),
  onSaveEdit: vi.fn(),
  onUpdateVenue: vi.fn(),
  startAt: new Date(),
  endAt: null,
} satisfies Omit<TabsProps, "activeTab" | "onTabChange" | "isCheckinLive">;

describe("ManageGatheringTabs", () => {
  it("shows Check-in as its own tab and reports a switch to it", async () => {
    const onTabChange = vi.fn();
    render(
      <TestProviders>
        <ManageGatheringTabs
          {...requiredProps}
          activeTab="overview"
          onTabChange={onTabChange}
          isCheckinLive={false}
        />
      </TestProviders>,
    );
    // The gatherings catalog loads lazily, so wait for the first label.
    fireEvent.click(await screen.findByRole("tab", { name: "Check-in" }));
    expect(onTabChange).toHaveBeenCalledWith("checkin");
  });

  it("renders the check-in panel when it is the active tab", async () => {
    render(
      <TestProviders>
        <ManageGatheringTabs
          {...requiredProps}
          activeTab="checkin"
          onTabChange={vi.fn()}
          isCheckinLive
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("tab", { name: "Check-in" }),
    ).toBeInTheDocument();
    expect(screen.getByText("check-in panel")).toBeInTheDocument();
  });
});
