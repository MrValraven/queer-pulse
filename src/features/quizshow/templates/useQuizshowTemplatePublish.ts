import { useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  QUIZSHOW_TEMPLATE_CARD_FIELDS,
  type QuizshowLanguageMode,
  type QuizshowTemplateCardField,
  type QuizshowTemplateCardText,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizshowErrorCodeOf, quizshowProblemsOf } from "../api/quizshowErrors";
import {
  usePublishQuizshowTemplate,
  useUnpublishQuizshowTemplate,
} from "../api/useQuizshowTemplates";
import {
  quizshowProblemsFromServer,
  type QuizshowLocalProblem,
} from "../builder/quizshowValidation";
import {
  quizshowTemplateErrorKeyOf,
  quizshowTemplatePublishErrorKeyOf,
} from "./quizshowTemplateErrors";
import {
  missingCardFieldsOf,
  templateCardFieldsOfRefusal,
} from "./quizshowTemplateResponse";

export interface QuizshowTemplatePublishing {
  isPending: boolean;
  /** Why Publish is blocked now: saveFirst, then fixFirst, then the card refusal copy; null when it may run. */
  blockedReasonKey: string | null;
  /** Card fields shown as missing: after a Publish attempt (blocked or refused) until the card fills in. */
  shownMissingFields: readonly QuizshowTemplateCardField[];
  /** Problems from a quiz_invalid or quiz_incomplete refusal, kept while the saved quiz is the one refused
   *  (publish leaves quiz.updatedAt alone, so a save is what retires them). */
  rejectedProblems: readonly QuizshowLocalProblem[];
  /** The last refusal's copy key, for the panel's alert line. */
  errorKey: string | null;
  publish: () => void;
  unpublish: () => void;
}

const SAVE_FIRST_KEY = "quizshow:templates.details.saveFirst";
const FIX_FIRST_KEY = "quizshow:templates.details.fixFirst";
const CARD_INCOMPLETE_KEY = "quizshow:errors.template_card_incomplete";
const PUBLISHED_KEY = "quizshow:templates.published";
const UNPUBLISHED_KEY = "quizshow:templates.unpublished";

const NO_FIELDS: readonly QuizshowTemplateCardField[] = [];
const NO_PROBLEMS: readonly QuizshowLocalProblem[] = [];

/** A card field the server refused, with the text it held then. */
interface RefusedCardField {
  field: QuizshowTemplateCardField;
  text: string;
}

/** The last refused write, kept beside what it answered so edits and saves retire it without an effect. */
interface PublishRefusal {
  errorKey: string;
  savedUpdatedAt: string | null;
  problems: readonly QuizshowLocalProblem[];
  cardFields: readonly RefusedCardField[];
}

function cardTextOf(
  card: QuizshowTemplateCardText,
  field: QuizshowTemplateCardField,
): string {
  const [part, language] = field.split(".") as [
    keyof QuizshowTemplateCardText,
    "en" | "pt",
  ];
  return card[part][language];
}

function refusalOf(
  error: unknown,
  card: QuizshowTemplateCardText,
  savedUpdatedAt: string | null,
): PublishRefusal {
  const code = quizshowErrorCodeOf(error);
  const isQuizRefusal =
    code === "quizshow_quiz_invalid" || code === "quizshow_quiz_incomplete";
  return {
    errorKey: quizshowTemplatePublishErrorKeyOf(error),
    savedUpdatedAt,
    problems: isQuizRefusal
      ? quizshowProblemsFromServer(quizshowProblemsOf(error))
      : NO_PROBLEMS,
    cardFields: templateCardFieldsOfRefusal(error).map((field) => ({
      field,
      text: cardTextOf(card, field),
    })),
  };
}

/** The refused fields whose text is still what the server refused. */
function keptCardFieldsOf(
  refusal: PublishRefusal | null,
  card: QuizshowTemplateCardText,
): QuizshowTemplateCardField[] {
  if (refusal === null) return [];
  return refusal.cardFields
    .filter((refused) => cardTextOf(card, refused.field) === refused.text)
    .map((refused) => refused.field);
}

function keptProblemsOf(
  refusal: PublishRefusal | null,
  savedUpdatedAt: string | null,
): readonly QuizshowLocalProblem[] {
  if (refusal === null || refusal.savedUpdatedAt !== savedUpdatedAt) {
    return NO_PROBLEMS;
  }
  return refusal.problems;
}

