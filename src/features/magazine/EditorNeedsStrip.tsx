import { FiArrowRight } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  needsYouNow,
  isLate,
  dueInfo,
  stripEm,
  firstName,
  STAGE_LABEL_KEY,
  type Piece,
  type Editor,
} from "./editorDashboard.data";
import { cx } from "../../shared/lib/cx";
import styles from "./EditorDashboardPage.module.css";

/** The urgent "Needs you now" strip — late pieces + things in your court. */
export function EditorNeedsStrip({
  pieces,
  me,
  onOpen,
  onChase,
}: {
  pieces: Piece[];
  me: Editor;
  onOpen: (piece: Piece) => void;
  onChase: (piece: Piece) => void;
}) {
  const { t } = useTranslation();
  const urgent = needsYouNow(pieces, me);

  if (!urgent.length) {
    return (
      <section className={styles.needs}>
        <div className={styles.needsClear}>
          <Translation
            i18nKey="magazine:editor.needsStrip.allClear"
            components={{ emph: <span /> }}
            values={{ name: me }}
          />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.needs}>
      <div className={styles.needsHead}>
        <Translation
          i18nKey="magazine:editor.needsStrip.heading"
          components={{ em: <em /> }}
          values={{ count: urgent.length }}
        />
      </div>
      <div className={styles.needsCards}>
        {urgent.map((p) => {
          const late = isLate(p);
          const di = dueInfo(p.due, t);
          const isChase = late && p.blocked === "writer";
          const stageLabel = t(STAGE_LABEL_KEY[p.stage]);
          const reason = late
            ? p.blocked === "writer"
              ? t("magazine:editor.needsStrip.writerHasntFiled")
              : t("magazine:editor.needsStrip.overdueAt", { stage: stageLabel })
            : t("magazine:editor.needsStrip.sittingInCourt", {
                stage: stageLabel,
              });
          const action = isChase
            ? t("magazine:editor.needsStrip.chase", {
                name: firstName(p.author),
              })
            : late
              ? t("magazine:editor.pieceRow.open")
              : t("magazine:editor.needsStrip.pickUp");
          return (
            <button
              key={p.id}
              type="button"
              className={cx(
                styles.needsCard,
                late ? styles.late : styles.court,
              )}
              onClick={() => (isChase ? onChase(p) : onOpen(p))}
            >
              <span className={styles.needsTag}>
                {late ? di.label : t("magazine:editor.needsStrip.yourCourt")}
              </span>
              <span className={styles.needsTitle}>{stripEm(p.title)}</span>
              <span className={styles.needsReason}>{reason}</span>
              <span className={styles.needsCta}>
                {action} <FiArrowRight aria-hidden />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
