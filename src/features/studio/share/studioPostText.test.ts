import { describe, expect, it } from "vitest";
import { findStudioLink } from "./studioLinkTarget";
import {
  draftWithoutStudioLink,
  splitStudioPostText,
  splitStudioSummaryText,
} from "./studioPostText";

const RELEASE_ID = "3f0c2a52-8d1e-4c6b-9a57-2b7f1e9d4c10";
const RELEASE_URL = `https://queerpulse.com/studio/album?id=${RELEASE_ID}`;
const RELEASE_PATH = `/studio/album?id=${RELEASE_ID}`;
const OTHER_TRACK_URL =
  "https://queerpulse.com/studio/track?id=7c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f";

function draftAfterRemove(draft: string): string {
  const match = findStudioLink(draft);
  expect(match).not.toBeNull();
  return draftWithoutStudioLink(draft, match!);
}

describe("splitStudioPostText", () => {
  it("leaves text without a Studio link as written", () => {
    expect(splitStudioPostText("see you Sunday")).toEqual({
      target: null,
      visibleText: "see you Sunday",
    });
  });

  it("takes the link out of the words and returns its target", () => {
    const { target, visibleText } = splitStudioPostText(
      `new one from Coro\n\n${RELEASE_URL}`,
    );
    expect(target).toMatchObject({ kind: "release", id: RELEASE_ID });
    expect(visibleText).toBe("new one from Coro");
  });

  it("returns empty words for a post that is only the link", () => {
    expect(splitStudioPostText(RELEASE_URL).visibleText).toBe("");
  });

  it("keeps a markdown-labelled link whole and still finds the card", () => {
    const text = `listen to [the EP](${RELEASE_URL}) tonight`;
    const { target, visibleText } = splitStudioPostText(text);
    expect(target?.id).toBe(RELEASE_ID);
    expect(visibleText).toBe(text);
  });

  it("collapses a markdown-labelled link to its label on a plain-text surface", () => {
    const text = `listen to [the EP](${RELEASE_URL}) tonight`;
    const { target, visibleText } = splitStudioPostText(text, {
      isMarkdown: false,
    });
    expect(target?.id).toBe(RELEASE_ID);
    expect(visibleText).toBe("listen to the EP tonight");
  });

  it("shows the same plain words the composer's remove control leaves", () => {
    const text = `line one\r\n[the EP](${RELEASE_URL})`;
    expect(splitStudioPostText(text, { isMarkdown: false }).visibleText).toBe(
      draftAfterRemove(text),
    );
  });

  it("returns empty words for a plain-text post holding only an empty-label link", () => {
    expect(
      splitStudioPostText(`([](${RELEASE_URL}))`, { isMarkdown: false })
        .visibleText,
    ).toBe("");
  });

  it("treats a bare link the same on both surfaces", () => {
    const text = `new one from Coro\n\n${RELEASE_URL}`;
    expect(splitStudioPostText(text, { isMarkdown: false })).toEqual(
      splitStudioPostText(text),
    );
  });

  it("ignores a preview link", () => {
    const text = "https://queerpulse.com/studio/preview/abc123";
    expect(splitStudioPostText(text)).toEqual({
      target: null,
      visibleText: text,
    });
  });

  it("reads CRLF line breaks as line feeds", () => {
    expect(
      splitStudioPostText(`new one from Coro\r\n\r\n${RELEASE_URL}`)
        .visibleText,
    ).toBe("new one from Coro");
  });

  it("drops the brackets of a link right after an opening bracket", () => {
    expect(splitStudioPostText(`out now (${RELEASE_URL})`).visibleText).toBe(
      "out now",
    );
  });

  it("matches past a longer run that only starts like the link", () => {
    const { target, visibleText } = splitStudioPostText(
      `(${RELEASE_URL}x) ${RELEASE_URL}`,
    );
    expect(target?.id).toBe(RELEASE_ID);
    expect(visibleText).toBe(`(${RELEASE_URL}x)`);
  });

  it("takes out the first of a repeated link only", () => {
    expect(
      splitStudioPostText(`${RELEASE_URL} and again ${RELEASE_URL}`)
        .visibleText,
    ).toBe(`and again ${RELEASE_URL}`);
  });
});

