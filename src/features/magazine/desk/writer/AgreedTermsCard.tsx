import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { WriterAssignmentDto } from "../../api/writerWorkspace.api";
import pieceStyles from "../pieceTabs.module.css";

export interface AgreedTermsCardProps {
  /** The rail's active assignment (`WriterWorkspacePage`), or `undefined` when
   *  the writer has no assignments. */
  assignment: WriterAssignmentDto | undefined;
}

interface KVProps {
  label: string;
  value: string;
}

function KV({ label, value }: KVProps) {
  return (
    <div className={pieceStyles.kv}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

/**
 * The erail "What you agreed to" card — the real kill-fee/rights/edits terms
 * from the writer's own assignment (`WriterAssignmentResponse.terms`), not
 * static boilerplate. With several open assignments this shows whichever one
 * is active in the "Your work" list (`WriterWorkspacePage`'s
 * `activeAssignment`, defaulting to the first).
 */
export function AgreedTermsCard({ assignment }: AgreedTermsCardProps) {
  const { t } = useTranslation();
  const current = assignment;

  return (
    <div className={pieceStyles.card}>
      <h3>{t("magazine:writer.terms.heading")}</h3>
      <p className={pieceStyles.tiny}>{t("magazine:writer.terms.body")}</p>
      {current ? (
        <div className={pieceStyles.kvs}>
          <KV
            label={t("magazine:writer.terms.killFeeLabel")}
            value={current.terms.killFee}
          />
          <KV
            label={t("magazine:writer.terms.rightsLabel")}
            value={current.terms.rights}
          />
          <KV
            label={t("magazine:writer.terms.editsLabel")}
            value={current.terms.edits}
          />
        </div>
      ) : (
        <p className={pieceStyles.tiny}>
          {t("magazine:writer.terms.emptyState")}
        </p>
      )}
    </div>
  );
}
