import { describe, expect, it } from "vitest";
import {
  ALBUM_WINDOW_MS,
  canJoinAlbum,
  groupIntoAlbums,
  type RunSegment,
} from "./messageAlbums";
import type { ChatMessage } from "./data";

let photoCounter = 0;

/** A plain uploaded photo that qualifies for an album unless `overrides`
 *  gives it something that breaks it out. */
function photo(overrides: Partial<ChatMessage> = {}): ChatMessage {
  photoCounter += 1;
  return {
    from: "them",
    text: "Photo",
    kind: "image",
    id: `photo-${photoCounter}`,
    at: "2026-09-15T10:00:00.000Z",
    attachment: {
      url: `https://example.test/photo-${photoCounter}.jpg`,
      width: 800,
      height: 600,
    } as ChatMessage["attachment"],
    ...overrides,
  };
}

function secondsAfterTen(seconds: number): string {
  return new Date(Date.UTC(2026, 8, 15, 10, 0, seconds)).toISOString();
}

/** The segment kinds with their sizes, e.g. `["album:3", "message"]`. */
function shape(segments: RunSegment[]): string[] {
  return segments.map((segment) =>
    segment.kind === "album" ? `album:${segment.messages.length}` : "message",
  );
}

describe("groupIntoAlbums counts", () => {
  it.each([2, 3, 4, 6])("collapses %i photos into one album", (count) => {
    const photos = Array.from({ length: count }, () => photo());
    const segments = groupIntoAlbums(photos);
    expect(shape(segments)).toEqual([`album:${count}`]);
    const album = segments[0];
    expect(album?.kind === "album" && album.messages).toEqual(photos);
    expect(album?.kind === "album" && album.startIndex).toBe(0);
  });

  it("leaves a single photo as an ordinary message", () => {
    expect(shape(groupIntoAlbums([photo()]))).toEqual(["message"]);
  });

  it("returns no segments for an empty run", () => {
    expect(groupIntoAlbums([])).toEqual([]);
  });

  it("keeps run positions on every segment", () => {
    const text: ChatMessage = { from: "them", text: "look", id: "text-1" };
    const segments = groupIntoAlbums([text, photo(), photo(), text]);
    expect(segments).toEqual([
      { kind: "message", message: text, index: 0 },
      expect.objectContaining({ kind: "album", startIndex: 1 }),
      { kind: "message", message: text, index: 3 },
    ]);
  });
});

describe("groupIntoAlbums 60 second window", () => {
  it("keeps photos exactly 60 seconds apart together", () => {
    const segments = groupIntoAlbums([
      photo({ at: secondsAfterTen(0) }),
      photo({ at: secondsAfterTen(ALBUM_WINDOW_MS / 1000) }),
    ]);
    expect(shape(segments)).toEqual(["album:2"]);
  });

  it("splits photos more than 60 seconds apart", () => {
    const segments = groupIntoAlbums([
      photo({ at: secondsAfterTen(0) }),
      photo({ at: secondsAfterTen(30) }),
      photo({ at: secondsAfterTen(91) }),
      photo({ at: secondsAfterTen(120) }),
    ]);
    expect(shape(segments)).toEqual(["album:2", "album:2"]);
  });

  it("measures the window from the previous photo, not the first", () => {
    const segments = groupIntoAlbums([
      photo({ at: secondsAfterTen(0) }),
      photo({ at: secondsAfterTen(50) }),
      photo({ at: secondsAfterTen(100) }),
    ]);
    expect(shape(segments)).toEqual(["album:3"]);
  });

  it("counts photos without `at` as inside the window", () => {
    const segments = groupIntoAlbums([
      photo({ at: secondsAfterTen(0) }),
      photo({ at: undefined, id: undefined, localId: "local-1" }),
      photo({ at: undefined, id: undefined, localId: "local-2" }),
    ]);
    expect(shape(segments)).toEqual(["album:3"]);
  });
});

