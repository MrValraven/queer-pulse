// src/features/messages/ComposerReplyPreview.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ComposerReplyPreview } from "./ComposerReplyPreview";
import type { ChatMessage } from "./data";

/** A reply sent as Café Lisboa, as a staff member of the café reads it. */
function businessReply(overrides: Partial<ChatMessage>): ChatMessage {
  return {
    id: "message-cafe-1",
    from: "me",
    text: "We can seat twelve on the terrace.",
    senderName: "Café Lisboa",
    senderIdentityId: "identity-cafe",
    senderIdentityKind: "listing",
    ...overrides,
  };
}

function renderPreview(previewMessage: ChatMessage) {
  render(
    <ComposerReplyPreview
      previewMessage={previewMessage}
      open
      isGroup={false}
      activeName="Nuno Alves"
    />,
    { wrapper: TestProviders },
  );
}

describe("ComposerReplyPreview, business mailboxes", () => {
  it("names a colleague's reply by the business and the colleague's first name", async () => {
    renderPreview(
      businessReply({ senderStaffFirstName: "Rui", isSentByViewer: false }),
    );
    expect(await screen.findByText("Rui from Café Lisboa")).toBeInTheDocument();
    expect(screen.queryByText("You")).not.toBeInTheDocument();
  });

  it("names the member's own business reply as You", async () => {
    renderPreview(
      businessReply({ senderStaffFirstName: "Tiago", isSentByViewer: true }),
    );
    expect(await screen.findByText("You")).toBeInTheDocument();
  });
});
