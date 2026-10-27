import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioReleaseCardView } from "./api/studio.adapters";
import type {
  StudioDashboardReleaseView,
  StudioReleaseHealthItemView,
} from "./api/studioDashboard.adapters";
import type { StudioReleaseStatus } from "./api/studio.types";
import { StudioReleaseHealthList } from "./StudioReleaseHealthList";

function releaseRowOf(
  id: string,
  title: string,
  status: StudioReleaseStatus,
  items: StudioReleaseHealthItemView[],
): StudioDashboardReleaseView {
  const doneCount = items.filter((item) => item.isDone).length;
  return {
    release: { id, title } as StudioReleaseCardView,
    status,
    health: {
      items,
      doneCount,
      totalCount: items.length,
      hasOpenItems: doneCount < items.length,
    },
  } as StudioDashboardReleaseView;
}

const doneItem = (
  key: StudioReleaseHealthItemView["key"],
): StudioReleaseHealthItemView => ({ key, isDone: true, isOptional: false });

const rows: StudioDashboardReleaseView[] = [
  releaseRowOf("r-mare", "Maré alta", "published", [
    doneItem("cover"),
    { key: "description", isDone: false, isOptional: false },
    doneItem("genreAndMood"),
    doneItem("creditsOnEveryTrack"),
    doneItem("versionNote"),
  ]),
  releaseRowOf("r-cidade", "Cidade dos santos", "published", [
    doneItem("cover"),
    doneItem("description"),
    { key: "lyrics", isDone: false, isOptional: true },
  ]),
  releaseRowOf("r-draft", "Rascunho", "draft", [
    { key: "cover", isDone: false, isOptional: false },
  ]),
  releaseRowOf("r-scheduled", "Lua nova", "scheduled", [
    doneItem("cover"),
    { key: "genreAndMood", isDone: false, isOptional: false },
  ]),
  releaseRowOf("r-buy", "Fado novo", "published", [
    doneItem("cover"),
    { key: "buyLink", isDone: false, isOptional: true },
  ]),
];

describe("StudioReleaseHealthList", () => {
  it("shows each release's progress and opens its checklist", async () => {
    render(
      <TestProviders>
        <StudioReleaseHealthList releases={rows} />
      </TestProviders>,
    );
    expect(screen.getByText("4 of 5 done")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Show checklist for Maré alta" }),
    );
    expect(
      screen.getByRole("button", { name: "Hide checklist for Maré alta" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      await screen.findByRole("link", { name: "Write a description" }),
    ).toHaveAttribute(
      "href",
      "/studio/upload?release=r-mare#studio-release-description",
    );
    expect(screen.getByText("Cover added")).toBeInTheDocument();
  });

  it("marks optional items", async () => {
    render(
      <TestProviders>
        <StudioReleaseHealthList releases={rows} />
      </TestProviders>,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Show checklist for Cidade dos santos",
      }),
    );
    const lyrics = await screen.findByRole("link", {
      name: "Add lyrics to every track",
    });
    expect(lyrics.closest("li")).toHaveTextContent("Optional");
  });

  it("shows three releases, then the rest on request", () => {
    render(
      <TestProviders>
        <StudioReleaseHealthList releases={rows} />
      </TestProviders>,
    );
    expect(
      screen.getAllByRole("button", { name: /^Show checklist for/ }),
    ).toHaveLength(3);
    fireEvent.click(
      screen.getByRole("button", { name: "Show 2 more releases" }),
    );
    expect(
      screen.getAllByRole("button", { name: /^Show checklist for/ }),
    ).toHaveLength(5);
    expect(
      screen.getByRole("button", { name: "Show fewer releases" }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});
