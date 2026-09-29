import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  MessageResponse,
  StickerAttachmentResponse,
} from "../../shared/contracts/contracts";
import { messageDisplayText } from "./api/messages.adapters";
import { starredSnippetIn } from "./starredMessagesFilter";

const languageState = { language: "en" as "en" | "pt" };

vi.mock("../../shared/i18n/locale", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../shared/i18n/locale")>();
  return { ...actual, detectLanguage: () => languageState.language };
});

function stickerAttachment(labelPt?: string): StickerAttachmentResponse {
  return {
    url: "https://example.test/bi-reverse.png",
    previewUrl: "https://example.test/bi-reverse.png",
    width: 512,
    height: 512,
    provider: "sticker",
    stickerId: "sticker-1",
    label: "Bi reverse",
    ...(labelPt ? { labelPt } : {}),
  };
}

// Only the two fields `messageDisplayText` reads, plus `body`.
function stickerMessage(labelPt?: string): MessageResponse {
  return {
    kind: "sticker",
    body: "",
    attachment: stickerAttachment(labelPt),
  } as unknown as MessageResponse;
}

describe("messageDisplayText for a sticker (baked labelPt)", () => {
  beforeEach(() => {
    languageState.language = "en";
  });

  it("shows the English label to an English reader", () => {
    expect(messageDisplayText(stickerMessage("Bi invertido"))).toBe(
      "Bi reverse",
    );
  });

  it("shows the baked Portuguese name to a Portuguese reader", () => {
    languageState.language = "pt";
    expect(messageDisplayText(stickerMessage("Bi invertido"))).toBe(
      "Bi invertido",
    );
  });

  it("falls back to the English label for a sticker sent without a Portuguese name", () => {
    languageState.language = "pt";
    expect(messageDisplayText(stickerMessage())).toBe("Bi reverse");
  });

  it("keeps an ordinary message's body", () => {
    languageState.language = "pt";
    const message = {
      kind: "user",
      body: "Hello",
      attachment: null,
    } as unknown as MessageResponse;
    expect(messageDisplayText(message)).toBe("Hello");
  });
});

describe("starredSnippetIn", () => {
  it("names a starred sticker in Portuguese from its baked labelPt", () => {
    expect(
      starredSnippetIn(
        {
          snippet: "Bi reverse",
          attachment: stickerAttachment("Bi invertido"),
        },
        "pt",
      ),
    ).toBe("Bi invertido");
  });

  it("keeps the English label for an English reader", () => {
    expect(
      starredSnippetIn(
        {
          snippet: "Bi reverse",
          attachment: stickerAttachment("Bi invertido"),
        },
        "en",
      ),
    ).toBe("Bi reverse");
  });

  it("keeps the server snippet for every other starred hit", () => {
    expect(
      starredSnippetIn({ snippet: "See you at 8", attachment: null }, "pt"),
    ).toBe("See you at 8");
  });
});
