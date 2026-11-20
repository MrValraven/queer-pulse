import { ApiError } from "../../../shared/api/client";
import {
  CULTURAL_GUIDE_BODY_MAX,
  CULTURAL_GUIDE_HEADING_MAX,
  CULTURAL_GUIDE_SECTION_STEPS_MAX,
  CULTURAL_GUIDE_SECTIONS_MAX,
  CULTURAL_GUIDE_STEPS_MAX,
  CULTURAL_GUIDE_SUMMARY_MAX,
  CULTURAL_STEP_DAYS_MAX,
  CULTURAL_STEP_DAYS_MIN,
  CULTURAL_TITLE_MAX,
  culturalReasonOf,
  culturalRefusalDetailOf,
  type CulturalEventType,
  type CulturalGuideDTO,
  type CulturalGuideLocale,
  type CulturalReasonCode,
  type ReplaceCulturalGuideBody,
} from "./api/culturalProduction.types";

// The guide editor's draft: the whole guide as the producer edits it, with a
// client key on every section and step so rows keep their identity while
// they move. Days stay text while typed; the body reads them as numbers.

export interface GuideStepDraft {
  key: string;
  /** The stored step's id, null for a step added in this edit. */
  id: string | null;
  text: string;
  /** The days input as typed: empty is any time. */
  daysText: string;
}

export interface GuideSectionDraft {
  key: string;
  id: string | null;
  heading: string;
  body: string;
  steps: GuideStepDraft[];
}

export interface GuideDraftMeta {
  title: string;
  eventType: CulturalEventType;
  locale: CulturalGuideLocale;
  summary: string;
}

export interface GuideDraft extends GuideDraftMeta {
  sections: GuideSectionDraft[];
}

export type GuideMoveDirection = "up" | "down";

export type GuideDraftAction =
  | { type: "setMeta"; meta: Partial<GuideDraftMeta> }
  | { type: "addSection"; key: string }
  | {
      type: "updateSection";
      sectionIndex: number;
      changes: Partial<Pick<GuideSectionDraft, "heading" | "body">>;
    }
  | { type: "moveSection"; sectionIndex: number; direction: GuideMoveDirection }
  | { type: "removeSection"; sectionIndex: number }
  | { type: "addStep"; sectionIndex: number; key: string }
  | {
      type: "updateStep";
      sectionIndex: number;
      stepIndex: number;
      changes: Partial<Pick<GuideStepDraft, "text" | "daysText">>;
    }
  | {
      type: "moveStep";
      sectionIndex: number;
      stepIndex: number;
      direction: GuideMoveDirection;
    }
  | { type: "removeStep"; sectionIndex: number; stepIndex: number };

let draftKeyCount = 0;

/** A key for a section or step added in this edit. */
export function newDraftKey(): string {
  draftKeyCount += 1;
  return `draft-${String(draftKeyCount)}`;
}

/** The list with the item at `index` swapped one place up or down; an edge
 *  move answers the list unchanged. */
function movedList<Item>(
  list: Item[],
  index: number,
  direction: GuideMoveDirection,
): Item[] {
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  const item = list[index];
  const neighbour = list[targetIndex];
  if (item === undefined || neighbour === undefined) return list;
  const next = [...list];
  next[targetIndex] = item;
  next[index] = neighbour;
  return next;
}

function withSection(
  draft: GuideDraft,
  sectionIndex: number,
  change: (section: GuideSectionDraft) => GuideSectionDraft,
): GuideDraft {
  return {
    ...draft,
    sections: draft.sections.map((section, index) =>
      index === sectionIndex ? change(section) : section,
    ),
  };
}

