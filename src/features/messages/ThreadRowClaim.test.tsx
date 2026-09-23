import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { conversations, type Conversation } from "./data";
import { MessagesThreadRow } from "./MessagesThreadRow";
import { ThreadRowMenu } from "./ThreadRowMenu";

/** Rui holds this Café Lisboa thread, seated as the switcher leaves it. */
function seatedRuiThread(): Conversation {
  const conversation = conversations.find(
    (candidate) => candidate.id === "demo-cafe-lisboa-nuno",
  );
  if (!conversation) throw new Error("No demo-cafe-lisboa-nuno seed");
  return {
    ...conversation,
    mailboxSeatIdentityId: conversation.mailboxIdentityId,
  };
}

const noop = () => {};

describe("inbox row claim wiring (demo)", () => {
  it("offers Take over in the row menu and opens the confirm", async () => {
    render(
      <ThreadRowMenu
        thread={seatedRuiThread()}
        isUnread={false}
        onTogglePin={noop}
        onToggleFavorite={noop}
        onToggleMute={noop}
        onToggleArchive={noop}
        onToggleReadUnread={noop}
        onDelete={noop}
        claimStatus="theirs"
      />,
      { wrapper: TestProviders },
    );
    const trigger = await screen.findByRole("button", {
      name: "Conversation options",
    });
    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole("menuitem", { name: "Take over" }));
    expect(await screen.findByText("Take over from Rui?")).toBeInTheDocument();
    // Cancelling returns focus to the menu trigger; the chosen item is gone.
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("shows the claim tag on an inbox row", async () => {
    render(
      <MessagesThreadRow
        thread={seatedRuiThread()}
        activeId=""
        readIds={new Set()}
        pinnedCount={0}
        onOpen={noop}
        onRequestDelete={noop}
        onMarkThreadRead={noop}
        onMarkThreadUnread={noop}
      />,
      { wrapper: TestProviders },
    );
    expect(await screen.findByText("With Rui")).toBeInTheDocument();
  });
});
