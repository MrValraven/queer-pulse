import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SubprofileItemRow } from "./SubprofileItemRow";
import type { SubprofileItemView } from "./api/subprofiles.adapters";

/**
 * A public portfolio row carries NO copyright footer. It used to render one
 * per item, which stacked the same "All rights reserved." line beside every
 * row on a persona page; the page now shows it once at the end via
 * `PersonaRightsFooter` (see `PersonaRightsFooter.test.tsx`). These guard
 * against the per-item footer creeping back in.
 */
const PROJECT_ITEM = {
  id: "item-neon-skyline",
  section: "projects",
  title: "Neon Skyline",
  createdAt: "2025-03-02T12:00:00.000Z",
  subtitle: "A generative art series",
  description: "Layered lighting studies of the city after dark.",
  url: "",
  imageUrl: "",
  date: "",
  meta: "",
  tags: [],
  isFeatured: false,
  collaborators: [],
  venue: null,
  doors: null,
  ticketUrl: null,
  gigState: null,
  medium: null,
  dimensions: null,
  edition: null,
  workState: null,
  structured: null,
} satisfies SubprofileItemView;

const POEM_ITEM = {
  ...PROJECT_ITEM,
  section: "poems",
  title: "Pecado",
} satisfies SubprofileItemView;

describe("SubprofileItemRow", () => {
  it("renders the item without a per-item copyright footer", async () => {
    render(
      <TestProviders>
        <SubprofileItemRow item={PROJECT_ITEM} skin="page" interactive />
      </TestProviders>,
    );

    expect(await screen.findByText("Neon Skyline")).toBeInTheDocument();
    expect(screen.queryByText(/All rights reserved/i)).not.toBeInTheDocument();
  });

  it("renders a poem row without a copyright footer", async () => {
    render(
      <TestProviders>
        <SubprofileItemRow item={POEM_ITEM} skin="page" interactive />
      </TestProviders>,
    );

    expect(await screen.findByText("Pecado")).toBeInTheDocument();
    expect(screen.queryByText(/All rights reserved/i)).not.toBeInTheDocument();
  });

  it("renders no copyright footer in the editor's docked preview either", async () => {
    render(
      <TestProviders>
        <SubprofileItemRow
          item={PROJECT_ITEM}
          skin="page"
          interactive={false}
        />
      </TestProviders>,
    );

    expect(await screen.findByText("Neon Skyline")).toBeInTheDocument();
    expect(screen.queryByText(/All rights reserved/i)).not.toBeInTheDocument();
  });
});
