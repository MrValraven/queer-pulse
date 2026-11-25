import { useId } from "react";
import type {
  QuizshowResultsWinBadges as QuizshowResultsWinBadgesDTO,
  QuizWinBadgeChip as QuizWinBadgeChipDTO,
} from "../../../shared/contracts/quizWinBadges";
import { AnimatePresence } from "motion/react";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizWinBadgeChip } from "./QuizWinBadgeChip";
import styles from "./QuizshowWinBadges.module.css";

function BadgeRow({
  label,
  badges,
}: {
  label: string;
  badges: QuizWinBadgeChipDTO[];
}) {
  const labelId = useId();
  return (
    <div className={styles.resultsRow}>
      <p id={labelId} className={styles.rowLabel}>
        {label}
      </p>
      <ul aria-labelledby={labelId} className={styles.chips}>
        {badges.map((badge) => (
          <li key={badge.badgeKey}>
            <QuizWinBadgeChip badge={badge} size="md" />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface QuizshowResultsWinBadgesProps {
  winBadges: QuizshowResultsWinBadgesDTO;
}

/** The results card's badge block: what the viewer earned, then each winner's badges. */
export function QuizshowResultsWinBadges({
  winBadges,
}: QuizshowResultsWinBadgesProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.results}>
      <Collapse isOpen={winBadges.myBadges.length > 0}>
        <BadgeRow
          label={t("quizshow:winBadges.results.youEarned")}
          badges={winBadges.myBadges}
        />
      </Collapse>
      <ul className={styles.winners}>
        <AnimatePresence initial={false}>
          {/* Two winners can share a screen name, so the place in the list
              joins the key. */}
          {winBadges.winners.map((winner, winnerIndex) => (
            <CollapseListItem
              key={`${winner.kind}:${winner.name}:${winnerIndex}`}
            >
              <BadgeRow
                label={t("quizshow:winBadges.results.winnerEarned", {
                  name: winner.name,
                })}
                badges={winner.badges}
              />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