describe("groupIntoAlbums break-out conditions", () => {
  const breakOuts: [string, Partial<ChatMessage>][] = [
    [
      "a reaction with a count above 0",
      { reactions: [{ key: "love", count: 1, mine: false }] },
    ],
    ["a pin", { pinnedAt: "2026-09-15T10:00:05.000Z" }],
    ["a star", { starred: true }],
    ["a failed send", { status: "failed" }],
    [
      "a reply quote",
      {
        replyTo: {
          id: "quoted",
          snippet: "hi",
          senderName: "Anika",
        } as ChatMessage["replyTo"],
      },
    ],
    ["the forwarded label", { forwarded: true }],
    ["a delete", { deletedAt: "2026-09-15T10:01:00.000Z" }],
  ];

  it.each(breakOuts)("breaks out a photo with %s", (_label, overrides) => {
    const brokenOut = photo(overrides);
    const segments = groupIntoAlbums([photo(), photo(), brokenOut, photo()]);
    expect(shape(segments)).toEqual(["album:2", "message", "message"]);
    expect(segments[1]).toEqual({
      kind: "message",
      message: brokenOut,
      index: 2,
    });
  });

  it("breaks out a photo with a non-empty caption", () => {
    const captioned = photo();
    captioned.attachment = {
      ...(captioned.attachment as object),
      caption: "sunset",
    } as ChatMessage["attachment"];
    expect(canJoinAlbum(captioned)).toBe(false);
    expect(shape(groupIntoAlbums([photo(), captioned, photo()]))).toEqual([
      "message",
      "message",
      "message",
    ]);
  });

  it("keeps a photo whose caption is only whitespace", () => {
    const blankCaption = photo();
    blankCaption.attachment = {
      ...(blankCaption.attachment as object),
      caption: "   ",
    } as ChatMessage["attachment"];
    expect(shape(groupIntoAlbums([photo(), blankCaption]))).toEqual([
      "album:2",
    ]);
  });

  it("keeps a reaction whose count dropped to 0", () => {
    const segments = groupIntoAlbums([
      photo({ reactions: [{ key: "love", count: 0, mine: false }] }),
      photo(),
    ]);
    expect(shape(segments)).toEqual(["album:2"]);
  });

  it("keeps a still-sending photo in the album", () => {
    const segments = groupIntoAlbums([photo(), photo({ status: "sending" })]);
    expect(shape(segments)).toEqual(["album:2"]);
  });
});

describe("groupIntoAlbums exclusions", () => {
  it("never puts a GIF in an album", () => {
    const gif = photo({ kind: "gif", text: "GIF" });
    expect(canJoinAlbum(gif)).toBe(false);
    expect(shape(groupIntoAlbums([photo(), gif, photo()]))).toEqual([
      "message",
      "message",
      "message",
    ]);
  });

  it("never puts a document in an album", () => {
    const documentMessage: ChatMessage = {
      from: "them",
      text: "File",
      kind: "document",
      attachment: {
        url: "https://example.test/file.pdf",
        fileName: "file.pdf",
        mimeType: "application/pdf",
        size: 1200,
      } as unknown as ChatMessage["attachment"],
    };
    expect(canJoinAlbum(documentMessage)).toBe(false);
  });

  it("never puts a restored photo without pixels in an album", () => {
    const restored = photo({ attachment: undefined, status: "sending" });
    expect(canJoinAlbum(restored)).toBe(false);
  });

  it("splits an album on a text message between photos", () => {
    const segments = groupIntoAlbums([
      photo(),
      photo(),
      { from: "them", text: "and these" },
      photo(),
      photo(),
    ]);
    expect(shape(segments)).toEqual(["album:2", "message", "album:2"]);
  });

  it("splits an album when the sender changes", () => {
    const segments = groupIntoAlbums([
      photo({ senderHandle: "anika" }),
      photo({ senderHandle: "anika" }),
      photo({ senderHandle: "jordan" }),
      photo({ senderHandle: "jordan" }),
    ]);
    expect(shape(segments)).toEqual(["album:2", "album:2"]);
  });
});
