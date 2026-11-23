import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ProfileLimitedNote } from "./ProfileLimitedNote";

/**
 * PRD-506. A private member takes no new connection requests, so their limited
 * card offers no "Ask to connect". A request that member already sent keeps its
 * answer button, and a profile that only shares with connections keeps the ask.
 */

const contactState = vi.hoisted(() => ({
  connected: false,
  hasIncomingRequest: false,
  isPending: false,
}));

vi.mock("../connect/useMemberContact", () => ({
  useMemberContact: () => ({
    connected: contactState.connected,
    hasIncomingRequest: contactState.hasIncomingRequest,
    contact: vi.fn(),
  }),
}));

vi.mock("../../app/providers/useConnections", () => ({
  useConnectionsHydrated: () => ({ isPending: () => contactState.isPending }),
}));

function renderNote(visibility: "network" | "private") {
  return render(
    <I18nProvider>
      <ProfileLimitedNote
        slug="val-raven"
        firstName="Val"
        visibility={visibility}
      />
    </I18nProvider>,
  );
}

describe("ProfileLimitedNote", () => {
  beforeEach(() => {
    contactState.connected = false;
    contactState.hasIncomingRequest = false;
    contactState.isPending = false;
  });

  it("offers Ask to connect on a network profile", async () => {
    renderNote("network");
    expect(
      await screen.findByRole("button", { name: /ask to connect/i }),
    ).toBeInTheDocument();
  });

  it("offers no Ask to connect on a private profile", async () => {
    renderNote("private");
    expect(
      await screen.findByText(/keeps their profile private/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/reaches out to people when they are ready/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/asked to connect with you/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /ask to connect/i }),
    ).not.toBeInTheDocument();
  });

  it("keeps the answer button on a private profile whose member already asked", async () => {
    contactState.hasIncomingRequest = true;
    renderNote("private");
    expect(
      await screen.findByRole("button", { name: /answer val/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/asked to connect with you/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/reaches out to people when they are ready/i),
    ).not.toBeInTheDocument();
  });
});
