import { describe, expect, it } from "vitest";
import { firstLinkIn } from "./api/useForumLinkPreview";
import { forumPostLink } from "./forumPostLink";

const TRACK_ID = "3f0c2a52-8d1e-4c6b-9a57-2b7f1e9d4c10";
const TRACK_URL = `https://queerpulse.com/studio/track?id=${TRACK_ID}`;

describe("forumPostLink", () => {
  it("turns a Studio link paragraph into the card and drops it from the text", () => {
    const link = forumPostLink(["Diogo you'll want this one", TRACK_URL]);
    expect(link.studioTarget).toMatchObject({ kind: "track", id: TRACK_ID });
    expect(link.visibleText).toBe("Diogo you'll want this one");
    expect(link.previewUrl).toBeNull();
  });

  it("keeps the OpenGraph card for an external link", () => {
    const link = forumPostLink(["gig list https://example.org/gigs"]);
    expect(link.studioTarget).toBeNull();
    expect(link.previewUrl).toBe("https://example.org/gigs");
    expect(link.visibleText).toBe("gig list https://example.org/gigs");
  });

  it("shows one card, the Studio one, when a post has both links", () => {
    const link = forumPostLink([
      "gig list https://example.org/gigs",
      `and the song ${TRACK_URL}`,
    ]);
    expect(link.studioTarget?.id).toBe(TRACK_ID);
    expect(link.previewUrl).toBeNull();
  });

  it("keeps a markdown-labelled Studio link in the text", () => {
    const paragraph = `listen to [the track](${TRACK_URL}) tonight`;
    const link = forumPostLink([paragraph]);
    expect(link.visibleText).toBe(paragraph);
    expect(link.studioTarget?.id).toBe(TRACK_ID);
  });
});

describe("firstLinkIn", () => {
  it("never picks a Studio URL for the link preview", () => {
    expect(firstLinkIn([TRACK_URL])).toBeNull();
    expect(
      firstLinkIn([`song ${TRACK_URL} and gigs https://example.org/gigs.`]),
    ).toBe("https://example.org/gigs");
  });

  it("passes over a Studio preview link and an artist page", () => {
    expect(
      firstLinkIn(["https://queerpulse.com/studio/preview/secret-token-123"]),
    ).toBeNull();
    expect(
      firstLinkIn([`https://queerpulse.com/studio/artist?id=${TRACK_ID}`]),
    ).toBeNull();
  });
});