export function guideDraftReducer(
  draft: GuideDraft,
  action: GuideDraftAction,
): GuideDraft {
  switch (action.type) {
    case "setMeta":
      return { ...draft, ...action.meta };
    case "addSection":
      return {
        ...draft,
        sections: [
          ...draft.sections,
          { key: action.key, id: null, heading: "", body: "", steps: [] },
        ],
      };
    case "updateSection":
      return withSection(draft, action.sectionIndex, (section) => ({
        ...section,
        ...action.changes,
      }));
    case "moveSection":
      return {
        ...draft,
        sections: movedList(
          draft.sections,
          action.sectionIndex,
          action.direction,
        ),
      };
    case "removeSection":
      return {
        ...draft,
        sections: draft.sections.filter(
          (_section, index) => index !== action.sectionIndex,
        ),
      };
    case "addStep":
      return withSection(draft, action.sectionIndex, (section) => ({
        ...section,
        steps: [
          ...section.steps,
          { key: action.key, id: null, text: "", daysText: "" },
        ],
      }));
    case "updateStep":
      return withSection(draft, action.sectionIndex, (section) => ({
        ...section,
        steps: section.steps.map((step, index) =>
          index === action.stepIndex ? { ...step, ...action.changes } : step,
        ),
      }));
    case "moveStep":
      return withSection(draft, action.sectionIndex, (section) => ({
        ...section,
        steps: movedList(section.steps, action.stepIndex, action.direction),
      }));
    case "removeStep":
      return withSection(draft, action.sectionIndex, (section) => ({
        ...section,
        steps: section.steps.filter(
          (_step, index) => index !== action.stepIndex,
        ),
      }));
  }
}

/** The stored guide as a draft: stored ids double as the row keys. */
export function draftFromGuide(guide: CulturalGuideDTO): GuideDraft {
  return {
    title: guide.title,
    eventType: guide.eventType,
    locale: guide.locale,
    summary: guide.summary,
    sections: guide.sections.map((section) => ({
      key: section.id,
      id: section.id,
      heading: section.heading,
      body: section.body,
      steps: section.steps.map((step) => ({
        key: step.id,
        id: step.id,
        text: step.text,
        daysText: step.daysBefore === null ? "" : String(step.daysBefore),
      })),
    })),
  };
}

/** The days a step's input means: empty is null (any time). */
export function daysOfText(daysText: string): number | null {
  const trimmed = daysText.trim();
  return trimmed === "" ? null : Number(trimmed);
}

/** The PUT body: every section and step in draft order, a stored one with
 *  its id and a new one without. */
export function bodyFromDraft(
  draft: GuideDraft,
  revision: number,
): ReplaceCulturalGuideBody {
  return {
    revision,
    title: draft.title,
    eventType: draft.eventType,
    locale: draft.locale,
    summary: draft.summary,
    sections: draft.sections.map((section) => ({
      ...(section.id === null ? {} : { id: section.id }),
      heading: section.heading,
      body: section.body,
      steps: section.steps.map((step) => ({
        ...(step.id === null ? {} : { id: step.id }),
        text: step.text,
        daysBefore: daysOfText(step.daysText),
      })),
    })),
  };
}

/** True when saving the draft would change the stored guide. */
export function isDraftChanged(
  draft: GuideDraft,
  guide: CulturalGuideDTO,
): boolean {
  const sent = bodyFromDraft(draft, guide.revision);
  const stored = bodyFromDraft(draftFromGuide(guide), guide.revision);
  return JSON.stringify(sent) !== JSON.stringify(stored);
}

/** A limit the draft breaks, named by the code and indexes (zero based)
 *  the server would answer with. */
export interface GuideLocalIssue {
  code: CulturalReasonCode;
  sectionIndex: number | null;
  stepIndex: number | null;
}

/** Code points after the server's line ends and trim. */
function lengthOf(text: string, shouldTrimStart = true): number {
  const unified = text.replace(/\r\n?/g, "\n");
  return Array.from(shouldTrimStart ? unified.trim() : unified.trimEnd())
    .length;
}

function issue(
  code: CulturalReasonCode,
  sectionIndex: number | null = null,
  stepIndex: number | null = null,
): GuideLocalIssue {
  return { code, sectionIndex, stepIndex };
}

function textIssue(
  text: string,
  max: number,
  codes: [CulturalReasonCode, CulturalReasonCode],
  sectionIndex: number | null = null,
  stepIndex: number | null = null,
): GuideLocalIssue | null {
  const length = lengthOf(text);
  if (length === 0) return issue(codes[0], sectionIndex, stepIndex);
  if (length > max) return issue(codes[1], sectionIndex, stepIndex);
  return null;
}

