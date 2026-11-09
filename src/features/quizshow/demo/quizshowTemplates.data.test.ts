import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { defaultRoundSettings } from "../builder/quizshowDraft";
import { quizshowProblemsFor } from "../builder/quizshowValidation";
import {
  isQuizRoundKind,
  isWheelRoundKind,
  playableRoundCount,
  wheelSliceRoundIndexes,
} from "../quizshowWheel";
import {
  QUIZSHOW_DEMO_TEMPLATE_IDS,
  QUIZSHOW_DEMO_TEMPLATE_SEEDS,
  templateSeedById,
} from "./quizshowTemplates.data";
import { QUIZSHOW_DEMO_WHEEL_PACKS } from "./wheelPacks/quizshowDemoWheelPacks.data";

// Relative to the repo root, where Vitest runs. Under jsdom import.meta.url is
// an http URL, which readFileSync cannot open.
const DATA_FILE_PATH = "src/features/quizshow/demo/quizshowTemplates.data.ts";
/** The five original published seeds; the wheel packs follow them. */
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
  it("lists ten published templates in publish order, then the draft", () => {
    expect(QUIZSHOW_DEMO_TEMPLATE_SEEDS.map((seed) => seed.id)).toEqual(
      Object.values(QUIZSHOW_DEMO_TEMPLATE_IDS),
    );
    expect(QUIZSHOW_DEMO_TEMPLATE_SEEDS.map((seed) => seed.status)).toEqual([
      ...Array.from({ length: 10 }, () => "published"),
      "draft",
    ]);
    const publishedAtValues = publishedSeeds().map((seed) => seed.publishedAt);
    expect(publishedAtValues).toEqual([...publishedAtValues].sort());
    expect(new Set(publishedAtValues).size).toBe(10);
  });

  it("keeps every seed's round and question counts and one closing party round", () => {
    for (const templateId of PUBLISHED_TEMPLATE_IDS) {
      const { rounds } = templateSeedById(templateId).quiz;
      const expectedShape = SHAPE_BY_TEMPLATE_ID[templateId];
      if (expectedShape === undefined) {
        throw new Error(`No expected shape for template id ${templateId}`);
      }
      expect(playableRoundCount(rounds)).toBe(expectedShape.roundCount);
      expect(
        rounds.reduce((total, round) => total + round.questions.length, 0),
      ).toBe(expectedShape.questionCount);
      expect(itemAt(rounds, rounds.length - 1).kind).toBe(
        PARTY_ROUND_KIND_BY_TEMPLATE_ID[templateId],
      );
      expect(
        rounds.filter(
          (round) =>
            !isQuizRoundKind(round.kind) && !isWheelRoundKind(round.kind),
        ),
      ).toHaveLength(1);
    }
  });

  it("gives the Lisbon template a pick-a-round wheel over its four rounds", () => {
    const { rounds } = templateSeedById(
      QUIZSHOW_DEMO_TEMPLATE_IDS.lisbonQueerIcons,
    ).quiz;
    expect(rounds[0]).toMatchObject({
      kind: "wheel",
      contentLabel: "none",
      questions: [],
      settings: { wheelPick: "round", sliceCount: null, wheelBonus: 0 },
    });
    expect(wheelSliceRoundIndexes(rounds, 0)).toEqual([1, 2, 3, 4]);
    expect(rounds.slice(1).map((round) => round.settings.wheelBonus)).toEqual([
      0, 500, 0, 500,
    ]);
  });

  it("gives every settings literal all eight fields", () => {
    const expectedKeys = Object.keys(defaultRoundSettings()).sort();
    expect(expectedKeys).toHaveLength(8);
    for (const seed of QUIZSHOW_DEMO_TEMPLATE_SEEDS) {
      for (const round of seed.quiz.rounds) {
        expect(Object.keys(round.settings).sort()).toEqual(expectedKeys);
      }
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
    // Only the five original seeds: the wheel packs carry their own source lines.
    const sourceLineCount = PUBLISHED_TEMPLATE_IDS.map(templateSeedById)
      .flatMap((seed) => seed.staffNotes.split("\n"))
      .filter((line) => sourceLinePattern.test(line)).length;
    expect(sourceLineCount).toBe(83);
    expect(readFileSync(DATA_FILE_PATH, "utf8")).not.toContain("// Source:");
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

const WHEEL_PACK_SHAPE_BY_TEMPLATE_ID: Record<
  string,
  { wheelPick: "round" | "question"; questionCount: number }
> = {
  [QUIZSHOW_DEMO_TEMPLATE_IDS.popDivas]: {
    wheelPick: "round",
    questionCount: 31,
  },
  [QUIZSHOW_DEMO_TEMPLATE_IDS.queerAnthems]: {
    wheelPick: "question",
    questionCount: 28,
  },
  [QUIZSHOW_DEMO_TEMPLATE_IDS.queerTvNight]: {
    wheelPick: "round",
    questionCount: 31,
  },
  [QUIZSHOW_DEMO_TEMPLATE_IDS.screenIcons]: {
    wheelPick: "question",
    questionCount: 28,
  },
  [QUIZSHOW_DEMO_TEMPLATE_IDS.sapphicNight]: {
    wheelPick: "round",
    questionCount: 31,
  },
};
const WHEEL_BONUSES_BY_PICK = {
  round: [500, 500, 1000],
  question: [250, 250, 500],
};
const DASH_PATTERN = /[–—]/;

function wheelPackShape(templateId: string) {
  const expectedShape = WHEEL_PACK_SHAPE_BY_TEMPLATE_ID[templateId];
  if (expectedShape === undefined) {
    throw new Error(
      `No expected wheel pack shape for template id ${templateId}`,
    );
  }
  return expectedShape;
}

describe("quizshow demo wheel packs", () => {
  it("publishes the five wheel packs in pack order after the original seeds", () => {
    expect(QUIZSHOW_DEMO_WHEEL_PACKS.map((wheelPack) => wheelPack.id)).toEqual(
      Object.keys(WHEEL_PACK_SHAPE_BY_TEMPLATE_ID),
    );
    for (const wheelPack of QUIZSHOW_DEMO_WHEEL_PACKS) {
      const seed = templateSeedById(wheelPack.id);
      expect(seed.status).toBe("published");
      expect(seed.updatedAt).toBe(seed.publishedAt);
      expect(seed.quiz).toBe(wheelPack.quiz);
    }
  });

  it("opens every pack with a wheel row over six slices", () => {
    for (const wheelPack of QUIZSHOW_DEMO_WHEEL_PACKS) {
      const { rounds } = wheelPack.quiz;
      expect(rounds[0]).toMatchObject({
        kind: "wheel",
        questions: [],
        settings: {
          wheelPick: wheelPackShape(wheelPack.id).wheelPick,
          sliceCount: null,
        },
      });
      expect(wheelSliceRoundIndexes(rounds, 0)).toEqual([1, 2, 3, 4, 5, 6]);
    }
  });

  it("keeps every pack's question count and wheel bonuses", () => {
    for (const wheelPack of QUIZSHOW_DEMO_WHEEL_PACKS) {
      const { rounds } = wheelPack.quiz;
      const expectedShape = wheelPackShape(wheelPack.id);
      expect(
        rounds.reduce((total, round) => total + round.questions.length, 0),
      ).toBe(expectedShape.questionCount);
      const bonuses = rounds
        .slice(1)
        .map((round) => round.settings.wheelBonus)
        .filter((wheelBonus) => wheelBonus > 0)
        .sort((first, second) => first - second);
      expect(bonuses).toEqual(WHEEL_BONUSES_BY_PICK[expectedShape.wheelPick]);
    }
  });

  it("gives every question exactly one source line in staff notes", () => {
    const sourceLinePrefixPattern = /^Round (\d+), question (\d+): \S/;
    for (const wheelPack of QUIZSHOW_DEMO_WHEEL_PACKS) {
      const expectedPrefixes = wheelPack.quiz.rounds.flatMap(
        (round, roundIndex) =>
          round.questions.map(
            (_question, questionIndex) =>
              `Round ${roundIndex}, question ${questionIndex + 1}`,
          ),
      );
      const notePrefixes = wheelPack.staffNotes.split("\n").map((line) => {
        const lineMatch = sourceLinePrefixPattern.exec(line);
        return lineMatch === null
          ? line
          : `Round ${lineMatch[1]}, question ${lineMatch[2]}`;
      });
      expect(notePrefixes).toEqual(expectedPrefixes);
    }
  });

  it("holds no media and no long dashes", () => {
    for (const wheelPack of QUIZSHOW_DEMO_WHEEL_PACKS) {
      const questions = wheelPack.quiz.rounds.flatMap(
        (round) => round.questions,
      );
      expect(
        questions.filter((question) => question.mediaRef !== null),
      ).toEqual([]);
      expect(JSON.stringify(wheelPack)).not.toMatch(DASH_PATTERN);
    }
  });
});
