import { FormField, Select } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { WriterAssignmentDto } from "../../api/writerWorkspace.api";
import pieceStyles from "../pieceTabs.module.css";

export interface BylineSafetyCardProps {
  /** The rail's active assignment (`WriterWorkspacePage`), or `undefined` when
   *  the writer has no assignments. */
  assignment: WriterAssignmentDto | undefined;
  onUpdateByline: (pieceId: string, byline: string) => void;
}

/** "Sara Pinheiro" → "Sara P.". Falls back to the full name for a single-word
 *  byline, since there's no surname to initial. */
function initialedByline(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return fullName;
  return `${parts[0]} ${parts[parts.length - 1]![0]}.`;
}

/**
 * The erail "Your safety" card — a byline chooser for the writer's current
 * assignment. Only one piece can be edited here at a time (the design keeps
 * this simple); with several open assignments, this reads whichever one is
 * active in the "Your work" list (`WriterWorkspacePage`'s `activeAssignment`,
 * defaulting to the first, selectable per-assignment via `AssignmentCard`).
 */
export function BylineSafetyCard({ assignment, onUpdateByline }: BylineSafetyCardProps) {
  const { t } = useTranslation();
  const current = assignment;
  const anonymousByline = t("magazine:writer.byline.anonymous");

  return (
    <div className={pieceStyles.card}>
      <h3>{t("magazine:writer.byline.heading")}</h3>
      <p className={pieceStyles.tiny}>{t("magazine:writer.byline.body")}</p>
      {current ? (
        <FormField label={t("magazine:writer.byline.fieldLabel", { title: current.title })}>
          <Select
            value={current.byline}
            onChange={(value) => onUpdateByline(current.id, value ?? "")}
            options={[
              current.byline,
              initialedByline(current.byline),
              anonymousByline,
            ]
              .filter((option, index, all) => all.indexOf(option) === index)
              .map((byline) => ({ value: byline, label: byline }))}
          />
        </FormField>
      ) : (
        <p className={pieceStyles.tiny}>{t("magazine:writer.byline.emptyState")}</p>
      )}
    </div>
  );
}
