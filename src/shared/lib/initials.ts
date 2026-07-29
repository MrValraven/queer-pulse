/**
 * Canonical avatar-initials helpers. Before this module, ~30 features each
 * reimplemented the same "name → two-letter mark" logic inline (with subtly
 * different edge-case handling). Everything now routes through here.
 *
 * Three distinct semantics are needed in practice, so there are three helpers:
 *   - `initialsFromName`  — personal names: first + last word ("Maria João Silva" → "MS")
 *   - `leadingInitials`   — org / community names: the leading words ("Community Arts Space" → "CA")
 *   - `initialsFromParts` — DTOs that carry `firstName` / `lastName` separately
 *   - `orgBadgeInitials`  — org logo chips that pad a single-word name to two letters
 */

/**
 * Two-letter initials from a display name, taking the FIRST and LAST words and
 * skipping anything in between ("Maria João Silva" → "MS"). The right choice for
 * personal names, where the surname is the last word. Empty or whitespace-only
 * names yield `fallback` (default "").
 */
export function initialsFromName(fullName: string, fallback = ""): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return fallback;
  const firstInitial = words[0]?.[0] ?? "";
  const lastInitial =
    words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (firstInitial + lastInitial).toUpperCase();
}

/**
 * Initials from the LEADING words of a name ("Community Arts Space" → "CA") —
 * one letter per word for the first `wordCount` words (default 2). Preferred for
 * org / community names, where the leading words carry the identity. Empty or
 * whitespace-only names yield `fallback` (default "").
 */
export function leadingInitials(
  fullName: string,
  {
    wordCount = 2,
    fallback = "",
  }: { wordCount?: number; fallback?: string } = {},
): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return fallback;
  return words
    .slice(0, wordCount)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
}

/**
 * Initials from an explicit first-name / last-name pair ("Ana", "Silva" → "AS").
 * Either part may be empty. The canonical form for `MemberRef`-style DTOs that
 * carry `firstName` / `lastName` separately.
 */
export function initialsFromParts(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

/**
 * Badge / logo initials for an organisation or company name: the first letters
 * of the first two words ("Casa Trans" → "CT"), or the first two characters when
 * there is only a single word ("Rádio" → "RÁ") so the mark never looks unbalanced.
 * Empty names yield `fallback` (default "QP").
 */
export function orgBadgeInitials(name: string, fallback = "QP"): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
  }
  return ((words[0] ?? "").slice(0, 2) || fallback).toUpperCase();
}
