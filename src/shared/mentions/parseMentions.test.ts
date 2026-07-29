import { describe, it, expect } from "vitest";
import { parseMentions } from "./parseMentions";

describe("parseMentions", () => {
  it("returns a single text segment when there are no tokens", () => {
    expect(parseMentions("just plain text")).toEqual([
      { kind: "text", value: "just plain text" },
    ]);
  });

  it("linkifies a leading @member", () => {
    expect(parseMentions("@ana-costa nice")).toEqual([
      { kind: "member", slug: "ana-costa" },
      { kind: "text", value: " nice" },
    ]);
  });

  it("linkifies a c/community mid-sentence", () => {
    expect(parseMentions("see c/creatives too")).toEqual([
      { kind: "text", value: "see " },
      { kind: "community", slug: "creatives" },
      { kind: "text", value: " too" },
    ]);
  });

  it("handles adjacent member + community tokens", () => {
    expect(parseMentions("@ana c/arts")).toEqual([
      { kind: "member", slug: "ana" },
      { kind: "text", value: " " },
      { kind: "community", slug: "arts" },
    ]);
  });

  it("does NOT match an email address", () => {
    expect(parseMentions("mail me@host.com ok")).toEqual([
      { kind: "text", value: "mail me@host.com ok" },
    ]);
  });

  it("does NOT match a c/ inside a URL path", () => {
    expect(parseMentions("https://x.dev/c/y here")).toEqual([
      { kind: "text", value: "https://x.dev/c/y here" },
    ]);
  });

  it("keeps trailing punctuation as text", () => {
    expect(parseMentions("hi @ana!")).toEqual([
      { kind: "text", value: "hi " },
      { kind: "member", slug: "ana" },
      { kind: "text", value: "!" },
    ]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parseMentions("")).toEqual([]);
  });

  it("linkifies a #topic", () => {
    expect(parseMentions("join #housing now")).toEqual([
      { kind: "text", value: "join " },
      { kind: "topic", slug: "housing" },
      { kind: "text", value: " now" },
    ]);
  });

  it("linkifies a b/business", () => {
    expect(parseMentions("try b/purple-door")).toEqual([
      { kind: "text", value: "try " },
      { kind: "business", slug: "purple-door" },
    ]);
  });

  it("linkifies e/event and t/thread", () => {
    expect(parseMentions("e/pride-picnic see t/intro-thread")).toEqual([
      { kind: "event", slug: "pride-picnic" },
      { kind: "text", value: " see " },
      { kind: "thread", slug: "intro-thread" },
    ]);
  });

  it("does NOT match a # inside a word", () => {
    expect(parseMentions("C#sharp rocks")).toEqual([
      { kind: "text", value: "C#sharp rocks" },
    ]);
  });
});
