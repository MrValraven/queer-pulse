import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { CreateGatheringSuccess } from "./CreateGatheringSuccess";
import { manageGatheringPath } from "./gatheringPaths";
import type { GatheringForm } from "./useGatheringForm";
import { awaitCatalog } from "../../test/awaitCatalog";

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

async function renderSuccess(format: string) {
  const view = render(
    <TestProviders>
      <CreateGatheringSuccess
        form={{ format } as unknown as GatheringForm}
        createdSlug="thursday-quiz-copy"
        occurrenceSlugs={["thursday-quiz-copy"]}
      />
    </TestProviders>,
  );
  await awaitCatalog("gatherings");
  return view;
}

beforeEach(() => {
  mocks.isVisible = true;
});

describe("CreateGatheringSuccess quizshow link", () => {
  it("links a quiz event to its Live game tab", async () => {
    await renderSuccess("quiz");
    const link = screen.getByRole("link", {
      name: "Write your quiz",
    });
    expect(link.getAttribute("href")).toBe(
      manageGatheringPath("thursday-quiz-copy", "quizshow"),
    );
  });

  it("shows no quiz link for other formats or while Pulse Live is hidden", async () => {
    await renderSuccess("brunch");
    expect(
      screen.queryByRole("link", {
        name: "Write your quiz",
      }),
    ).toBeNull();
    mocks.isVisible = false;
    await renderSuccess("quiz");
    expect(
      screen.queryByRole("link", {
        name: "Write your quiz",
      }),
    ).toBeNull();
  });
});
