/** A6: one clean pronoun line. Splits on "," or ";", trims, drops empties,
 *  keeps the first spelling of each set (compared case-insensitively) and
 *  joins with ", ". */
export function formatPronouns(raw: string | null | undefined): string {
  if (!raw) return "";
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const part of raw.split(/[,;]/)) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const comparable = trimmed.toLocaleLowerCase();
    if (seen.has(comparable)) continue;
    seen.add(comparable);
    kept.push(trimmed);
  }
  return kept.join(", ");
}
