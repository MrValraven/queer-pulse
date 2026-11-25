import { ApiError } from "../../../shared/api/client";
import {
  QUIZ_BADGE_DESCRIPTION_MAX_LENGTH,
  QUIZ_BADGE_NAME_MAX_LENGTH,
  QUIZ_BADGE_RARITIES,
  QUIZ_BADGE_TINTS,
  type QuizBadgeDefinitionDTO,
  type QuizBadgeRarity,
  type QuizBadgeText,
  type QuizBadgeTint,
} from "../../../shared/contracts/quizWinBadges";
import {
  isCommunityBadgeIconKey,
  type CommunityBadgeIconKey,
} from "../../communities/badges/communityBadges.catalog";
import type { QuizBadgePreviewInput } from "../../members/quizBadges";
import { quizWinBadgeReasonOf } from "../../quizshow/winBadges/quizWinBadgeErrors";
import { quizBadgeCodePointLength } from "../../quizshow/winBadges/quizWinBadgeText";
import type {
  QuizBadgeCreateBody,
  QuizBadgeUpdateBody,
} from "./api/quizBadgesAdmin.api";

/**
 * The create and edit form of a quiz badge, as plain data. Each text stays
 * what the admin typed until it is sent, so trimming never moves the cursor.
 */
export interface QuizBadgeDraft {
  nameEn: string;
  namePt: string;
  descriptionEn: string;
  descriptionPt: string;
  iconKey: CommunityBadgeIconKey;
  tint: QuizBadgeTint;
  rarity: QuizBadgeRarity;
}

/** The form fields a refusal can point at. */
export type QuizBadgeFormField =
  | "nameEn"
  | "namePt"
  | "descriptionEn"
  | "descriptionPt"
  | "iconKey"
  | "tint"
  | "rarity";

export type QuizBadgeDraftProblemCode =
  | "quiz_badge_name_required"
  | "quiz_badge_name_too_long"
  | "quiz_badge_description_required"
  | "quiz_badge_description_too_long";

export interface QuizBadgeDraftProblem {
  code: QuizBadgeDraftProblemCode;
  field: QuizBadgeFormField;
  language: "en" | "pt";
}

export function isQuizBadgeTint(tint: string): tint is QuizBadgeTint {
  return (QUIZ_BADGE_TINTS as readonly string[]).includes(tint);
}

function isQuizBadgeRarity(rarity: string): rarity is QuizBadgeRarity {
  return (QUIZ_BADGE_RARITIES as readonly string[]).includes(rarity);
}

export function emptyQuizBadgeDraft(): QuizBadgeDraft {
  return {
    nameEn: "",
    namePt: "",
    descriptionEn: "",
    descriptionPt: "",
    iconKey: "award",
    tint: "jade",
    rarity: "common",
  };
}

/** An icon, tint or rarity this build does not know opens as the defaults. */
export function draftFromDefinition(
  definition: QuizBadgeDefinitionDTO,
): QuizBadgeDraft {
  return {
    nameEn: definition.name.en,
    namePt: definition.name.pt ?? "",
    descriptionEn: definition.description.en,
    descriptionPt: definition.description.pt ?? "",
    iconKey: isCommunityBadgeIconKey(definition.iconKey)
      ? definition.iconKey
      : "award",
    tint: isQuizBadgeTint(definition.tint) ? definition.tint : "jade",
    rarity: isQuizBadgeRarity(definition.rarity) ? definition.rarity : "common",
  };
}

/** One text as it is sent: trimmed, with a blank Portuguese line as null. */
function textOf(english: string, portuguese: string): QuizBadgeText {
  const portugueseText = portuguese.trim();
  return {
    en: english.trim(),
    pt: portugueseText === "" ? null : portugueseText,
  };
}

function isSameText(first: QuizBadgeText, second: QuizBadgeText): boolean {
  return first.en === second.en && first.pt === second.pt;
}

export function createBodyFromDraft(
  draft: QuizBadgeDraft,
): QuizBadgeCreateBody {
  return {
    name: textOf(draft.nameEn, draft.namePt),
    description: textOf(draft.descriptionEn, draft.descriptionPt),
    iconKey: draft.iconKey,
    tint: draft.tint,
    rarity: draft.rarity,
  };
}

/**
 * Only the groups the admin changed, measured against the form as it opened.
 * A changed name or description goes whole, both languages, because the
 * server replaces both.
 */
