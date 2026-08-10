import { FiCheck } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PieceRecordView } from "../data/pieceRecord.data";
import { KV } from "./KV";
import styles from "./pieceTabs.module.css";

export interface BriefTabProps {
  record: PieceRecordView;
}

export function BriefTab({ record }: BriefTabProps) {
  const { t } = useTranslation();
  const brief = record.brief;

  if (!brief) {
    return (
      <div className={styles.stack}>
        <div className={styles.card}>
          <p className={styles.tiny}>{t("magazine:piece.brief.noBriefYet")}</p>
        </div>
      </div>
    );
  }

  const hasFiledWords = brief.filedWords !== null;
  const overWords = (brief.filedWords ?? 0) - (brief.wordCount ?? 0);

  return (
    <div className={styles.stack}>
      <div className={styles.card}>
        <h3>{t("magazine:piece.brief.commissionHeading")}</h3>
        <p className={styles.lede}>{brief.angle}</p>
        <div className={styles.kvs}>
          <KV
            label={t("magazine:piece.brief.commissioned")}
            value={`${brief.commissionedBy} · ${brief.commissionedOn}`}
          />
          <KV
            label={t("magazine:piece.brief.due")}
            value={record.due ?? t("magazine:piece.brief.noDateSet")}
          />
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
            warn={hasFiledWords && overWords > 200}
          />
          <KV label={t("magazine:piece.brief.fee")} value={brief.rate} />
          <KV label={t("magazine:piece.brief.killFee")} value={brief.killFee} />
        </div>
        {hasFiledWords && overWords > 0 ? (
          <div className={`${styles.note} ${styles.warn}`}>
            {t("magazine:piece.brief.overWordsWarning", { count: overWords })}
          </div>
        ) : null}
      </div>

      <div className={styles.card}>
        <h3>{t("magazine:piece.brief.whatWeAskedFor")}</h3>
        <ul className={styles.ticks}>
          {brief.wants.map((want) => (
            <li key={want}>
              <FiCheck />
              {want}
            </li>
          ))}
        </ul>
        <div className={styles.note}>
          <b>{t("magazine:piece.brief.avoidLabel")}</b> {brief.avoid}
        </div>
        <div className={styles.note}>
          <b>{t("magazine:piece.brief.artLabel")}</b> {brief.art}
        </div>
        <div className={styles.row}>
          <Button size="sm" variant="ghost">
            {t("magazine:piece.brief.sendToWriter")}
          </Button>
          <Button size="sm" variant="ghost">
            {t("magazine:piece.brief.saveAsTemplate")}
          </Button>
        </div>
      </div>

      <div className={styles.card}>
        <h3>{t("magazine:piece.brief.similarHeading")}</h3>
        {record.similar.map((similarPiece) => (
          <div key={similarPiece.title} className={styles.simrow}>
            <div>
              <b>{similarPiece.title}</b>
              <span className={styles.tiny}>
                {" "}
                {t("magazine:piece.brief.similarIssueBy", {
                  issue: similarPiece.issue,
                  by: similarPiece.by,
                })}
              </span>
              <div className={styles.tiny}>{similarPiece.why}</div>
            </div>
            <Button size="sm" variant="ghost">
              {t("magazine:piece.brief.readButton")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
