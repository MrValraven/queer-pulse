import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { CreateGatheringSuccess } from "./CreateGatheringSuccess";
import {
  EventHostScopeContext,
  MEMBER_HOST_SCOPE,
  type EventHostScope,
} from "./eventHostScope";
import type { GatheringForm } from "./useGatheringForm";

vi.mock("../quizshow/quizshowLaunch", () => ({
  useIsQuizshowVisible: () => false,
}));
vi.mock("./gatheringOccurrences", () => ({
  gatheringOccurrences: () => [{}],
}));
vi.mock("./preview/GatheringPreviewPanel", () => ({
  GatheringPreviewPanel: () => null,
}));
vi.mock("./shareKit/ShareKitRow", () => ({ ShareKitRow: () => null }));

const HOUSE_TEST_SCOPE: EventHostScope = {
  ...MEMBER_HOST_SCOPE,
  apiTarget: "musicAdmin",
  isHouseEvent: true,
  fixedFamily: "music",
  managePathFor: (slug) => `/admin/music-events/${slug}`,
};

const PUBLISHED_SLUG = "queerpulse-club-night-x1";

// The catalogs load per namespace, so a label reads as its key until its
// namespace lands and as the English line after.
const MANAGE_NAME = /admin:musicEvents\.row\.manageCta|Manage event/;
const EVENT_PAGE_NAME =
  /gatherings:create\.success\.eventCta|See your event page/;
const HOUSE_LEAD =
  /admin:musicEvents\.house\.successLead|The music event is live/;
const MEMBER_LEAD = /gatherings:create\.v2\.success\.lead|RSVPs show up/;

function renderSuccess(scope: EventHostScope) {
  return render(
    <TestProviders>
      <EventHostScopeContext.Provider value={scope}>
        <CreateGatheringSuccess
          form={{ format: "club_night" } as unknown as GatheringForm}
          createdSlug={PUBLISHED_SLUG}
          occurrenceSlugs={[PUBLISHED_SLUG]}
        />
      </EventHostScopeContext.Provider>
    </TestProviders>,
  );
}

/** The action links in DOM order. The member screen's primary is last (the
 *  stacked column reverses it); the house screen's primary is first. */
function actionLinkNames(): string[] {
  return screen
    .getAllByRole("link")
    .map((link) => link.textContent?.trim() ?? "");
}

describe("CreateGatheringSuccess in the house scope", () => {
  it("leads with the music team's next steps", async () => {
    renderSuccess(HOUSE_TEST_SCOPE);
    expect(await screen.findByText(HOUSE_LEAD)).toBeInTheDocument();
    expect(screen.queryByText(MEMBER_LEAD)).toBeNull();
  });

  it("puts Manage event first, linked to the admin manage page", async () => {
    renderSuccess(HOUSE_TEST_SCOPE);
    const manageLink = await screen.findByRole("link", { name: MANAGE_NAME });
    expect(manageLink).toHaveAttribute(
      "href",
      `/admin/music-events/${PUBLISHED_SLUG}`,
    );
    const names = actionLinkNames();
    expect(names[0]).toMatch(MANAGE_NAME);
    expect(names[names.length - 1]).toMatch(EVENT_PAGE_NAME);
  });
});

describe("CreateGatheringSuccess in the member scope", () => {
  it("keeps the member lead, no Manage event, and the event page last", async () => {
    renderSuccess(MEMBER_HOST_SCOPE);
    expect(await screen.findByText(MEMBER_LEAD)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: MANAGE_NAME })).toBeNull();
    const names = actionLinkNames();
    expect(names[names.length - 1]).toMatch(EVENT_PAGE_NAME);
  });
});
