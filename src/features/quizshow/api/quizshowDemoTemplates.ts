import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_TEMPLATE_CARD_FIELDS,
  type QuizshowQuiz,
  type QuizshowTemplateCard,
  type QuizshowTemplateCardField,
  type QuizshowTemplateCardText,
  type QuizshowTemplateDetail,
  type QuizshowTemplateInput,
  type QuizshowTemplatePreview,
  type QuizshowTemplateRow,
  type QuizshowTemplateStatus,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";
import {
  quizshowProblemsFor,
  usedLanguagesOf,
} from "../builder/quizshowValidation";
import {
  QUIZSHOW_DEMO_STAFF_NAME,
  QUIZSHOW_DEMO_TEMPLATE_SEEDS,
} from "../demo/quizshowTemplates.data";
import type { QuizshowStoredQuizShape } from "../quizshowNormalise";
import {
  isWheelRoundKind,
  playableRoundCount,
  withWheelSettingsDefaults,
} from "../quizshowWheel";
import {
  demoAssertShape,
  demoBadRequest,
  demoBodyOf,
  demoRefusal,
  hasAdultsRound,
  quizFromInput,
  type DemoQuizBody,
  type DemoQuizCopy,
} from "./quizshowDemoQuizzes";

/**
 * The demo staff store for Pulse Live quiz templates. It seeds itself from the
 * static seeds on first use. A demo edit or delete stays in this tab, and the
 * seeded games and default quizzes keep reading the static seeds as they are.
 */

interface DemoTemplate {
  id: string;
  card: QuizshowTemplateCardText;
  staffNotes: string;
  status: QuizshowTemplateStatus;
  publishedAt: string | null;
  publishedByName: string | null;
  updatedByName: string | null;
  /**
   * Contract 6.25 `content_updated_at`: stamped by a publish and by a save while
   * published; an unpublish keeps it. The detail reads it only while published.
   */
  contentUpdatedAt: string | null;
  changeNote: QuizshowText;
  quiz: QuizshowQuiz;
}

const NEW_TEMPLATE_CARD_TITLE: QuizshowText = {
  en: "New template",
  pt: "Novo modelo",
};
const NEW_TEMPLATE_QUIZ: DemoQuizBody = {
  title: "New template",
  languages: "both",
  screenLanguage: "en",
  rounds: [],
};
const COPY_SUFFIX: QuizshowText = { en: " (copy)", pt: " (cópia)" };
/** Longest change note per language (contract 2.5: 0..300 each, after trim). */
const CHANGE_NOTE_MAX = 300;

// Module scope on purpose: the demo keeps what a tab saved until it reloads.
const templatesById = new Map<string, DemoTemplate>();
let hasSeededTemplates = false;
let templateCounter = 0;
let saveCounter = 0;
// Registered once at module load by the event and game stores; a reset keeps them.
const templateDeletedListeners = new Set<(templateId: string) => void>();

/** Lets a store clear `sourceTemplateId` on its copies when a template is deleted, as the live ON DELETE SET NULL does. */
export function onDemoTemplateDeleted(
  listener: (templateId: string) => void,
): void {
  templateDeletedListeners.add(listener);
}

export function resetQuizshowDemoTemplates(): void {
  templatesById.clear();
  hasSeededTemplates = false;
  templateCounter = 0;
  saveCounter = 0;
}

/** Seeds arrive as stored shapes; quizFromInput runs them through the C2.4 normaliser. */
function buildTemplateQuiz(
  templateId: string,
  body: QuizshowStoredQuizShape,
  updatedAt: string,
): QuizshowQuiz {
  saveCounter += 1;
  return quizFromInput(structuredClone(body), {
    idPrefix: `demo-template-${templateId}-${saveCounter}`,
    updatedAt,
    sourceTemplateId: null,
  });
}

