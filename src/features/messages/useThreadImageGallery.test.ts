import { describe, expect, it } from "vitest";
import {
  collectThreadPhotos,
  findPhotoIndex,
  isViewablePhoto,
} from "./useThreadImageGallery";
import type { ChatMessage } from "./data";

const options = { counterpartName: "Nadia", youLabel: "You" };

function photoMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    from: "them",
    text: "Photo",
    time: "14:32",
    kind: "image",
    attachment: {
      url: "https://cdn.example/a.jpg",
      previewUrl: "https://cdn.example/a-small.jpg",
      width: 800,
      height: 600,
      provider: "upload",
    },
    ...overrides,
  };
}

describe("isViewablePhoto", () => {
  it("accepts an image message with a renderable attachment", () => {
    expect(isViewablePhoto(photoMessage())).toBe(true);
  });

  it("accepts a gif message", () => {
    expect(isViewablePhoto(photoMessage({ kind: "gif" }))).toBe(true);
  });

  it("rejects a text message", () => {
    expect(isViewablePhoto({ from: "me", text: "hello" })).toBe(false);
  });

  it("rejects a document message", () => {
    const document: ChatMessage = {
      from: "me",
      text: "File",
      kind: "document",
      attachment: {
        url: "https://cdn.example/a.pdf",
        fileName: "a.pdf",
        contentType: "application/pdf",
        byteSize: 1024,
        provider: "upload",
      },
    };
    expect(isViewablePhoto(document)).toBe(false);
  });

  it("rejects a deleted photo", () => {
    expect(
      isViewablePhoto(photoMessage({ deletedAt: "2026-09-14T10:00:00Z" })),
    ).toBe(false);
  });

  it("rejects a restored outbox entry whose blob preview was stripped", () => {
    const stripped = photoMessage();
    delete stripped.attachment;
    expect(isViewablePhoto(stripped)).toBe(false);
  });
});

describe("collectThreadPhotos", () => {
  it("returns photos in reading order, carrying day and time labels", () => {
    const older = photoMessage({ id: "m1", time: "09:10" });
    const newer = photoMessage({ id: "m2", time: "14:32" });
    const photos = collectThreadPhotos(
      [
        { day: "Yesterday", items: [older, { from: "me", text: "hi" }] },
        { day: "Today", items: [newer] },
      ],
      options,
    );
    expect(photos.map((photo) => photo.key)).toEqual(["m1", "m2"]);
    expect(photos[0]?.dayLabel).toBe("Yesterday");
    expect(photos[1]?.timeLabel).toBe("14:32");
  });

  it("names the sender: the counterpart for received, the you label for own", () => {
    const received = photoMessage({ id: "m1" });
    const own = photoMessage({ id: "m2", from: "me" });
    const group = photoMessage({ id: "m3", senderName: "Ines" });
    const photos = collectThreadPhotos(
      [{ day: "Today", items: [received, own, group] }],
      options,
    );
    expect(photos.map((photo) => photo.senderName)).toEqual([
      "Nadia",
      "You",
      "Ines",
    ]);
  });

  it("carries the message's own text as alt for a gif", () => {
    const gif = photoMessage({ id: "m1", kind: "gif", text: "A cat waving" });
    const photos = collectThreadPhotos(
      [{ day: "Today", items: [gif] }],
      options,
    );
    expect(photos[0]?.alt).toBe("A cat waving");
  });

  it("leaves alt undefined for an uploaded image", () => {
    const image = photoMessage({ id: "m1" });
    const photos = collectThreadPhotos(
      [{ day: "Today", items: [image] }],
      options,
    );
    expect(photos[0]?.alt).toBeUndefined();
  });

  it("falls back to a 0 size when the attachment has no dimensions", () => {
    const sizeless = photoMessage({ id: "m1" });
    sizeless.attachment = {
      url: "https://cdn.example/a.jpg",
      previewUrl: "",
      width: 0,
      height: 0,
      provider: "upload",
    };
    const photos = collectThreadPhotos(
      [{ day: "Today", items: [sizeless] }],
      options,
    );
    expect(photos[0]?.width).toBe(0);
    expect(photos[0]?.height).toBe(0);
  });

  it("keys a sending optimistic photo by its local id", () => {
    const sending = photoMessage({ localId: "local-1" });
    const photos = collectThreadPhotos(
      [{ day: "Today", items: [sending] }],
      options,
    );
    expect(photos[0]?.key).toBe("local-1");
  });

  it("keeps the same key across the optimistic-to-acked transition", () => {
    const sending = photoMessage({ localId: "local-1" });
    const beforeAck = collectThreadPhotos(
      [{ day: "Today", items: [sending] }],
      options,
    );
    const acked = photoMessage({ localId: "local-1", id: "m1" });
    const afterAck = collectThreadPhotos(
      [{ day: "Today", items: [acked] }],
      options,
    );
    expect(afterAck[0]?.key).toBe(beforeAck[0]?.key);
  });

  it("keys a server-history photo with no local id by its server id", () => {
    const historic = photoMessage({ id: "m1" });
    const photos = collectThreadPhotos(
      [{ day: "Today", items: [historic] }],
      options,
    );
    expect(photos[0]?.key).toBe("m1");
  });

  it("gives a demo photo with neither id a stable positional key", () => {
    const demo = photoMessage();
    const photos = collectThreadPhotos(
      [{ day: "Today", items: [demo] }],
      options,
    );
    expect(photos[0]?.key).toBe("Today-0-https://cdn.example/a.jpg");
  });
});

describe("findPhotoIndex", () => {
  it("finds by server id", () => {
    const first = photoMessage({ id: "m1" });
    const second = photoMessage({ id: "m2" });
    const photos = collectThreadPhotos(
      [{ day: "Today", items: [first, second] }],
      options,
    );
    expect(findPhotoIndex(photos, second)).toBe(1);
  });

  it("finds a demo message with no id by object identity", () => {
    const first = photoMessage();
    const second = photoMessage();
    const photos = collectThreadPhotos(
      [{ day: "Today", items: [first, second] }],
      options,
    );
    expect(findPhotoIndex(photos, second)).toBe(1);
  });

  it("returns -1 for a message that is not in the gallery", () => {
    const photos = collectThreadPhotos(
      [{ day: "Today", items: [photoMessage({ id: "m1" })] }],
      options,
    );
    expect(findPhotoIndex(photos, { from: "me", text: "hello" })).toBe(-1);
  });
});