/**
 * A refusal's copy stays while what it named stays. One that named nothing
 * (offline, a server problem, a missing template) stays until the next attempt
 * or the next successful save, whichever comes first.
 */
function keptErrorKeyOf(
  refusal: PublishRefusal | null,
  savedUpdatedAt: string | null,
  keptProblems: readonly QuizshowLocalProblem[],
  keptCardFields: readonly QuizshowTemplateCardField[],
): string | null {
  if (refusal === null) return null;
  const hasNamedProblems = refusal.problems.length > 0;
  const hasNamedFields = refusal.cardFields.length > 0;
  if (!hasNamedProblems && !hasNamedFields) {
    return refusal.savedUpdatedAt === savedUpdatedAt ? refusal.errorKey : null;
  }
  if (keptProblems.length > 0 || keptCardFields.length > 0) {
    return refusal.errorKey;
  }
  return null;
}

/** Local and refused fields together, in the server's refusal order. */
function shownFieldsOf(
  hasAttemptedPublish: boolean,
  localMissing: readonly QuizshowTemplateCardField[],
  keptCardFields: readonly QuizshowTemplateCardField[],
): readonly QuizshowTemplateCardField[] {
  const shown = new Set(keptCardFields);
  if (hasAttemptedPublish) {
    for (const field of localMissing) shown.add(field);
  }
  if (shown.size === 0) return NO_FIELDS;
  return QUIZSHOW_TEMPLATE_CARD_FIELDS.filter((field) => shown.has(field));
}

export function useQuizshowTemplatePublish(options: {
  templateId: string | null;
  card: QuizshowTemplateCardText;
  languages: QuizshowLanguageMode;
  savedUpdatedAt: string | null;
  isUnsaved: boolean;
  hasQuizProblems: boolean;
}): QuizshowTemplatePublishing {
  const { templateId, card, languages, savedUpdatedAt, isUnsaved } = options;
  const { t } = useTranslation();
  const { showToast } = useToast();
  const publishTemplate = usePublishQuizshowTemplate();
  const unpublishTemplate = useUnpublishQuizshowTemplate();
  const [hasAttemptedPublish, setHasAttemptedPublish] = useState(false);
  const [refusal, setRefusal] = useState<PublishRefusal | null>(null);

  const isPending = publishTemplate.isPending || unpublishTemplate.isPending;
  const localMissing = missingCardFieldsOf(card, languages);
  let blockedReasonKey: string | null = null;
  if (isUnsaved) blockedReasonKey = SAVE_FIRST_KEY;
  else if (options.hasQuizProblems) blockedReasonKey = FIX_FIRST_KEY;
  else if (localMissing.length > 0) blockedReasonKey = CARD_INCOMPLETE_KEY;

  const keptCardFields = keptCardFieldsOf(refusal, card);
  const rejectedProblems = keptProblemsOf(refusal, savedUpdatedAt);

  async function runPublish(publishedId: string): Promise<void> {
    setRefusal(null);
    try {
      await publishTemplate.mutateAsync(publishedId);
      setHasAttemptedPublish(false);
      showToast(t(PUBLISHED_KEY), "success");
    } catch (error) {
      setRefusal(refusalOf(error, card, savedUpdatedAt));
    }
  }

  async function runUnpublish(unpublishedId: string): Promise<void> {
    setRefusal(null);
    try {
      await unpublishTemplate.mutateAsync(unpublishedId);
      showToast(t(UNPUBLISHED_KEY), "success");
    } catch (error) {
      setRefusal({
        errorKey: quizshowTemplateErrorKeyOf(error),
        savedUpdatedAt,
        problems: NO_PROBLEMS,
        cardFields: [],
      });
    }
  }

  return {
    isPending,
    blockedReasonKey,
    shownMissingFields: shownFieldsOf(
      hasAttemptedPublish,
      localMissing,
      keptCardFields,
    ),
    rejectedProblems,
    errorKey: keptErrorKeyOf(
      refusal,
      savedUpdatedAt,
      rejectedProblems,
      keptCardFields,
    ),
    publish: () => {
      setHasAttemptedPublish(true);
      if (templateId === null || isPending || blockedReasonKey !== null) {
        return;
      }
      void runPublish(templateId);
    },
    unpublish: () => {
      if (templateId === null || isPending) return;
      void runUnpublish(templateId);
    },
  };
}
