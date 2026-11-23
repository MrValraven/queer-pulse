import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { currentUserSlug } from "../../members/data/members";
import type {
  CommunityBadgeAdminDTO,
  CommunityBadgeAdminResponse,
} from "./api/communityBadges.api";
import type { CommunityRole } from "../membership.types";
import {
  demoCreateBadge,
  demoGetBadgeAdmin,
  resetCommunityBadgesDemo,
  type CommunityBadgesDemoViewer,
} from "./communityBadgesDemoStore";
import { ModToolsBadges } from "./ModToolsBadges";

const mocks = vi.hoisted(() => ({
  getCommunityBadgeAdmin: vi.fn(),
  updateCommunityBadge: vi.fn(),
  /** When set, every `useDemoMode` reader sees this mode. */
  demoOverride: { demoMode: null as boolean | null },
}));

vi.mock("./api/communityBadges.api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getCommunityBadgeAdmin: mocks.getCommunityBadgeAdmin,
  updateCommunityBadge: mocks.updateCommunityBadge,
}));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("../../../app/providers/DemoModeProvider")
    >();
  return {
    ...original,
    useDemoMode: () => {
      const value = original.useDemoMode();
      const overrideMode = mocks.demoOverride.demoMode;
      return overrideMode === null
        ? value
        : { ...value, demoMode: overrideMode };
    },
  };
});

const RUNNERS = "queer-runners";
const demoMod: CommunityBadgesDemoViewer = {
  viewerSlug: currentUserSlug,
  role: "mod",
  isMember: true,
  isSpace: false,
};

beforeEach(() => {
  resetCommunityBadgesDemo();
  mocks.getCommunityBadgeAdmin.mockReset();
  mocks.updateCommunityBadge.mockReset();
  mocks.demoOverride.demoMode = null;
});

function liveBadge(
  overrides: Partial<CommunityBadgeAdminDTO> = {},
): CommunityBadgeAdminDTO {
  return {
    id: "b1",
    starterKey: "regular",
    name: "Regular",
    iconKey: "calendar",
    tint: "jade",
    ruleType: "events_checked_in",
    threshold: 3,
    isEnabled: true,
    holderCount: 2,
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z",
    ...overrides,
  };
}

async function renderPane(slug = RUNNERS, viewerRole: CommunityRole = "mod") {
  render(
    <TestProviders>
      <ModToolsBadges
        slug={slug}
        communityName="Queer Runners"
        viewerRole={viewerRole}
      />
    </TestProviders>,
  );
  await awaitCatalog("communities");
  return screen.findByRole("list");
}

function openDialog() {
  return screen.getByRole("dialog");
}

