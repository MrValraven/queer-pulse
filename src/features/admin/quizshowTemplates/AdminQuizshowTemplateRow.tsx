import { useId } from "react";
import type { QuizshowTemplateRow } from "../../../shared/contracts/quizshow";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatRelative } from "../../../shared/lib/date";
import { templateCardTitleOf } from "../../quizshow/templates/quizshowTemplateResponse";
import { AdminChip } from "../ui";
import { AdminQuizshowTemplateRowActions } from "./AdminQuizshowTemplateRowActions";
import {
  TEMPLATE_STATUS_LABEL_KEYS,
  TEMPLATE_STATUS_TONES,
} from "./quizshowTemplateList.data";
import styles from "./AdminQuizshowTemplates.module.css";

/**
 * One quiz template in the staff list: its card title (a level 2 heading under the page H1) in the viewer's
 * language, its status, an 18+ chip when a round is for adults, its size and
 * who last edited it. The actions below name this title as their description.
 */
export function AdminQuizshowTemplateRow({
  row,
}: {
  row: QuizshowTemplateRow;
}) {
  const { t, language } = useTranslation();
  const formatters = useFormat();
  const titleId = useId();
  const cardTitle = templateCardTitleOf(row.title, language);
  const editedTime = formatRelative(row.updatedAt, formatters);
  const editedText =
    row.updatedByName === null
      ? t("quizshow:templates.row.edited", { time: editedTime })
      : t("quizshow:templates.row.editedBy", {
          name: row.updatedByName,
          time: editedTime,
        });

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <h2 id={titleId} className={styles.title}>
          {cardTitle === "" ? t("quizshow:templates.row.untitled") : cardTitle}
        </h2>
        <div className={styles.chips}>
          <AdminChip tone={TEMPLATE_STATUS_TONES[row.status]}>
            {t(TEMPLATE_STATUS_LABEL_KEYS[row.status])}
          </AdminChip>
          {/* Only a builder save changes the rounds, so this chip never toggles on this page. */}
          {row.hasAdultsRounds && (
            <AdminChip tone="amber">
              {t("quizshow:games.row.adultsTag")}
            </AdminChip>
          )}
        </div>
      </div>

      <p className={styles.meta}>
        <span className={styles.metaItem}>
          {t("quizshow:packs.rounds", { count: row.roundCount })}
        </span>
        <span className={styles.metaItem}>
          {t("quizshow:packs.questions", { count: row.questionCount })}
        </span>
        <span className={styles.metaItem}>{editedText}</span>
      </p>

      <AdminQuizshowTemplateRowActions row={row} titleId={titleId} />
    </article>
  );
}
