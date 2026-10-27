import { ApiError } from "../../../shared/api/client";
import {
  QUIZSHOW_TEMPLATE_CARD_FIELDS,
  type QuizshowLanguage,
  type QuizshowLanguageMode,
  type QuizshowQuiz,
  type QuizshowQuizProblem,
  type QuizshowQuizResponse,
  type QuizshowTemplateCardField,
  type QuizshowTemplateCardText,
  type QuizshowTemplateDetail,
  type QuizshowTemplateStatus,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";
import {
  isStructuralProblem,
  quizshowProblemsFor,
  usedLanguagesOf,
  type QuizshowLocalProblem,
} from "../builder/quizshowValidation";

/** What the builder knows about a template beyond its quiz. */
export interface QuizshowTemplateMeta {
  id: string;
  card: QuizshowTemplateCardText;
  staffNotes: string;
  status: QuizshowTemplateStatus;
  publishedAt: string | null;
  publishedByName: string | null;
}

/** A template read as the builder's quiz response, with its card and notes beside it. */
export interface QuizshowTemplateQuizResponse extends QuizshowQuizResponse {
  quiz: QuizshowQuiz;
  template: QuizshowTemplateMeta;
}

/** The template fields a template save sends beside the quiz. */
export interface QuizshowTemplateFields {
  card: QuizshowTemplateCardText;
  staffNotes: string;
}

/** Each card field names the text and the language it reads. */
const CARD_FIELD_PARTS: Record<
  QuizshowTemplateCardField,
  { part: keyof QuizshowTemplateCardText; language: QuizshowLanguage }
> = {
  "title.en": { part: "title", language: "en" },
  "title.pt": { part: "title", language: "pt" },
  "description.en": { part: "description", language: "en" },
  "description.pt": { part: "description", language: "pt" },
};

const KNOWN_CARD_FIELDS: ReadonlySet<string> = new Set(
  QUIZSHOW_TEMPLATE_CARD_FIELDS,
);

function isServerProblem(
  problem: QuizshowLocalProblem,
): problem is QuizshowQuizProblem {
  return problem.code !== "adults_round_needs_adults_event";
}

/** The completeness problems the server lists for a saved quiz; structural ones never get saved. */
export function quizshowCompletenessProblemsOf(
  quiz: QuizshowQuiz,
): QuizshowQuizProblem[] {
  const body = {
    title: quiz.title,
    languages: quiz.languages,
    screenLanguage: quiz.screenLanguage,
    rounds: quiz.rounds,
  };
  return quizshowProblemsFor(body, { isAdultsEvent: true })
    .filter((problem) => !isStructuralProblem(problem.code))
    .filter(isServerProblem);
}

/**
 * A template detail as the builder's quiz response. The adults label is always
 * selectable on a template, and a template never has a session or results.
 */
export function quizResponseOfTemplate(
  detail: QuizshowTemplateDetail,
): QuizshowTemplateQuizResponse {
  return {
    quiz: detail.quiz,
    problems: quizshowCompletenessProblemsOf(detail.quiz),
    isAdultsEvent: true,
    liveSession: null,
    hasResults: false,
    template: {
      id: detail.id,
      card: detail.card,
      staffNotes: detail.staffNotes,
      status: detail.status,
      publishedAt: detail.publishedAt,
      publishedByName: detail.publishedByName,
    },
  };
}

/** The template part of a builder response, or null for an event or a game. */
export function templateMetaOf(
  response: QuizshowQuizResponse,
): QuizshowTemplateMeta | null {
  if (!("template" in response)) return null;
  const { template } = response;
  if (typeof template !== "object" || template === null) return null;
  return template as QuizshowTemplateMeta;
}

/** The card fields still blank in the languages the quiz uses, in refusal order. */
export function missingCardFieldsOf(
  card: QuizshowTemplateCardText,
  languages: QuizshowLanguageMode,
): QuizshowTemplateCardField[] {
  const usedLanguages = usedLanguagesOf(languages);
  return QUIZSHOW_TEMPLATE_CARD_FIELDS.filter((field) => {
    const { part, language } = CARD_FIELD_PARTS[field];
    return (
      usedLanguages.includes(language) && card[part][language].trim() === ""
    );
  });
}

/** The card title in the viewer's language, else the other language, else "". */
export function templateCardTitleOf(
  title: QuizshowText,
  language: QuizshowLanguage,
): string {
  const otherLanguage: QuizshowLanguage = language === "en" ? "pt" : "en";
  const viewerTitle = title[language].trim();
  if (viewerTitle !== "") return viewerTitle;
  return title[otherLanguage].trim();
}

/** The known card fields a card refusal lists under `missing`; unknown entries drop out. */
export function templateCardFieldsOfRefusal(
  error: unknown,
): QuizshowTemplateCardField[] {
  if (!(error instanceof ApiError)) return [];
  const { data } = error;
  if (typeof data !== "object" || data === null) return [];
  const missing = (data as { missing?: unknown }).missing;
  if (!Array.isArray(missing)) return [];
  return missing.filter(
    (field): field is QuizshowTemplateCardField =>
      typeof field === "string" && KNOWN_CARD_FIELDS.has(field),
  );
}
