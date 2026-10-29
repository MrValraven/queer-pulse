import {
  createGivingDraftId,
  emptyGivingDraftRow,
  validateGivingDraft,
  type GivingDraft,
} from "../communities/giving/givingDraft";
import {
  formatGivingValue,
  normalizeGivingValue,
} from "../communities/giving/givingValue";
import type { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPaymentMethodsView } from "./api/studioPurchases.adapters";
import type { ReplaceStudioPaymentMethodsBody } from "./api/studioPurchases.types";
import { studioErrorMessageKeyOf } from "./studioErrors.data";

/**
 * The Getting paid editor's working copy, built on the community support
 * section's draft so the same rows, rules and hints apply. Nothing here logs
 * or tracks a value.
 */

/** The editor's starting draft: stored values read as they display (MB WAY
 *  grouped, IBAN in fours), rows keep their stored order, and a persona with
 *  no ways yet starts with one blank row. There is no intro in this section. */
export function givingDraftOf(
  view: StudioPaymentMethodsView | null,
): GivingDraft {
  const rows = (view?.methods ?? []).map((method) => ({
    draftId: createGivingDraftId(),
    kind: method.kind,
    value: formatGivingValue(method.kind, method.value),
    label: method.label ?? "",
    note: method.note ?? "",
  }));
  return { intro: "", rows: rows.length > 0 ? rows : [emptyGivingDraftRow()] };
}

function trimmedOrNull(text: string): string | null {
  const trimmed = text.trim();
  return trimmed ? trimmed : null;
}

/** The PUT body with every value normalized, or null while any row has an
 *  error. Zero rows is a valid body: it clears the list. */
export function replaceBodyOf(
  draft: GivingDraft,
): ReplaceStudioPaymentMethodsBody | null {
  if (validateGivingDraft(draft).hasErrors) return null;
  const methods: ReplaceStudioPaymentMethodsBody["methods"] = [];
  for (const row of draft.rows) {
    const value = normalizeGivingValue(row.kind, row.value);
    if (value === null) return null;
    methods.push({
      kind: row.kind,
      value,
      label: trimmedOrNull(row.label),
      note: trimmedOrNull(row.note),
    });
  }
  return { methods };
}

type Translate = ReturnType<typeof useTranslation>["t"];

/** After a move, focus goes to the same direction's control on the moved
 *  row, else to whichever move control is still enabled. */
export function focusMovedRowControl(
  form: HTMLFormElement | null,
  draftId: string,
  offset: -1 | 1,
): void {
  const rowElement = form?.querySelector(`[data-giving-row="${draftId}"]`);
  const direction = offset < 0 ? "up" : "down";
  const target =
    rowElement?.querySelector<HTMLButtonElement>(
      `[data-giving-move="${direction}"]:not(:disabled)`,
    ) ??
    rowElement?.querySelector<HTMLButtonElement>(
      "[data-giving-move]:not(:disabled)",
    );
  target?.focus();
}

/** The alert line: the action, then the refusal's own reason, with the row
 *  number when the server named a row. */
export function saveFailureLineOf(
  t: Translate,
  error: unknown,
  rowIndex: number | null,
): string {
  const reason = t(studioErrorMessageKeyOf(error, "save"));
  const reasonLine =
    rowIndex === null
      ? reason
      : t("studio:paymentMethods.rowError", { number: rowIndex + 1, reason });
  return `${t("studio:paymentMethods.saveFailed")}. ${reasonLine}`;
}
