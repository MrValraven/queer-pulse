import { describe, expect, it } from "vitest";
import {
  entryDateLabel,
  entrySenderName,
  extractLinkUrls,
  filterEntriesByKind,
  flattenNewestFirst,
  formatDocumentSize,
  groupEntriesByMonth,
  matchesMediaKind,
  messageLinks,
  type ConversationMediaEntry,
} from "./conversationMediaFilters";
import type { ChatMessage } from "./data";

function textMessage(
  text: string,
  overrides: Partial<ChatMessage> = {},
): ChatMessage {
  return { from: "them", text, ...overrides };
}

function photoMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    from: "them",
    text: "Photo",
    kind: "image",
    attachment: {
      url: "https://files.example.test/photo.jpg",
      previewUrl: "https://files.example.test/photo-small.jpg",
      width: 800,
      height: 600,
      provider: "upload",
    },
    ...overrides,
  };
}

function documentMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    from: "me",
    text: "Document",
    kind: "document",
    attachment: {
      url: "https://files.example.test/lease.pdf",
      fileName: "lease.pdf",
      byteSize: 48_213,
      contentType: "application/pdf",
      provider: "upload",
    },
    ...overrides,
  };
}

function entry(
  message: ChatMessage,
  at: string | null,
): ConversationMediaEntry {
  return { message, at };
}

describe("extractLinkUrls", () => {
  it("finds every URL in reading order and drops trailing punctuation", () => {
    expect(
      extractLinkUrls(
        "Book here https://clinic.example.pt/book, and the brunch: www.brunch.example.org.",
      ),
    ).toEqual([
      "https://clinic.example.pt/book",
      "https://www.brunch.example.org",
    ]);
  });

  it("lists a URL shared twice in one message once", () => {
    expect(
      extractLinkUrls("https://a.example.test then https://a.example.test"),
    ).toEqual(["https://a.example.test"]);
  });

  it("advances past a bare www host that also appears with a scheme later", () => {
    expect(
      extractLinkUrls(
        "www.x.example.test and later https://www.x.example.test/page",
      ),
    ).toEqual([
      "https://www.x.example.test",
      "https://www.x.example.test/page",
    ]);
  });

  it("returns nothing for text without a link", () => {
    expect(extractLinkUrls("See you at eight")).toEqual([]);
  });
});

describe("matchesMediaKind", () => {
  it("puts a viewable photo on Media only", () => {
    const message = photoMessage();
    expect(matchesMediaKind(message, "media")).toBe(true);
    expect(matchesMediaKind(message, "links")).toBe(false);
    expect(matchesMediaKind(message, "documents")).toBe(false);
  });

  it("keeps a captioned photo with a URL on Media only", () => {
    const attachment = photoMessage().attachment;
    const message = photoMessage({
      attachment: attachment && {
        ...attachment,
        caption: "the flat, listing at https://flats.example.test/42",
      },
    });
    expect(matchesMediaKind(message, "media")).toBe(true);
    expect(matchesMediaKind(message, "links")).toBe(false);
    expect(messageLinks(message)).toEqual([]);
  });

  it("keeps a captioned document with a URL on Documents only", () => {
    const attachment = documentMessage().attachment;
    const message = documentMessage({
      attachment: attachment && {
        ...attachment,
        caption: "signed copy, original at www.leases.example.test",
      },
    });
    expect(matchesMediaKind(message, "documents")).toBe(true);
    expect(matchesMediaKind(message, "links")).toBe(false);
  });

  it("puts a text message with a URL in its body on Links", () => {
    expect(
      matchesMediaKind(textMessage("see https://a.example.test"), "links"),
    ).toBe(true);
    expect(
      matchesMediaKind(
        textMessage("see www.a.example.test", { kind: "user" }),
        "links",
      ),
    ).toBe(true);
    expect(matchesMediaKind(textMessage("no link here"), "links")).toBe(false);
  });

  it("reads a photo's fallback text as no link", () => {
    expect(
      matchesMediaKind(
        photoMessage({ text: "https://not-a-caption.test" }),
        "links",
      ),
    ).toBe(false);
  });

  it("puts a document on Documents", () => {
    expect(matchesMediaKind(documentMessage(), "documents")).toBe(true);
    expect(matchesMediaKind(documentMessage(), "media")).toBe(false);
  });

  it("keeps deleted and system messages off every shelf", () => {
    const deletedAt = "2026-09-01T10:00:00.000Z";
    for (const kind of ["media", "links", "documents"] as const) {
      expect(matchesMediaKind(photoMessage({ deletedAt }), kind)).toBe(false);
      expect(matchesMediaKind(documentMessage({ deletedAt }), kind)).toBe(
        false,
      );
      expect(
        matchesMediaKind(
          textMessage("https://a.example.test", { deletedAt }),
          kind,
        ),
      ).toBe(false);
      expect(
        matchesMediaKind(
          textMessage("https://a.example.test", { kind: "system" }),
          kind,
        ),
      ).toBe(false);
    }
  });
});

