import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ManageGatheringTabs } from "./ManageGatheringTabs";
import type { ManageGatheringTab } from "./gatheringPaths";

vi.mock("./checkin/CheckinTab", () => ({
  CheckinTab: () => <div>check-in panel</div>,
}));

vi.mock("../quizshow/builder/QuizshowBuilderTab", () => ({
  QuizshowBuilderTab: () => <div>live game panel</div>,
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

  async function renderedTabNames(options: {
    isQuizFormat: boolean;
    isQuizshowVisible: boolean;
  }) {
    render(
      <TestProviders>
        <ManageGatheringTabs
          {...requiredProps}
          {...options}
          activeTab="overview"
          onTabChange={vi.fn()}
          isCheckinLive={false}
        />
      </TestProviders>,
    );
    await screen.findByRole("tab", { name: "Check-in" });
    return screen.getAllByRole("tab").map((tab) => tab.textContent);
  }

  it("puts Live game second on a quiz event", async () => {
    const names = await renderedTabNames({
      isQuizFormat: true,
      isQuizshowVisible: true,
    });
    expect(names[1]).toBe("Live game");
  });

  it("puts Live game before Settings on any other event", async () => {
    const names = await renderedTabNames({
      isQuizFormat: false,
      isQuizshowVisible: true,
    });
    const settingsPosition = names.findIndex((name) => name === "Settings");
    expect(names[settingsPosition - 1]).toBe("Live game");
  });

  it("hides Live game while Pulse Live is not visible", async () => {
    const names = await renderedTabNames({
      isQuizFormat: true,
      isQuizshowVisible: false,
    });
    expect(names).not.toContain("Live game");
  });

  it("renders the builder when Live game is active", async () => {
    const activeTab: ManageGatheringTab = "quizshow";
    render(
      <TestProviders>
        <ManageGatheringTabs
          {...requiredProps}
          isQuizshowVisible
          activeTab={activeTab}
          onTabChange={vi.fn()}
          isCheckinLive={false}
        />
      </TestProviders>,
    );
    expect(await screen.findByText("live game panel")).toBeInTheDocument();
  });
});
