import { useId } from "react";
import { FiCheck } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import { LoadErrorState, SkeletonLine } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { usePieceRecord } from "../api/usePieceRecord";
import type { PieceRecordView } from "../data/pieceRecord.data";
import type { Piece } from "../data/desk.data";
import { KV } from "./KV";
import { MoneyMiniCard } from "./MoneyMiniCard";
import { PiecePeekThread } from "./PiecePeekThread";
import tabStyles from "./pieceTabs.module.css";
import styles from "./PiecePeekPanel.module.css";

export interface PiecePeekBodyProps {
  piece: Piece;
  onOpenFullRecord: (piece: Piece) => void;
}

/**
 * The brief in short: the angle, what we asked for, and the length against
 * what was filed. `BriefTab` itself carries the similar-pieces list and the
 * send and template buttons, which belong on the full record, so the peek
 * reads the same `brief` fields and reuses its `KV` rows. The due date and
 * the fee are left out: the status block and the money section hold them.
 */
function PiecePeekBrief({
  record,
  headingId,
}: {
  record: PieceRecordView;
  headingId: string;
}) {
  const { t } = useTranslation();
  const brief = record.brief;
  const overWords = (brief?.filedWords ?? 0) - (brief?.wordCount ?? 0);

  return (
    <section className={styles.block} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.blockHeading}>
        {t("magazine:piece.tabs.brief")}
      </h3>
      {brief === null ? (
        <p className={styles.muted}>{t("magazine:piece.brief.noBriefYet")}</p>
      ) : (
        <>
          <p className={styles.angle}>{brief.angle}</p>
          {brief.wants.length > 0 && (
            <ul className={styles.wants}>
              {brief.wants.map((want) => (
                <li key={want}>
                  <FiCheck aria-hidden />
                  {want}
                </li>
              ))}
            </ul>
          )}
          <div className={tabStyles.kvs}>
            <KV
              label={t("magazine:piece.brief.length")}
              value={
                brief.wordCount !== null
                  ? t("magazine:format.words", { count: brief.wordCount })
                  : t("magazine:piece.brief.noTargetSet")
              }
            />
            <KV
              label={t("magazine:piece.brief.filedAt")}
              value={
                brief.filedWords !== null
                  ? t("magazine:format.words", { count: brief.filedWords })
                  : t("magazine:piece.brief.notFiledYet")
              }
              warn={brief.filedWords !== null && overWords > 200}
            />
          </div>
        </>
      )}
    </section>
  );
}

/**
 * The lower half of the peek: brief, latest messages and money. The brief and
 * money load with `usePieceRecord`, the query the full record page uses. The
 * thread needs only the piece id, so it loads alongside and still shows when
 * the record fails. Keyed on the piece id by the panel, so stepping to
 * another piece starts a fresh reply draft.
 *
 * Retry invalidates the record's `["magazine-piece", id]` prefix, the same
 * key `usePieceMutations` busts, since the hook exposes no `refetch`.
 */
export function PiecePeekBody({ piece, onOpenFullRecord }: PiecePeekBodyProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { record, isLoading, isError } = usePieceRecord(piece.id);
  const briefHeadingId = useId();
  const threadHeadingId = useId();

  function renderRecordState() {
    if (isLoading) {
      return (
        <div className={styles.skeleton} aria-busy="true">
          <SkeletonLine width="40%" height={12} />
          <SkeletonLine width="90%" height={16} />
          <SkeletonLine width="75%" height={16} />
          <SkeletonLine width="55%" height={14} />
        </div>
      );
    }
    if (isError || !record) {
      return (
        <div>
          <LoadErrorState
            compact
            title={t("magazine:desk.peek.recordErrorTitle")}
            onRetry={() =>
              void queryClient.invalidateQueries({
                queryKey: ["magazine-piece", piece.id],
              })
            }
          />
        </div>
      );
    }
    return <PiecePeekBrief record={record} headingId={briefHeadingId} />;
  }

  return (
    <div className={styles.body}>
      {renderRecordState()}
      <PiecePeekThread pieceId={piece.id} headingId={threadHeadingId} />
      {/* The full record opens on its Brief tab; the record page has no
          deep link to Money yet, so "Open money" lands one tab short. */}
      {record && !isError && (
        <div className={styles.money}>
          <MoneyMiniCard
            payment={record.payment}
            onOpenMoney={() => onOpenFullRecord(piece)}
          />
        </div>
      )}
    </div>
  );
}