describe("flattenNewestFirst and filterEntriesByKind", () => {
  it("reverses the thread order and dates undated messages by their day bucket", () => {
    const older = textMessage("https://older.example.test");
    const newer = photoMessage({ at: "2026-09-14T18:30:00.000Z" });
    const entries = flattenNewestFirst([
      { dayKey: "2026-08-02", items: [older] },
      { dayKey: "2026-09-14", items: [newer] },
    ]);
    expect(entries).toEqual([
      entry(newer, "2026-09-14T18:30:00.000Z"),
      entry(older, "2026-08-02"),
    ]);
    expect(filterEntriesByKind(entries, "links")).toEqual([
      entry(older, "2026-08-02"),
    ]);
  });
});

describe("groupEntriesByMonth", () => {
  it("sections newest-first entries by month with a localized heading", () => {
    const september = entry(photoMessage(), "2026-09-03T12:00:00");
    const alsoSeptember = entry(photoMessage(), "2026-09-01");
    const march = entry(photoMessage(), "2026-03-03T12:00:00");
    const undated = entry(photoMessage(), null);
    const sections = groupEntriesByMonth(
      [september, alsoSeptember, march, undated],
      "en-GB",
    );
    expect(
      sections.map((section) => [section.heading, section.entries.length]),
    ).toEqual([
      ["September 2026", 2],
      ["March 2026", 1],
      [null, 1],
    ]);
  });
});

describe("entryDateLabel", () => {
  const now = new Date(2026, 8, 15);

  it("omits the year inside the current year", () => {
    expect(entryDateLabel("2026-03-03T12:00:00", "en-GB", now)).toBe("3 March");
  });

  it("adds the year for an earlier year", () => {
    expect(entryDateLabel("2025-12-24T12:00:00", "en-GB", now)).toBe(
      "24 December 2025",
    );
  });

  it("reads a bare calendar date as that local day", () => {
    expect(entryDateLabel("2026-08-02", "en-GB", now)).toBe("2 August");
  });

  it("is empty without a usable date", () => {
    expect(entryDateLabel(null, "en-GB", now)).toBe("");
    expect(entryDateLabel("not a date", "en-GB", now)).toBe("");
  });
});

describe("entrySenderName", () => {
  it("names the viewer, a group sender, or the DM counterpart", () => {
    expect(entrySenderName(photoMessage({ from: "me" }), "Ana", "You")).toBe(
      "You",
    );
    expect(
      entrySenderName(photoMessage({ senderName: "Rui" }), "Group", "You"),
    ).toBe("Rui");
    expect(entrySenderName(photoMessage(), "Ana", "You")).toBe("Ana");
  });
});

describe("formatDocumentSize", () => {
  it("matches the document bubble's units", () => {
    expect(formatDocumentSize(48)).toBe("48 B");
    expect(formatDocumentSize(48_213)).toBe("47.1 KB");
    expect(formatDocumentSize(1_258_291)).toBe("1.2 MB");
  });
});
