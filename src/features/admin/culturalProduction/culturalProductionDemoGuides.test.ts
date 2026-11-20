import { describe, expect, it } from "vitest";
import { DEMO_CULTURAL_GUIDES } from "./culturalGuidesDemo.data";
import type { DemoCulturalGuide } from "./culturalProductionDemo.data";
import { normalizeCulturalGuideSections } from "./culturalProductionDemoRules";

const guideOf = (id: string): DemoCulturalGuide => {
  const guide = DEMO_CULTURAL_GUIDES.find((candidate) => candidate.id === id);
  if (!guide) throw new Error(`no seeded guide ${id}`);
  return guide;
};

const offsetsOf = (guide: DemoCulturalGuide): (number | null)[] =>
  guide.sections.flatMap((section) =>
    section.steps.map((step) => step.daysBefore),
  );

const stepCountOf = (guide: DemoCulturalGuide): number =>
  guide.sections.reduce((total, section) => total + section.steps.length, 0);

describe("culturalGuidesDemo.data", () => {
  it("seeds four guides, two per language", () => {
    expect(DEMO_CULTURAL_GUIDES.map((guide) => guide.id)).toEqual([
      "demo-guide-board-games-en",
      "demo-guide-board-games-pt",
      "demo-guide-quiz-en",
      "demo-guide-quiz-pt",
    ]);
    const localeCount = (locale: string) =>
      DEMO_CULTURAL_GUIDES.filter((guide) => guide.locale === locale).length;
    expect(localeCount("en")).toBe(2);
    expect(localeCount("pt")).toBe(2);
    for (const guide of DEMO_CULTURAL_GUIDES) {
      expect(guide.sections).toHaveLength(7);
    }
  });

  it("keeps the EN and PT step offsets of each guide identical", () => {
    expect(offsetsOf(guideOf("demo-guide-board-games-pt"))).toEqual(
      offsetsOf(guideOf("demo-guide-board-games-en")),
    );
    expect(offsetsOf(guideOf("demo-guide-quiz-pt"))).toEqual(
      offsetsOf(guideOf("demo-guide-quiz-en")),
    );
  });

  it("counts 20 board game steps and 18 quiz steps", () => {
    expect(stepCountOf(guideOf("demo-guide-board-games-en"))).toBe(20);
    expect(stepCountOf(guideOf("demo-guide-board-games-pt"))).toBe(20);
    expect(stepCountOf(guideOf("demo-guide-quiz-en"))).toBe(18);
    expect(stepCountOf(guideOf("demo-guide-quiz-pt"))).toBe(18);
  });

  it("carries the quiz templates link in the quiz questions section", () => {
    const english = guideOf("demo-guide-quiz-en").sections[2];
    const portuguese = guideOf("demo-guide-quiz-pt").sections[2];
    expect(english?.heading).toBe("Questions");
    expect(english?.body).toContain(
      "[Quiz templates](/admin/quizshow/templates)",
    );
    expect(portuguese?.heading).toBe("Perguntas");
    expect(portuguese?.body).toContain(
      "[Modelos de quiz](/admin/quizshow/templates)",
    );
  });

  it("numbers section and step ids from one", () => {
    const quiz = guideOf("demo-guide-quiz-en");
    expect(quiz.sections[0]?.id).toBe("demo-guide-quiz-en-s1");
    expect(quiz.sections[2]?.steps[1]?.id).toBe("demo-guide-quiz-en-s3-2");
  });

  it("passes every seeded body and step through the store's own section rules", () => {
    const makeId = () => {
      throw new Error("a seeded id was replaced");
    };
    for (const guide of DEMO_CULTURAL_GUIDES) {
      expect(normalizeCulturalGuideSections(guide.sections, makeId)).toEqual(
        guide.sections,
      );
    }
  });
});
