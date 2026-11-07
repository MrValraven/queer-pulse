import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { ListingWorksAtView } from "../marketing/listBusiness/api/listingTeam.types";
import { SubprofileAffiliations } from "./SubprofileAffiliations";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import { SubprofileWorksAt } from "./SubprofileWorksAt";
import { awaitCatalog } from "../../test/awaitCatalog";

const TINTA_VIVA: ListingWorksAtView = {
  slug: "tinta-viva",
  name: "Tinta Viva",
  href: "/local/directory/tinta-viva",
  imageUrl: null,
  tint: "plum",
  initials: "TV",
  roleLabel: "Apprentice",
};

describe("SubprofileWorksAt", () => {
  it("links each business with its image and role", async () => {
    render(
      <TestProviders>
        <SubprofileWorksAt worksAt={[TINTA_VIVA]} isInteractive />
      </TestProviders>,
    );
    await awaitCatalog("subprofiles");
    expect(screen.getByText("Works at")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Tinta Viva/ });
    expect(link).toHaveAttribute("href", "/local/directory/tinta-viva");
    expect(link).toHaveTextContent("Apprentice");
  });

  it("draws the initials outside any span, like the Part of chip", async () => {
    render(
      <TestProviders>
        <SubprofileWorksAt worksAt={[TINTA_VIVA]} isInteractive />
      </TestProviders>,
    );
    await awaitCatalog("subprofiles");
    const initials = screen.getByText("TV");
    expect(initials.tagName).toBe("DIV");
    expect(initials.closest("span")).toBeNull();
    expect(initials.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("renders plain chips in the editor preview", async () => {
    render(
      <TestProviders>
        <SubprofileWorksAt worksAt={[TINTA_VIVA]} isInteractive={false} />
      </TestProviders>,
    );
    await awaitCatalog("subprofiles");
    expect(screen.getByText("Tinta Viva", { exact: false })).toBeVisible();
    expect(screen.getByText("Apprentice")).toBeVisible();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders nothing without links", async () => {
    // The providers paint their own audio and toast nodes into the
    // container, so the component gets a slot of its own.
    render(
      <TestProviders>
        <div data-testid="works-at-slot">
          <SubprofileWorksAt worksAt={[]} isInteractive />
        </div>
      </TestProviders>,
    );
    await awaitCatalog("subprofiles");
    expect(screen.getByTestId("works-at-slot")).toBeEmptyDOMElement();
  });

  it("shows Works at on a persona with no Part of links", async () => {
    const persona = {
      id: "persona-1",
      affiliations: [],
      endorsementCount: 0,
      viewerIsMember: false,
      visibility: "open",
      worksAt: [TINTA_VIVA],
    } as unknown as PublicSubprofileView;
    render(
      <TestProviders>
        <SubprofileAffiliations
          persona={persona}
          skin="studio"
          mode="visitor"
          onAction={() => undefined}
        />
      </TestProviders>,
    );
    await awaitCatalog("subprofiles");
    expect(screen.getByText("Works at")).toBeInTheDocument();
  });
});
