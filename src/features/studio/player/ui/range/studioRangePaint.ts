/** Writes the playhead fraction (0 to 1) the slider styles read. */
export function paintStudioRangeProgress(
  element: HTMLDivElement,
  fraction: number,
): void {
  element.style.setProperty("--studio-range-progress", String(fraction));
}
