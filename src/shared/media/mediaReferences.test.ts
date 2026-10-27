import { describe, expect, it } from "vitest";
import {
  mediaReferenceHref,
  mediaReferenceLabelKey,
  type MediaReference,
} from "./mediaReferences";

function referenceOf(
  type: MediaReference["type"],
  entityId: string,
): MediaReference {
  return { type, entityId, label: "Quiz", slug: "" };
}

describe("mediaReferenceHref", () => {
  it("links a template question image to its template page", () => {
    expect(
      mediaReferenceHref(referenceOf("quizshow-template-question", "t-1")),
    ).toBe("/admin/quizshow/templates/t-1");
  });

  it("keeps a game question image on the game page", () => {
    expect(
      mediaReferenceHref(referenceOf("quizshow-game-question", "g-1")),
    ).toBe("/play/games/g-1");
  });
});

describe("mediaReferenceLabelKey", () => {
  it("labels it with its own catalog key", () => {
    expect(mediaReferenceLabelKey("quizshow-template-question")).toBe(
      "shared:mediaRef.quizshow-template-question",
    );
  });
});
