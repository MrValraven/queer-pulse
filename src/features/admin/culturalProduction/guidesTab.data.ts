import { ApiError } from "../../../shared/api/client";
import type { Language } from "../../../shared/i18n/types";
import {
  CULTURAL_GUIDE_SUMMARY_MAX,
  CULTURAL_TITLE_MAX,
  type CulturalEventType,
  type CulturalGuideListItemDTO,
  type CulturalGuideLocale,
  type CulturalReasonCode,
} from "./api/culturalProduction.types";

const GUIDES_PREFIX = "admin:culturalProduction.guides";

/** The day a guide was last edited, as the card and the page header show it. */
export const GUIDE_EDIT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

/** How many card outlines the Guides tab shows while the guides load. */
export const GUIDE_SKELETON_CARD_COUNT = 4;

/** The router state that opens a guide's page straight in the editor (the
 *  add dialog sends it, so a new guide opens ready for its sections). */
export interface GuidePageRouterState {
  isEditing: boolean;
}

/** Whether router state asks the guide page to open in the editor. Only a
 *  boolean `true` counts, so stray state never opens it. */
export function isEditingFromRouterState(state: unknown): boolean {
  if (typeof state !== "object" || state === null) return false;
  return (state as Record<string, unknown>).isEditing === true;
}

const compareText = (first: string, second: string): number =>
  first.localeCompare(second);

/** The guides in the viewer's app language first, then by event type, then
 *  by title. */
export function sortGuidesForLanguage(
  guides: readonly CulturalGuideListItemDTO[],
  language: Language,
): CulturalGuideListItemDTO[] {
  const languageRank = (locale: CulturalGuideLocale) =>
    locale === language ? 0 : 1;
  return [...guides].sort(
    (first, second) =>
      languageRank(first.locale) - languageRank(second.locale) ||
      compareText(first.eventType, second.eventType) ||
      compareText(first.title, second.title) ||
      compareText(first.id, second.id),
  );
}

/** The line that says who last edited a guide and when. The editor is the
 *  last person who saved it, else the person who wrote it. A guide with
 *  neither that was never saved is a starter guide; one whose editor's
 *  account is gone reads the date alone. */
export function guideEditLineOf(
  guide: Pick<
    CulturalGuideListItemDTO,
    "author" | "updatedBy" | "createdAt" | "updatedAt"
  >,
): { key: string; name: string | null } {
  const editor = guide.updatedBy ?? guide.author;
  if (editor !== null)
    return { key: `${GUIDES_PREFIX}.card.updated`, name: editor.displayName };
  if (guide.updatedAt === guide.createdAt)
    return { key: `${GUIDES_PREFIX}.card.starter`, name: null };
  return { key: `${GUIDES_PREFIX}.card.updatedUnknown`, name: null };
}

/** The add form's values. */
export interface GuideFormValues {
  title: string;
  eventType: CulturalEventType | null;
  locale: CulturalGuideLocale;
  summary: string;
}

/** The fields of the add form a refusal can sit under. */
export type GuideFormField = "title" | "eventType" | "locale" | "summary";

/** The field each reason code shows under; any other code shows above the
 *  buttons. */
export const GUIDE_FORM_REASON_FIELD: Partial<
  Record<CulturalReasonCode, GuideFormField>
> = {
  CULTURAL_TITLE_REQUIRED: "title",
  CULTURAL_TITLE_TOO_LONG: "title",
  CULTURAL_EVENT_TYPE_INVALID: "eventType",
  CULTURAL_GUIDE_LOCALE_INVALID: "locale",
  CULTURAL_GUIDE_SUMMARY_TOO_LONG: "summary",
};

const codePointLength = (text: string): number => Array.from(text).length;

/** The refusal the server would answer for these values, in its check order,
 *  built the way the server sends it so the same line shows; null when they
 *  would pass. */
export function localGuideFormRefusalOf(
  values: GuideFormValues,
): ApiError | null {
  const title = values.title.trim();
  let code: CulturalReasonCode | null = null;
  if (title === "") code = "CULTURAL_TITLE_REQUIRED";
  else if (codePointLength(title) > CULTURAL_TITLE_MAX)
    code = "CULTURAL_TITLE_TOO_LONG";
  else if (values.eventType === null) code = "CULTURAL_EVENT_TYPE_INVALID";
  else if (codePointLength(values.summary.trim()) > CULTURAL_GUIDE_SUMMARY_MAX)
    code = "CULTURAL_GUIDE_SUMMARY_TOO_LONG";
  if (code === null) return null;
  return new ApiError(400, "Bad Request", { statusCode: 400, code });
}
