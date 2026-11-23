import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { CommunityBadgeSheetHost } from "./CommunityBadgeSheetHost";
import * as badgesDemoStore from "./communityBadgesDemoStore";

/**
 * The sheet in demo, read through the URL the way a notification or the
 * sidebar card opens it. The viewer is a member of queer-runners (seeded
 * progress 620 days, 4 events, 2 volunteer hours, 12 posts and replies) and a
 * visitor of rainbow-arts.
 */

const MEMBER_SLUG = "queer-runners";
const MEMBER_COMMUNITY = "Queer Runners";
const VISITOR_SLUG = "rainbow-arts";
const VISITOR_COMMUNITY = "Rainbow Arts";
const REGULAR_ID = "demo-badge-queer-runners-regular";

function LocationProbe() {
  const location = useLocation();
  // A plain div: an <output> is an implicit status region and would sit
  // beside the toast's own status region.
  return <div data-testid="location-search">{location.search}</div>;
}

async function renderSheet({
  slug = MEMBER_SLUG,
  communityName = MEMBER_COMMUNITY,
  search,
}: {
  slug?: string;
  communityName?: string;
  search: string;
}) {
  render(
    <TestProviders initialEntries={[`/community/${slug}${search}`]}>
      <MotionProvider>
        <CommunityBadgeSheetHost
          slug={slug}
          communityName={communityName}
          isSpace={false}
        />
        <LocationProbe />
      </MotionProvider>
    </TestProviders>,
  );
  await awaitCatalog("communities");
}

/** The row card that holds the chip naming `badgeName`. */
/** The toast stack's own status region (the Studio player's live region is
 *  a second role=status on the page). */
function toastStatus(): HTMLElement {
  const toastStatuses = screen
    .getAllByRole("status")
    .filter((element) => element.closest("[data-toast-region]") !== null);
  expect(toastStatuses).toHaveLength(1);
  return toastStatuses[0]!;
}

function rowOf(badgeName: string): HTMLElement {
  const row = screen.getByText(badgeName).closest("article");
  if (!row) throw new Error(`No badge row holds ${badgeName}`);
  return row;
}

/** The shelf row whose sender line matches `senderPattern`. */
function giftRowFrom(senderPattern: RegExp): HTMLElement {
  const row = screen.getByText(senderPattern).closest("article");
  if (!row) throw new Error(`No gift row matches ${String(senderPattern)}`);
  return row;
}

/** The elements scrolled to the centre of the sheet, the focus scroll's
 *  signature. Other scrolls (a tab moving into view) are left out. */
function centredScrollTargets(
  scrollSpy: MockInstance<Element["scrollIntoView"]>,
): unknown[] {
  return scrollSpy.mock.calls.flatMap(([options], callIndex) =>
    typeof options === "object" && options.block === "center"
      ? [scrollSpy.mock.contexts[callIndex]]
      : [],
  );
}

