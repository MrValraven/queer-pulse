import { EmptyState } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { WriterAssignmentDto } from "../../api/writerWorkspace.api";
import { AssignmentCard } from "./AssignmentCard";
import pieceStyles from "../pieceTabs.module.css";

export interface WriterWorkTabProps {
  assignments: WriterAssignmentDto[];
  /** The rail's active assignment id (`WriterWorkspacePage`'s `activeAssignment`). */
  activeAssignmentId: string | undefined;
  onSelectAssignment: (assignment: WriterAssignmentDto) => void;
  onFileDraft: (assignment: WriterAssignmentDto) => void;
  onMessageEditor: (assignment: WriterAssignmentDto) => void;
  onReadBrief: (assignment: WriterAssignmentDto) => void;
}

/** The "Your work" tab body of `WriterWorkspacePage` — the writer's own
 *  assignment list, one `AssignmentCard` per commissioned piece. Extracted so
 *  the page component stays under the 200-line component limit. */
export function WriterWorkTab({
  assignments,
  activeAssignmentId,
  onSelectAssignment,
  onFileDraft,
  onMessageEditor,
  onReadBrief,
}: WriterWorkTabProps) {
  const { t } = useTranslation();

  if (assignments.length === 0) {
    return (
      <EmptyState
        compact
        title={t("magazine:writer.work.emptyTitle")}
        description={t("magazine:writer.work.emptyDescription")}
      />
    );
  }

  return (
    <div className={pieceStyles.stack}>
      {assignments.map((assignment) => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          isActive={assignment.id === activeAssignmentId}
          onSelect={onSelectAssignment}
          onFileDraft={onFileDraft}
          onMessageEditor={onMessageEditor}
          onReadBrief={onReadBrief}
        />
      ))}
    </div>
  );
}
