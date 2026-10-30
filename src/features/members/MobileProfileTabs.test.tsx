import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { resetListingTeamDemo } from "../marketing/listBusiness/api/listingTeam.demo";
import type { MemberProfile } from "./data/memberProfiles";
import { MobileProfileTabs } from "./MobileProfileTabs";

// The real panels pull in a dozen async sections. The tab bar, the hash jump
// and the count are what this file covers, so the panel only reports which
// tab is open and, on Community, mounts the section the hash targets.
vi.mock("./MobileProfileTabPanels", () => ({
  MobileProfileTabPanels: ({ activeTab }: { activeTab: string }) => (
    <div data-testid="panel" data-active-tab={activeTab}>
      {activeTab === "community" && (
        <section id="places" tabIndex={-1}>
          Places
        </section>
      )}
    </div>
  ),
}));

const profile = { slug: "alex", first: "Alex" } as unknown as MemberProfile;
const TEAM_INVITE_SPOKEN = "1 team invite waiting for your answer";

function GoToPlaces() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => void navigate("#places")}>
      Go to places
    </button>
  );
}

function renderTabs({
  isSelf,
  previewing = false,
  initialEntry = "/account/profile",
}: {
  isSelf: boolean;
  previewing?: boolean;
  initialEntry?: string;
}) {
  return render(
    <TestProviders initialEntries={[initialEntry]}>
      <GoToPlaces />
      <MobileProfileTabs
        profile={profile}
        isSelf={isSelf}
        previewing={previewing}
        otherMember={null}
        firstName="Alex"
        memberSlug="alex"
      />
    </TestProviders>,
  );
}

function openTabKey() {
  return screen.getByTestId("panel").getAttribute("data-active-tab");
}

let scrollToSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  resetListingTeamDemo();
  scrollToSpy = vi.fn();
  window.scrollTo = scrollToSpy;
});

afterEach(() => vi.restoreAllMocks());

describe("MobileProfileTabs #places hash", () => {
  it("opens Community on first load and scrolls the Places section into view", async () => {
    renderTabs({ isSelf: true, initialEntry: "/account/profile#places" });

    expect(openTabKey()).toBe("community");
    expect(screen.getByRole("tab", { name: /Community/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await waitFor(() => expect(scrollToSpy).toHaveBeenCalled());
    expect(document.getElementById("places")).toHaveFocus();
  });

  it("opens Community when the hash changes while mounted", async () => {
    renderTabs({ isSelf: true });
    expect(openTabKey()).toBe("about");

    await userEvent.click(screen.getByRole("button", { name: "Go to places" }));

    await waitFor(() => expect(openTabKey()).toBe("community"));
    await waitFor(() => expect(scrollToSpy).toHaveBeenCalled());
  });

  it("opens on About when there is no hash", () => {
    renderTabs({ isSelf: true });

    expect(openTabKey()).toBe("about");
    expect(scrollToSpy).not.toHaveBeenCalled();
  });
});

describe("MobileProfileTabs Community count", () => {
  it("shows the waiting team invites on the owner's Community tab", async () => {
    renderTabs({ isSelf: true });

    expect(await screen.findByText(TEAM_INVITE_SPOKEN)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Community/ })).toHaveTextContent(
      "1",
    );
  });

  it("shows no count to a visitor", async () => {
    renderTabs({ isSelf: false });

    expect(screen.getByRole("tab", { name: "Community" })).toBeInTheDocument();
    await waitFor(() => expect(openTabKey()).toBe("about"));
    expect(screen.queryByText(TEAM_INVITE_SPOKEN)).toBeNull();
  });

  it("shows no count while the owner previews as a visitor", () => {
    renderTabs({ isSelf: true, previewing: true });

    expect(screen.getByRole("tab", { name: "Community" })).toBeInTheDocument();
    expect(screen.queryByText(TEAM_INVITE_SPOKEN)).toBeNull();
  });
});
