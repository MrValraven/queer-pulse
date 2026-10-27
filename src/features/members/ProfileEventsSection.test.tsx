import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import type { ProfileEventItem } from "./api/profileEvents.adapters";
import type { ProfileEventRole } from "./api/profileEvents.api";
import type { ProfileEventsResult } from "./api/useProfileEvents";
import { ProfileEventsSection } from "./ProfileEventsSection";

interface ProfileEventsMockState {
  result: ProfileEventsResult;
  /** Whether the section's column is too narrow for the grid: true
   *  renders the rails. */
  isRail: boolean;
}

function emptyResult(): ProfileEventsResult {
  return {
    upcoming: [],
    past: [],
    isPending: false,
    isError: false,
    isRetrying: false,
    error: null,
    isMissing: false,
    refetch: () => undefined,
    isLimited: false,
  };
}

const mockState = vi.hoisted((): ProfileEventsMockState => ({
  isRail: false,
  result: {
    upcoming: [],
    past: [],
    isPending: false,
    isError: false,
    isRetrying: false,
    error: null,
    isMissing: false,
    refetch: () => undefined,
    isLimited: false,
  },
}));
vi.mock("./api/useProfileEvents", () => ({
  useProfileEvents: () => mockState.result,
}));
// jsdom lays nothing out, so the width measure is replaced: false is a
// column wide enough for the grid, true a narrow one that gets the rail.
vi.mock("./usePosterGridFit", () => ({
  usePosterGridFit: () => [() => undefined, !mockState.isRail],
}));

function eventItem(
  slug: string,
  role: ProfileEventRole = "host",
  daysAhead = 3,
): ProfileEventItem {
  return {
    event: {
      date: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
      org: "Community",
      orgColor: "var(--accent)",
      title: `Event ${slug}`,
      hood: "Anjos",
      slug,
      to: `/gatherings/${slug}`,
      kind: "gathering",
    },
    role,
  };
}

function renderSection(props: { isSelf: boolean }) {
  return render(
    <TestProviders>
      <ProfileEventsSection
        memberSlug="sam"
        isSelf={props.isSelf}
        firstName="Sam"
      />
    </TestProviders>,
  );
}

beforeEach(() => {
  mockState.result = emptyResult();
  mockState.isRail = false;
});