/** Every demo template, seeded on first use after a reset. */
function templates(): Map<string, DemoTemplate> {
  if (!hasSeededTemplates) {
    hasSeededTemplates = true;
    for (const seed of QUIZSHOW_DEMO_TEMPLATE_SEEDS) {
      templatesById.set(seed.id, {
        id: seed.id,
        card: structuredClone(seed.card),
        staffNotes: seed.staffNotes,
        status: seed.status,
        publishedAt: seed.publishedAt,
        publishedByName: seed.publishedByName,
        updatedByName: seed.updatedByName,
        contentUpdatedAt: seed.lastPublishedAt,
        changeNote: { ...seed.changeNote },
        quiz: buildTemplateQuiz(seed.id, seed.quiz, seed.updatedAt),
      });
    }
  }
  return templatesById;
}

function requireTemplate(templateId: string): DemoTemplate {
  const template = templates().get(templateId);
  if (!template) throw demoRefusal(404, "quizshow_template_not_found");
  return template;
}

function questionCountOf(quiz: QuizshowQuiz): number {
  return quiz.rounds.reduce(
    (total, round) => total + round.questions.length,
    0,
  );
}

/** The latest publish of a published template (the content stamp, else the publish date); null for a draft. */
function lastPublishedAtOf(template: DemoTemplate): string | null {
  if (template.publishedAt === null) return null;
  return template.contentUpdatedAt ?? template.publishedAt;
}

function detailOf(template: DemoTemplate): QuizshowTemplateDetail {
  return structuredClone({
    id: template.id,
    card: template.card,
    staffNotes: template.staffNotes,
    status: template.status,
    publishedAt: template.publishedAt,
    publishedByName: template.publishedByName,
    quiz: template.quiz,
    changeNote: template.changeNote,
    lastPublishedAt: lastPublishedAtOf(template),
  });
}

function rowOf(template: DemoTemplate): QuizshowTemplateRow {
  return {
    id: template.id,
    title: { ...template.card.title },
    status: template.status,
    roundCount: playableRoundCount(template.quiz.rounds),
    questionCount: questionCountOf(template.quiz),
    hasAdultsRounds: hasAdultsRound(template.quiz),
    updatedAt: template.quiz.updatedAt,
    updatedByName: template.updatedByName,
    publishedAt: template.publishedAt,
  };
}

function cardOf(template: DemoTemplate): QuizshowTemplateCard {
  return {
    id: template.id,
    title: { ...template.card.title },
    description: { ...template.card.description },
    languages: template.quiz.languages,
    roundCount: playableRoundCount(template.quiz.rounds),
    questionCount: questionCountOf(template.quiz),
    hasAdultsRounds: hasAdultsRound(template.quiz),
    // Cards list published templates only, so the stamp is always set here.
    lastPublishedAt: lastPublishedAtOf(template) ?? "",
  };
}

function addTemplate(
  fields: Omit<DemoTemplate, "id" | "quiz" | "contentUpdatedAt" | "changeNote">,
  quizBody: DemoQuizBody,
): DemoTemplate {
  templateCounter += 1;
  const templateId = `demo-template-new-${templateCounter}`;
  const template: DemoTemplate = {
    ...fields,
    id: templateId,
    contentUpdatedAt: null,
    changeNote: { en: "", pt: "" },
    quiz: buildTemplateQuiz(templateId, quizBody, new Date().toISOString()),
  };
  templates().set(templateId, template);
  return template;
}

/** Drafts first, then published, each newest edit first; among equal times the one added last comes first. */
export function demoListTemplates(): { items: QuizshowTemplateRow[] } {
  const items = [...templates().values()]
    .reverse()
    .sort((first, second) => {
      if (first.status !== second.status) {
        return first.status === "draft" ? -1 : 1;
      }
      return second.quiz.updatedAt.localeCompare(first.quiz.updatedAt);
    })
    .map(rowOf);
  return { items };
}

