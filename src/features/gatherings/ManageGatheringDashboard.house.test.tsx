import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { DEMO_GATHERING_SLUGS, resolveGathering } from "./data";
import {
  EventHostScopeContext,
  MEMBER_HOST_SCOPE,
  type EventHostScope,
} from "./eventHostScope";
import { HOUSE_MUSIC_DEMO_SLUGS } from "./houseMusicEvents.data";
import { GATHERING_TITLE } from "./manageGathering.data";
import { ManageGatheringDashboard } from "./ManageGatheringDashboard";

/** The music admin scope's shape, built here so `gatherings/` never imports
 *  from `features/admin/`. */
const houseScope: EventHostScope = {
  ...MEMBER_HOST_SCOPE,
  apiTarget: "musicAdmin",
  isHouseEvent: true,
  fixedFamily: "music",
  allowedVisibilities: ["members", "invite_only"],
  homePath: "/admin/music-events",
};

const clubNightSlug = HOUSE_MUSIC_DEMO_SLUGS.clubNight;

function renderHouseDashboard() {
  render(
    <TestProviders>
      <EventHostScopeContext.Provider value={houseScope}>
        <ManageGatheringDashboard
          demoMode
          gathering={resolveGathering(clubNightSlug)}
          slug={clubNightSlug}
          routeParam={clubNightSlug}
        />
      </EventHostScopeContext.Provider>
    </TestProviders>,
  );
}

describe("ManageGatheringDashboard in the house scope", () => {
  it("opens on the house event in demo", async () => {
    renderHouseDashboard();
    expect(
      (await screen.findAllByText("QueerPulse Club Night")).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Pride Brunch/)).not.toBeInTheDocument();
  });

  it("offers no Delete, Live game, Run by or Duplicate", async () => {
    renderHouseDashboard();
    await screen.findAllByText("QueerPulse Club Night");

    // Overview is the opening tab: the club night is days away.
    expect(screen.queryByText(/Duplicate event/)).not.toBeInTheDocument();
    expect(screen.queryByText("Run by")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /Live game/ }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /^Settings/ }));
    expect(
      await screen.findByRole("button", { name: "Cancel event" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Delete event/ }),
    ).not.toBeInTheDocument();
  });

  it("leaves out the message-the-team help line", async () => {
    renderHouseDashboard();
    await screen.findAllByText("QueerPulse Club Night");
    expect(
      screen.queryByText(/Need help with your event/),
    ).not.toBeInTheDocument();
  });

  it("the member demo dashboard still opens on the Pride Brunch", async () => {
    render(
      <TestProviders>
        <ManageGatheringDashboard
          demoMode
          gathering={null}
          slug={DEMO_GATHERING_SLUGS.manage}
          routeParam={undefined}
        />
      </TestProviders>,
    );
    // The header sets the half after the colon in an <em>, so the title is
    // matched on an element's whole text.
    const titleMatches = await screen.findAllByText(
      (_content, element) => element?.textContent === GATHERING_TITLE,
    );
    expect(titleMatches.length).toBeGreaterThan(0);
    expect(screen.queryByText("QueerPulse Club Night")).not.toBeInTheDocument();
    expect(
      await screen.findByText(/Need help with your event/),
    ).toBeInTheDocument();
  });
});
