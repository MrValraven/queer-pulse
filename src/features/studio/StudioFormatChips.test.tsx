import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioFormatChips } from "./StudioFormatChips";
import { studioHomePath } from "./studioPaths";

describe("StudioFormatChips (demo)", () => {
  it("lists All and every format with content, the current one marked", async () => {
    render(
      <TestProviders>
        <StudioFormatChips activeFormat="podcast" hrefOf={studioHomePath} />
      </TestProviders>,
    );
    const nav = await screen.findByRole("navigation", {
      name: "Show one format",
    });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "All",
      "Music",
      "Podcasts",
      "Spoken word",
      "Performance",
    ]);
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
