// src/features/messages/ConversationMediaShelves.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ConversationMediaGrid } from "./ConversationMediaGrid";
import type { ConversationMediaEntry } from "./conversationMediaFilters";
import type { ChatMessage } from "./data";

/** A photo sent as Café Lisboa, as staff of the café read it. */
function businessPhotoEntry(
  overrides: Partial<ChatMessage>,
): ConversationMediaEntry {
  return {
    at: "2026-03-03T10:00:00.000Z",
    message: {
      id: "message-cafe-photo",
      from: "me",
      text: "Photo",
      kind: "image",
      senderName: "Café Lisboa",
      senderIdentityId: "identity-cafe",
      attachment: {
        url: "https://files.example.test/terrace.jpg",
        previewUrl: "https://files.example.test/terrace-small.jpg",
        width: 800,
        height: 600,
        provider: "upload",
      },
      ...overrides,
    },
  };
}

function renderGrid(entry: ConversationMediaEntry) {
  render(
    <ConversationMediaGrid
      entries={[entry]}
      counterpartName="Nuno Alves"
      onOpenPhoto={() => undefined}
    />,
    { wrapper: TestProviders },
  );
}

describe("ConversationMediaGrid, business mailboxes", () => {
  it("names a colleague's photo by the business and the colleague's first name", async () => {
    renderGrid(
      businessPhotoEntry({
        senderStaffFirstName: "Rui",
        isSentByViewer: false,
      }),
    );
    const tile = await screen.findByRole("button");
    expect(tile).toHaveAccessibleName(/Rui from Café Lisboa/);
  });

  it("keeps the member's own photo named as theirs", async () => {
    renderGrid(
      businessPhotoEntry({
        senderStaffFirstName: "Tiago",
        isSentByViewer: true,
      }),
    );
    const tile = await screen.findByRole("button");
    expect(tile).toHaveAccessibleName(/Your photo/);
  });
});
