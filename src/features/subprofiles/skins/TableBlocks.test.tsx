import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { TableMenuCard } from "./TableBlocks";
import type { SubprofileItemView } from "../api/subprofiles.adapters";

/**
 * Task 3b fix round 1: `TableMenuCard` is the table skin's (chef/mixologist)
 * stand-in for the generic `SubprofileSpotlight` (see `SubprofilePageBody`'s
 * `skin === "table" && courses.length > 0` branch), so it needs the SAME
 * `WorkRightsFooter` `SubprofileSpotlight` itself carries. Only
 * `TestProviders` for the lazy `subprofiles` catalog, so translated text
 * comes via `findBy*`.
 */
const MENU_ITEM = {
  id: "item-tasting-menu",
  section: "menus",
  title: "Tasting Menu",
  createdAt: "2025-03-02T12:00:00.000Z",
  subtitle: "Five courses, seasonal",
  description: "",
  url: "",
  imageUrl: "",
  date: "",
  meta: "",
  tags: [],
  isFeatured: true,
  collaborators: [],
  venue: null,
  doors: null,
  ticketUrl: null,
  gigState: null,
  medium: null,
  dimensions: null,
  edition: null,
  workState: null,
  structured: {
    courses: [
      {
        n: "1",
        name: "Starters",
        dishes: [{ title: "Beet tartare" }],
      },
    ],
  },
} satisfies SubprofileItemView;

describe("TableMenuCard", () => {
  it("renders WorkRightsFooter's copyright text when interactive", async () => {
    render(
      <TestProviders>
        <TableMenuCard
          featured={MENU_ITEM}
          authorName="Chef Rui"
          interactive
        />
      </TestProviders>,
    );

    expect(await screen.findByText(/All rights reserved/i)).toBeInTheDocument();
    expect(await screen.findByText(/Chef Rui/)).toBeInTheDocument();
  });

  it("does not render the footer in the editor's docked preview (interactive=false)", () => {
    render(
      <TestProviders>
        <TableMenuCard
          featured={MENU_ITEM}
          authorName="Chef Rui"
          interactive={false}
        />
      </TestProviders>,
    );

    expect(screen.queryByText(/All rights reserved/i)).not.toBeInTheDocument();
  });
});
