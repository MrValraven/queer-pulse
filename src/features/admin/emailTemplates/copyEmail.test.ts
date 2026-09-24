import { afterEach, describe, expect, it, vi } from "vitest";
import { copyRichEmail } from "./copyEmail";

class FakeClipboardItem {
  readonly items: Record<string, Blob>;

  constructor(items: Record<string, Blob>) {
    this.items = items;
  }
}

function installClipboard(clipboard: Partial<Clipboard> | undefined) {
  Object.defineProperty(navigator, "clipboard", {
    value: clipboard,
    configurable: true,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  installClipboard(undefined);
});

describe("copyRichEmail", () => {
  it("writes an HTML and a plain-text part when the browser supports it", async () => {
    vi.stubGlobal("ClipboardItem", FakeClipboardItem);
    const write = vi.fn().mockResolvedValue(undefined);
    installClipboard({ write, writeText: vi.fn() });
    await expect(
      copyRichEmail({ html: "<p>Hi</p>", text: "Hi" }),
    ).resolves.toBe("rich");
    const writtenItems = write.mock.calls[0]?.[0] as
      FakeClipboardItem[] | undefined;
    const item = writtenItems?.[0];
    expect(item).toBeDefined();
    expect(Object.keys(item?.items ?? {})).toEqual(["text/html", "text/plain"]);
  });

  it("falls back to plain text when the rich write is refused", async () => {
    vi.stubGlobal("ClipboardItem", FakeClipboardItem);
    const writeText = vi.fn().mockResolvedValue(undefined);
    installClipboard({
      write: vi.fn().mockRejectedValue(new Error("denied")),
      writeText,
    });
    await expect(
      copyRichEmail({ html: "<p>Hi</p>", text: "Hi" }),
    ).resolves.toBe("plain");
    expect(writeText).toHaveBeenCalledWith("Hi");
  });

  it("falls back to plain text when ClipboardItem does not exist", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    installClipboard({ writeText });
    await expect(
      copyRichEmail({ html: "<p>Hi</p>", text: "Hi" }),
    ).resolves.toBe("plain");
  });

  it("reports failure when there is no clipboard at all", async () => {
    installClipboard(undefined);
    await expect(
      copyRichEmail({ html: "<p>Hi</p>", text: "Hi" }),
    ).resolves.toBe("failed");
  });
});
