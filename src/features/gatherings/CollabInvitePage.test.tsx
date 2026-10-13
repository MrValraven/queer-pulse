import { fireEvent, render, screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { EventCommunityInviteDetailDTO } from "./api/eventCommunities.api";
import { CollabInvitePage } from "./CollabInvitePage";
import { gatheringPath } from "./gatheringPaths";

const { mutate, queryState } = vi.hoisted(() => ({
  mutate: vi.fn(),
  queryState: {
    data: undefined as EventCommunityInviteDetailDTO | undefined,
    isPending: false,
    isError: false,
  },
}));

vi.mock("./api/useCollabInvite", () => ({
  useCollabInvite: () => queryState,
  useRespondCollabInvite: () => ({ mutate, isPending: false }),
}));

const PENDING_INVITE: EventCommunityInviteDetailDTO = {
  id: "invite-1",
  status: "pending",
  createdAt: "2026-10-06T10:00:00Z",
  respondedAt: null,
  respondedByName: null,
  community: {
    slug: "queer-runners",
    name: "Queer Runners Lisboa",
    accessTier: "public",
  },
  leadCommunity: { slug: "rainbow-arts", name: "Rainbow Arts Collective" },
  event: {
    slug: "portfolio-night",
    title: "Portfolio Night",
    startAt: "2026-11-14T19:00:00Z",
    endAt: null,
    timezone: "Europe/Lisbon",
    venue: "Atelier",
    isOnline: false,
    goingCount: 18,
    waitlistCount: 0,
    isCancelled: false,
    isPast: false,
  },
  inviter: {
    slug: "luisa-gomes",
    firstName: "Luísa",
    lastName: "Gomes",
    avatarUrl: null,
    hostedEventsCount: 9,
    mutualConnectionsCount: 4,
  },
  canRespond: true,
  canLeave: false,
};

afterEach(() => {
  mutate.mockReset();
  queryState.data = undefined;
  queryState.isPending = false;
  queryState.isError = false;
});

function renderPage(invite?: Partial<EventCommunityInviteDetailDTO>) {
  if (invite) queryState.data = { ...PENDING_INVITE, ...invite };
  render(
    <TestProviders initialEntries={["/collab-invites/invite-1"]}>
      <Routes>
        <Route
          path="/collab-invites/:inviteId"
          element={<CollabInvitePage />}
        />
      </Routes>
    </TestProviders>,
  );
}

describe("CollabInvitePage", () => {
  it("says the invite is gone when it fails to load", async () => {
    queryState.isError = true;
    renderPage();
    expect(
      await screen.findByText("This invite isn't here anymore"),
    ).toBeInTheDocument();
  });

  it("shows the lead, the guest and what accepting does", () => {
    renderPage({});
    expect(
      screen.getByRole("heading", { level: 1, name: /wants to host/ }),
    ).toHaveTextContent(
      "Rainbow Arts Collective wants to host together with Queer Runners Lisboa.",
    );
    expect(
      screen.getByText(
        "Lists on your community page. Your members can see it and RSVP.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Portfolio Night")).toBeInTheDocument();
  });

  it("accepts for the community", () => {
    renderPage({});
    fireEvent.click(screen.getByRole("button", { name: "Accept collab" }));
    expect(mutate).toHaveBeenCalledWith(
      { id: "invite-1", decision: "accept" },
      expect.any(Object),
    );
  });

  it("declines for the community", () => {
    renderPage({});
    fireEvent.click(screen.getByRole("button", { name: "Decline invite" }));
    expect(mutate).toHaveBeenCalledWith(
      { id: "invite-1", decision: "decline" },
      expect.any(Object),
    );
  });

  it("shows no answer buttons to someone outside the community's team", () => {
    renderPage({ canRespond: false });
    expect(
      screen.queryByRole("button", { name: "Accept collab" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "The owners, co-owners and mods of Queer Runners Lisboa answer this invite.",
      ),
    ).toBeInTheDocument();
  });

  it("names who accepted and for which community", () => {
    renderPage({ status: "accepted", respondedByName: "Rui" });
    expect(
      screen.getByText("Rui accepted for Queer Runners Lisboa"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Accept collab" }),
    ).not.toBeInTheDocument();
  });

  it("names the community when the responder has no name", () => {
    renderPage({ status: "accepted", respondedByName: null });
    expect(
      screen.getByText("Queer Runners Lisboa accepted this invite"),
    ).toBeInTheDocument();
  });

  it("names who declined and for which community", () => {
    renderPage({ status: "declined", respondedByName: "Rui" });
    expect(
      screen.getByText("Rui declined for Queer Runners Lisboa"),
    ).toBeInTheDocument();
  });

  it("names the community that declined when the responder has no name", () => {
    renderPage({ status: "declined", respondedByName: null });
    expect(
      screen.getByText("Queer Runners Lisboa declined this invite"),
    ).toBeInTheDocument();
  });

  it("links back to the notifications once from an answered invite", () => {
    renderPage({ status: "accepted", respondedByName: "Rui" });
    const main = within(screen.getByRole("main"));
    expect(main.getByRole("link", { name: "Notifications" })).toHaveAttribute(
      "href",
      "/notifications",
    );
    expect(
      main
        .getAllByRole("link")
        .filter((link) => link.getAttribute("href") === "/notifications"),
    ).toHaveLength(1);
    expect(main.getByRole("link", { name: "View gathering" })).toHaveAttribute(
      "href",
      gatheringPath("portfolio-night"),
    );
  });

  it("links back to the notifications once from an invite that is gone", () => {
    renderPage();
    const main = within(screen.getByRole("main"));
    expect(
      main
        .getAllByRole("link")
        .filter((link) => link.getAttribute("href") === "/notifications"),
    ).toHaveLength(1);
    expect(main.getByRole("link", { name: "Notifications" })).toBeVisible();
  });

  it("says the gathering was cancelled", () => {
    renderPage({ event: { ...PENDING_INVITE.event, isCancelled: true } });
    expect(
      screen.getByText("This gathering was cancelled"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Accept collab" }),
    ).not.toBeInTheDocument();
  });

  it("says the gathering already happened", () => {
    renderPage({ event: { ...PENDING_INVITE.event, isPast: true } });
    expect(
      screen.getByText("This gathering already happened"),
    ).toBeInTheDocument();
  });
});
