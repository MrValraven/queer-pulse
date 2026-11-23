import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../app/providers/MotionProvider";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import { CommunityDetailPage } from "./CommunityDetailPage";
import { resetCommunityBadgesDemo } from "./badges/communityBadgesDemoStore";
import { DEMO_SPACE_PARENTS_SLUG } from "./spaces.data";

/**
 * The two ways into the badge sheet on the community page (the sidebar card
 * and the phone hero button) and the sheet host reading `?badges=`. jsdom
 * applies no CSS, so both entries render at once here; the breakpoint split
 * lives in CommunityBadgesEntry.module.css.
 */

const FLAGSHIP_SLUG = "queer-runners";
const FLAGSHIP_NAME = "Queer Runners Lisboa";
const SPACE_NAME = "Runners with kids";

beforeAll(() => {
  // jsdom has no layout engine, so the sheet's scroll to a row needs a stub.
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  resetCommunityBadgesDemo();
});

function LocationProbe() {
  const location = useLocation();
  // A plain div: an <output> is an implicit status region and would sit
  // beside the toast's own status region.
  return <div data-testid="location-search">{location.search}</div>;
}

async function renderDetailPage(path: string) {
  render(
    <TestProviders initialEntries={[path]}>
      <MotionProvider>
        <Routes>
          <Route path="/community/:slug" element={<CommunityDetailPage />} />
        </Routes>
        <LocationProbe />
      </MotionProvider>
    </TestProviders>,
  );
  await awaitCatalog("communities");
}

async function findPageHeading(name: string): Promise<HTMLElement> {
  return screen.findByRole("heading", { level: 1, name });
}

describe("CommunityDetailPage badge entries", () => {
  it("opens the badge sheet from the sidebar card", async () => {
    const user = userEvent.setup();
    await renderDetailPage(`/community/${FLAGSHIP_SLUG}`);
    await findPageHeading(FLAGSHIP_NAME);

    await user.click(screen.getByRole("button", { name: "Open badges" }));

    expect(
      await screen.findByRole("dialog", {
        name: new RegExp(`Badges in ${FLAGSHIP_NAME}`),
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("location-search").textContent).toContain(
      "badges=open",
    );
  });

  it("opens the sheet straight from a badges link", async () => {
    await renderDetailPage(`/community/${FLAGSHIP_SLUG}?badges=gifts`);

    await screen.findByRole("dialog", {
      name: new RegExp(`Badges in ${FLAGSHIP_NAME}`),
    });
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Gifts" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
  });

  it("shows no badge entry in a space", async () => {
    await renderDetailPage(`/community/${DEMO_SPACE_PARENTS_SLUG}`);
    await findPageHeading(SPACE_NAME);

    expect(screen.queryByRole("button", { name: "Open badges" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: /^Open badges for / }),
    ).toBeNull();
  });

  it("ignores the badges param in a space", async () => {
    await renderDetailPage(`/community/${DEMO_SPACE_PARENTS_SLUG}?badges=open`);
    await findPageHeading(SPACE_NAME);

    expect(screen.queryByRole("dialog", { name: /^Badges in / })).toBeNull();
  });

  it("renders the phone entry in the hero row", async () => {
    await renderDetailPage(`/community/${FLAGSHIP_SLUG}`);
    const heading = await findPageHeading(FLAGSHIP_NAME);

    const heroButton = screen.getByRole("button", {
      name: `Open badges for ${FLAGSHIP_NAME}`,
    });
    const hero = heading.closest("header");
    expect(hero).not.toBeNull();
    expect(hero?.contains(heroButton)).toBe(true);
  });
});