export function demoCreateTemplate(): QuizshowTemplateDetail {
  const template = addTemplate(
    {
      card: {
        title: { ...NEW_TEMPLATE_CARD_TITLE },
        description: { en: "", pt: "" },
      },
      staffNotes: "",
      status: "draft",
      publishedAt: null,
      publishedByName: null,
      updatedByName: QUIZSHOW_DEMO_STAFF_NAME,
    },
    NEW_TEMPLATE_QUIZ,
  );
  return detailOf(template);
}

export function demoGetTemplate(templateId: string): QuizshowTemplateDetail {
  return detailOf(requireTemplate(templateId));
}

function trimmedTextOf(text: QuizshowText): QuizshowText {
  return { en: text.en.trim(), pt: text.pt.trim() };
}

/** The DTO limit: each trimmed language holds at most 300 characters. */
function assertChangeNoteFits(changeNote: QuizshowText | null): void {
  if (changeNote === null) return;
  for (const language of ["en", "pt"] as const) {
    // class-validator's MaxLength counts code points, so an emoji counts once.
    if (Array.from(changeNote[language]).length > CHANGE_NOTE_MAX) {
      throw demoBadRequest(
        `changeNote.${language} must be shorter than or equal to ${CHANGE_NOTE_MAX} characters`,
      );
    }
  }
}

export function demoPutTemplate(
  templateId: string,
  body: QuizshowTemplateInput,
): QuizshowTemplateDetail {
  const template = requireTemplate(templateId);
  const { expectedUpdatedAt, ...quizInput } = body.quiz;
  if (expectedUpdatedAt !== template.quiz.updatedAt) {
    throw demoRefusal(409, "quizshow_quiz_changed", {
      updatedAt: template.quiz.updatedAt,
      updatedByName: template.updatedByName,
    });
  }
  const card: QuizshowTemplateCardText = {
    title: trimmedTextOf(body.card.title),
    description: trimmedTextOf(body.card.description),
  };
  const quizBody: DemoQuizBody = {
    ...quizInput,
    title: quizInput.title.trim(),
  };
  if (quizBody.title.length === 0) {
    throw demoBadRequest("quiz.title should not be empty");
  }
  // An older staff page may leave the note out; the stored one stays (as live).
  const changeNote: QuizshowText | null =
    body.changeNote === undefined ? null : trimmedTextOf(body.changeNote);
  assertChangeNoteFits(changeNote);
  demoAssertShape(quizBody, {
    isAdultsAllowed: true,
    adultsCode: "quizshow_quiz_invalid",
  });
  template.card = card;
  template.staffNotes = body.staffNotes;
  template.quiz = buildTemplateQuiz(
    templateId,
    quizBody,
    new Date().toISOString(),
  );
  template.updatedByName = QUIZSHOW_DEMO_STAFF_NAME;
  if (changeNote !== null) template.changeNote = changeNote;
  if (template.publishedAt !== null) {
    template.contentUpdatedAt = template.quiz.updatedAt;
  }
  return detailOf(template);
}

/**
 * Mirrors the backend `withCopySuffix`: a blank title stays "", the base is cut
 * by code points so the result fits the card title limit, and the cut base is
 * right-trimmed before the suffix.
 */
function copyTitleOf(title: string, suffix: string): string {
  if (title.trim() === "") return "";
  const room = QUIZSHOW_LIMITS.templateCardTitleMax - suffix.length;
  const base = Array.from(title).slice(0, room).join("").trimEnd();
  return `${base}${suffix}`;
}

export function demoDuplicateTemplate(
  templateId: string,
): QuizshowTemplateDetail {
  const source = requireTemplate(templateId);
  const copy = addTemplate(
    {
      card: {
        title: {
          en: copyTitleOf(source.card.title.en, COPY_SUFFIX.en),
          pt: copyTitleOf(source.card.title.pt, COPY_SUFFIX.pt),
        },
        description: { ...source.card.description },
      },
      staffNotes: source.staffNotes,
      status: "draft",
      publishedAt: null,
      publishedByName: null,
      updatedByName: QUIZSHOW_DEMO_STAFF_NAME,
    },
    demoBodyOf(source.quiz),
  );
  return detailOf(copy);
}

