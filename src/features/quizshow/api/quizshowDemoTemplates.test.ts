import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type {
  QuizshowText,
  QuizshowTemplateDetail,
  QuizshowTemplateInput,
} from "../../../shared/contracts/quizshow";
import {
  QUIZSHOW_DEMO_STAFF_NAME,
  QUIZSHOW_DEMO_TEMPLATE_IDS,
} from "../demo/quizshowTemplates.data";
import {
  demoGetQuiz,
  demoImportQuiz,
  resetQuizshowDemoStore,
} from "./quizshowDemoStore";
import { QUIZSHOW_DEMO_LIVE_SLUG } from "./quizshowDemoStore.data";
import { demoCreateGame, demoGetGame } from "./quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "./quizshowDemoGames.data";
import {
  demoCreateTemplate,
  demoDeleteTemplate,
  demoDuplicateTemplate,
  demoGetTemplate,
  demoListTemplates,
  demoPublishTemplate,
  demoPutTemplate,
  demoTemplateCards,
  demoTemplateCopy,
  demoUnpublishTemplate,
} from "./quizshowDemoTemplates";

const CARD_FIELD_NAMES = [
  "description",
  "hasAdultsRounds",
  "id",
  "languages",
  "questionCount",
  "roundCount",
  "title",
];

