import { useRef, useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { FeedBlockConfirmHost } from "./FeedBlockConfirmHost";
import { MoreMenu } from "./FeedModeration";

const AUTHOR_NAME = "Rui Cardoso";
const AUTHOR_SLUG = "rui-cardoso";

/**
 * Mirrors `FeedPage`'s shape: `FeedBlockConfirmHost` sits above the list, one
 * card renders inside it, and "Remove card" simulates the optimistic
 * row-removal a real block causes, without waiting on a real feed query.
 */
function HostedFeedFixture() {
  const listRef = useRef<HTMLDivElement>(null);
  const [isCardMounted, setIsCardMounted] = useState(true);
  return (
    <TestProviders>
      <div ref={listRef} tabIndex={-1} data-testid="list">
        <FeedBlockConfirmHost fallbackFocusRef={listRef}>
          {isCardMounted && (
            <MoreMenu authorName={AUTHOR_NAME} slug={AUTHOR_SLUG} />
          )}
        </FeedBlockConfirmHost>
      </div>
      <button type="button" onClick={() => setIsCardMounted(false)}>
        Remove card
      </button>
    </TestProviders>
  );
}

async function openBlockDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Post options" }));
  await user.click(
    screen.getByRole("menuitem", { name: `Block ${AUTHOR_NAME}` }),
  );
  return screen.findByRole("dialog");
}

describe("FeedModeration: block dialog survives its card", () => {
  // `SocialProvider`'s demo store persists to `localStorage["qp.social.v1"]`
  // (useSocialStore.ts) and reads it back on mount, and jsdom's storage
  // outlives any one test. Without this, the block submitted in one test
  // carries into the next test's fresh render, which then reads the menu
  // item as "Unblock Rui Cardoso" while this file's tests expect "Block Rui
  // Cardoso," so the result depends on test order.
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps the block dialog open and shows the done panel after the card unmounts", async () => {
    const user = userEvent.setup();
    render(<HostedFeedFixture />);

    await openBlockDialog(user);

    // The card leaves the feed exactly as an optimistic block would remove
    // it, while the dialog (hosted above the list, independent of the card)
    // stays mounted.
    await user.click(screen.getByRole("button", { name: "Remove card" }));
    expect(
      screen.queryByRole("button", { name: "Post options" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: `Block ${AUTHOR_NAME}` }),
    );

    expect(
      await screen.findByRole("button", { name: "Done" }),
    ).toBeInTheDocument();
  });

  it("returns focus to the list when the card is gone", async () => {
    const user = userEvent.setup();
    render(<HostedFeedFixture />);

    await openBlockDialog(user);
    await user.click(screen.getByRole("button", { name: "Remove card" }));
    await user.click(
      screen.getByRole("button", { name: `Block ${AUTHOR_NAME}` }),
    );
    await user.click(await screen.findByRole("button", { name: "Done" }));

    // The card's own "..." button is gone, so focus lands on the list region
    // the host was given as its fallback.
    expect(screen.getByTestId("list")).toHaveFocus();
  });

  it("opens the block dialog with focus on the dialog itself", async () => {
    const user = userEvent.setup();
    render(<HostedFeedFixture />);

    const dialog = await openBlockDialog(user);

    // The least consequential stop in a destructive confirm: the "also
    // report" checkbox stays unticked until the member tabs to it.
    expect(dialog).toHaveFocus();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("hides mute and block for a card with no slug", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <MoreMenu
          authorName="Anonymous member"
          slug=""
          onReport={() => {}}
          muteTarget={{
            sourceKind: "community",
            sourceId: "community-1",
            name: "Trans Wellness Circle",
          }}
        />
      </TestProviders>,
    );

    await user.click(screen.getByRole("button", { name: "Post options" }));
    const menu = screen.getByRole("menu");

    // Source-level items (report the post, mute the source) don't need a
    // profile slug, so they still render.
    within(menu).getByRole("menuitem", { name: "Report post" });
    within(menu).getByRole("menuitem", {
      name: "Show less of Trans Wellness Circle",
    });
    // Person-scoped items have nobody to point at when the card is masked or
    // flat, so they're left out entirely, since neither action has a slug to
    // act on.
    expect(
      within(menu).queryByRole("menuitem", { name: /^Mute /i }),
    ).not.toBeInTheDocument();
    expect(
      within(menu).queryByRole("menuitem", { name: /^Block /i }),
    ).not.toBeInTheDocument();
  });

  it("renders nothing for a masked card with no report and no mute source", () => {
    render(
      <TestProviders>
        <MoreMenu authorName="Anonymous member" slug="" />
      </TestProviders>,
    );

    expect(
      screen.queryByRole("button", { name: "Post options" }),
    ).not.toBeInTheDocument();
  });
});
