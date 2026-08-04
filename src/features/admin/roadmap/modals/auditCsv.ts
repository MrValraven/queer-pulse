import type { RoadmapAuditEntryDTO } from "../../api/roadmapAdmin.types";

/** Quotes a field only when it needs it (contains a comma, quote, or newline),
 *  doubling any embedded quotes — the standard minimal CSV-escaping rule. */
function csvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Builds the audit-log CSV client-side in demo mode (there's no backend to
 * ask). Live mode instead downloads the real export from
 * `getRoadmapAuditCsv()` — this mirrors that endpoint's column order
 * (`id,actorLabel,action,createdAt`) so demo and live exports look the same
 * shape to whoever opens them.
 */
export function buildAuditCsv(entries: RoadmapAuditEntryDTO[]): string {
  const header = "id,actorLabel,action,createdAt";
  const rows = entries.map((entry) =>
    [entry.id, entry.actorLabel, entry.action, entry.createdAt]
      .map(csvField)
      .join(","),
  );
  return [header, ...rows].join("\n");
}

/** Triggers a browser download of `content` as `filename` — used by both the
 *  live (server CSV) and demo (client-built CSV) export paths so there's one
 *  download mechanism, not two. */
export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
