import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  replaceListingTeamDemoRows,
  resetListingTeamDemo,
} from "../marketing/listBusiness/api/listingTeam.demo";
import { ProfileNavAwaitingCount } from "./ProfileNavAwaitingCount";

const SPOKEN_KEY = "members:profile.nav.placesAwaiting";

function renderCount() {
  return render(
    <TestProviders>
      <a href="#places">
        Places
        <ProfileNavAwaitingCount spokenKey={SPOKEN_KEY} />
      </a>
    </TestProviders>,
  );
}

beforeEach(resetListingTeamDemo);

describe("ProfileNavAwaitingCount", () => {
  it("shows the number of team invites waiting on the owner", async () => {
    renderCount();

    expect(
      await screen.findByText("1 team invite waiting for your answer"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveTextContent("1");
  });

  it("draws nothing when no invite is waiting", async () => {
    replaceListingTeamDemoRows([]);
    renderCount();

    // Wait for the query to settle before asserting the absence.
    await waitFor(() => expect(screen.getByRole("link")).toBeInTheDocument());
    expect(screen.queryByText(/waiting for your answer/)).toBeNull();
  });
});