function refusalOf(action: () => unknown): ApiError {
  try {
    action();
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error("expected a refusal");
}

function dataOf(error: ApiError): Record<string, unknown> {
  return error.data as Record<string, unknown>;
}

/** The PUT body that saves a detail back as it is, with optional changes on top. */
function inputOf(
  detail: QuizshowTemplateDetail,
  changes: Partial<QuizshowTemplateInput> = {},
): QuizshowTemplateInput {
  return {
    card: structuredClone(detail.card),
    staffNotes: detail.staffNotes,
    quiz: {
      title: detail.quiz.title,
      languages: detail.quiz.languages,
      screenLanguage: detail.quiz.screenLanguage,
      rounds: structuredClone(detail.quiz.rounds),
      expectedUpdatedAt: detail.quiz.updatedAt,
    },
    ...changes,
  };
}

describe("quizshow demo templates store", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("seeds five published templates and one draft", () => {
    const rows = demoListTemplates().items;
    expect(rows).toHaveLength(6);
    expect(rows.filter((row) => row.status === "published")).toHaveLength(5);
    expect(rows.filter((row) => row.status === "draft")).toHaveLength(1);
    expect(demoTemplateCards().items).toHaveLength(5);
  });

  it("lists rows drafts first, then published, newest edit first", () => {
    const rows = demoListTemplates().items;
    expect(rows.map((row) => row.id)).toEqual([
      QUIZSHOW_DEMO_TEMPLATE_IDS.queerCinema,
      QUIZSHOW_DEMO_TEMPLATE_IDS.lisbonQueerIcons,
      QUIZSHOW_DEMO_TEMPLATE_IDS.dragHerstory,
      QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
      QUIZSHOW_DEMO_TEMPLATE_IDS.portugueseQueerCulture,
      QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory,
    ]);
    expect(rows[0]).toMatchObject({
      status: "draft",
      roundCount: 1,
      questionCount: 3,
      hasAdultsRounds: false,
      updatedAt: "2026-10-26T15:00:00.000Z",
      updatedByName: QUIZSHOW_DEMO_STAFF_NAME,
      publishedAt: null,
    });
    expect(rows[5]).toMatchObject({
      status: "published",
      publishedAt: "2026-10-20T10:00:00.000Z",
      updatedByName: QUIZSHOW_DEMO_STAFF_NAME,
    });
    for (const row of rows) {
      expect(row.roundCount).toBeGreaterThan(0);
      expect(row.questionCount).toBeGreaterThan(0);
    }
  });

  it("gives hosts the published cards in publish order, with answers left out", () => {
    const cards = demoTemplateCards().items;
    expect(cards.map((card) => card.id)).toEqual([
      QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory,
      QUIZSHOW_DEMO_TEMPLATE_IDS.portugueseQueerCulture,
      QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
      QUIZSHOW_DEMO_TEMPLATE_IDS.dragHerstory,
      QUIZSHOW_DEMO_TEMPLATE_IDS.lisbonQueerIcons,
    ]);
    for (const card of cards) {
      expect(Object.keys(card).sort()).toEqual(CARD_FIELD_NAMES);
    }
    expect(cards[0]?.title.en).toBe("Pride and queer history");
  });

  it("refuses to import a draft with template_not_found", () => {
    const error = refusalOf(() =>
      demoImportQuiz(QUIZSHOW_DEMO_LIVE_SLUG, {
        from: "template",
        templateId: QUIZSHOW_DEMO_TEMPLATE_IDS.queerCinema,
      }),
    );
    expect(error.status).toBe(404);
    expect(dataOf(error).code).toBe("quizshow_template_not_found");
  });

  it("starts a blank draft with the wire defaults", () => {
    const created = demoCreateTemplate();
    expect(created.id).toMatch(/^demo-template-new-\d+$/);
    expect(created.card).toEqual({
      title: { en: "New template", pt: "Novo modelo" },
      description: { en: "", pt: "" },
    });
    expect(created.staffNotes).toBe("");
    expect(created.status).toBe("draft");
    expect(created.publishedAt).toBeNull();
    expect(created.publishedByName).toBeNull();
    expect(created.quiz).toMatchObject({
      title: "New template",
      languages: "both",
      screenLanguage: "en",
      rounds: [],
      sourceTemplateId: null,
    });
    expect(demoListTemplates().items[0]?.id).toBe(created.id);
    expect(demoTemplateCards().items.map((card) => card.id)).not.toContain(
      created.id,
    );
  });

  it("duplicates as a draft with copy titles that fit 120 characters", () => {
    const prideId = QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory;
    const pride = demoGetTemplate(prideId);
    const longTitle = "Q".repeat(118);
    demoPutTemplate(
      prideId,
      inputOf(pride, {
        card: {
          title: { en: longTitle, pt: "" },
          description: pride.card.description,
        },
      }),
    );
    const duplicated = demoDuplicateTemplate(prideId);
    expect(duplicated.id).not.toBe(prideId);
    expect(duplicated.card.title.en).toHaveLength(120);
    expect(duplicated.card.title.en.endsWith(" (copy)")).toBe(true);
    expect(duplicated.card.title.en.startsWith("Q".repeat(113))).toBe(true);
    expect(duplicated.card.title.pt).toBe("");
    expect(duplicated.card.description).toEqual(pride.card.description);
    expect(duplicated.staffNotes).toBe(pride.staffNotes);
    expect(duplicated.staffNotes.length).toBeGreaterThan(0);
    expect(duplicated.status).toBe("draft");
    expect(duplicated.publishedAt).toBeNull();
    expect(duplicated.publishedByName).toBeNull();
    expect(duplicated.quiz.title).toBe(pride.quiz.title);
    expect(duplicated.quiz.rounds).toHaveLength(pride.quiz.rounds.length);
    const lisbonCopy = demoDuplicateTemplate(
      QUIZSHOW_DEMO_TEMPLATE_IDS.lisbonQueerIcons,
    );
    expect(lisbonCopy.card.title.pt.endsWith(" (cópia)")).toBe(true);
  });

  it("copies a 120 character title and a title ending in a space like the backend", () => {
    const prideId = QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory;
    const duplicatedCardTitleOf = (
      titleEn: string,
      titlePt = "",
    ): QuizshowText => {
      const current = demoGetTemplate(prideId);
      demoPutTemplate(
        prideId,
        inputOf(current, {
          card: {
            title: { en: titleEn, pt: titlePt },
            description: current.card.description,
          },
        }),
      );
      return demoDuplicateTemplate(prideId).card.title;
    };
    const fullLength = duplicatedCardTitleOf("Q".repeat(120));
    expect(fullLength.en).toBe(`${"Q".repeat(113)} (copy)`);
    expect(fullLength.en).toHaveLength(120);
    const endsInSpace = duplicatedCardTitleOf(
      `${"Q".repeat(112)} ${"Z".repeat(10)}`,
    );
    expect(endsInSpace.en).toBe(`${"Q".repeat(112)} (copy)`);
    const astralCharacter = String.fromCodePoint(0x1d11e);
    const astral = duplicatedCardTitleOf(astralCharacter.repeat(120));
    expect(Array.from(astral.en)).toHaveLength(120);
    expect(astral.en.startsWith(astralCharacter.repeat(113))).toBe(true);
    expect(duplicatedCardTitleOf("   ", "   ")).toEqual({ en: "", pt: "" });
  });

  it("refuses a stale save with quiz_changed and the current updatedAt", () => {
    const pride = demoGetTemplate(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory);
    const staleInput = inputOf(pride);
    staleInput.quiz.expectedUpdatedAt = "2026-01-01T00:00:00.000Z";
    const error = refusalOf(() =>
      demoPutTemplate(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory, staleInput),
    );
    expect(error.status).toBe(409);
    expect(dataOf(error).code).toBe("quizshow_quiz_changed");
    expect(dataOf(error).updatedAt).toBe(pride.quiz.updatedAt);
  });

  it("refuses a blank quiz title with 400", () => {
    const pride = demoGetTemplate(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory);
    const blankInput = inputOf(pride);
    blankInput.quiz.title = "   ";
    const error = refusalOf(() =>
      demoPutTemplate(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory, blankInput),
    );
    expect(error.status).toBe(400);
    expect(
      demoGetTemplate(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory).quiz.title,
    ).toBe("Pride and queer history");
  });
});

