import type { TFunction } from "../../shared/i18n/types";
import {
  findStudioLink,
  type StudioShareKind,
  textWithoutStudioLink,
} from "../studio/share/studioLinkTarget";
import { studioKindInQuoteSnippet } from "./internalLinkTargets";
import {
  studioShareLabelKey,
  studioShareLabelText,
} from "../studio/share/studioShareLabel";

/**
 * An inbox row's text for a message that carries a Studio link: the note,
 * then the "Studio track" style label where the URL stood (spec section 2).
 * The label names the kind only, because a title would need a Studio read per
 * row. A translator that echoes the key (a namespace still loading, or the
 * live-patch path, which has none) falls back to the eager `shared` catalog.
 */
export function studioSharePreviewText(
  text: string,
  translate?: TFunction,
): string {
  const match = findStudioLink(text);
  if (!match) return text;
  const note = textWithoutStudioLink(text, match);
  return joinedWithLabel(note, match.target.kind, translate);
}

/**
 * The same reading for a text the server cut (a search hit, a starred row, a
 * pinned banner snippet): a whole link reads as in
 * {@link studioSharePreviewText}, and a link cut at the tail still reads as
 * its kind label, so no half-cut Studio URL shows.
 */
export function studioSnippetPreviewText(
  text: string,
  translate?: TFunction,
): string {
  if (findStudioLink(text)) return studioSharePreviewText(text, translate);
  const kind = studioKindInQuoteSnippet(text);
  if (!kind) return text;
  const trimmed = text.trimEnd();
  const lastRunStart = trimmed.search(/\S+$/);
  const note = trimmed.slice(0, Math.max(lastRunStart, 0)).trim();
  return joinedWithLabel(note, kind, translate);
}

function joinedWithLabel(
  note: string,
  kind: StudioShareKind,
  translate?: TFunction,
): string {
  const key = studioShareLabelKey(kind);
  const translated = translate?.(key);
  const label =
    translated && translated !== key ? translated : studioShareLabelText(kind);
  return note ? `${note} · ${label}` : label;
}
