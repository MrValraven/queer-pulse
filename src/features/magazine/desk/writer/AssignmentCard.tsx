import { Badge, Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { WriterAssignmentDto } from "../../api/writerWorkspace.api";
import pieceStyles from "../pieceTabs.module.css";
import styles from "./writerCards.module.css";

export interface AssignmentCardProps {
  assignment: WriterAssignmentDto;
  /** Whether this is the rail's active assignment (see `WriterWorkspacePage`) —
   *  the one `AgreedTermsCard`/`BylineSafetyCard`/`EditorMessageCard` read from. */
  isActive: boolean;
  /** Marks this assignment as the rail's active one. */
  onSelect: (assignment: WriterAssignmentDto) => void;
  /** Opens the file-a-draft modal for this assignment. */
  onFileDraft: (assignment: WriterAssignmentDto) => void;
  /** Opens the real per-piece message thread with the assigned editor (Phase 7 Wave F). */
  onMessageEditor: (assignment: WriterAssignmentDto) => void;
  /** Stub feedback for "Read the brief", which has no backing endpoint yet. */
  onToast: (message: string) => void;
}

interface KVProps {
  label: string;
  value: string;
  warn?: boolean;
}

function KV({ label, value, warn }: KVProps) {
  return (
    <div className={pieceStyles.kv}>
      <span>{label}</span>
      <b className={warn ? pieceStyles.warn : undefined}>{value}</b>
    </div>
  );
}

/**
 * One commissioned piece from the writer's own point of view — the same
 * `magazine_piece` an editor sees on the desk, but through the writer-scoped
 * `WriterAssignmentDto` projection (brief-adjacent fields only, never other
 * contributors' data or internal editor notes). "File a draft" and "Message
 * editor" (Phase 7 Wave F, the real per-piece thread) are both wired to real
 * backends — only "Read the brief" has no backing endpoint yet, so it stays
 * an honest toast stub.
 */
export function AssignmentCard({
  assignment,
  isActive,
  onSelect,
  onFileDraft,
  onMessageEditor,
  onToast,
}: AssignmentCardProps) {
  const { t } = useTranslation();
  const hasWordCount = assignment.words !== null && assignment.target !== null;
  const isOverTarget = hasWordCount && assignment.words! > assignment.target!;
  const progressPct = hasWordCount
    ? Math.min(100, Math.round((assignment.words! / assignment.target!) * 100))
    : 0;
  const isPaymentUnpaid = assignment.pay.toLowerCase().includes("unpaid");

  return (
    <div className={pieceStyles.card}>
      <div className={styles.head}>
        <span className={styles.eyebrow}>{assignment.section}</span>
        <div className={styles.badges}>
          {isActive && <Badge tone="jade">{t("magazine:writer.work.activeBadge")}</Badge>}
          <Badge tone="plum" dot>
            {assignment.state}
          </Badge>
        </div>
      </div>

      <h3 className={pieceStyles.lede}>{assignment.title}</h3>

      <div className={pieceStyles.note}>{assignment.note}</div>

      <div className={pieceStyles.kvs}>
        <KV
          label={t("magazine:writer.work.dueLabel")}
          value={assignment.due ?? t("magazine:writer.work.noDateSet")}
        />
        <KV
          label={t("magazine:writer.work.lengthLabel")}
          value={
            hasWordCount
              ? t("magazine:writer.work.length", {
                  words: assignment.words ?? undefined,
                  target: assignment.target ?? undefined,
                })
              : t("magazine:writer.work.notFiledYet")
          }
          warn={isOverTarget}
        />
        <KV label={t("magazine:writer.work.feeLabel")} value={assignment.fee} />
        <KV label={t("magazine:writer.work.paymentLabel")} value={assignment.pay} warn={isPaymentUnpaid} />
      </div>

      {hasWordCount && (
        <div className={pieceStyles.prog}>
          <i
            style={{
              width: `${progressPct}%`,
              background: isOverTarget ? "var(--accent)" : "var(--jade)",
            }}
          />
        </div>
      )}

      <div className={pieceStyles.row}>
        <Button size="sm" variant="primary" onClick={() => onFileDraft(assignment)}>
          {t("magazine:writer.work.fileDraft")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onToast(t("magazine:writer.work.readBriefToast"))}
        >
          {t("magazine:writer.work.readBrief")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onMessageEditor(assignment)}>
          {t("magazine:writer.work.messageEditor")}
        </Button>
        {!isActive && (
          <Button size="sm" variant="ghost" onClick={() => onSelect(assignment)}>
            {t("magazine:writer.work.setActive")}
          </Button>
        )}
      </div>
    </div>
  );
}
