import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { useShareMenuItems } from "../../messages/share/useShareMenuItems";
import { studioMilestoneTarget } from "./studioLinkTarget";
import { StudioMilestoneShareDialog } from "./StudioMilestoneShareDialog";

vi.mock("./LazyStudioShareCard", () => ({
  LazyStudioShareCard: ({
    target,
    surface,
  }: {
    target: { kind: string };
    surface: string;
  }) => (
    <div
      data-testid="studio-card"
      data-kind={target.kind}
      data-surface={surface}
    />
  ),
}));

vi.mock("./useStudioShareRules", () => ({
  useStudioShareRules: () => ({
    canSendToOthers: true,
    ownPersonaName: "Mariana Sol",
  }),
}));

vi.mock("../../messages/share/useShareMenuItems", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../messages/share/useShareMenuItems")
    >();
  return { useShareMenuItems: vi.fn(actual.useShareMenuItems) };
});

const MILESTONE_SENTENCE = "Mariana Sol passed 1,000 followers";

function renderDialog() {
  return render(
    <TestProviders>
      <StudioMilestoneShareDialog
        target={studioMilestoneTarget("p1", "m1")}
        title={MILESTONE_SENTENCE}
        onClose={() => {}}
      />
    </TestProviders>,
  );
}

describe("StudioMilestoneShareDialog", () => {
  it("shares the milestone link with the sentence as its title", () => {
    renderDialog();
    expect(
      screen.getByRole("dialog", { name: "Share milestone" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "Ways to share this milestone" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("studio-card")).toHaveAttribute(
      "data-kind",
      "milestone",
    );
    expect(useShareMenuItems).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/studio/artist?id=p1&milestone=m1",
        title: MILESTONE_SENTENCE,
        kind: "studio",
      }),
      expect.anything(),
      { shouldOfferSendInMessage: true },
    );
  });
});