function isStepDaysValid(daysText: string): boolean {
  const days = daysOfText(daysText);
  return (
    days === null ||
    (Number.isInteger(days) &&
      days >= CULTURAL_STEP_DAYS_MIN &&
      days <= CULTURAL_STEP_DAYS_MAX)
  );
}

function sectionIssuesOf(
  section: GuideSectionDraft,
  sectionIndex: number,
): GuideLocalIssue[] {
  const issues: (GuideLocalIssue | null)[] = [
    textIssue(
      section.heading,
      CULTURAL_GUIDE_HEADING_MAX,
      ["CULTURAL_GUIDE_HEADING_REQUIRED", "CULTURAL_GUIDE_HEADING_TOO_LONG"],
      sectionIndex,
    ),
    lengthOf(section.body, false) > CULTURAL_GUIDE_BODY_MAX
      ? issue("CULTURAL_GUIDE_BODY_TOO_LONG", sectionIndex)
      : null,
    section.steps.length > CULTURAL_GUIDE_SECTION_STEPS_MAX
      ? issue("CULTURAL_GUIDE_TOO_MANY_STEPS", sectionIndex)
      : null,
  ];
  section.steps.forEach((step, stepIndex) => {
    issues.push(
      textIssue(
        step.text,
        CULTURAL_TITLE_MAX,
        [
          "CULTURAL_GUIDE_STEP_TEXT_REQUIRED",
          "CULTURAL_GUIDE_STEP_TEXT_TOO_LONG",
        ],
        sectionIndex,
        stepIndex,
      ),
      isStepDaysValid(step.daysText)
        ? null
        : issue("CULTURAL_GUIDE_STEP_DAYS_INVALID", sectionIndex, stepIndex),
    );
  });
  return issues.filter((found) => found !== null);
}

/** Every contract 8.1 limit (and the title and summary rules) the draft
 *  breaks, in the server's check order, so the first is the refusal a save
 *  would meet. */
export function localIssuesOf(draft: GuideDraft): GuideLocalIssue[] {
  const issues: GuideLocalIssue[] = [];
  const titleIssue = textIssue(draft.title, CULTURAL_TITLE_MAX, [
    "CULTURAL_TITLE_REQUIRED",
    "CULTURAL_TITLE_TOO_LONG",
  ]);
  if (titleIssue) issues.push(titleIssue);
  if (lengthOf(draft.summary) > CULTURAL_GUIDE_SUMMARY_MAX)
    issues.push(issue("CULTURAL_GUIDE_SUMMARY_TOO_LONG"));
  if (draft.sections.length > CULTURAL_GUIDE_SECTIONS_MAX)
    issues.push(issue("CULTURAL_GUIDE_TOO_MANY_SECTIONS"));
  draft.sections.forEach((section, sectionIndex) => {
    issues.push(...sectionIssuesOf(section, sectionIndex));
  });
  if (stepCountOf(draft) > CULTURAL_GUIDE_STEPS_MAX)
    issues.push(issue("CULTURAL_GUIDE_TOO_MANY_STEPS"));
  return issues;
}

/** A local issue as the refusal the server would send, so the editor reads
 *  it through the same lines as a real one. */
export function refusalOfIssue(found: GuideLocalIssue): ApiError {
  return new ApiError(400, "Bad Request", {
    statusCode: 400,
    message: "Bad Request",
    code: found.code,
    sectionIndex: found.sectionIndex,
    stepIndex: found.stepIndex,
  });
}

export function stepCountOf(draft: GuideDraft): number {
  return draft.sections.reduce(
    (total, section) => total + section.steps.length,
    0,
  );
}

/** The control a refusal belongs beside. `foot` is the line by Save. */
export type GuideField =
  | "title"
  | "eventType"
  | "locale"
  | "summary"
  | "heading"
  | "body"
  | "steps"
  | "stepText"
  | "stepDays"
  | "foot";

export interface GuideFieldTarget {
  field: GuideField;
  sectionIndex: number | null;
  stepIndex: number | null;
}

