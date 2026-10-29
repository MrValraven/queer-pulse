import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioAccountMenuPanel } from "./StudioAccountMenuPanel";

const state = vi.hoisted(() => ({
  isShowcase: false,
  isStaff: false,
  replyCount: 0,
  personas: [] as {
    id: string;
    name: string;
    initials: string;
    avatarUrl: string | null;
    href: string;
  }[],
}));
vi.mock("./useStudioShowcase", () => ({
  useStudioShowcase: () => state.isShowcase,
}));
vi.mock("./useIsStudioStaff", () => ({
  useIsStudioStaff: () => state.isStaff,
}));
vi.mock("./api/useStudioAccess", () => ({
  useStudioAccess: () => ({
    status: "granted",
    hasAccess: true,
    isPending: false,
    uploadablePersonas: state.personas,
  }),
}));
vi.mock("./api/useStudioMyClaimsReplyCount", () => ({
  useStudioMyClaimsReplyCount: () => ({ count: state.replyCount }),
}));

function makePersona(index: number) {
  return {
    id: `persona-${index}`,
    name: `Artist ${index}`,
    initials: `A${index}`,
    avatarUrl: null,
    href: `/studio/artist?id=persona-${index}`,
  };
}

beforeEach(() => {
  state.isShowcase = false;
  state.isStaff = false;
  state.replyCount = 0;
  state.personas = [];
});

function renderPanel({ isSheet = false }: { isSheet?: boolean } = {}) {
  render(
    <TestProviders initialEntries={["/studio"]}>
      <StudioAccountMenuPanel
        id="studio-account-menu"
        isExiting={false}
        persona={null}
        onNavigate={() => {}}
        isSheet={isSheet}
      />
    </TestProviders>,
  );
}

describe("account menu panel (showcase off)", () => {
  it("lists the everyone rows for a member without an artist page", async () => {
    renderPanel();
    expect(
      await screen.findByRole("link", { name: "My claims" }),
    ).toHaveAttribute("href", "/studio/claims");
    // The demo credit requests can add a count to the name.
    expect(screen.getByRole("link", { name: /^Credits/ })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open calls" }),
    ).toBeInTheDocument();
    // Desktop: Settings is the header icon link, a single link by that name.
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/studio/settings",
    );
    expect(
      screen.getByRole("link", { name: "Solidarity fund" }),
    ).toBeInTheDocument();
    // Anchored prefixes, so a row whose badge adds a count still matches.
    for (const name of [
      /^Upload a release/,
      /^Your numbers/,
      /^Press kit/,
      /^Payouts/,
      /^Your library/,
      /^Flag review/,
    ])
      expect(screen.queryByRole("link", { name })).not.toBeInTheDocument();
  });

  it("adds the creator rows and the persona for a member with an artist page", async () => {
    state.personas = [makePersona(1)];
    renderPanel();
    expect(
      await screen.findByRole("link", { name: "Upload a release" }),
    ).toHaveAttribute("href", "/studio/upload");
    expect(screen.getByRole("link", { name: "Your numbers" })).toHaveAttribute(
      "href",
      "/studio/dashboard",
    );
    expect(screen.getByRole("link", { name: "Press kit" })).toHaveAttribute(
      "href",
      "/studio/press/edit",
    );
    expect(screen.getByRole("link", { name: "Artist 1" })).toHaveAttribute(
      "href",
      "/studio/artist?id=persona-1",
    );
  });

  it("folds artist pages past the third behind Show all", async () => {
    state.personas = [1, 2, 3, 4, 5].map(makePersona);
    renderPanel();
    const toggle = await screen.findByRole("button", { name: "Show all (5)" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    for (const index of [1, 2, 3])
      expect(
        screen.getByRole("link", { name: `Artist ${index}` }),
      ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Artist 4" }),
    ).not.toBeInTheDocument();
    fireEvent.click(toggle);
    expect(
      await screen.findByRole("link", { name: "Artist 4" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Artist 5" })).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("reveals the help pages under Help and info", async () => {
    renderPanel();
    const toggle = await screen.findByRole("button", {
      name: "Help and info",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(await screen.findByRole("link", { name: "Help" })).toHaveAttribute(
      "href",
      "/studio/help",
    );
    for (const name of [
      "About Studio",
      "Rights and takedowns",
      "Studio terms",
      "Accessibility",
    ])
      expect(screen.getByRole("link", { name })).toBeInTheDocument();
  });

  it("adds Flag review for staff under a Staff heading", async () => {
    state.isStaff = true;
    renderPanel();
    // The row opens the tab with work waiting (`?tab=claims` or
    // `?tab=disputes`) once the counts land, and the bare route before.
    expect(
      (await screen.findByRole("link", { name: /^Flag review/ })).getAttribute(
        "href",
      ),
    ).toMatch(/^\/studio\/flag-review(\?tab=(claims|disputes))?$/);
    expect(screen.getByRole("group", { name: "Staff" })).toContainElement(
      screen.getByRole("link", { name: /^Flag review/ }),
    );
  });

  it("counts the claims waiting for the member's reply", async () => {
    state.replyCount = 2;
    renderPanel();
    expect(
      await screen.findByRole("link", { name: /My claims/ }),
    ).toHaveAccessibleName(/2 claims waiting for your reply/);
  });
});

describe("account menu panel (showcase)", () => {
  it("shows the showcase rows and the giving line", async () => {
    state.isShowcase = true;
    renderPanel();
    expect(
      await screen.findByRole("link", { name: "Payouts" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Submit a set" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Programme the week" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sustained")).toBeInTheDocument();
  });

  it("opens the phone sheet with the listening pages the dropdown leaves to the rail", async () => {
    state.isShowcase = true;
    renderPanel({ isSheet: true });
    expect(
      await screen.findByRole("link", { name: "The Wednesday set" }),
    ).toHaveAttribute("href", "/studio/set");
    expect(screen.getByRole("link", { name: "Sheet music" })).toHaveAttribute(
      "href",
      "/studio/sheet-store",
    );
    expect(
      screen.getByRole("link", { name: "Live broadcasts" }),
    ).toHaveAttribute("href", "/studio/live");
  });

  it("keeps Settings as a row in the phone sheet, with no header icon", async () => {
    renderPanel({ isSheet: true });
    expect(
      await screen.findByRole("link", { name: "Settings" }),
    ).toHaveAttribute("href", "/studio/settings");
    expect(screen.getAllByRole("link", { name: "Settings" })).toHaveLength(1);
  });

  it("moves Settings out of the desktop Studio group into the header", async () => {
    renderPanel();
    const settingsLink = await screen.findByRole("link", { name: "Settings" });
    expect(settingsLink).toHaveAttribute("aria-label", "Settings");
    expect(screen.getAllByRole("link", { name: "Settings" })).toHaveLength(1);
  });

  it("keeps the listening pages out of the dropdown", async () => {
    state.isShowcase = true;
    renderPanel();
    expect(
      await screen.findByRole("link", { name: "Payouts" }),
    ).toBeInTheDocument();
    for (const name of ["The Wednesday set", "Sheet music", "Live broadcasts"])
      expect(screen.queryByRole("link", { name })).not.toBeInTheDocument();
  });
});