describe("quizshow demo template publishing and host copies", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("refuses to publish the cinema draft with the missing Portuguese description", () => {
    const error = refusalOf(() =>
      demoPublishTemplate(QUIZSHOW_DEMO_TEMPLATE_IDS.queerCinema),
    );
    expect(error.status).toBe(422);
    expect(dataOf(error).code).toBe("quizshow_template_card_incomplete");
    expect(dataOf(error).missing).toEqual(["description.pt"]);
    expect(demoGetTemplate(QUIZSHOW_DEMO_TEMPLATE_IDS.queerCinema).status).toBe(
      "draft",
    );
  });

  it("refuses to publish an empty quiz with quiz_invalid and its problems", () => {
    const created = demoCreateTemplate();
    demoPutTemplate(
      created.id,
      inputOf(created, {
        card: {
          title: created.card.title,
          description: { en: "An empty quiz", pt: "Um quiz vazio" },
        },
      }),
    );
    const error = refusalOf(() => demoPublishTemplate(created.id));
    expect(error.status).toBe(422);
    expect(dataOf(error).code).toBe("quizshow_quiz_invalid");
    const problems = dataOf(error).problems as Array<{ code: string }>;
    expect(problems.map((problem) => problem.code)).toContain("no_rounds");
  });

  it("publishes and unpublishes without moving the quiz's updatedAt", () => {
    const prideId = QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory;
    const before = demoGetTemplate(prideId);
    const unpublished = demoUnpublishTemplate(prideId);
    expect(unpublished.status).toBe("draft");
    expect(unpublished.publishedAt).toBeNull();
    expect(unpublished.publishedByName).toBeNull();
    expect(unpublished.quiz.updatedAt).toBe(before.quiz.updatedAt);
    const published = demoPublishTemplate(prideId);
    expect(published.status).toBe("published");
    expect(published.publishedAt).not.toBeNull();
    expect(published.publishedByName).toBe(QUIZSHOW_DEMO_STAFF_NAME);
    expect(published.quiz.updatedAt).toBe(before.quiz.updatedAt);
    const row = demoListTemplates().items.find(
      (candidate) => candidate.id === prideId,
    );
    expect(row?.updatedAt).toBe(before.quiz.updatedAt);
  });

  it("moves a republished template to the end of the host list", () => {
    const prideId = QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory;
    demoPublishTemplate(prideId);
    const cardIds = demoTemplateCards().items.map((card) => card.id);
    expect(cardIds).toHaveLength(5);
    expect(cardIds[0]).toBe(QUIZSHOW_DEMO_TEMPLATE_IDS.portugueseQueerCulture);
    expect(cardIds[cardIds.length - 1]).toBe(prideId);
  });

  it("keeps a host's copy when its template is edited, unpublished or deleted", () => {
    const prideId = QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory;
    const imported = demoImportQuiz(QUIZSHOW_DEMO_LIVE_SLUG, {
      from: "template",
      templateId: prideId,
    });
    const copy = structuredClone(imported.quiz);
    expect(copy?.sourceTemplateId).toBe(prideId);
    const gameCopy = demoCreateGame({
      title: "Pride game",
      source: { from: "template", templateId: prideId },
    });
    expect(gameCopy.quiz?.sourceTemplateId).toBe(prideId);
    const pride = demoGetTemplate(prideId);
    const editedInput = inputOf(pride);
    editedInput.quiz.title = "Pride history, edited";
    demoPutTemplate(prideId, editedInput);
    demoUnpublishTemplate(prideId);
    expect(demoGetQuiz(QUIZSHOW_DEMO_LIVE_SLUG).quiz).toEqual(copy);
    demoDeleteTemplate(prideId);
    const eventQuiz = demoGetQuiz(QUIZSHOW_DEMO_LIVE_SLUG).quiz;
    expect(eventQuiz).toEqual({ ...copy, sourceTemplateId: null });
    expect(eventQuiz?.title).toBe("Pride and queer history");
    expect(eventQuiz?.rounds).toEqual(copy?.rounds);
    const gameQuiz = demoGetGame(gameCopy.gameId).quiz;
    expect(gameQuiz).toEqual({ ...gameCopy.quiz, sourceTemplateId: null });
    expect(gameQuiz?.rounds).toEqual(gameCopy.quiz?.rounds);
    expect(
      demoGetGame(QUIZSHOW_DEMO_GAME_IDS.flatQuiz).quiz?.sourceTemplateId,
    ).toBe(QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision);
    expect(demoListTemplates().items.some((row) => row.id === prideId)).toBe(
      false,
    );
  });

  it("answers template_not_found for an unknown id", () => {
    const unknownId = "demo-template-unknown";
    const pride = demoGetTemplate(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory);
    const actions: Array<() => unknown> = [
      () => demoGetTemplate(unknownId),
      () => demoPutTemplate(unknownId, inputOf(pride)),
      () => demoDuplicateTemplate(unknownId),
      () => demoPublishTemplate(unknownId),
      () => demoUnpublishTemplate(unknownId),
      () => demoDeleteTemplate(unknownId),
      () => demoTemplateCopy(unknownId),
    ];
    for (const action of actions) {
      const error = refusalOf(action);
      expect(error.status).toBe(404);
      expect(dataOf(error).code).toBe("quizshow_template_not_found");
    }
  });
});
