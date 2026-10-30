import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { resetListingTeamDemo } from "../marketing/listBusiness/api/listingTeam.demo";
import { PlacesSection } from "./PlacesSection";

// A slug the demo registry does not know, so the member runs no places.
const MEMBER_SLUG_WITHOUT_PLACES = "member-without-places";

function renderPlaces(isSelf: boolean) {
  return render(
    <TestProviders>
      <PlacesSection
        memberSlug={MEMBER_SLUG_WITHOUT_PLACES}
        isSelf={isSelf}
        firstName="Alex"
      />
    </TestProviders>,
  );
}

beforeEach(resetListingTeamDemo);

describe("PlacesSection team invites", () => {
  it("keeps the section for an owner who runs no places and shows the invite", async () => {
    const { container } = renderPlaces(true);

    expect(await screen.findByText("Studio Cabelo")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Team invites" }),
    ).toBeInTheDocument();
    expect(container.querySelector("#places")).not.toBeNull();
    // The empty state still invites the owner to list a business.
    expect(screen.getByText("No places yet")).toBeInTheDocument();
  });

  it("never shows a visitor the owner's team invites", async () => {
    renderPlaces(false);

    // A visitor's section renders nothing while the member runs no places, so
    // wait for that settled state before asserting the invite's absence.
    await waitFor(() => expect(screen.queryByText("No places yet")).toBeNull());
    expect(screen.queryByText("Studio Cabelo")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Team invites" })).toBeNull();
  });
});