describe("ProfileEventsSection", () => {
  it("renders nothing for a visitor when the member hosts nothing", () => {
    const { container } = renderSection({ isSelf: false });
    expect(container.querySelector("#events")).toBeNull();
  });

  it("renders nothing on a limited profile", () => {
    mockState.result = {
      ...emptyResult(),
      upcoming: [eventItem("supper")],
      isLimited: true,
    };
    const { container } = renderSection({ isSelf: false });
    expect(container.querySelector("#events")).toBeNull();
  });

  it("offers the owner a Host an event link when they host nothing", async () => {
    renderSection({ isSelf: true });
    const hostLink = await screen.findByRole("link", {
      name: "Host an event",
    });
    expect(hostLink).toHaveAttribute("href", "/create-gathering");
  });

  it("renders a bare pending placeholder on the first load", () => {
    mockState.result = { ...emptyResult(), isPending: true };
    const { container } = renderSection({ isSelf: false });
    expect(container.querySelector("[data-section-pending]")).not.toBeNull();
    expect(container.querySelector("#events")).toBeNull();
  });

  it("shows three upcoming posters in the grid until Show more reveals the rest", async () => {
    mockState.result = {
      ...emptyResult(),
      upcoming: ["one", "two", "three", "four", "five"].map((slug, index) =>
        eventItem(slug, "host", index + 1),
      ),
    };
    const user = userEvent.setup();
    renderSection({ isSelf: false });

    const showMore = await screen.findByRole("button", {
      name: /Show 2 more/,
    });
    expect(
      screen.getByRole("link", { name: "Event three" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Event four" }),
    ).not.toBeInTheDocument();
    expect(showMore).toHaveAttribute("aria-expanded", "false");
    const gridId = showMore.getAttribute("aria-controls") ?? "";
    const grid = document.getElementById(gridId);
    if (!grid) throw new Error("Show more controls no grid");
    expect(within(grid).getAllByRole("link", { name: /^Event / })).toHaveLength(
      3,
    );

    await user.click(showMore);

    expect(
      await screen.findByRole("link", { name: "Event five" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Show fewer/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("tags a co-hosted event under its poster, outside the link", async () => {
    mockState.result = {
      ...emptyResult(),
      upcoming: [eventItem("hosted"), eventItem("shared", "cohost")],
    };
    renderSection({ isSelf: false });
    const cohostTag = await screen.findByText("Co-host");
    expect(screen.getAllByText("Co-host")).toHaveLength(1);
    expect(cohostTag.closest("a")).toBeNull();
    // The tag follows the co-hosted poster's link in the same cell.
    const posterLink = screen.getByRole("link", { name: "Event shared" });
    expect(posterLink.parentElement?.contains(cohostTag)).toBe(true);
  });

  it("names a server fault in the error panel", async () => {
    mockState.result = {
      ...emptyResult(),
      isError: true,
      error: new ApiError(503, "Service unavailable"),
    };
    renderSection({ isSelf: false });
    expect(
      await screen.findByText(
        "Our server had trouble loading these events. Try again in a moment.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the server's own reason when it gives one", async () => {
    mockState.result = {
      ...emptyResult(),
      isError: true,
      error: new ApiError(422, "Event listings are paused for this profile"),
    };
    renderSection({ isSelf: false });
    expect(
      await screen.findByText("Event listings are paused for this profile"),
    ).toBeInTheDocument();
  });

  it("points at the connection when the request never landed", async () => {
    mockState.result = {
      ...emptyResult(),
      isError: true,
      error: new TypeError("Failed to fetch"),
    };
    renderSection({ isSelf: false });
    expect(
      await screen.findByText("Check your connection and try again."),
    ).toBeInTheDocument();
  });

  it("keeps the error panel up with a busy button while a retry runs", async () => {
    mockState.result = {
      ...emptyResult(),
      isRetrying: true,
      error: new ApiError(503, "Service unavailable"),
    };
    const { container } = renderSection({ isSelf: false });
    expect(
      await screen.findByRole("button", { name: /Trying again/ }),
    ).toBeInTheDocument();
    expect(container.querySelector("[data-section-pending]")).toBeNull();
  });

  it("keeps past events folded until the toggle opens them", async () => {
    mockState.result = {
      ...emptyResult(),
      past: [eventItem("brunch", "host", -30)],
    };
    const user = userEvent.setup();
    renderSection({ isSelf: false });

    expect(
      await screen.findByText("Sam has nothing coming up."),
    ).toBeInTheDocument();
    // The toggle is the past group's header: a button inside a heading.
    const pastHeading = screen.getByRole("heading", { name: /Past events/ });
    const pastToggle = within(pastHeading).getByRole("button", {
      name: /Past events/,
    });
    expect(pastToggle).toHaveAttribute("aria-expanded", "false");
    expect(pastToggle).toHaveAttribute("aria-controls");
    expect(
      screen.queryByRole("link", { name: "Event brunch" }),
    ).not.toBeInTheDocument();

    await user.click(pastToggle);

    expect(pastToggle).toHaveAttribute("aria-expanded", "true");
    expect(
      await screen.findByRole("link", { name: "Event brunch" }),
    ).toBeInTheDocument();
  });

  it("marks past posters as past: no Coming up ribbon, the year on the date", async () => {
    const pastItem = eventItem("brunch", "host", -30);
    mockState.result = {
      ...emptyResult(),
      upcoming: [eventItem("later", "host", 40)],
      past: [pastItem],
    };
    const user = userEvent.setup();
    renderSection({ isSelf: false });

    // The upcoming poster still carries its ribbon, so the copy is loaded.
    expect(await screen.findByText("Coming up")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Past events/ }));

    const pastLink = await screen.findByRole("link", { name: "Event brunch" });
    expect(screen.getAllByText("Coming up")).toHaveLength(1);
    expect(pastLink.textContent).not.toContain("Coming up");
    expect(pastLink.textContent).toContain(
      String(pastItem.event.date.getFullYear()),
    );
  });

  it("never offers the hub's community menu on a profile poster", async () => {
    const withCommunity = eventItem("walk");
    withCommunity.event.hostingCommunity = {
      id: "community-1",
      slug: "queer-walkers",
      name: "Queer Walkers",
    };
    mockState.result = { ...emptyResult(), upcoming: [withCommunity] };
    renderSection({ isSelf: false });

    expect(
      await screen.findByRole("link", { name: "Event walk" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /More options for/ }),
    ).not.toBeInTheDocument();
  });

  it("shows every upcoming poster in a rail with no Show more in a narrow column", async () => {
    mockState.isRail = true;
    mockState.result = {
      ...emptyResult(),
      upcoming: ["one", "two", "three", "four", "five"].map((slug, index) =>
        eventItem(slug, "host", index + 1),
      ),
    };
    renderSection({ isSelf: false });

    expect(
      await screen.findByRole("link", { name: "Event five" }),
    ).toBeInTheDocument();
    const rail = screen.getByRole("link", { name: "Event one" }).closest("ul");
    if (!rail) throw new Error("the posters sit in no rail list");
    expect(within(rail).getAllByRole("listitem")).toHaveLength(5);
    expect(
      screen.queryByRole("button", { name: /Show \d+ more/ }),
    ).not.toBeInTheDocument();
  });
});