function missingCardFieldsOf(
  template: DemoTemplate,
): QuizshowTemplateCardField[] {
  const usedLanguages = usedLanguagesOf(template.quiz.languages);
  return QUIZSHOW_TEMPLATE_CARD_FIELDS.filter((field) => {
    const [part, language] = field.split(".") as [
      keyof QuizshowTemplateCardText,
      keyof QuizshowText,
    ];
    if (!usedLanguages.includes(language)) return false;
    return template.card[part][language].trim().length === 0;
  });
}

/** Refuses an incomplete card first, then a quiz with problems; publishing again moves the template to the end of the host list. */
export function demoPublishTemplate(
  templateId: string,
): QuizshowTemplateDetail {
  const template = requireTemplate(templateId);
  const missing = missingCardFieldsOf(template);
  if (missing.length > 0) {
    throw demoRefusal(422, "quizshow_template_card_incomplete", { missing });
  }
  const problems = quizshowProblemsFor(demoBodyOf(template.quiz), {
    isAdultsEvent: true,
  });
  if (problems.length > 0) {
    throw demoRefusal(422, "quizshow_quiz_invalid", { problems });
  }
  const publishedAt = new Date().toISOString();
  template.status = "published";
  template.publishedAt = publishedAt;
  template.contentUpdatedAt = publishedAt;
  template.publishedByName = QUIZSHOW_DEMO_STAFF_NAME;
  return detailOf(template);
}

export function demoUnpublishTemplate(
  templateId: string,
): QuizshowTemplateDetail {
  const template = requireTemplate(templateId);
  template.status = "draft";
  template.publishedAt = null;
  template.publishedByName = null;
  return detailOf(template);
}

export function demoDeleteTemplate(templateId: string): void {
  requireTemplate(templateId);
  templates().delete(templateId);
  for (const listener of templateDeletedListeners) listener(templateId);
}

/** Published templates only, in publish order then id, with no questions or answers. */
export function demoTemplateCards(): { items: QuizshowTemplateCard[] } {
  const items = [...templates().values()]
    .filter((template) => template.status === "published")
    .sort(
      (first, second) =>
        (first.publishedAt ?? "").localeCompare(second.publishedAt ?? "") ||
        first.id.localeCompare(second.id),
    )
    .map(cardOf);
  return { items };
}

/**
 * Contract 5.1 template preview: a published template's card and each row's
 * prompts, with no options, answers or notes. A wheel row lists no prompts; a
 * draft or unknown id refuses 404 quizshow_template_not_found.
 */
export function demoTemplatePreview(
  templateId: string,
): QuizshowTemplatePreview {
  const template = templates().get(templateId);
  if (!template || template.status !== "published") {
    throw demoRefusal(404, "quizshow_template_not_found");
  }
  return structuredClone({
    templateId: template.id,
    title: template.card.title,
    description: template.card.description,
    languages: template.quiz.languages,
    rounds: template.quiz.rounds.map((round, roundIndex) => ({
      roundIndex,
      kind: round.kind,
      title: round.title,
      questionCount: round.questions.length,
      // A wheel row's stored slice count (null for Auto) for the round checklist, as the BE reads it.
      sliceCount: isWheelRoundKind(round.kind)
        ? withWheelSettingsDefaults(round.settings).sliceCount
        : null,
      contentLabel: round.contentLabel,
      prompts: isWheelRoundKind(round.kind)
        ? []
        : round.questions.map((question) => question.prompt),
    })),
  });
}

/** A published template as an import source; a draft or unknown id refuses 404 quizshow_template_not_found. */
export function demoTemplateCopy(templateId: string): DemoQuizCopy {
  const template = templates().get(templateId);
  if (!template || template.status !== "published") {
    throw demoRefusal(404, "quizshow_template_not_found");
  }
  return {
    body: structuredClone(demoBodyOf(template.quiz)),
    sourceTemplateId: template.id,
  };
}