describe("ModToolsBadges in demo", () => {
  it("lists every badge with its holders, switched-off ones included", async () => {
    const seed = demoGetBadgeAdmin(RUNNERS, demoMod);
    const list = await renderPane();
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(seed.badges.length);
    const trailRow = rows.find((row) => within(row).queryByText("Trail crew"));
    expect(trailRow).toBeDefined();
    expect(
      within(trailRow!).getByText(
        "Switched off: hidden everywhere and not awarded",
      ),
    ).toBeInTheDocument();
    expect(
      within(trailRow!).getByRole("switch", {
        name: "Award and show Trail crew",
      }),
    ).not.toBeChecked();
    const regular = seed.badges.find(
      (badge) => badge.starterKey === "regular",
    )!;
    const regularRow = rows.find((row) => within(row).queryByText("Regular"))!;
    expect(
      within(regularRow).getByText(
        regular.holderCount === 1
          ? "1 member holds it"
          : `${regular.holderCount} members hold it`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${seed.badges.length} of 12 badges`),
    ).toBeInTheDocument();
  });

  it("creates a badge with a live preview", async () => {
    const user = userEvent.setup();
    const list = await renderPane();
    await user.click(screen.getByRole("button", { name: "Create badge" }));
    const dialog = openDialog();
    await user.type(
      within(dialog).getByRole("textbox", { name: /^Name/ }),
      "Night owls",
    );
    const iconGroup = within(dialog).getByRole("radiogroup", { name: "Icon" });
    await user.click(within(iconGroup).getByRole("radio", { name: "Moon" }));
    const tintGroup = within(dialog).getByRole("radiogroup", {
      name: "Colour",
    });
    await user.click(within(tintGroup).getByRole("radio", { name: "Violet" }));
    expect(
      within(screen.getByTestId("badge-preview")).getByText("Night owls"),
    ).toBeInTheDocument();
    await user.click(
      within(dialog).getByRole("button", { name: "Create badge" }),
    );
    expect(await within(list).findByText("Night owls")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Night owls created. Members who already qualify get it quietly, with no notification.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the taken-name line under the name field", async () => {
    const user = userEvent.setup();
    await renderPane();
    await user.click(screen.getByRole("button", { name: "Create badge" }));
    const dialog = openDialog();
    const nameInput = within(dialog).getByRole("textbox", { name: /^Name/ });
    await user.type(nameInput, "regular");
    await user.click(
      within(dialog).getByRole("button", { name: "Create badge" }),
    );
    expect(
      await within(dialog).findByText(
        "This community already has a badge with that name. Pick another one.",
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(nameInput).toHaveAttribute("aria-invalid", "true"),
    );
  });

  it("locks the rule on an edit", async () => {
    const user = userEvent.setup();
    await renderPane();
    await user.click(
      screen.getByRole("button", { name: "Edit badge: Regular" }),
    );
    const dialog = openDialog();
    expect(
      within(dialog).queryByRole("radiogroup", { name: "How members earn it" }),
    ).not.toBeInTheDocument();
    const lockedHint = within(dialog).getByText(
      "The way members earn a badge stays fixed once you create it. Create a new badge for a different rule.",
    );
    // The fixed rule name sits beside its hint; the threshold field below
    // carries the same words as its label.
    const lockedRule = lockedHint.parentElement;
    if (!lockedRule) throw new Error("The locked rule hint has no container");
    expect(within(lockedRule).getByText("Events attended")).toBeInTheDocument();
    expect(
      within(dialog).queryByText("Switch it on now"),
    ).not.toBeInTheDocument();
  });

  it("names how many members lose a badge before deleting it", async () => {
    const user = userEvent.setup();
    const seed = demoGetBadgeAdmin(RUNNERS, demoMod);
    const regular = seed.badges.find(
      (badge) => badge.starterKey === "regular",
    )!;
    await renderPane();
    await user.click(
      screen.getByRole("button", { name: "Delete badge: Regular" }),
    );
    const dialog = openDialog();
    expect(within(dialog).getByText("Delete Regular?")).toBeInTheDocument();
    const tail =
      "this badge and lose it when you delete it. Anyone wearing it goes back to wearing none. You can't undo this.";
    const expectedBody =
      regular.holderCount === 0
        ? "Nobody holds this badge yet. You can't undo this."
        : regular.holderCount === 1
          ? `1 member holds ${tail.replace("and lose it", "and loses it")}`
          : `${regular.holderCount} members hold ${tail}`;
    expect(within(dialog).getByText(expectedBody)).toBeInTheDocument();
    await user.click(
      within(dialog).getByRole("button", { name: "Delete badge" }),
    );
    await waitFor(() =>
      expect(
        demoGetBadgeAdmin(RUNNERS, demoMod).badges.some(
          (badge) => badge.id === regular.id,
        ),
      ).toBe(false),
    );
  });

  it("holds the create button at twelve badges", async () => {
    const seeded = demoGetBadgeAdmin(RUNNERS, demoMod).badges.length;
    for (let index = seeded; index < 12; index += 1) {
      demoCreateBadge(RUNNERS, demoMod, {
        name: `Extra ${index}`,
        iconKey: "star",
        tint: "amber",
        ruleType: "posts_and_replies",
        threshold: 50,
      });
    }
    await renderPane();
    expect(screen.getByRole("button", { name: "Create badge" })).toBeDisabled();
    expect(
      screen.getByText(
        "This community has 12 badges, the most it can hold. Delete one to make space.",
      ),
    ).toBeInTheDocument();
  });

  it("deletes a badge nobody holds with the short toast", async () => {
    const user = userEvent.setup();
    demoCreateBadge(RUNNERS, demoMod, {
      name: "Quiet one",
      iconKey: "moon",
      tint: "violet",
      ruleType: "posts_and_replies",
      threshold: 5000,
    });
    await renderPane();
    await user.click(
      screen.getByRole("button", { name: "Delete badge: Quiet one" }),
    );
    const dialog = openDialog();
    expect(
      within(dialog).getByText(
        "Nobody holds this badge yet. You can't undo this.",
      ),
    ).toBeInTheDocument();
    await user.click(
      within(dialog).getByRole("button", { name: "Delete badge" }),
    );
    expect(await screen.findByText("Quiet one deleted.")).toBeInTheDocument();
  });
});

describe("ModToolsBadges create form in demo", () => {
  it("checks a changed field on blur and shows the reason under it", async () => {
    const user = userEvent.setup();
    await renderPane();
    await user.click(screen.getByRole("button", { name: "Create badge" }));
    const dialog = openDialog();
    expect(
      within(screen.getByTestId("badge-preview")).getByText("Badge name"),
    ).toBeInTheDocument();
    const nameInput = within(dialog).getByRole("textbox", { name: /^Name/ });
    await user.click(nameInput);
    await user.tab();
    expect(within(dialog).queryByText("Give the badge a name.")).toBeNull();
    await user.type(nameInput, "a");
    await user.clear(nameInput);
    await user.tab();
    expect(
      await within(dialog).findByText("Give the badge a name."),
    ).toBeInTheDocument();
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    const thresholdInput = within(dialog).getByRole("spinbutton", {
      name: "Events attended",
    });
    expect(
      within(dialog).getByText("Between 1 and 500 events"),
    ).toBeInTheDocument();
    await user.clear(thresholdInput);
    await user.type(thresholdInput, "0");
    await user.tab();
    await waitFor(() =>
      expect(thresholdInput).toHaveAttribute("aria-invalid", "true"),
    );
    // The reason takes over the field's description from the range hint.
    const describedBy = thresholdInput.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(describedBy)?.textContent).not.toContain(
      "Between 1 and 500 events",
    );
  });

  it("starts the number over when a new rule cannot take it", async () => {
    const user = userEvent.setup();
    await renderPane();
    await user.click(screen.getByRole("button", { name: "Create badge" }));
    const dialog = openDialog();
    const ruleGroup = within(dialog).getByRole("radiogroup", {
      name: "How members earn it",
    });
    await user.click(
      within(ruleGroup).getByRole("radio", { name: "Time in the community" }),
    );
    expect(
      within(dialog).getByRole("spinbutton", { name: "Days in the community" }),
    ).toHaveValue(30);
    await user.click(
      within(ruleGroup).getByRole("radio", { name: "Events attended" }),
    );
    expect(
      within(dialog).getByRole("spinbutton", { name: "Events attended" }),
    ).toHaveValue(30);
  });
});

describe("ModToolsBadges live", () => {
  it("reads the pane only for a live mod", async () => {
    mocks.demoOverride.demoMode = false;
    const response: CommunityBadgeAdminResponse = {
      canManage: false,
      limit: 12,
      badges: [liveBadge()],
    };
    mocks.getCommunityBadgeAdmin.mockResolvedValue(response);
    await renderPane("club");
    expect(mocks.getCommunityBadgeAdmin).toHaveBeenCalledWith("club");
    expect(
      screen.getByText(
        "Only the owner and co-owners can change badges. You can see how they're set up here.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Award and show Regular" }),
    ).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Edit badge: Regular" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Create badge" }),
    ).not.toBeInTheDocument();
  });

  it("holds every switch while one save is in flight", async () => {
    const user = userEvent.setup();
    mocks.demoOverride.demoMode = false;
    mocks.getCommunityBadgeAdmin.mockResolvedValue({
      canManage: true,
      limit: 12,
      badges: [
        liveBadge(),
        liveBadge({
          id: "b2",
          starterKey: null,
          name: "Night owls",
          isEnabled: false,
        }),
      ],
    } satisfies CommunityBadgeAdminResponse);
    mocks.updateCommunityBadge.mockReturnValue(new Promise(() => {}));
    await renderPane("club", "owner");
    await user.click(
      screen.getByRole("switch", { name: "Award and show Regular" }),
    );
    expect(mocks.updateCommunityBadge).toHaveBeenCalledWith("club", "b1", {
      isEnabled: false,
    });
    const nightOwlsSwitch = screen.getByRole("switch", {
      name: "Award and show Night owls",
    });
    const regularSwitch = screen.getByRole("switch", {
      name: "Award and show Regular",
    });
    await waitFor(() =>
      expect(nightOwlsSwitch).toHaveAttribute("aria-disabled", "true"),
    );
    expect(regularSwitch).toHaveAttribute("aria-disabled", "true");
    expect(regularSwitch).toBeEnabled();
    expect(regularSwitch).toHaveFocus();
    await user.click(nightOwlsSwitch);
    expect(mocks.updateCommunityBadge).toHaveBeenCalledTimes(1);
    expect(nightOwlsSwitch).not.toBeChecked();
  });

  it("says so when the community has no badges", async () => {
    mocks.demoOverride.demoMode = false;
    mocks.getCommunityBadgeAdmin.mockResolvedValue({
      canManage: true,
      limit: 12,
      badges: [],
    } satisfies CommunityBadgeAdminResponse);
    await renderPane("club", "owner");
    expect(
      screen.getByText(
        "No badges here yet. Create one and members start earning it.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("0 of 12 badges")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create badge" })).toBeEnabled();
  });
});
