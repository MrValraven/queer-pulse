import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { QUIZSHOW_STARTER_PACK_KEYS } from "../../../shared/contracts/quizshow";
import { quizshowProblemsFor } from "../builder/quizshowValidation";
import {
  QUIZSHOW_STARTER_PACKS,
  starterPackByKey,
} from "./quizshowStarterPacks.data";

const BACKEND_PACKS_PATH =
  "../queerpulse-backend/src/quizshow/quizshow-starter-packs.ts";
const PARTY_ROUND_KIND_BY_PACK_KEY = {
  pride_history: "lie_detector",
  portuguese_queer_culture: "lie_detector",
  eurovision: "lie_detector",
  drag_herstory: "drag_name",
  lisbon_queer_icons: "lie_detector",
} as const;
const SHAPE_BY_PACK_KEY = {
  pride_history: { roundCount: 3, questionCount: 15 },
  portuguese_queer_culture: { roundCount: 3, questionCount: 15 },
  eurovision: { roundCount: 3, questionCount: 15 },
  drag_herstory: { roundCount: 3, questionCount: 15 },
  lisbon_queer_icons: { roundCount: 4, questionCount: 23 },
} as const;

function itemAt<Item>(items: readonly Item[], itemIndex: number): Item {
  const item = items[itemIndex];
  if (item === undefined) {
    throw new Error(`No item at index ${itemIndex}`);
  }
  return item;
}

describe("quizshow starter packs", () => {
  it("lists the packs in key order", () => {
    expect(QUIZSHOW_STARTER_PACKS.map((pack) => pack.key)).toEqual([
      ...QUIZSHOW_STARTER_PACK_KEYS,
    ]);
    for (const key of QUIZSHOW_STARTER_PACK_KEYS) {
      expect(starterPackByKey(key).key).toBe(key);
    }
  });

  it("gives every pack its round and question counts and one closing party round", () => {
    for (const pack of QUIZSHOW_STARTER_PACKS) {
      const { rounds } = pack.quiz;
      const expectedShape = SHAPE_BY_PACK_KEY[pack.key];
      expect(rounds).toHaveLength(expectedShape.roundCount);
      expect(
        rounds.reduce((total, round) => total + round.questions.length, 0),
      ).toBe(expectedShape.questionCount);
      expect(itemAt(rounds, rounds.length - 1).kind).toBe(
        PARTY_ROUND_KIND_BY_PACK_KEY[pack.key],
      );
      expect(rounds.filter((round) => round.kind !== "quiz")).toHaveLength(1);
    }
  });

  it("passes the local structural and completeness checks", () => {
    for (const pack of QUIZSHOW_STARTER_PACKS) {
      expect(quizshowProblemsFor(pack.quiz, { isAdultsEvent: false })).toEqual(
        [],
      );
    }
  });

  it("holds no adults round and no picture", () => {
    for (const pack of QUIZSHOW_STARTER_PACKS) {
      for (const round of pack.quiz.rounds) {
        expect(round.contentLabel).toBe("none");
        for (const question of round.questions) {
          expect(question.mediaRef).toBeNull();
        }
      }
    }
  });

  it.skipIf(!existsSync(BACKEND_PACKS_PATH))(
    "matches the backend copy word for word",
    () => {
      const backendSource = readFileSync(BACKEND_PACKS_PATH, "utf8");
      for (const pack of QUIZSHOW_STARTER_PACKS) {
        for (const round of pack.quiz.rounds) {
          for (const question of round.questions) {
            expect(backendSource).toContain(question.prompt.en);
            expect(backendSource).toContain(question.prompt.pt);
          }
        }
      }
    },
  );
});
