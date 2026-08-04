import type {
  AdminRoadmapIdea,
  AdminRoadmapItem,
} from "../../adminRoadmap.data";
import type { TFunction } from "../../../../shared/i18n/types";

/**
 * Builds the "You asked, we built" monthly digest as plain markdown, entirely
 * client-side from the current board — no dedicated digest endpoint exists
 * (or needs to: everything it draws from is already in `useAdminRoadmap()`'s
 * bundle). Headings/labels come from `admin:roadmap.modals.digest.*` so the
 * scaffolding translates; the bullet lines themselves are generated content
 * (item names, dates, freeform reasons) an admin is expected to edit before
 * sending, so they're composed directly rather than routed through more i18n
 * keys that don't exist for this shape.
 */
export function buildDigestMarkdown(
  items: AdminRoadmapItem[],
  ideas: AdminRoadmapIdea[],
  t: TFunction,
): string {
  const month = new Date().toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const shipped = items.filter(
    (item) => item.column === "shipped" && item.isPublic,
  );
  const movedLines = items.flatMap((item) =>
    item.slips.map(
      (slip) => `- "${item.name}" moved ${slip.from} → ${slip.to}: ${slip.reason}`,
    ),
  );
  const declined = ideas.filter((idea) => idea.status === "dismissed");
  const buildingCount = items.filter((item) => item.column === "building").length;

  const lines: string[] = [
    `# ${t("admin:roadmap.modals.digest.heading", { month })}`,
    "",
    `## ${t("admin:roadmap.modals.digest.shippedHeading")}`,
    ...(shipped.length > 0
      ? shipped.map((item) => `- ${item.publicNote || item.name}`)
      : ["- —"]),
    "",
    `## ${t("admin:roadmap.modals.digest.movedHeading")}`,
    ...(movedLines.length > 0
      ? movedLines
      : [`- ${t("admin:roadmap.modals.digest.movedEmpty")}`]),
    "",
    `## ${t("admin:roadmap.modals.digest.declinedHeading")}`,
    ...(declined.length > 0
      ? declined.map(
          (idea) =>
            `- ${idea.text}${idea.declineNote ? ` — ${idea.declineNote}` : ""}`,
        )
      : ["- —"]),
    "",
    t("admin:roadmap.modals.digest.footer", { count: buildingCount }),
  ];

  return lines.join("\n");
}
