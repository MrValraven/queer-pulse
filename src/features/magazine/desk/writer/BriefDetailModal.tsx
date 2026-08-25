import { FiCheck } from "react-icons/fi";
import { Button, Modal } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { WriterAssignmentDto } from "../../api/writerWorkspace.api";
import { KV } from "../KV";
import pieceStyles from "../pieceTabs.module.css";
import modalStyles from "../DeskModals.module.css";

export interface BriefDetailModalProps {
  assignment: WriterAssignmentDto;
  onClose: () => void;
}

/**
 * "Read the brief" (CNT-6) — the full commission brief for one assignment,
 * read-only from the writer's side. Mirrors the editor-facing `BriefTab`'s
 * content, but reads the writer-scoped `WriterAssignmentDto` fields (never
 * the editor's `PieceCare`/internal notes — see `magazine-writer-response.ts`'s
 * own scoping comment).
 */
export function BriefDetailModal({
  assignment,
  onClose,
}: BriefDetailModalProps) {
  const { t } = useTranslation();
  const hasBrief =
    assignment.note.length > 0 ||
    assignment.wants.length > 0 ||
    assignment.avoid.length > 0 ||
    assignment.rate.length > 0 ||
    assignment.terms.killFee.length > 0 ||
    assignment.commissionedBy.length > 0;

  return (
    <Modal
      title={t("magazine:writer.brief.title", { title: assignment.title })}
      onClose={onClose}
      footer={
        <div className={modalStyles.actions}>
          <Button variant="primary" onClick={onClose}>
            {t("magazine:writer.brief.close")}
          </Button>
        </div>
      }
    >
      {!hasBrief ? (
        <p className={modalStyles.body}>{t("magazine:writer.brief.noBrief")}</p>
      ) : (
        <div className={pieceStyles.stack}>
          {assignment.note.length > 0 && (
            <div>
              <b>{t("magazine:writer.brief.angleLabel")}</b>
              <p className={modalStyles.body}>{assignment.note}</p>
            </div>
          )}

          <div className={pieceStyles.kvs}>
            <KV
              label={t("magazine:writer.brief.wordCountLabel")}
              value={
                assignment.target !== null
                  ? t("magazine:format.words", { count: assignment.target })
                  : t("magazine:writer.work.noDateSet")
              }
            />
            <KV
              label={t("magazine:writer.brief.rateLabel")}
              value={assignment.rate}
            />
            <KV
              label={t("magazine:writer.brief.killFeeLabel")}
              value={assignment.terms.killFee}
            />
            <KV
              label={t("magazine:writer.brief.commissionedByLabel")}
              value={assignment.commissionedBy}
            />
            <KV
              label={t("magazine:writer.brief.commissionedOnLabel")}
              value={assignment.commissionedOn}
            />
          </div>

          {assignment.wants.length > 0 && (
            <div>
              <b>{t("magazine:writer.brief.wantsLabel")}</b>
              <ul className={pieceStyles.ticks}>
                {assignment.wants.map((want) => (
                  <li key={want}>
                    <FiCheck aria-hidden />
                    {want}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {assignment.avoid.length > 0 && (
            <div className={pieceStyles.note}>
              <b>{t("magazine:writer.brief.avoidLabel")}</b> {assignment.avoid}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
