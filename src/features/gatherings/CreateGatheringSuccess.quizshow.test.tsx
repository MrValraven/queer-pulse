import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { CreateGatheringSuccess } from "./CreateGatheringSuccess";
import { manageGatheringPath } from "./gatheringPaths";
import type { GatheringForm } from "./useGatheringForm";

const mocks = vi.hoisted(() => ({ isVisible: true }));

vi.mock("../quizshow/quizshowLaunch", () => ({
  useIsQuizshowVisible: () => mocks.isVisible,
}));
vi.mock("./gatheringOccurrences", () => ({
  gatheringOccurrences: () => [{}],
}));
vi.mock("./preview/GatheringPreviewPanel", () => ({
  GatheringPreviewPanel: () => null,
}));
vi.mock("./shareKit/ShareKitRow", () => ({ ShareKitRow: () => null }));

function renderSuccess(format: string) {
  return render(
    <TestProviders>
      <CreateGatheringSuccess
        form={{ format } as unknown as GatheringForm}
        createdSlug="thursday-quiz-copy"
        occurrenceSlugs={["thursday-quiz-copy"]}
      />
    </TestProviders>,
  );
}

beforeEach(() => {
  mocks.isVisible = true;
});

describe("CreateGatheringSuccess quizshow link", () => {
  it("links a quiz event to its Live game tab", () => {
    renderSuccess("quiz");
    const link = screen.getByRole("link", {
      name: "gatherings:create.success.quizshowCta",
    });
    expect(link.getAttribute("href")).toBe(
      manageGatheringPath("thursday-quiz-copy", "quizshow"),
    );
  });

  it("shows no quiz link for other formats or while Pulse Live is hidden", () => {
    renderSuccess("brunch");
    expect(
      screen.queryByRole("link", {
        name: "gatherings:create.success.quizshowCta",
      }),
    ).toBeNull();
    mocks.isVisible = false;
    renderSuccess("quiz");
    expect(
      screen.queryByRole("link", {
        name: "gatherings:create.success.quizshowCta",
      }),
    ).toBeNull();
  });
});
