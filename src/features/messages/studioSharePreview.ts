import type { TFunction } from "../../shared/i18n/types";
import {
  findStudioLink,
  textWithoutStudioLink,
} from "../studio/share/studioLinkTarget";
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
  const key = studioShareLabelKey(match.target.kind);
  const translated = translate?.(key);
  const label =
    translated && translated !== key
      ? translated
      : studioShareLabelText(match.target.kind);
  const note = textWithoutStudioLink(text, match);
  return note ? `${note} · ${label}` : label;
}