const META_FIELD_OF: Partial<Record<CulturalReasonCode, GuideField>> = {
  CULTURAL_TITLE_REQUIRED: "title",
  CULTURAL_TITLE_TOO_LONG: "title",
  CULTURAL_EVENT_TYPE_INVALID: "eventType",
  CULTURAL_GUIDE_LOCALE_INVALID: "locale",
  CULTURAL_GUIDE_SUMMARY_TOO_LONG: "summary",
};

const SECTION_FIELD_OF: Partial<Record<CulturalReasonCode, GuideField>> = {
  CULTURAL_GUIDE_HEADING_REQUIRED: "heading",
  CULTURAL_GUIDE_HEADING_TOO_LONG: "heading",
  CULTURAL_GUIDE_BODY_TOO_LONG: "body",
  CULTURAL_GUIDE_TOO_MANY_STEPS: "steps",
};

const STEP_FIELD_OF: Partial<Record<CulturalReasonCode, GuideField>> = {
  CULTURAL_GUIDE_STEP_TEXT_REQUIRED: "stepText",
  CULTURAL_GUIDE_STEP_TEXT_TOO_LONG: "stepText",
  CULTURAL_GUIDE_STEP_DAYS_INVALID: "stepDays",
};

const FOOT_TARGET: GuideFieldTarget = {
  field: "foot",
  sectionIndex: null,
  stepIndex: null,
};

/** Where a refusal's line shows: beside the field its code and indexes
 *  name, or by Save when it names none, or one the draft no longer has. */
export function refusalTargetOf(
  error: unknown,
  draft: GuideDraft,
): GuideFieldTarget {
  const code = culturalReasonOf(error);
  if (code === null) return FOOT_TARGET;
  const metaField = META_FIELD_OF[code];
  if (metaField)
    return { field: metaField, sectionIndex: null, stepIndex: null };
  const { sectionIndex, stepIndex } = culturalRefusalDetailOf(error);
  const section =
    sectionIndex === null ? undefined : draft.sections[sectionIndex];
  if (section === undefined || sectionIndex === null) return FOOT_TARGET;
  const sectionField = SECTION_FIELD_OF[code];
  if (sectionField)
    return { field: sectionField, sectionIndex, stepIndex: null };
  const stepField = STEP_FIELD_OF[code];
  const hasStep = stepIndex !== null && section.steps[stepIndex] !== undefined;
  return stepField && hasStep
    ? { field: stepField, sectionIndex, stepIndex }
    : FOOT_TARGET;
}

export type GuideSectionControl =
  "heading" | "body" | "addStep" | "moveUp" | "moveDown" | "remove";

export type GuideStepControl =
  "text" | "days" | "moveUp" | "moveDown" | "remove";

export function sectionControlId(
  idPrefix: string,
  sectionKey: string,
  control: GuideSectionControl,
): string {
  return `${idPrefix}-section-${sectionKey}-${control}`;
}

export function stepControlId(
  idPrefix: string,
  stepKey: string,
  control: GuideStepControl,
): string {
  return `${idPrefix}-step-${stepKey}-${control}`;
}

export const GUIDE_META_CONTROL = {
  title: "title",
  eventType: "event-type",
  locale: "locale",
  summary: "summary",
} as const;

/** The id of the control a target names, or null for the foot. */
export function targetControlId(
  idPrefix: string,
  target: GuideFieldTarget,
  draft: GuideDraft,
): string | null {
  const { field, sectionIndex, stepIndex } = target;
  if (
    field === "title" ||
    field === "eventType" ||
    field === "locale" ||
    field === "summary"
  )
    return `${idPrefix}-${GUIDE_META_CONTROL[field]}`;
  const section =
    sectionIndex === null ? undefined : draft.sections[sectionIndex];
  if (section === undefined) return null;
  if (field === "heading" || field === "body")
    return sectionControlId(idPrefix, section.key, field);
  if (field === "steps")
    return sectionControlId(idPrefix, section.key, "addStep");
  const step = stepIndex === null ? undefined : section.steps[stepIndex];
  if (step === undefined) return null;
  if (field === "stepText") return stepControlId(idPrefix, step.key, "text");
  if (field === "stepDays") return stepControlId(idPrefix, step.key, "days");
  return null;
}
