import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type {
  QuizshowQuiz,
  QuizshowTemplateCardText,
  QuizshowTemplateDetail,
} from "../../../shared/contracts/quizshow";
import {
  missingCardFieldsOf,
  quizResponseOfTemplate,
  quizshowCompletenessProblemsOf,
  templateCardFieldsOfRefusal,
  templateCardTitleOf,
  templateMetaOf,
} from "./quizshowTemplateResponse";

const EMPTY_QUIZ: QuizshowQuiz = {
  title: "New template",
  languages: "both",
  screenLanguage: "en",
  sourceTemplateId: null,
  updatedAt: "2026-10-27T10:00:00.000Z",
  rounds: [],
};

const DETAIL: QuizshowTemplateDetail = {
  id: "template-1",
  card: {
    title: { en: "Pride history", pt: "História do Pride" },
    description: {
      en: "Fifty years of marches",
      pt: "Cinquenta anos de marchas",
    },
  },
  staffNotes: "Round 1, question 1: checked",
  status: "published",
  publishedAt: "2026-10-20T10:00:00.000Z",
  publishedByName: "Rui Marçal",
  quiz: EMPTY_QUIZ,
};

const EMPTY_CARD: QuizshowTemplateCardText = {
  title: { en: "", pt: "" },
  description: { en: "", pt: "" },
};

describe("quizshow template response adapter", () => {
  it("adapts a template detail into a builder response with the adults label open", () => {
    const response = quizResponseOfTemplate(DETAIL);

    expect(response.quiz).toBe(EMPTY_QUIZ);
    expect(response.isAdultsEvent).toBe(true);
    expect(response.liveSession).toBeNull();
    expect(response.hasResults).toBe(false);
    expect(response.problems.map((problem) => problem.code)).toEqual([
      "no_rounds",
    ]);
    expect(response.problems).toEqual(
      quizshowCompletenessProblemsOf(EMPTY_QUIZ),
    );
    expect(response.template).toEqual({
      id: "template-1",
      card: DETAIL.card,
      staffNotes: "Round 1, question 1: checked",
      status: "published",
      publishedAt: "2026-10-20T10:00:00.000Z",
      publishedByName: "Rui Marçal",
    });
    expect(templateMetaOf(response)).toEqual(response.template);
    expect(
      templateMetaOf({
        quiz: EMPTY_QUIZ,
        problems: [],
        isAdultsEvent: false,
        liveSession: null,
        hasResults: false,
      }),
    ).toBeNull();
  });

  it("lists the missing card fields for the quiz's languages", () => {
    expect(missingCardFieldsOf(EMPTY_CARD, "both")).toEqual([
      "title.en",
      "title.pt",
      "description.en",
      "description.pt",
    ]);
    expect(missingCardFieldsOf(EMPTY_CARD, "en")).toEqual([
      "title.en",
      "description.en",
    ]);
    expect(missingCardFieldsOf(EMPTY_CARD, "pt")).toEqual([
      "title.pt",
      "description.pt",
    ]);
    const whitespaceCard: QuizshowTemplateCardText = {
      title: { en: "Pride history", pt: "   " },
      description: { en: "\n\t", pt: "Cinquenta anos" },
    };
    expect(missingCardFieldsOf(whitespaceCard, "both")).toEqual([
      "title.pt",
      "description.en",
    ]);
    expect(missingCardFieldsOf(DETAIL.card, "both")).toEqual([]);
  });

  it("titles a card in the viewer's language, else the other", () => {
    const title = { en: "Pride history", pt: "História do Pride" };
    expect(templateCardTitleOf(title, "en")).toBe("Pride history");
    expect(templateCardTitleOf(title, "pt")).toBe("História do Pride");
    expect(templateCardTitleOf({ en: "Eurovision", pt: " " }, "pt")).toBe(
      "Eurovision",
    );
    expect(templateCardTitleOf({ en: "", pt: "Ícones de Lisboa" }, "en")).toBe(
      "Ícones de Lisboa",
    );
    expect(templateCardTitleOf({ en: "", pt: "" }, "en")).toBe("");
  });

  it("reads the missing fields of a card refusal and drops unknown ones", () => {
    const refusal = new ApiError(422, "x", {
      code: "quizshow_template_card_incomplete",
      missing: ["title.pt", "subtitle.en", 7, "description.pt"],
    });
    expect(templateCardFieldsOfRefusal(refusal)).toEqual([
      "title.pt",
      "description.pt",
    ]);
    expect(templateCardFieldsOfRefusal(new ApiError(422, "x"))).toEqual([]);
    expect(
      templateCardFieldsOfRefusal(
        new ApiError(422, "x", { code: "quizshow_quiz_invalid" }),
      ),
    ).toEqual([]);
    expect(templateCardFieldsOfRefusal(new Error("offline"))).toEqual([]);
  });
});
