import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { CoHostInvitePage } from "./CoHostInvitePage";

const { mutate, queryState } = vi.hoisted(() => ({
  mutate: vi.fn(),
  queryState: {
    data: undefined as unknown,
    isPending: false,
    isError: false,
  },
}));

vi.mock("./api/useCohostInvite", () => ({
  useCohostInvite: () => queryState,
}));
vi.mock("./api/useEventMutations", () => ({
  useRespondCohostInvite: () => ({ mutate }),
}));

const PENDING_INVITE = {
  id: "inv-1",
  status: "pending" as const,
  role: "greeter",
  commitment: "light",
  message: null,
  replyByDate: null,
  createdAt: "2026-08-01T00:00:00Z",
  event: {
    slug: "pride-picnic",
    title: "Pride Picnic",
    startAt: "2026-09-01T18:00:00Z",
    endAt: null,
    timezone: "Europe/Lisbon",
    venue: "The Park",
    isOnline: false,
    goingCount: 22,
    waitlistCount: 4,
  },
  inviter: {
    slug: "anika",
    firstName: "Anika",
    lastName: "Kovač",
    avatarUrl: null,
    hostedEventsCount: 14,
    mutualConnectionsCount: 11,
  },
};

afterEach(() => {
  mutate.mockReset();
  queryState.data = undefined;
  queryState.isPending = false;
  queryState.isError = false;
});

function renderPage() {
  render(
    <TestProviders initialEntries={["/gatherings/pride-picnic/co-host-invite/inv-1"]}>
      <Routes>
        <Route
          path="/gatherings/:slug/co-host-invite/:inviteId"
          element={<CoHostInvitePage />}
        />
      </Routes>
    </TestProviders>,
  );
}

describe("CoHostInvitePage", () => {
  it("renders the not-found state when the invite fails to load", async () => {
    queryState.isError = true;
    renderPage();
    expect(
      await screen.findByText("This invite isn't here anymore"),
    ).toBeInTheDocument();
  });

  it("renders the pending invite and calls accept with the invite id", async () => {
    queryState.data = PENDING_INVITE;
    renderPage();

    const acceptButton = await screen.findByRole("button", {
      name: /Yes, co-host with Anika/i,
    });
    fireEvent.click(acceptButton);

    expect(mutate).toHaveBeenCalledWith({ id: "inv-1", action: "accept" });
  });

  it("calls decline with the invite id", async () => {
    queryState.data = PENDING_INVITE;
    renderPage();

    const declineButton = await screen.findByRole("button", {
      name: /Decline politely/i,
    });
    fireEvent.click(declineButton);

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith({ id: "inv-1", action: "decline" }),
    );
  });

  it("renders an already-answered state for a non-pending invite", async () => {
    queryState.data = { ...PENDING_INVITE, status: "accepted" };
    renderPage();
    expect(
      await screen.findByText("You've already answered this invite"),
    ).toBeInTheDocument();
  });
});
