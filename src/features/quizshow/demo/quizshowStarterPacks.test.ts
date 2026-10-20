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
} as const;

function itemAt<Item>(items: readonly Item[], itemIndex: number): Item {
  const item = items[itemIndex];
  if (item === undefined) {
    throw new Error(`No item at index ${itemIndex}`);
  }
  return item;
}

describe("quizshow starter packs", () => {
  it("lists the four packs in key order", () => {
    expect(QUIZSHOW_STARTER_PACKS.map((pack) => pack.key)).toEqual([
      ...QUIZSHOW_STARTER_PACK_KEYS,
    ]);
    for (const key of QUIZSHOW_STARTER_PACK_KEYS) {
      expect(starterPackByKey(key).key).toBe(key);
    }
  });

  it("gives every pack three rounds, fifteen questions and one party round", () => {
    for (const pack of QUIZSHOW_STARTER_PACKS) {
      const { rounds } = pack.quiz;
      expect(rounds).toHaveLength(3);
      expect(
        rounds.reduce((total, round) => total + round.questions.length, 0),
      ).toBe(15);
      expect(itemAt(rounds, 2).kind).toBe(
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
