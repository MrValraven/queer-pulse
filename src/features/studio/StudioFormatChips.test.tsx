import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import { StudioFormatChips } from "./StudioFormatChips";
import { studioHomePath } from "./studioPaths";

describe("StudioFormatChips (demo)", () => {
  it("lists All and every format with content, the current one marked", async () => {
    render(
      <TestProviders>
        <StudioFormatChips activeFormat="podcast" hrefOf={studioHomePath} />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    const nav = await screen.findByRole("navigation", {
      name: "Show one format",
    });
    // The row holds the current format alone until the format list lands.
    await waitFor(() =>
      expect(
        within(nav)
          .getAllByRole("link")
          .map((link) => link.textContent),
      ).toEqual(["All", "Music", "Podcasts", "Spoken word", "Performance"]),
    );
    expect(within(nav).getByRole("link", { name: "Podcasts" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(nav).getByRole("link", { name: "All" })).toHaveAttribute(
      "href",
      "/studio",
    );
    expect(
      within(nav).getByRole("link", { name: "Spoken word" }),
    ).toHaveAttribute("href", "/studio?format=spoken_word");
  });
});
