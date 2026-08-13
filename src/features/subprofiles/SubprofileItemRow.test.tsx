import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SubprofileItemRow } from "./SubprofileItemRow";
import type { SubprofileItemView } from "./api/subprofiles.adapters";

/**
 * Task 3b: every non-poem portfolio item's public row shows the SAME
 * `WorkRightsFooter` copyright block poems already get in `PoemReaderModal`
 * (Task 3). Verifies the footer appears on an interactive, non-poem row and
 * is withheld both for poem items (avoids doubling the footer poems already
 * show in the reader modal) and in the editor's docked
 * `interactive={false}` preview.
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
  it("renders WorkRightsFooter's copyright text for an interactive non-poem item", async () => {
    render(
      <TestProviders>
        <SubprofileItemRow
          item={PROJECT_ITEM}
          skin="page"
          interactive
          authorName="Sofia Neves"
        />
      </TestProviders>,
    );

    expect(await screen.findByText(/All rights reserved/i)).toBeInTheDocument();
    expect(await screen.findByText(/Sofia Neves/)).toBeInTheDocument();
  });

  it("does not render the footer for a poem item (PoemReaderModal owns it instead)", () => {
    render(
      <TestProviders>
        <SubprofileItemRow
          item={POEM_ITEM}
          skin="page"
          interactive
          authorName="Sofia Neves"
        />
      </TestProviders>,
    );

    expect(screen.queryByText(/All rights reserved/i)).not.toBeInTheDocument();
  });

  it("does not render the footer when non-interactive (editor's docked preview)", () => {
    render(
      <TestProviders>
        <SubprofileItemRow
          item={PROJECT_ITEM}
          skin="page"
          interactive={false}
          authorName="Sofia Neves"
        />
      </TestProviders>,
    );

    expect(screen.queryByText(/All rights reserved/i)).not.toBeInTheDocument();
  });
});
