import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  replaceListingTeamDemoRows,
  resetListingTeamDemo,
} from "../../marketing/listBusiness/api/listingTeam.demo";
import {
  DEMO_TEAM_HIDDEN_LISTING,
  DEMO_TEAM_ROWS,
  DEMO_VIEWER_TEAM_USER_ID,
  type DemoTeamRow,
} from "../../marketing/listBusiness/api/listingTeam.demo.data";
import { MemberTeamInvitesInbox } from "./MemberTeamInvitesInbox";

const TEAM_NAME = "Tinta Viva";
const INVITE_LISTING_NAME = "Studio Cabelo";

const ACCEPTED_VIEWER_ROW: DemoTeamRow = {
  id: "test-team-link-tinta-viva-viewer-member",
  listingId: "demo-listing-tinta-viva",
  subprofileId: null,
  userId: DEMO_VIEWER_TEAM_USER_ID,
  status: "accepted",
  initiatedBy: "listing",
  roleLabel: "Receptionist",
  position: 9,
  createdAt: "2026-09-01T10:00:00.000Z",
  answeredAt: "2026-09-02T10:00:00.000Z",
};

const HIDDEN_LISTING_INVITE_ROW: DemoTeamRow = {
  id: "test-team-link-hidden-viewer-member",
  listingId: DEMO_TEAM_HIDDEN_LISTING.id,
  subprofileId: null,
  userId: DEMO_VIEWER_TEAM_USER_ID,
  status: "pending",
  initiatedBy: "listing",
  roleLabel: null,
  position: null,
  createdAt: "2026-10-20T10:00:00.000Z",
  answeredAt: null,
};

function renderInbox() {
  return render(
    <TestProviders>
      <section id="places" tabIndex={-1}>
        <MemberTeamInvitesInbox />
      </section>
    </TestProviders>,
  );
}

beforeEach(resetListingTeamDemo);

describe("MemberTeamInvitesInbox", () => {
  it("shows the seeded invite with its role and a count", async () => {
    renderInbox();

    expect(
      await screen.findByRole("heading", { name: "Team invites" }),
    ).toBeInTheDocument();
    expect(screen.getByText(INVITE_LISTING_NAME)).toBeInTheDocument();
    expect(screen.getByText("Role: Colourist")).toBeInTheDocument();
    expect(
      screen.getByText("1 invite waiting for your answer"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Accept invite: Studio Cabelo",
      }),
    ).toHaveTextContent("Accept invite");
    expect(
      screen.getByRole("button", {
        name: "Decline invite: Studio Cabelo",
      }),
    ).toHaveTextContent("Decline invite");
  });

  it("accepts the invite and moves it under Teams you are on", async () => {
    const user = userEvent.setup();
    renderInbox();

    await user.click(
      await screen.findByRole("button", {
        name: "Accept invite: Studio Cabelo",
      }),
    );

    expect(await screen.findByText("Invite accepted")).toBeInTheDocument();
    const teamList = await screen.findByRole("list", {
      name: "Teams you are on",
    });
    expect(teamList).toHaveTextContent(INVITE_LISTING_NAME);
    await waitFor(() =>
      expect(screen.queryByRole("list", { name: "Team invites" })).toBeNull(),
    );
  });

  it("returns focus to the Teams you are on heading after the last invite is answered", async () => {
    const user = userEvent.setup();
    renderInbox();

    await user.click(
      await screen.findByRole("button", {
        name: "Accept invite: Studio Cabelo",
      }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Teams you are on" }),
      ).toHaveFocus(),
    );
  });

  it("declines the invite and folds the whole inbox away when nothing else is left", async () => {
    const user = userEvent.setup();
    renderInbox();

    await user.click(
      await screen.findByRole("button", {
        name: "Decline invite: Studio Cabelo",
      }),
    );

    expect(await screen.findByText("Invite declined")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText(INVITE_LISTING_NAME)).toBeNull(),
    );
    expect(screen.queryByRole("heading", { name: "Team invites" })).toBeNull();
  });

  it("asks before leaving a team, then removes it", async () => {
    const user = userEvent.setup();
    replaceListingTeamDemoRows([...DEMO_TEAM_ROWS, ACCEPTED_VIEWER_ROW]);
    renderInbox();

    await user.click(
      await screen.findByRole("button", { name: `Leave team: ${TEAM_NAME}` }),
    );
    expect(
      await screen.findByText(`Leave the team at ${TEAM_NAME}?`),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Leave team" }));

    expect(await screen.findByText("You left the team")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: `Leave team: ${TEAM_NAME}` }),
      ).toBeNull(),
    );
  });

  it("names the cause under the row when an answer is refused", async () => {
    const user = userEvent.setup();
    replaceListingTeamDemoRows([HIDDEN_LISTING_INVITE_ROW]);
    renderInbox();

    await user.click(
      await screen.findByRole("button", {
        name: `Accept invite: ${DEMO_TEAM_HIDDEN_LISTING.name}`,
      }),
    );

    const refusal = await screen.findByRole("alert");
    expect(refusal).not.toHaveTextContent("Something went wrong. Try again");
    // The invite stays so the member can try again or decline it.
    expect(screen.getByText(DEMO_TEAM_HIDDEN_LISTING.name)).toBeInTheDocument();
  });

  it("holds every answer while one is in flight", async () => {
    replaceListingTeamDemoRows([...DEMO_TEAM_ROWS, ACCEPTED_VIEWER_ROW]);
    renderInbox();

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Accept invite: Studio Cabelo",
      }),
    );

    expect(
      screen.getByRole("button", { name: `Leave team: ${TEAM_NAME}` }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("renders nothing when there is no invite and no team", async () => {
    replaceListingTeamDemoRows([]);
    renderInbox();

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Team invites" }),
      ).toBeNull(),
    );
    expect(
      screen.queryByRole("heading", { name: "Teams you are on" }),
    ).toBeNull();
  });
});