export function updateBodyFromDraft(
  draft: QuizBadgeDraft,
  definition: QuizBadgeDefinitionDTO,
): QuizBadgeUpdateBody {
  const opened = draftFromDefinition(definition);
  const body: QuizBadgeUpdateBody = {};
  const name = textOf(draft.nameEn, draft.namePt);
  if (!isSameText(name, textOf(opened.nameEn, opened.namePt))) body.name = name;
  const description = textOf(draft.descriptionEn, draft.descriptionPt);
  if (
    !isSameText(description, textOf(opened.descriptionEn, opened.descriptionPt))
  )
    body.description = description;
  if (draft.iconKey !== opened.iconKey) body.iconKey = draft.iconKey;
  if (draft.tint !== opened.tint) body.tint = draft.tint;
  if (draft.rarity !== opened.rarity) body.rarity = draft.rarity;
  return body;
}

interface TextCheck {
  english: string;
  portuguese: string;
  englishField: QuizBadgeFormField;
  portugueseField: QuizBadgeFormField;
  maxLength: number;
  requiredCode: QuizBadgeDraftProblemCode;
  tooLongCode: QuizBadgeDraftProblemCode;
}

function textProblem(check: TextCheck): QuizBadgeDraftProblem | null {
  const english = check.english.trim();
  if (english === "")
    return {
      code: check.requiredCode,
      field: check.englishField,
      language: "en",
    };
  if (quizBadgeCodePointLength(english) > check.maxLength)
    return {
      code: check.tooLongCode,
      field: check.englishField,
      language: "en",
    };
  if (quizBadgeCodePointLength(check.portuguese.trim()) > check.maxLength)
    return {
      code: check.tooLongCode,
      field: check.portugueseField,
      language: "pt",
    };
  return null;
}

/** The first problem the server would refuse the texts for, in its order. */
export function draftProblem(
  draft: QuizBadgeDraft,
): QuizBadgeDraftProblem | null {
  return (
    textProblem({
      english: draft.nameEn,
      portuguese: draft.namePt,
      englishField: "nameEn",
      portugueseField: "namePt",
      maxLength: QUIZ_BADGE_NAME_MAX_LENGTH,
      requiredCode: "quiz_badge_name_required",
      tooLongCode: "quiz_badge_name_too_long",
    }) ??
    textProblem({
      english: draft.descriptionEn,
      portuguese: draft.descriptionPt,
      englishField: "descriptionEn",
      portugueseField: "descriptionPt",
      maxLength: QUIZ_BADGE_DESCRIPTION_MAX_LENGTH,
      requiredCode: "quiz_badge_description_required",
      tooLongCode: "quiz_badge_description_too_long",
    })
  );
}

const TEXT_FIELD_OF_WIRE_FIELD: Record<string, QuizBadgeFormField> = {
  "name.en": "nameEn",
  "name.pt": "namePt",
  "description.en": "descriptionEn",
  "description.pt": "descriptionPt",
};

function refusalValue(error: unknown, key: string): unknown {
  if (
    !(error instanceof ApiError) ||
    typeof error.data !== "object" ||
    error.data === null
  )
    return undefined;
  return (error.data as Record<string, unknown>)[key];
}

/** The field a server refusal belongs under, or null for a toast. */
export function fieldOfRefusal(error: unknown): QuizBadgeFormField | null {
  const code = quizWinBadgeReasonOf(error);
  const isPortuguese = refusalValue(error, "language") === "pt";
  switch (code) {
    case "quiz_badge_name_required":
    case "quiz_badge_name_too_long":
    case "quiz_badge_name_taken":
      return isPortuguese ? "namePt" : "nameEn";
    case "quiz_badge_description_required":
    case "quiz_badge_description_too_long":
      return isPortuguese ? "descriptionPt" : "descriptionEn";
    case "quiz_badge_icon_unknown":
      return "iconKey";
    case "quiz_badge_tint_unknown":
      return "tint";
    case "quiz_badge_rarity_unknown":
      return "rarity";
    case "quiz_badge_text_invalid": {
      const wireField = refusalValue(error, "field");
      return typeof wireField === "string"
        ? (TEXT_FIELD_OF_WIRE_FIELD[wireField] ?? null)
        : null;
    }
    default:
      return null;
  }
}

/** The badge the preview draws, with the texts as they would be saved. */
export function previewInputFromDraft(
  draft: QuizBadgeDraft,
): QuizBadgePreviewInput {
  return {
    name: textOf(draft.nameEn, draft.namePt),
    description: textOf(draft.descriptionEn, draft.descriptionPt),
    iconKey: draft.iconKey,
    tint: draft.tint,
    rarity: draft.rarity,
  };
}
