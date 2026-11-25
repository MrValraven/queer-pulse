import type {
  QuizBadgeDefinitionDTO,
  QuizBadgeTint,
} from "../../../shared/contracts/quizWinBadges";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { RARITY_LABEL_KEY } from "../../members/badgeSelectors";
import { quizBadgeIconNode } from "../../members/quizBadgeIcon";
import { quizBadgeTextIn } from "../../quizshow/winBadges/quizWinBadgeText";
import { AdminChip, adminTableClasses } from "../ui";
import { AdminQuizBadgeRowActions } from "./AdminQuizBadgeRowActions";
import { isQuizBadgeTint } from "./quizBadgeForm.model";
import styles from "./AdminQuizBadges.module.css";

const ICON_TINT_CLASS: Record<QuizBadgeTint, string | undefined> = {
  jade: styles.iconJade,
  accent: styles.iconAccent,
  plum: styles.iconPlum,
};

/** A tint a newer backend adds draws on jade, so the row never breaks. */
function iconTintClassOf(tint: string): string {
  return (
    (isQuizBadgeTint(tint) ? ICON_TINT_CLASS[tint] : styles.iconJade) ?? ""
  );
}

/**
 * One badge in the library: its icon on its colour, its name (a level 2
 * heading under the page H1) in the viewer's language, its rarity, how many
 * members hold it and how many events use it, an Archived tag, then the
 * actions.
 */
export function AdminQuizBadgeRow({
  definition,
  onEdit,
  onDelete,
}: {
  definition: QuizBadgeDefinitionDTO;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t, language } = useTranslation();
  const name = quizBadgeTextIn(definition.name, language);

  return (
    <article className={`${adminTableClasses.row} ${styles.card}`}>
      <div className={styles.cardTop}>
        <span
          className={`${styles.icon} ${iconTintClassOf(definition.tint)}`}
          aria-hidden
        >
          {quizBadgeIconNode(definition.iconKey)}
        </span>
        <div className={styles.cardHeading}>
          <h2 className={styles.title}>{name}</h2>
          <p className={styles.meta}>
            <span className={styles.metaItem}>
              {t(RARITY_LABEL_KEY[definition.rarity])}
            </span>
            <span className={styles.metaItem}>
              {t("quizshow:winBadges.admin.library.holders", {
                count: definition.holderCount,
              })}
            </span>
            <span className={styles.metaItem}>
              {t("quizshow:winBadges.admin.library.events", {
                count: definition.eventCount,
              })}
            </span>
          </p>
          <Collapse isOpen={definition.isArchived}>
            <span className={styles.archivedTag}>
              <AdminChip tone="ghost">
                {t("quizshow:winBadges.admin.library.archivedTag")}
              </AdminChip>
            </span>
          </Collapse>
        </div>
      </div>
      <AdminQuizBadgeRowActions
        definition={definition}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </article>
  );
}
