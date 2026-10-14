import type { StudioSource } from "./api/studio.types";

/** A row with one field filled and the other empty. */
export function isIncompleteSource(source: StudioSource): boolean {
  const hasTitle = source.title.trim().length > 0;
  const hasArtist = source.artist.trim().length > 0;
  return hasTitle !== hasArtist;
}

/** The rows as they save: each field trimmed, empty rows left out. */
export function cleanSources(sources: readonly StudioSource[]): StudioSource[] {
  return sources
    .map((source) => ({
      title: source.title.trim(),
      artist: source.artist.trim(),
    }))
    .filter((source) => source.title && source.artist);
}

/** Rows on their way out stay inert while they fold, so focus skips them. */
const PRESENT_ROW = "li:not([inert])";

/** The title fields of the rows still on screen, in order. */
export function presentSourceTitles(
  container: HTMLElement,
): HTMLInputElement[] {
  return [
    ...container.querySelectorAll<HTMLInputElement>(
      `${PRESENT_ROW} input[data-source-title]`,
    ),
  ];
}

/** Focus (and so scroll to) the first field marked incomplete. */
export function focusFirstIncompleteSource(container: HTMLElement | null) {
  container
    ?.querySelector<HTMLInputElement>(
      `${PRESENT_ROW} input[aria-invalid="true"]`,
    )
    ?.focus();
}
