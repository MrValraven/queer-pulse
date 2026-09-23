import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SpaceBreadcrumb } from "./SpaceBreadcrumb";

function renderBreadcrumb() {
  return render(
    <TestProviders>
      <SpaceBreadcrumb
        parent={{ slug: "queer-elders", name: "Queer Elders" }}
        spaceName="Book Club"
      />
    </TestProviders>,
  );
}

describe("SpaceBreadcrumb", () => {
  it("links back to the parent, then a chevron, then the space name", async () => {
    renderBreadcrumb();

    // i18n catalogs load lazily, so the link's accessible name needs findBy*.
    const backLink = await screen.findByRole("link", {
      name: "Back to Queer Elders",
    });
    expect(backLink).toHaveAttribute("href", "/community/queer-elders");

    const chevron = document.querySelector('svg[aria-hidden="true"]');
    expect(chevron).toBeInTheDocument();

    const spaceName = screen.getByText("Book Club");

    // DOM order matters too: the link precedes the chevron, and the
    // chevron precedes the space name, matching the brief's "link, then icon,
    // then name" sequence. `DOCUMENT_POSITION_FOLLOWING` is set on the bitmask
    // when the argument comes after the node it's compared against.
    expect(
      backLink.compareDocumentPosition(chevron as Node) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      (chevron as Node).compareDocumentPosition(spaceName) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
