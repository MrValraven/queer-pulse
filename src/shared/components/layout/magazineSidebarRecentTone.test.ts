import { describe, expect, it } from "vitest";
import type { Editor, Piece } from "../../../features/magazine/data/desk.data";
import type { TranslateOptions } from "../../i18n/types";
import {
  recentToneFor,
  recentWaitingOnText,
} from "./magazineSidebarRecentTone";

function makePiece(overrides: Partial<Piece> = {}): Piece {
  return {
    id: "piece-1",
    title: "A piece",
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Someone",
    editorId: "marta",
    stage: "Edit",
    due: "",
    art: "in",
    issueId: null,
    ...overrides,
  };
}

const EDITORS: Editor[] = [
  { id: "marta", name: "Marta Cruz", initials: "MC", tint: "coral", cap: 7 },
  { id: "sara", name: "Sara Pinheiro", initials: "SP", tint: "jade", cap: 7 },
];

/** Echoes the key and its values, so each case can assert which sentence
 *  was picked and what filled it. */
function echoTranslate(key: string, options?: TranslateOptions): string {
  return options ? `${key} ${JSON.stringify(options)}` : key;
}

describe("recentToneFor", () => {
  it("is writer for a piece with its writer", () => {
    expect(recentToneFor(makePiece({ wait: "writer" }), "marta")).toBe(
      "writer",
    );
  });

  it("is writer for a piece out with the sensitivity reader", () => {
    const piece = makePiece({ stage: "Sensitivity read", wait: "you" });
    expect(recentToneFor(piece, "marta")).toBe("writer");
  });

  it("is you for the viewer's own turn", () => {
    expect(recentToneFor(makePiece({ wait: "you" }), "marta")).toBe("you");
  });

  it("is neutral for another editor's turn and for nobody", () => {
    expect(recentToneFor(makePiece({ wait: "you" }), "sara")).toBe("neutral");
    expect(recentToneFor(makePiece({ stage: "Published" }), "marta")).toBe(
      "neutral",
    );
  });
});

describe("recentWaitingOnText", () => {
  it("reads the viewer's own turn as its own sentence", () => {
    const text = recentWaitingOnText(
      makePiece({ wait: "you" }),
      "marta",
      EDITORS,
      echoTranslate,
    );
    expect(text).toBe("magazine:desk.pieceRow.waitingOnYouAria");
  });

  it("names another editor by first name", () => {
    const text = recentWaitingOnText(
      makePiece({ wait: "you" }),
      "sara",
      EDITORS,
      echoTranslate,
    );
    expect(text).toBe('magazine:desk.pieceRow.waitingOnAria {"who":"Marta"}');
  });

  it("names the reader for a piece at sensitivity read", () => {
    const text = recentWaitingOnText(
      makePiece({ stage: "Sensitivity read", wait: "you" }),
      "marta",
      EDITORS,
      echoTranslate,
    );
    expect(text).toContain("magazine:desk.pieceRow.reader");
  });
});
