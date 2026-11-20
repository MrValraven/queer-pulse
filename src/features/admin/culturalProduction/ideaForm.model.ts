import { ApiError } from "../../../shared/api/client";
import {
  CULTURAL_IDEA_DESCRIPTION_MAX,
  CULTURAL_TITLE_MAX,
  DEFAULT_CULTURAL_IDEA_STATUS,
  type CreateCulturalIdeaBody,
  type CulturalEventType,
  type CulturalIdeaDTO,
  type CulturalIdeaStatus,
  type CulturalReasonCode,
  type UpdateCulturalIdeaBody,
} from "./api/culturalProduction.types";

/** The fields of the idea form a refusal can sit under. */
export type IdeaFormField = "title" | "description" | "eventType" | "status";

export interface IdeaFormValues {
  title: string;
  description: string;
  eventType: CulturalEventType | null;
  status: CulturalIdeaStatus;
}

/** The share of a limit at which the description shows its live counter. */
export const IDEA_COUNTER_THRESHOLD = 0.8;

/** The add form before anything is typed: no event type, status New. */
export function emptyIdeaFormValues(): IdeaFormValues {
  return {
    title: "",
    description: "",
    eventType: null,
    status: DEFAULT_CULTURAL_IDEA_STATUS,
  };
}

/** The edit form seeded from a stored idea. */
export function ideaFormValuesOf(idea: CulturalIdeaDTO): IdeaFormValues {
  return {
    title: idea.title,
    description: idea.description,
    eventType: idea.eventType,
    status: idea.status,
  };
}

/** Lengths count code points, as the server does. */
export function codePointLength(text: string): number {
  return Array.from(text).length;
}

/** Whether a text of `length` is close enough to `max` to show its count. */
export function shouldShowCharacterCount(length: number, max: number): boolean {
  return length >= Math.ceil(max * IDEA_COUNTER_THRESHOLD);
}

/** The field each idea reason code shows under. */
const IDEA_REASON_FIELD: Partial<Record<CulturalReasonCode, IdeaFormField>> = {
  CULTURAL_TITLE_REQUIRED: "title",
  CULTURAL_TITLE_TOO_LONG: "title",
  CULTURAL_DESCRIPTION_TOO_LONG: "description",
  CULTURAL_EVENT_TYPE_INVALID: "eventType",
  CULTURAL_IDEA_STATUS_INVALID: "status",
};

/** The field a refusal belongs under; null puts it above the buttons. */
export function fieldOfCulturalReason(
  reasonCode: CulturalReasonCode | null,
): IdeaFormField | null {
  if (reasonCode === null) return null;
  return IDEA_REASON_FIELD[reasonCode] ?? null;
}

/** The first refusal the server would answer for these values, in its check
 *  order (title, description, event type), or null when they would pass. */
export function localIdeaReasonOf(
  values: IdeaFormValues,
): CulturalReasonCode | null {
  const title = values.title.trim();
  if (title === "") return "CULTURAL_TITLE_REQUIRED";
  if (codePointLength(title) > CULTURAL_TITLE_MAX)
    return "CULTURAL_TITLE_TOO_LONG";
  if (
    codePointLength(values.description.trim()) > CULTURAL_IDEA_DESCRIPTION_MAX
  )
    return "CULTURAL_DESCRIPTION_TOO_LONG";
  if (values.eventType === null) return "CULTURAL_EVENT_TYPE_INVALID";
  return null;
}

/** A refusal shaped like the server's, so a check made before sending reads
 *  through the same lines as one the server answers. */
export function localIdeaRefusal(reasonCode: CulturalReasonCode): ApiError {
  return new ApiError(400, "Bad Request", {
    statusCode: 400,
    message: "Bad Request",
    code: reasonCode,
  });
}

/** The create body: trimmed text, status New. */
export function createIdeaBodyOf(
  values: IdeaFormValues & { eventType: CulturalEventType },
): CreateCulturalIdeaBody {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    eventType: values.eventType,
  };
}

/** Every field of the idea form, in the server's check order. */
const IDEA_FORM_FIELDS: readonly IdeaFormField[] = [
  "title",
  "description",
  "eventType",
  "status",
];

/** The fields whose value differs between two versions of the form. */
export function changedIdeaFieldsOf(
  previous: IdeaFormValues,
  next: IdeaFormValues,
): IdeaFormField[] {
  return IDEA_FORM_FIELDS.filter((field) => previous[field] !== next[field]);
}

/** The edit form as shown: what the staff member typed in the fields they
 *  touched, and the current idea everywhere else, so a teammate's newer
 *  save to another field shows (and stays) once the idea refetches. */
export function shownIdeaFormValuesOf(
  typedValues: IdeaFormValues,
  touchedFields: ReadonlySet<IdeaFormField>,
  currentIdea: CulturalIdeaDTO,
): IdeaFormValues {
  const currentValues = ideaFormValuesOf(currentIdea);
  return {
    title: touchedFields.has("title") ? typedValues.title : currentValues.title,
    description: touchedFields.has("description")
      ? typedValues.description
      : currentValues.description,
    eventType: touchedFields.has("eventType")
      ? typedValues.eventType
      : currentValues.eventType,
    status: touchedFields.has("status")
      ? typedValues.status
      : currentValues.status,
  };
}

/** The update body: only the touched fields that differ from the current
 *  idea, trimmed. An untouched field is never sent, so a save never writes
 *  back a value a teammate has changed since the form opened. */
export function updateIdeaBodyOf(
  values: IdeaFormValues & { eventType: CulturalEventType },
  touchedFields: ReadonlySet<IdeaFormField>,
  currentIdea: CulturalIdeaDTO,
): UpdateCulturalIdeaBody {
  const body: UpdateCulturalIdeaBody = {};
  const title = values.title.trim();
  const description = values.description.trim();
  if (touchedFields.has("title") && title !== currentIdea.title)
    body.title = title;
  if (
    touchedFields.has("description") &&
    description !== currentIdea.description
  )
    body.description = description;
  if (
    touchedFields.has("eventType") &&
    values.eventType !== currentIdea.eventType
  )
    body.eventType = values.eventType;
  if (touchedFields.has("status") && values.status !== currentIdea.status)
    body.status = values.status;
  return body;
}
