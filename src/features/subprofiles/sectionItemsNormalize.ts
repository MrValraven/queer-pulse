import type { SubprofileEditorRow } from "./subprofileSectionEditorRows";

/** A description's non-blank lines, each trimmed. */
export const nonBlankLines = (description: string): string[] =>
  description
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

/**
 * Rows of a section edited through a `sectionItems` control (a therapist's
 * topics) as the page shows them: the title trimmed, the description's lines
 * trimmed with blank lines dropped, and rows left with neither dropped. The
 * inline editor can hold a blank topic (straight after "Add a topic") or a
 * trailing empty line while typing; neither is content, so the save sends and
 * the diff compares these rows. Each row keeps its `_uid`, so a normalised
 * draft and baseline still diff row by row.
 */
export function normalizeSectionItemRows(
  rows: SubprofileEditorRow[],
): SubprofileEditorRow[] {
  return rows
    .map((row) => ({
      ...row,
      title: row.title.trim(),
      description: nonBlankLines(row.description).join("\n"),
    }))
    .filter((row) => row.title !== "" || row.description !== "");
}
