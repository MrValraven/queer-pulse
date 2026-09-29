import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { WriterAssignmentDto } from "../../api/writerWorkspace.api";
import { deskDateText } from "../../magazineFormat";
import styles from "../../WriterWorkspacePage.module.css";

/** A bare `yyyy-mm-dd`, which is what live `due` values are (`magazine_piece.due_on`
 *  is a Postgres `date`) and what the demo fixture's free text ("4 Aug") is not. */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The soonest deadline across the writer's open assignments, as its raw `due`
 * value. ISO values sort lexically, so live mode gets a real "next up"; the demo
 * fixture's free-text dates can't be ordered, so those fall back to the first
 * assignment that carries one. Returns `null` when nothing has a date set.
 */
function nextDueValue(assignments: WriterAssignmentDto[]): string | null {
  const dueValues = assignments
    .map((assignment) => assignment.due)
    .filter((due): due is string => Boolean(due));
  const isoValues = dueValues
    .filter((due) => ISO_DATE_PATTERN.test(due))
    .sort();
  return isoValues[0] ?? dueValues[0] ?? null;
}

export interface WriterWorkspaceHeaderProps {
  assignments: WriterAssignmentDto[];
}

/**
 * The workspace's `.ebar`: the surface name plus the writer's open workload.
 * It deliberately does NOT restate who you are: the meganav already carries
 * the signed-in avatar and name a few pixels above, so a second identity block
 * would spend a sticky header on nothing. Extracted so `WriterWorkspacePage`
 * stays under the 200-line component limit.
 */
export function WriterWorkspaceHeader({
  assignments,
}: WriterWorkspaceHeaderProps) {
  const { t, language } = useTranslation();
  const nextDue = nextDueValue(assignments);
  // "2 assignments open · next due 29 Aug", collapsing to a quiet line when the
  // desk is clear. `deskDateText` is the same helper every assignment card uses,
  // and it returns an unparseable value unchanged, so the demo fixture's
  // "4 Aug" passes straight through.
  const workloadSummary =
    assignments.length === 0
      ? t("magazine:writer.page.nothingOpen")
      : [
          t("magazine:writer.page.openCount", { count: assignments.length }),
          nextDue
            ? t("magazine:writer.page.nextDue", {
                date: deskDateText(nextDue, language),
              })
            : null,
        ]
          .filter(Boolean)
          .join(" · ");

  return (
    <div className={styles.ebar}>
      <div className={styles.title}>
        <h1>{t("magazine:writer.page.heading")}</h1>
        <span className={styles.titleSub}>{workloadSummary}</span>
      </div>
    </div>
  );
}
