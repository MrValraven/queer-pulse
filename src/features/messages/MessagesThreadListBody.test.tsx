import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { Conversation } from "./data";
import { DEMO_MAILBOX_SUMMARIES } from "./demoIdentities.data";
import { MessagesThreadListBody } from "./MessagesThreadListBody";

const NOOP = () => {};
const claimedThread = {
  id: "claimed",
  unread: false,
  claimedBy: { handle: "rui", name: "Rui Marçal", firstName: "Rui" },
} as Conversation;

describe("MessagesThreadListBody in a business mailbox", () => {
  it("shows the empty copy of an empty Unclaimed tab", async () => {
    render(
      <MessagesThreadListBody
        loading={false}
        searching={false}
        query=""
        threads={[claimedThread]}
        visibleThreads={[]}
        activeTab="unclaimed"
        activeId=""
        readIds={new Set()}
        pinnedCount={0}
        onOpen={NOOP}
        onCompose={NOOP}
        onQueryChange={NOOP}
        onSelectResult={NOOP}
        onRequestDelete={NOOP}
        onMarkThreadRead={NOOP}
        onMarkThreadUnread={NOOP}
        activeMailbox={DEMO_MAILBOX_SUMMARIES[1]!}
      />,
      { wrapper: TestProviders },
    );
    expect(
      await screen.findByText("Every conversation has someone handling it"),
    ).toBeInTheDocument();
  });

  // M5: `mailbox.replyOnly.composeHint` used to have no caller, so a business
  // mailbox with conversations already in it (the header's compose buttons
  // hidden) explained nothing; only the fully-empty state did. `threads`
  // alone (non-empty) is what gates the hint; `visibleThreads` stays empty
  // here so no row renders, matching the existing "Unclaimed" test above.
  it("explains the missing compose buttons once the mailbox already has conversations", async () => {
    render(
      <MessagesThreadListBody
        loading={false}
        searching={false}
        query=""
        threads={[claimedThread]}
        visibleThreads={[]}
        activeTab="unclaimed"
        activeId=""
        readIds={new Set()}
        pinnedCount={0}
        onOpen={NOOP}
        onCompose={NOOP}
        onQueryChange={NOOP}
        onSelectResult={NOOP}
        onRequestDelete={NOOP}
        onMarkThreadRead={NOOP}
        onMarkThreadUnread={NOOP}
        activeMailbox={DEMO_MAILBOX_SUMMARIES[1]!}
      />,
      { wrapper: TestProviders },
    );
    expect(
      await screen.findByText(/answers conversations members start/i),
    ).toBeInTheDocument();
  });

  it("shows no compose hint in the personal mailbox", async () => {
    render(
      <MessagesThreadListBody
        loading={false}
        searching={false}
        query=""
        threads={[claimedThread]}
        visibleThreads={[]}
        activeTab="unread"
        activeId=""
        readIds={new Set()}
        pinnedCount={0}
        onOpen={NOOP}
        onCompose={NOOP}
        onQueryChange={NOOP}
        onSelectResult={NOOP}
        onRequestDelete={NOOP}
        onMarkThreadRead={NOOP}
        onMarkThreadUnread={NOOP}
        activeMailbox={DEMO_MAILBOX_SUMMARIES[0]!}
      />,
      { wrapper: TestProviders },
    );
    // Wait for the tab's own (unrelated) empty copy to settle the tree
    // before asserting the negative.
    await screen.findByText("No unread chats");
    await waitFor(() =>
      expect(
        screen.queryByText(/answers conversations members start/i),
      ).not.toBeInTheDocument(),
    );
  });
});
