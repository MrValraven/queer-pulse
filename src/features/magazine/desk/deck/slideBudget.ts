import type { TFunction } from "../../../../shared/i18n/types";
import { stripHtml } from "../editor/articleWordCount";

/**
 * A field's character budget: how many characters were typed against the
 * layout's practical limit, and a copy hint to show next to the field (the
 * design's `.warnfield`, applied by the per-layout field components built in
 * Task 2). Pure — callers pass `t` in (mirrors `articlePublishChecklist`'s
 * `buildPublishChecklist`) so this stays hook-free and testable.
 */
export interface FieldBudget {
  count: number;
  max: number;
  over: boolean;
  hint: string;
}

/** A slide heading has room for one short line before it clips — the reader's
 * `.heading` (`DeckSlides.module.css`) is a single fluid `clamp()` size with
 * no responsive wrap budget, unlike an article's headings. */
const HEADING_MAX_CHARS = 52;

/** A slide's body is a caption, not an article paragraph: long body text both
 * looks wrong centred on the reader's stage and defeats the format's point
 * (one idea per slide). */
const BODY_MAX_CHARS = 180;

function fieldBudget(
  text: string,
  max: number,
  overHint: string,
  okHint: string,
): FieldBudget {
  // Every field this editor exposes is a plain string in practice (see
  // `SlideEditorCard`'s `asText`), but strip markup defensively in case a
  // future field carries it — a stray tag shouldn't count against the budget.
  const count = stripHtml(text).length;
  const over = count > max;
  return { count, max, over, hint: over ? overHint : okHint };
}

export function headingBudget(text: string, t: TFunction): FieldBudget {
  return fieldBudget(
    text,
    HEADING_MAX_CHARS,
    t("magazine:deck.editor.budget.headingOver"),
    t("magazine:deck.editor.budget.headingOk"),
  );
}

export function bodyBudget(text: string, t: TFunction): FieldBudget {
  return fieldBudget(
    text,
    BODY_MAX_CHARS,
    t("magazine:deck.editor.budget.bodyOver"),
    t("magazine:deck.editor.budget.bodyOk"),
  );
}
