import { describe, expect, it } from "vitest";
import type { TFunction } from "../../shared/i18n/types";
import type { HelpSectionData } from "./studioHelp.data";
import {
  filterHelpSections,
  findHelpMatchRanges,
  helpSearchTerms,
} from "./studioHelpSearch";

const copy: Record<string, string> = {
  "q.dispute": "Como contesto uma retirada?",
  "a.dispute": "Escreve uma contestação para a <a>nossa equipa</a>.",
  "q.saving": "How do saving and playlists work?",
  "a.saving": "Save any release and it waits in your <a>library</a>.",
};
const t = ((key: string) => copy[key] ?? key) as TFunction;

const sections: HelpSectionData[] = [
  {
    id: "listening",
    headingKey: "heading.listening",
    items: [{ id: "saving", questionKey: "q.saving", answerKey: "a.saving" }],
  },
  {
    id: "safety",
    headingKey: "heading.safety",
    items: [
      { id: "dispute", questionKey: "q.dispute", answerKey: "a.dispute" },
    ],
  },
];

describe("filterHelpSections", () => {
  it("keeps everything for an empty or blank query", () => {
    expect(filterHelpSections(sections, "   ", t)).toBe(sections);
  });

  it("matches the question, case-blind", () => {
    expect(
      filterHelpSections(sections, "CONTESTO", t).map((section) => section.id),
    ).toEqual(["safety"]);
  });

  it("matches the answer text too", () => {
    expect(
      filterHelpSections(sections, "library", t).map((section) => section.id),
    ).toEqual(["listening"]);
  });

  it("never matches the markup around a link", () => {
    expect(filterHelpSections(sections, "<a>", t)).toEqual([]);
  });

  it("is accent-blind both ways", () => {
    expect(
      filterHelpSections(sections, "contestacao", t)[0]?.items.map(
        (item) => item.id,
      ),
    ).toEqual(["dispute"]);
    expect(filterHelpSections(sections, "equípa", t)).toHaveLength(1);
  });

  it("matches word by word, in any order", () => {
    expect(
      filterHelpSections(sections, "playlists saving", t).map(
        (section) => section.id,
      ),
    ).toEqual(["listening"]);
    expect(filterHelpSections(sections, "saving contesto", t)).toEqual([]);
  });
});

describe("findHelpMatchRanges", () => {
  it("returns ranges in the original text, accent-blind", () => {
    const text = "Como contestação funciona";
    const terms = helpSearchTerms("CONTESTACAO");
    const [range] = findHelpMatchRanges(text, terms);
    expect(range && text.slice(range[0], range[1])).toBe("contestação");
  });

  it("merges overlapping hits and returns none for no terms", () => {
    expect(findHelpMatchRanges("playlist", ["play", "list"])).toEqual([[0, 8]]);
    expect(findHelpMatchRanges("playlist", [])).toEqual([]);
  });
});
