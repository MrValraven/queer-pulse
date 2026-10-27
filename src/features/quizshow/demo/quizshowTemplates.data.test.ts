import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { quizshowProblemsFor } from "../builder/quizshowValidation";
import {
  QUIZSHOW_DEMO_TEMPLATE_IDS,
  QUIZSHOW_DEMO_TEMPLATE_SEEDS,
  templateSeedById,
} from "./quizshowTemplates.data";

const DATA_FILE_URL = new URL("./quizshowTemplates.data.ts", import.meta.url);
const PUBLISHED_TEMPLATE_IDS = [
  QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory,
  QUIZSHOW_DEMO_TEMPLATE_IDS.portugueseQueerCulture,
  QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
  QUIZSHOW_DEMO_TEMPLATE_IDS.dragHerstory,
  QUIZSHOW_DEMO_TEMPLATE_IDS.lisbonQueerIcons,
];
const PARTY_ROUND_KIND_BY_TEMPLATE_ID: Record<string, string> = {
  [QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory]: "lie_detector",
  [QUIZSHOW_DEMO_TEMPLATE_IDS.portugueseQueerCulture]: "lie_detector",
  [QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision]: "lie_detector",
  [QUIZSHOW_DEMO_TEMPLATE_IDS.dragHerstory]: "drag_name",
  [QUIZSHOW_DEMO_TEMPLATE_IDS.lisbonQueerIcons]: "lie_detector",
};
const SHAPE_BY_TEMPLATE_ID: Record<
  string,
  { roundCount: number; questionCount: number }
> = {
  [QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory]: {
    roundCount: 3,
    questionCount: 15,
  },
  [QUIZSHOW_DEMO_TEMPLATE_IDS.portugueseQueerCulture]: {
    roundCount: 3,
    questionCount: 15,
  },
  [QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision]: { roundCount: 3, questionCount: 15 },
  [QUIZSHOW_DEMO_TEMPLATE_IDS.dragHerstory]: {
    roundCount: 3,
    questionCount: 15,
  },
  [QUIZSHOW_DEMO_TEMPLATE_IDS.lisbonQueerIcons]: {
    roundCount: 4,
    questionCount: 23,
  },
};

function publishedSeeds() {
  return QUIZSHOW_DEMO_TEMPLATE_SEEDS.filter(
    (seed) => seed.status === "published",
  );
}

function itemAt<Item>(items: readonly Item[], itemIndex: number): Item {
  const item = items[itemIndex];
  if (item === undefined) {
    throw new Error(`No item at index ${itemIndex}`);
  }
  return item;
}

describe("quizshow demo templates", () => {
  it("lists five published templates in publish order, then the draft", () => {
    expect(QUIZSHOW_DEMO_TEMPLATE_SEEDS.map((seed) => seed.id)).toEqual(
      Object.values(QUIZSHOW_DEMO_TEMPLATE_IDS),
    );
    expect(QUIZSHOW_DEMO_TEMPLATE_SEEDS.map((seed) => seed.status)).toEqual([
      "published",
      "published",
      "published",
      "published",
      "published",
      "draft",
    ]);
    const publishedAtValues = publishedSeeds().map((seed) => seed.publishedAt);
    expect(publishedAtValues).toEqual([...publishedAtValues].sort());
    expect(new Set(publishedAtValues).size).toBe(5);
  });

  it("keeps every seed's round and question counts and one closing party round", () => {
    for (const templateId of PUBLISHED_TEMPLATE_IDS) {
      const { rounds } = templateSeedById(templateId).quiz;
      const expectedShape = SHAPE_BY_TEMPLATE_ID[templateId];
      if (expectedShape === undefined) {
        throw new Error(`No expected shape for template id ${templateId}`);
      }
      expect(rounds).toHaveLength(expectedShape.roundCount);
      expect(
        rounds.reduce((total, round) => total + round.questions.length, 0),
      ).toBe(expectedShape.questionCount);
      expect(itemAt(rounds, rounds.length - 1).kind).toBe(
        PARTY_ROUND_KIND_BY_TEMPLATE_ID[templateId],
      );
      expect(rounds.filter((round) => round.kind !== "quiz")).toHaveLength(1);
    }
  });

  it("passes the local checks for every published seed", () => {
    for (const seed of publishedSeeds()) {
      expect(quizshowProblemsFor(seed.quiz, { isAdultsEvent: true })).toEqual(
        [],
      );
    }
  });

  it("moves all 83 source comments into staff notes", () => {
    const sourceLinePattern = /^Round \d+, question \d+: \S/;
    const sourceLineCount = publishedSeeds()
      .flatMap((seed) => seed.staffNotes.split("\n"))
      .filter((line) => sourceLinePattern.test(line)).length;
    expect(sourceLineCount).toBe(83);
    expect(readFileSync(DATA_FILE_URL, "utf8")).not.toContain("// Source:");
  });

  it("leaves the draft's Portuguese description empty", () => {
    const draftSeed = templateSeedById(QUIZSHOW_DEMO_TEMPLATE_IDS.queerCinema);
    expect(draftSeed.status).toBe("draft");
    expect(draftSeed.card.description.pt).toBe("");
    expect(draftSeed.card.description.en).not.toBe("");
  });

  it("finds a seed by id and throws on an unknown one", () => {
    for (const seed of QUIZSHOW_DEMO_TEMPLATE_SEEDS) {
      expect(templateSeedById(seed.id)).toBe(seed);
    }
    expect(() => templateSeedById("unknown-template-id")).toThrow(Error);
  });
});
