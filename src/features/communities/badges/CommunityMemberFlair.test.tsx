import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { CommunityMemberAvatarRing } from "./CommunityMemberAvatarRing";
import { CommunityMemberFlair } from "./CommunityMemberFlair";
import { resetCommunityBadgesDemo } from "./communityBadgesDemoStore";

const mocks = vi.hoisted(() => ({
  /** When set, every `useDemoMode` reader sees this mode. */
  demoOverride: { demoMode: null as boolean | null },
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

const COMMUNITY_SLUG = "queer-runners";

beforeEach(() => {
  resetCommunityBadgesDemo();
  mocks.demoOverride.demoMode = null;
});

afterEach(() => {
  mocks.demoOverride.demoMode = null;
});

async function renderNameLine(
  member: Parameters<typeof CommunityMemberFlair>[0]["member"],
) {
  const view = render(
    <TestProviders>
      <MotionProvider>
        <div data-testid="name-line">
          <CommunityMemberFlair
            communitySlug={COMMUNITY_SLUG}
            member={member}
          />
        </div>
      </MotionProvider>
    </TestProviders>,
  );
  await awaitCatalog("communities");
  return view;
}

/** The toast stack's own status region (the Studio player's live region is
 *  a second role=status on the page). */
function toastStatus(): HTMLElement {
  const toastStatuses = screen
    .getAllByRole("status")
    .filter((element) => element.closest("[data-toast-region]") !== null);
  expect(toastStatuses).toHaveLength(1);
  return toastStatuses[0]!;
}

describe("CommunityMemberFlair", () => {
  it("shows the worn badge beside a demo member", async () => {
    await renderNameLine({ slug: "monica", name: "Monica" });

    expect(screen.getByText("Old friend")).toBeInTheDocument();
  });

  it("renders nothing for a member who wears nothing and got no gift", async () => {
    await renderNameLine({ slug: "diogo", name: "Diogo" });

    expect(screen.getByTestId("name-line")).toBeEmptyDOMElement();
  });

  it("shows one gift mark for a member with recent gifts", async () => {
    await renderNameLine({ slug: "sofia", name: "Sofia" });

    expect(
      screen.getAllByRole("button", { name: /got a gift recently/ }),
    ).toHaveLength(1);
  });

  it("lists the marks and lets the sender remove one", async () => {
    const user = userEvent.setup();
    await renderNameLine({ slug: "kai", name: "Kai" });

    await user.click(
      screen.getByRole("button", { name: /got a gift recently/ }),
    );
    const giftsDialog = await screen.findByRole("dialog");
    expect(await within(giftsDialog).findByText("Smile")).toBeInTheDocument();

    await user.click(
      within(giftsDialog).getByRole("button", { name: "Remove gift" }),
    );
    const dialogs = await screen.findAllByRole("dialog");
    expect(dialogs).toHaveLength(2);
    await user.click(
      within(dialogs[1]!).getByRole("button", { name: "Remove gift" }),
    );

    await waitFor(() =>
      expect(
        within(toastStatus()).getByText("Gift removed."),
      ).toBeInTheDocument(),
    );
  });

  it.each([
    ["the close button", "click"],
    ["Escape", "escape"],
  ])(
    "plays the dialog exit after the only gift is removed and moves focus off the body when closed with %s",
    async (_label, closeWith) => {
      const user = userEvent.setup();
      render(
        <TestProviders>
          <MotionProvider>
            <div data-testid="card" tabIndex={-1}>
              <CommunityMemberFlair
                communitySlug={COMMUNITY_SLUG}
                member={{ slug: "kai", name: "Kai" }}
              />
            </div>
          </MotionProvider>
        </TestProviders>,
      );
      await awaitCatalog("communities");

      await user.click(
        screen.getByRole("button", { name: /got a gift recently/ }),
      );
      const giftsDialog = await screen.findByRole("dialog");
      await user.click(
        await within(giftsDialog).findByRole("button", {
          name: "Remove gift",
        }),
      );
      const dialogs = await screen.findAllByRole("dialog");
      await user.click(
        within(dialogs[1]!).getByRole("button", { name: "Remove gift" }),
      );
      // The row folds away with the focus it held, so focus is on the body.
      await waitFor(() =>
        expect(screen.queryByText("Smile")).not.toBeInTheDocument(),
      );
      // The confirm dialog is still on its exit and the topmost until it goes.
      await waitFor(() =>
        expect(screen.queryAllByRole("dialog")).toHaveLength(1),
      );
      act(() => {
        if (document.activeElement instanceof HTMLElement)
          document.activeElement.blur();
      });
      expect(document.body).toHaveFocus();
      // The last gift is gone, but the mark stays while its dialog is open.
      expect(
        screen.getByRole("button", { name: /got a gift recently/ }),
      ).toBeInTheDocument();

      if (closeWith === "click") {
        await user.click(
          within(screen.getByRole("dialog")).getByRole("button", {
            name: "Close",
          }),
        );
      } else {
        await user.keyboard("{Escape}");
      }

      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      await waitFor(() =>
        expect(
          screen.queryByRole("button", { name: /got a gift recently/ }),
        ).not.toBeInTheDocument(),
      );
      await waitFor(() => expect(screen.getByTestId("card")).toHaveFocus());
    },
  );

  it("rings the avatar in the worn badge's tint", async () => {
    render(
      <TestProviders>
        <MotionProvider>
          <CommunityMemberAvatarRing
            communitySlug={COMMUNITY_SLUG}
            member={{ slug: "monica", name: "Monica" }}
          >
            <span data-testid="avatar">M</span>
          </CommunityMemberAvatarRing>
        </MotionProvider>
      </TestProviders>,
    );
    await act(async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId("avatar").parentElement?.className).toMatch(
      /ringPlum/,
    );
  });

  it("reads live fields off the member", async () => {
    mocks.demoOverride.demoMode = false;
    await renderNameLine({
      slug: "monica",
      name: "Monica",
      flair: {
        name: "Regulars",
        starterKey: null,
        iconKey: "award",
        tint: "accent",
      },
      hasRecentGift: false,
    });

    expect(screen.getByText("Regulars")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /got a gift recently/ }),
    ).not.toBeInTheDocument();
  });
});
