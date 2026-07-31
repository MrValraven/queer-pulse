/**
 * Client-side file downloads via a temporary `<a download>` element +
 * `URL.createObjectURL`. The prototype has no file-serving backend, so exports
 * (CSV, `.ics` calendars, `.vcf` cards, JSON dumps) are generated in the browser
 * and handed to the user this way — identical in demo and live mode.
 */

/** Trigger a browser download of an in-memory Blob under `filename`. */
export function downloadBlobFile(filename: string, blob: Blob): void {
  // Guard for SSR / non-DOM environments (e.g. calendar exports called in tests).
  if (typeof document === "undefined") return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke on the next tick so the click has flushed before the URL is released.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Build a Blob from string `content` + MIME type, then download it. */
export function downloadBlob(
  filename: string,
  content: string,
  mime: string,
): void {
  downloadBlobFile(filename, new Blob([content], { type: mime }));
}

/**
 * Serialise `rows` to a double-quote-escaped CSV string and download it. Every
 * cell is quoted so embedded commas, quotes, and newlines survive round-trips.
 */
export function downloadCsv(filename: string, rows: string[][]): void {
  const escapeCell = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
  const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
  downloadBlob(filename, csv, "text/csv;charset=utf-8;");
}
