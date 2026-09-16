import { describe, it, expect } from "vitest";
import {
  filterStarredMessages,
  type FilterableStarredMessage,
} from "./starredMessagesFilter";

function makeItem(
  overrides: Partial<FilterableStarredMessage>,
): FilterableStarredMessage {
  return {
    id: overrides.id ?? "msg-1",
    conversationId: overrides.conversationId ?? "conv-1",
    snippet: overrides.snippet ?? "Hey, how's it going?",
    sender: overrides.sender ?? {
      handle: "amara",
      displayName: "Amara",
      avatarUrl: null,
    },
    createdAt: overrides.createdAt ?? "2026-01-01T00:00:00.000Z",
    starredAt: overrides.starredAt ?? "2026-01-02T00:00:00.000Z",
    conversationTitle: overrides.conversationTitle ?? "Amara",
    kind: overrides.kind ?? "user",
    attachment: overrides.attachment ?? null,
  };
}

function documentAttachment(
  fileName: string,
  caption?: string,
): FilterableStarredMessage["attachment"] {
  return {
    url: "https://cdn.example.com/lease.pdf",
    fileName,
    byteSize: 240_000,
    contentType: "application/pdf",
    provider: "storage",
    caption: caption ?? null,
  };
}

function imageAttachment(
  caption?: string,
): FilterableStarredMessage["attachment"] {
  return {
    url: "https://cdn.example.com/photo.jpg",
    previewUrl: "https://cdn.example.com/photo-preview.jpg",
    width: 800,
    height: 600,
    provider: "storage",
    caption: caption ?? null,
  };
}

describe("filterStarredMessages", () => {
  it("returns every item for an empty query and the 'all' type", () => {
    const items = [makeItem({ id: "a" }), makeItem({ id: "b" })];
    expect(filterStarredMessages(items, "", "all")).toHaveLength(2);
  });

  it("matches the message body case-insensitively", () => {
    const items = [makeItem({ snippet: "See you at the Pride march!" })];
    expect(filterStarredMessages(items, "PRIDE", "all")).toEqual(items);
    expect(filterStarredMessages(items, "picnic", "all")).toEqual([]);
  });

  it("matches accent-insensitively via NFD normalization", () => {
    const items = [makeItem({ snippet: "Vamos ao café amanhã" })];
    expect(filterStarredMessages(items, "cafe", "all")).toEqual(items);
    expect(filterStarredMessages(items, "café", "all")).toEqual(items);
    expect(filterStarredMessages(items, "amanha", "all")).toEqual(items);
  });

  it("matches the sender display name", () => {
    const items = [
      makeItem({
        snippet: "unrelated text",
        sender: { handle: "zoe", displayName: "Zoë", avatarUrl: null },
      }),
    ];
    expect(filterStarredMessages(items, "zoe", "all")).toEqual(items);
  });

  it("matches the conversation title", () => {
    const items = [
      makeItem({ snippet: "hello", conversationTitle: "QueerPulse Official" }),
    ];
    expect(filterStarredMessages(items, "official", "all")).toEqual(items);
  });

  it("matches a group conversation's title", () => {
    const items = [
      makeItem({
        snippet: "see you there",
        conversationTitle: "Pride Brunch Crew",
      }),
    ];
    expect(filterStarredMessages(items, "brunch", "all")).toEqual(items);
  });

  it("matches an attachment's caption or file name when present", () => {
    const items = [
      makeItem({
        snippet: "Document",
        kind: "document",
        attachment: documentAttachment("lease-agreement.pdf"),
      }),
      makeItem({
        id: "with-caption",
        snippet: "Photo",
        kind: "image",
        attachment: imageAttachment("our first apartment"),
      }),
    ];
    expect(filterStarredMessages(items, "lease", "all")).toEqual([items[0]]);
    expect(filterStarredMessages(items, "apartment", "all")).toEqual([
      items[1],
    ]);
  });

  it("filters to photos by kind (image or gif)", () => {
    const items = [
      makeItem({ id: "photo", kind: "image", attachment: imageAttachment() }),
      makeItem({ id: "gif", kind: "gif", attachment: imageAttachment() }),
      makeItem({ id: "text", kind: "user" }),
      makeItem({ id: "default-kind" }),
    ];
    const result = filterStarredMessages(items, "", "photos");
    expect(result.map((item) => item.id)).toEqual(["photo", "gif"]);
  });

  it("filters to documents by kind", () => {
    const items = [
      makeItem({
        id: "doc",
        kind: "document",
        attachment: documentAttachment("invoice.pdf"),
      }),
      makeItem({ id: "photo", kind: "image", attachment: imageAttachment() }),
    ];
    const result = filterStarredMessages(items, "", "documents");
    expect(result.map((item) => item.id)).toEqual(["doc"]);
  });

  it("filters to links by scanning the snippet for an http(s) URL or a bare www. address", () => {
    const items = [
      makeItem({
        id: "with-link",
        snippet: "Check this out: https://example.com/event",
      }),
      makeItem({ id: "http-link", snippet: "http://example.com is fun" }),
      makeItem({ id: "bare-www", snippet: "see www.example.com for details" }),
      makeItem({ id: "no-link", snippet: "no url here at all" }),
    ];
    const result = filterStarredMessages(items, "", "links");
    expect(result.map((item) => item.id)).toEqual([
      "with-link",
      "http-link",
      "bare-www",
    ]);
  });

  it("matches a PT sender name with a diacritic, accent-insensitively", () => {
    const items = [
      makeItem({
        snippet: "unrelated text",
        sender: { handle: "joao", displayName: "João", avatarUrl: null },
      }),
    ];
    expect(filterStarredMessages(items, "joao", "all")).toEqual(items);
    expect(filterStarredMessages(items, "João", "all")).toEqual(items);
  });

  it("matches a PT chat/group name with a diacritic, accent-insensitively", () => {
    const items = [
      makeItem({
        snippet: "vemo-nos lá",
        conversationTitle: "Conceição",
      }),
    ];
    expect(filterStarredMessages(items, "conceicao", "all")).toEqual(items);
    expect(filterStarredMessages(items, "Conceição", "all")).toEqual(items);
  });

  it("treats a whitespace-only query as no query, returning every item that matches the type", () => {
    const items = [makeItem({ id: "a" }), makeItem({ id: "b" })];
    expect(filterStarredMessages(items, "   ", "all")).toEqual(items);
    expect(filterStarredMessages(items, "\t\n", "all")).toEqual(items);
  });

  it("combines a type filter with a query", () => {
    const items = [
      makeItem({
        id: "match",
        kind: "document",
        attachment: documentAttachment("lease.pdf"),
      }),
      makeItem({
        id: "wrong-type",
        kind: "image",
        attachment: imageAttachment("lease photo"),
      }),
      makeItem({
        id: "wrong-query",
        kind: "document",
        attachment: documentAttachment("invoice.pdf"),
      }),
    ];
    const result = filterStarredMessages(items, "lease", "documents");
    expect(result.map((item) => item.id)).toEqual(["match"]);
  });

  it("returns an empty list when nothing matches", () => {
    const items = [makeItem({ snippet: "hello there" })];
    expect(filterStarredMessages(items, "goodbye", "all")).toEqual([]);
  });
});
