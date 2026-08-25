import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { TableMenuCard } from "./TableBlocks";
import type { SubprofileItemView } from "../api/subprofiles.adapters";

/**
 * `TableMenuCard` is the table skin's (chef/mixologist) stand-in for the
 * generic `SubprofileSpotlight` (see `SubprofilePageBody`'s
 * `skin === "table" && courses.length > 0` branch), and like that component it
 * carries no copyright footer of its own: the persona page shows one
 * `PersonaRightsFooter` at the end instead. Only `TestProviders` for the lazy
 * `subprofiles` catalog, so translated text comes via `findBy*`.
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
  it("renders the menu without a copyright footer", async () => {
    render(
      <TestProviders>
        <TableMenuCard featured={MENU_ITEM} />
      </TestProviders>,
    );

    expect(await screen.findByText("Tasting Menu")).toBeInTheDocument();
    expect(screen.queryByText(/All rights reserved/i)).not.toBeInTheDocument();
  });
});
