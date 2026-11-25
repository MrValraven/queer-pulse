import { useId } from "react";
import type { QuizWinBadgeChip as QuizWinBadgeChipDTO } from "../../../shared/contracts/quizWinBadges";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { BadgeMedallion } from "../../members/BadgeMedallion";
import {
  quizBadgeModelOf,
  type QuizBadgePreviewInput,
} from "../../members/quizBadges";
import { QuizWinBadgeChip } from "../../quizshow/winBadges/QuizWinBadgeChip";
import { quizBadgeTextIn } from "../../quizshow/winBadges/quizWinBadgeText";
import styles from "./AdminQuizBadges.module.css";

const PREVIEW_DEFINITION_ID = "preview";

function previewChipOf(input: QuizBadgePreviewInput): QuizWinBadgeChipDTO {
  return {
    definitionId: PREVIEW_DEFINITION_ID,
    badgeKey: `quiz:${PREVIEW_DEFINITION_ID}`,
    name: input.name,
    iconKey: input.iconKey,
    tint: input.tint,
    rarity: input.rarity,
    isArchived: false,
  };
}

/**
 * The badge as members see it once they win it: the earned medallion from
 * their Badges page, its name and description in the viewer's language, and
 * the chip the event page and the results card draw.
 */
export function AdminQuizBadgePreview({
  input,
}: {
  input: QuizBadgePreviewInput;
}) {
  const { t, language } = useTranslation();
  const labelId = useId();
  const name = quizBadgeTextIn(input.name, language);
  const description = quizBadgeTextIn(input.description, language);

  return (
    <section className={styles.preview} aria-labelledby={labelId}>
      <span id={labelId} className={styles.fieldLabel}>
        {t("quizshow:winBadges.admin.form.preview")}
      </span>
      <div className={styles.previewBadge}>
        <BadgeMedallion badge={quizBadgeModelOf(input)} earned size="md" />
        <div className={styles.previewText}>
          <p className={styles.previewName}>{name}</p>
          <p className={styles.previewDescription}>{description}</p>
        </div>
      </div>
      <div className={styles.previewChip}>
        <QuizWinBadgeChip badge={previewChipOf(input)} size="md" />
      </div>
    </section>
  );
}
