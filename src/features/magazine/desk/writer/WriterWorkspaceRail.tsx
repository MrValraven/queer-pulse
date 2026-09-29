import type { WriterAssignmentDto } from "../../api/writerWorkspace.api";
import { AgreedTermsCard } from "./AgreedTermsCard";
import { BylineSafetyCard } from "./BylineSafetyCard";
import { EditorMessageCard } from "./EditorMessageCard";
import styles from "../../WriterWorkspacePage.module.css";

export interface WriterWorkspaceRailProps {
  assignment: WriterAssignmentDto | undefined;
  onOpenThread: (assignment: WriterAssignmentDto) => void;
  onUpdateByline: (pieceId: string, byline: string) => void;
}

/**
 * The workspace's `.erail` sidebar: the editor's latest message, the agreed
 * terms and the byline picker, all for the rail's active assignment. The page
 * renders it beside every tab except Submissions, whose story submissions have
 * no assignment to describe. Extracted so `WriterWorkspacePage` stays under the
 * 200-line component limit.
 */
export function WriterWorkspaceRail({
  assignment,
  onOpenThread,
  onUpdateByline,
}: WriterWorkspaceRailProps) {
  return (
    <aside className={styles.erail}>
      <EditorMessageCard assignment={assignment} onOpenThread={onOpenThread} />
      <AgreedTermsCard assignment={assignment} />
      <BylineSafetyCard
        assignment={assignment}
        onUpdateByline={onUpdateByline}
      />
    </aside>
  );
}
