import type {
  CommunityGivingDTO,
  CommunityGivingKind,
  UpdateCommunityGivingBody,
  UpdateCommunityGivingMethodBody,
} from "../api/communityGiving.api";
import { GIVING_LIMITS } from "./givingConstants";
import {
  formatGivingValue,
  givingValueError,
  normalizeGivingValue,
  type GivingFieldError,
} from "./givingValue";

/**
 * The support section editor's working copy. Fields hold what the owner typed;
 * `draftToBody` trims and normalizes them into the PUT body (MB WAY as 9
 * digits, IBAN compact, links with `https://`), so the server only ever sees
 * canonical values. Nothing here logs a value.
 */

export interface GivingDraftRow {
  /** Client-only render and focus key; never sent. */
  draftId: string;
  kind: CommunityGivingKind;
  value: string;
  label: string;
  note: string;
}

export interface GivingDraft {
  intro: string;
  rows: GivingDraftRow[];
}

export interface GivingRowErrors {
  value?: GivingFieldError;
  label?: GivingFieldError;
  note?: GivingFieldError;
}

export interface GivingDraftErrors {
  intro?: GivingFieldError;
  /** Keyed by `draftId`; only rows with at least one error appear. */
  rows: Record<string, GivingRowErrors>;
  hasErrors: boolean;
}

let draftIdCounter = 0;

export function createGivingDraftId(): string {
  draftIdCounter += 1;
  return `giving-draft-${draftIdCounter}`;
}

export function emptyGivingDraftRow(): GivingDraftRow {
  return {
    draftId: createGivingDraftId(),
    kind: "link",
    value: "",
    label: "",
    note: "",
  };
}

/** The editor's starting draft. Stored values read as they display (MB WAY
 *  grouped, IBAN in fours), and an empty section starts with one blank row. */
export function draftFromGiving(
  giving: CommunityGivingDTO | null,
): GivingDraft {
  const methods = [...(giving?.methods ?? [])].sort(
    (first, second) => first.position - second.position,
  );
  const rows = methods.map((method) => ({
    draftId: createGivingDraftId(),
    kind: method.kind,
    value: formatGivingValue(method.kind, method.value),
    label: method.label ?? "",
    note: method.note ?? "",
  }));
  return {
    intro: giving?.intro ?? "",
    rows: rows.length > 0 ? rows : [emptyGivingDraftRow()],
  };
}

function lengthError(text: string, max: number): GivingFieldError | undefined {
  return text.trim().length > max ? "tooLong" : undefined;
}

function rowErrors(row: GivingDraftRow): GivingRowErrors {
  const errors: GivingRowErrors = {};
  const valueError = givingValueError(row.kind, row.value);
  if (valueError) errors.value = valueError;
  const labelError = lengthError(row.label, GIVING_LIMITS.labelMax);
  if (labelError) errors.label = labelError;
  const noteError = lengthError(row.note, GIVING_LIMITS.noteMax);
  if (noteError) errors.note = noteError;
  return errors;
}

export function validateGivingDraft(draft: GivingDraft): GivingDraftErrors {
  const introError = lengthError(draft.intro, GIVING_LIMITS.introMax);
  const rows: Record<string, GivingRowErrors> = {};
  for (const row of draft.rows) {
    const errors = rowErrors(row);
    if (Object.keys(errors).length > 0) rows[row.draftId] = errors;
  }
  const hasErrors = Boolean(introError) || Object.keys(rows).length > 0;
  return introError
    ? { intro: introError, rows, hasErrors }
    : { rows, hasErrors };
}

function trimmedOrNull(text: string): string | null {
  const trimmed = text.trim();
  return trimmed ? trimmed : null;
}

/** The PUT body with every value normalized, or null while any field has an
 *  error. Zero rows is a valid body: it clears the section. */
export function draftToBody(
  draft: GivingDraft,
): UpdateCommunityGivingBody | null {
  if (validateGivingDraft(draft).hasErrors) return null;
  const methods: UpdateCommunityGivingMethodBody[] = [];
  for (const row of draft.rows) {
    const value = normalizeGivingValue(row.kind, row.value);
    if (value === null) return null;
    methods.push({
      kind: row.kind,
      label: trimmedOrNull(row.label),
      value,
      note: trimmedOrNull(row.note),
    });
  }
  return { intro: trimmedOrNull(draft.intro), methods };
}

/** True when anything the owner can see differs from `initial`. Row ids are
 *  ignored, so reordering back to the start reads as clean. */
export function isGivingDraftDirty(
  draft: GivingDraft,
  initial: GivingDraft,
): boolean {
  if (draft.intro !== initial.intro) return true;
  if (draft.rows.length !== initial.rows.length) return true;
  return draft.rows.some((row, rowIndex) => {
    const initialRow = initial.rows[rowIndex];
    return (
      initialRow === undefined ||
      row.kind !== initialRow.kind ||
      row.value !== initialRow.value ||
      row.label !== initialRow.label ||
      row.note !== initialRow.note
    );
  });
}