describe("splitStudioSummaryText", () => {
  it("drops a link the summary cut runs through", () => {
    const { target, visibleText } = splitStudioSummaryText(
      "Sharing this one https://queerpulse.com/studio/alb…",
      RELEASE_PATH,
    );
    expect(target).toMatchObject({ kind: "release", id: RELEASE_ID });
    expect(visibleText).toBe("Sharing this one…");
  });

  it("drops a link the cut ran through inside its scheme", () => {
    expect(
      splitStudioSummaryText("Sharing this one http…", RELEASE_PATH)
        .visibleText,
    ).toBe("Sharing this one…");
  });

  it("keeps the label of a markdown link the cut ran through", () => {
    expect(
      splitStudioSummaryText(
        "listen to [the EP](https://queerpulse.com/stu…",
        RELEASE_PATH,
      ).visibleText,
    ).toBe("listen to the EP…");
  });

  it("keeps the label of a markdown link cut right after its bracket", () => {
    expect(
      splitStudioSummaryText("listen to [the EP](…", RELEASE_PATH).visibleText,
    ).toBe("listen to the EP…");
    expect(
      splitStudioSummaryText("listen to [the EP](h…", RELEASE_PATH).visibleText,
    ).toBe("listen to the EP…");
  });

  it("splits a cut link from a word it is glued to by a bracket", () => {
    expect(
      splitStudioSummaryText("foo(https://queerpulse.com/stu…", RELEASE_PATH)
        .visibleText,
    ).toBe("foo…");
  });

  it("returns empty words when the cut link was the whole summary", () => {
    expect(
      splitStudioSummaryText("https://queerpulse.com/stu…", RELEASE_PATH)
        .visibleText,
    ).toBe("");
  });

  it("keeps a short cut word that only looks like a path", () => {
    expect(splitStudioSummaryText("great /s…", RELEASE_PATH).visibleText).toBe(
      "great /s…",
    );
  });

  it("removes a whole link that fits inside the summary", () => {
    expect(
      splitStudioSummaryText(`Sharing this one ${RELEASE_URL}`, RELEASE_PATH)
        .visibleText,
    ).toBe("Sharing this one");
  });

  it("keeps a whole markdown-labelled link inside the summary", () => {
    const summary = `listen to [the EP](${RELEASE_URL}) tonight`;
    expect(splitStudioSummaryText(summary, RELEASE_PATH).visibleText).toBe(
      summary,
    );
  });

  it("shows the summary as sent when its link is another target", () => {
    const summary = `Sharing this one ${OTHER_TRACK_URL}`;
    expect(splitStudioSummaryText(summary, RELEASE_PATH)).toMatchObject({
      target: { kind: "release", id: RELEASE_ID },
      visibleText: summary,
    });
  });

  it("shows the summary as sent when the server sends null", () => {
    const summary = `Sharing this one ${RELEASE_URL}`;
    expect(splitStudioSummaryText(summary, null)).toEqual({
      target: null,
      visibleText: summary,
    });
  });

  it("reads the summary itself when an older server sends no field", () => {
    expect(
      splitStudioSummaryText(`Sharing this one ${RELEASE_URL}`, undefined)
        .target?.id,
    ).toBe(RELEASE_ID);
  });

  it("keeps a cut tail when the post had no Studio link", () => {
    const summary = "Long post about https://example.org/some-pa…";
    expect(splitStudioSummaryText(summary, null).visibleText).toBe(summary);
  });

  it("keeps a cut word that starts no link", () => {
    const summary = "A long evening of songs and stori…";
    expect(splitStudioSummaryText(summary, RELEASE_PATH).visibleText).toBe(
      summary,
    );
  });
});

describe("draftWithoutStudioLink", () => {
  it("removes a bare link from the draft", () => {
    expect(draftAfterRemove(`listen to this\n\n${RELEASE_URL}`)).toBe(
      "listen to this",
    );
  });

  it("leaves the label of a markdown link", () => {
    expect(draftAfterRemove(`listen to [the EP](${RELEASE_URL}) tonight`)).toBe(
      "listen to the EP tonight",
    );
  });

  it("leaves the label of a markdown link still missing its bracket", () => {
    expect(draftAfterRemove(`listen to [the EP](${RELEASE_URL}`)).toBe(
      "listen to the EP",
    );
  });

  it("reads CRLF line breaks as line feeds in a markdown draft", () => {
    expect(draftAfterRemove(`line one\r\n[the EP](${RELEASE_URL})`)).toBe(
      "line one\nthe EP",
    );
  });

  it("empties a draft left with brackets only", () => {
    expect(draftAfterRemove(`([](${RELEASE_URL}))`)).toBe("");
  });

  it("removes the matched link past a longer markdown run", () => {
    expect(draftAfterRemove(`[EP](${RELEASE_URL}x) and ${RELEASE_URL}`)).toBe(
      `[EP](${RELEASE_URL}x) and`,
    );
  });

  it("removes the first of a repeated markdown link", () => {
    expect(draftAfterRemove(`[EP](${RELEASE_URL}) and ${RELEASE_URL}`)).toBe(
      `EP and ${RELEASE_URL}`,
    );
  });
});