beforeEach(() => {
  badgesDemoStore.resetCommunityBadgesDemo();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CommunityBadgeSheet", () => {
  it("lists the badges with the member's progress", async () => {
    await renderSheet({ search: "?badges=open" });

    expect(await screen.findByText("Helping hands")).toBeInTheDocument();
    expect(
      within(rowOf("Helping hands")).getByText("2 of 5 hours"),
    ).toBeInTheDocument();
    expect(
      within(rowOf("Sunrise club")).getByText("4 of 10 events attended here"),
    ).toBeInTheDocument();
    expect(within(rowOf("Regular")).getByText(/^Earned /)).toBeInTheDocument();
    // 620 days in, capped at the 365-day threshold the bar stops at.
    expect(
      within(rowOf("Old friend")).getByText("365 of 365 days"),
    ).toBeInTheDocument();
    expect(
      within(rowOf("Helping hands")).getByText("Not earned yet"),
    ).toBeInTheDocument();
  });

  it("wears an earned badge from the sheet", async () => {
    const user = userEvent.setup();
    await renderSheet({ search: "?badges=open" });
    await screen.findByText("Regular");

    await user.click(
      within(rowOf("Regular")).getByRole("button", { name: "Wear this badge" }),
    );

    expect(
      await within(rowOf("Regular")).findByText("You're wearing this badge"),
    ).toBeInTheDocument();
    expect(
      await within(toastStatus()).findByText(
        `You're wearing Regular in ${MEMBER_COMMUNITY} now.`,
      ),
    ).toBeInTheDocument();
  });

  it("stops wearing the worn badge", async () => {
    const user = userEvent.setup();
    await renderSheet({ search: "?badges=open" });
    await screen.findByText("Regular");
    await user.click(
      within(rowOf("Regular")).getByRole("button", { name: "Wear this badge" }),
    );
    await within(rowOf("Regular")).findByText("You're wearing this badge");

    await user.click(
      within(rowOf("Regular")).getByRole("button", {
        name: "Stop wearing this badge",
      }),
    );

    expect(
      await within(toastStatus()).findByText(
        `You're no longer wearing a badge in ${MEMBER_COMMUNITY}.`,
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByText("You're wearing this badge"),
      ).not.toBeInTheDocument(),
    );
    expect(
      within(rowOf("Regular")).getByRole("button", { name: "Wear this badge" }),
    ).toBeInTheDocument();
  });

  it("shows no worn badge when the response has none", async () => {
    await renderSheet({ search: "?badges=open" });
    await screen.findByText("Regular");

    expect(
      screen.queryByText("You're wearing this badge"),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Wear this badge" }).length,
    ).toBeGreaterThan(0);
  });

  it("focuses the badge named in the link", async () => {
    const scrollSpy = vi.spyOn(Element.prototype, "scrollIntoView");
    await renderSheet({ search: `?badges=open&badge=${REGULAR_ID}` });
    await screen.findByText("Regular");

    const row = rowOf("Regular");
    expect(row.className).toMatch(/rowFocused/);
    expect(row).toHaveAttribute("data-focused", "true");
    await waitFor(() =>
      expect(centredScrollTargets(scrollSpy)).toHaveLength(1),
    );
    const [scrolledItem] = centredScrollTargets(scrollSpy);
    expect(scrolledItem).toBeInstanceOf(HTMLElement);
    expect((scrolledItem as HTMLElement).contains(row)).toBe(true);
    expect(rowOf("Helping hands")).not.toHaveAttribute("data-focused");
  });

  it("scrolls to the linked badge only once across a tab round trip", async () => {
    const user = userEvent.setup();
    const scrollSpy = vi.spyOn(Element.prototype, "scrollIntoView");
    await renderSheet({ search: `?badges=open&badge=${REGULAR_ID}` });
    await screen.findByText("Regular");
    await waitFor(() =>
      expect(centredScrollTargets(scrollSpy)).toHaveLength(1),
    );

    await user.click(screen.getByRole("tab", { name: "Gifts" }));
    await screen.findByText(/^From Carla/);
    await user.click(screen.getByRole("tab", { name: "Badges" }));
    await screen.findByText("Regular");

    expect(screen.getByTestId("location-search").textContent).toBe(
      "?badges=open",
    );
    expect(centredScrollTargets(scrollSpy)).toHaveLength(1);
    expect(document.querySelector("[data-focused]")).toBeNull();
  });

  it("ignores a focus id that is not in the list", async () => {
    const scrollSpy = vi.spyOn(Element.prototype, "scrollIntoView");
    await renderSheet({ search: "?badges=open&badge=gone" });
    await screen.findByText("Regular");

    expect(document.querySelector("[data-focused]")).toBeNull();
    expect(rowOf("Regular").className).not.toMatch(/rowFocused/);
    expect(centredScrollTargets(scrollSpy)).toHaveLength(0);
  });

  it("opens on the gift shelf at badges=gifts", async () => {
    const shelfSpy = vi.spyOn(badgesDemoStore, "demoListShelf");
    await renderSheet({ search: "?badges=gifts" });

    expect(await screen.findByText(/^From Carla/)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Gifts" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Badges" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(
      within(giftRowFrom(/^From Carla/)).getByText(/Showing beside your name/),
    ).toBeInTheDocument();
    expect(shelfSpy).toHaveBeenCalled();
  });

  it("hides a gift from the shelf", async () => {
    const user = userEvent.setup();
    await renderSheet({ search: "?badges=gifts" });
    await screen.findByText(/^From Carla/);

    await user.click(
      within(giftRowFrom(/^From Carla/)).getByRole("button", {
        name: "Hide gift",
      }),
    );

    expect(
      await within(giftRowFrom(/^From Carla/)).findByText(
        "Hidden from beside your name",
      ),
    ).toBeInTheDocument();
    expect(
      within(giftRowFrom(/^From Carla/)).getByRole("button", {
        name: "Show gift",
      }),
    ).toBeInTheDocument();
    expect(
      await within(toastStatus()).findByText(
        "Gift hidden. It no longer shows beside your name.",
      ),
    ).toBeInTheDocument();
  });

  it("opens on the badge list for a visitor even at the gifts param", async () => {
    await renderSheet({
      slug: VISITOR_SLUG,
      communityName: VISITOR_COMMUNITY,
      search: "?badges=gifts",
    });

    expect(await screen.findByText("Regular")).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByText(/events attended here/)).not.toBeInTheDocument();
    expect(screen.queryByText("Not earned yet")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Wear this badge" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        `Members earn these by taking part in ${VISITOR_COMMUNITY}. Join to start earning them.`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Attend 3 events")).toBeInTheDocument();
  });

  it("never asks for the shelf for a visitor", async () => {
    const shelfSpy = vi.spyOn(badgesDemoStore, "demoListShelf");
    await renderSheet({
      slug: VISITOR_SLUG,
      communityName: VISITOR_COMMUNITY,
      search: "?badges=gifts",
    });
    await screen.findByText("Regular");

    expect(shelfSpy).not.toHaveBeenCalled();
    expect(screen.queryByText(/^From /)).not.toBeInTheDocument();
  });

  it("removes both params when it closes", async () => {
    const user = userEvent.setup();
    await renderSheet({ search: `?badges=open&badge=${REGULAR_ID}` });
    await screen.findByText("Regular");
    expect(screen.getByTestId("location-search").textContent).toBe(
      `?badges=open&badge=${REGULAR_ID}`,
    );

    await user.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() =>
      expect(screen.getByTestId("location-search").textContent).toBe(""),
    );
  });
});
