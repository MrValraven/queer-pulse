import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioFormat } from "./api/studio.types";
import { StudioFormatChips } from "./StudioFormatChips";
import { studioHomePath } from "./studioPaths";

const formatList = vi.hoisted(() => ({ formats: [] as StudioFormat[] }));
vi.mock("./api/useStudioFormats", () => ({
  useStudioFormats: () => ({
    formats: formatList.formats,
    loadState: {
      isLoading: false,
      isError: false,
      isRetrying: false,
      isNotFound: false,
      isWithdrawn: false,
      retry: () => undefined,
    },
  }),
}));

function renderChips(activeFormat: StudioFormat | null) {
  render(
    <TestProviders>
      <StudioFormatChips activeFormat={activeFormat} hrefOf={studioHomePath} />
    </TestProviders>,
  );
}

describe("StudioFormatChips with fewer than two formats", () => {
  beforeEach(() => {
    formatList.formats = [];
  });

  it("keeps All in reach for the chosen format with a single format listed", () => {
    formatList.formats = ["podcast"];
    renderChips("podcast");
    const nav = screen.getByRole("navigation", { name: "Show one format" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["All", "Podcasts"]);
    expect(within(nav).getByRole("link", { name: "All" })).toHaveAttribute(
      "href",
      "/studio",
    );
    expect(within(nav).getByRole("link", { name: "Podcasts" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("shows the chosen format beside All while the list is empty", () => {
    renderChips("spoken_word");
    const nav = screen.getByRole("navigation", { name: "Show one format" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["All", "Spoken word"]);
  });

  it("hides the row with a single format and nothing chosen", () => {
    formatList.formats = ["music"];
    renderChips(null);
    expect(
      screen.queryByRole("navigation", { name: "Show one format" }),
    ).toBeNull();
  });
});
