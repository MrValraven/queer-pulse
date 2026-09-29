import type { AvatarTint } from "../../../../shared/components/ui";
import type { Editor } from "../../data/desk.data";

/**
 * How the rail draws a person: the editor directory's tint mapped onto the
 * Avatar's tints, and initials for anyone the directory does not know. Moved
 * here from `DeskSidebar.tsx` so the Team and Activity cards share one
 * mapping; the old sidebar keeps its own copy until the integration task
 * deletes it.
 */
export const EDITOR_TINT_TO_AVATAR_TINT: Record<Editor["tint"], AvatarTint> = {
  coral: "coral",
  jade: "jade",
  // Avatar has no "violet" tint; the closest repo tint for a deep purple is plum.
  violet: "plum",
};

/** First one or two initials from a free-form label ("Sara Pinheiro" gives
 * "SP", a bare id its first two characters), for rows with no matched `Editor`. */
export function initialsFromLabel(label: string): string {
  const [firstWord, secondWord] = label.trim().split(/\s+/).filter(Boolean);
  if (!firstWord) return "?";
  if (!secondWord) return firstWord.slice(0, 2).toUpperCase();
  return (firstWord.charAt(0) + secondWord.charAt(0)).toUpperCase();
}

/** The avatar props (RailAvatar) for a person: the directory's own initials and tint when
 * the editor is known, initials from the label on the default tint when not. */
export function avatarIdentity(
  editor: Editor | undefined,
  fallbackLabel: string,
): { initials: string; tint: AvatarTint } {
  if (!editor) {
    return { initials: initialsFromLabel(fallbackLabel), tint: "default" };
  }
  return {
    initials: editor.initials,
    tint: EDITOR_TINT_TO_AVATAR_TINT[editor.tint],
  };
}
