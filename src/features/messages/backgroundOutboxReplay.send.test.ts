import { afterEach, describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "./data";

// The background replay loop POSTs stored outbox entries straight against
// the API. Each entry must go out with the payload its original send used,
// and as the identity it was composed as.

vi.mock("./api/messages.api", () => ({
  sendMessage: vi.fn(() => Promise.resolve({})),
  sendDocumentMessage: vi.fn(() => Promise.resolve({})),
}));

import { sendDocumentMessage, sendMessage } from "./api/messages.api";
import { sendOutboxEntry } from "./useBackgroundOutboxReplay";

const CONVERSATION_ID = "66666666-6666-4666-8666-666666666666";

afterEach(() => {
  vi.mocked(sendMessage).mockClear();
  vi.mocked(sendDocumentMessage).mockClear();
});

describe("sendOutboxEntry", () => {
  it("replays a sticker as its bare kind and sticker id", async () => {
    const entry: ChatMessage = {
      from: "me",
      text: "Wave",
      kind: "sticker",
      localId: "local-sticker",
      status: "failed",
      attachment: {
        url: "stickers/wave.webp",
        previewUrl: "stickers/wave.webp",
        width: 160,
        height: 160,
        provider: "sticker",
        stickerId: "sticker-wave",
        label: "Wave",
      },
    };

    await sendOutboxEntry(CONVERSATION_ID, "local-sticker", entry);

    expect(vi.mocked(sendMessage)).toHaveBeenCalledWith(
      CONVERSATION_ID,
      "Wave",
      undefined,
      "local-sticker",
      undefined,
      undefined,
      "sticker",
      "sticker-wave",
      undefined,
    );
  });

  it("replays a text entry as the identity it was composed as", async () => {
    const entry: ChatMessage = {
      from: "me",
      text: "We open at nine.",
      localId: "local-text",
      status: "sending",
      sendAsIdentityId: "identity-cafe",
    };

    await sendOutboxEntry(CONVERSATION_ID, "local-text", entry);

    expect(vi.mocked(sendMessage).mock.calls[0]!.at(-1)).toBe("identity-cafe");
  });

  it("replays a document as the identity it was composed as", async () => {
    const entry: ChatMessage = {
      from: "me",
      text: "Document",
      kind: "document",
      localId: "local-document",
      status: "failed",
      sendAsIdentityId: "identity-cafe",
      sendAttachment: {
        url: "files/menu",
        fileName: "menu.pdf",
        byteSize: 1,
        contentType: "application/pdf",
        provider: "upload",
      },
    };

    await sendOutboxEntry(CONVERSATION_ID, "local-document", entry);

    expect(vi.mocked(sendDocumentMessage).mock.calls[0]!.at(-1)).toBe(
      "identity-cafe",
    );
  });
});
