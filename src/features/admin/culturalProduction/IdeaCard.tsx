import { FiCheckSquare, FiMessageSquare } from "react-icons/fi";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminChip } from "../ui";
import {
  CULTURAL_TIME_ZONE,
  type CulturalIdeaListItemDTO,
} from "./api/culturalProduction.types";
import { CulturalAssigneeStack } from "./CulturalAssigneeStack";
import { CulturalEventTypeChip } from "./CulturalEventTypeChip";
import {
  CULTURAL_IDEA_STATUS_KEY,
  CULTURAL_IDEA_STATUS_TONE,
} from "./culturalProductionLabels.data";
import styles from "./Ideas.module.css";

const CARD_PREFIX = "admin:culturalProduction.ideas.card";
const BACKERS_SHOWN = 5;

/** The day an idea was added, in Lisbon. */
const BYLINE_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: CULTURAL_TIME_ZONE,
};

/**
 * One idea on the Ideas grid: one card, opened by a real button that covers
 * it (its title). Title, a two-line description, the event type and status,
 * who added it and when, who is in, and the comment and task counts.
 */
export function IdeaCard({
  idea,
  onOpen,
}: {
  idea: CulturalIdeaListItemDTO;
  onOpen: (ideaId: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const date = fmt.date(new Date(idea.createdAt), BYLINE_DATE);
  const byline =
    idea.author === null
      ? t("admin:culturalProduction.ideas.bylineUnknown", { date })
      : t("admin:culturalProduction.ideas.byline", {
          name: idea.author.displayName,
          date,
        });

  return (
    <article className={styles.card}>
      <div className={styles.cardTags}>
        <CulturalEventTypeChip eventType={idea.eventType} />
        <AdminChip tone={CULTURAL_IDEA_STATUS_TONE[idea.status]}>
          {t(CULTURAL_IDEA_STATUS_KEY[idea.status])}
        </AdminChip>
      </div>
      <h3 className={styles.cardTitle}>
        <button
          type="button"
          className={styles.cardOpen}
          aria-label={t(`${CARD_PREFIX}.openAria`, { title: idea.title })}
          onClick={() => onOpen(idea.id)}
        >
          {idea.title}
        </button>
      </h3>
      {idea.description !== "" ? (
        <p className={styles.cardDescription}>{idea.description}</p>
      ) : null}
      <p className={styles.cardByline}>{byline}</p>
      <div className={styles.cardFoot}>
        <span className={styles.cardBackers}>
          {idea.backers.length > 0 ? (
            <span aria-hidden>
              <CulturalAssigneeStack
                people={idea.backers}
                maxShown={BACKERS_SHOWN}
                size="sm"
              />
            </span>
          ) : null}
          {t(`${CARD_PREFIX}.backers`, { count: idea.backerCount })}
        </span>
        <span className={styles.cardCounts}>
          <span className={styles.cardCount}>
            <FiMessageSquare aria-hidden />
            {t(`${CARD_PREFIX}.comments`, { count: idea.commentCount })}
          </span>
          <span className={styles.cardCount}>
            <FiCheckSquare aria-hidden />
            {t(`${CARD_PREFIX}.tasks`, { count: idea.linkedTaskCount })}
          </span>
        </span>
      </div>
    </article>
  );
}
