import { describe, expect, it } from "vitest";
import { parseGuideBody } from "./guideBody.model";

describe("parseGuideBody", () => {
  it("splits paragraphs on blank lines", () => {
    expect(parseGuideBody("First one.\n\n\nSecond one.")).toEqual([
      { kind: "paragraph", inlines: [{ kind: "text", text: "First one." }] },
      { kind: "paragraph", inlines: [{ kind: "text", text: "Second one." }] },
    ]);
  });

  it("joins wrapped lines with a space", () => {
    expect(parseGuideBody("Bring the games\n  early on the day.")).toEqual([
      {
        kind: "paragraph",
        inlines: [{ kind: "text", text: "Bring the games early on the day." }],
      },
    ]);
  });

  it("groups dash lines into one list", () => {
    expect(parseGuideBody("- Dice\n- Cards\n  - Timer")).toEqual([
      {
        kind: "list",
        items: [
          [{ kind: "text", text: "Dice" }],
          [{ kind: "text", text: "Cards" }],
          [{ kind: "text", text: "Timer" }],
        ],
      },
    ]);
  });

  it("starts a paragraph after a list", () => {
    expect(parseGuideBody("Pack:\n- Dice\n- Cards\nThen set up.")).toEqual([
      { kind: "paragraph", inlines: [{ kind: "text", text: "Pack:" }] },
      {
        kind: "list",
        items: [
          [{ kind: "text", text: "Dice" }],
          [{ kind: "text", text: "Cards" }],
        ],
      },
      { kind: "paragraph", inlines: [{ kind: "text", text: "Then set up." }] },
    ]);
  });

  it("turns [label](/path) into a link", () => {
    expect(
      parseGuideBody("Post it on [the events page](/events) today."),
    ).toEqual([
      {
        kind: "paragraph",
        inlines: [
          { kind: "text", text: "Post it on " },
          { kind: "link", label: "the events page", path: "/events" },
          { kind: "text", text: " today." },
        ],
      },
    ]);
    expect(parseGuideBody("- See [venues](/admin/leads?type=venue)")).toEqual([
      {
        kind: "list",
        items: [
          [
            { kind: "text", text: "See " },
            { kind: "link", label: "venues", path: "/admin/leads?type=venue" },
          ],
        ],
      },
    ]);
  });

  it("keeps [label](https://example.com) as text", () => {
    expect(parseGuideBody("Read [this](https://example.com) first.")).toEqual([
      {
        kind: "paragraph",
        inlines: [
          { kind: "text", text: "Read [this](https://example.com) first." },
        ],
      },
    ]);
  });

  it("keeps [label](//host/path) as text", () => {
    expect(parseGuideBody("Go to [here](//evil.example/x) now.")).toEqual([
      {
        kind: "paragraph",
        inlines: [
          { kind: "text", text: "Go to [here](//evil.example/x) now." },
        ],
      },
    ]);
  });

  it("never reads HTML", () => {
    const html = '<b>Bold</b> <a href="/x">link</a> <script>alert(1)</script>';
    expect(parseGuideBody(html)).toEqual([
      { kind: "paragraph", inlines: [{ kind: "text", text: html }] },
    ]);
  });

  it("answers no blocks for an empty body", () => {
    expect(parseGuideBody("")).toEqual([]);
    expect(parseGuideBody("\n\n  \n")).toEqual([]);
  });
});
