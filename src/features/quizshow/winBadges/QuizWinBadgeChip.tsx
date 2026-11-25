import type {
  QuizBadgeTint,
  QuizWinBadgeChip as QuizWinBadgeChipDTO,
} from "../../../shared/contracts/quizWinBadges";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizBadgeIconNode } from "../../members/quizBadgeIcon";
import { quizBadgeTextIn } from "./quizWinBadgeText";
import styles from "./QuizWinBadgeChip.module.css";

const TINT_CLASS: Record<QuizBadgeTint, string | undefined> = {
  jade: styles.jade,
  accent: styles.accent,
  plum: styles.plum,
};

/** A tint a newer backend adds reads as jade, so the page never breaks. */
function tintClassOf(tint: string): string {
  const knownClasses: Record<string, string | undefined> = TINT_CLASS;
  return knownClasses[tint] ?? styles.jade ?? "";
}

interface QuizWinBadgeChipProps {
  badge: QuizWinBadgeChipDTO;
  size?: "sm" | "md";
}

/** A quiz badge as a pill: its icon and its name in the viewer's language. */
export function QuizWinBadgeChip({
  badge,
  size = "sm",
}: QuizWinBadgeChipProps) {
  const { language } = useTranslation();
  const name = quizBadgeTextIn(badge.name, language);
  const sizeClass = size === "md" ? styles.md : "";
  return (
    <span
      className={[styles.chip, tintClassOf(badge.tint), sizeClass]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={styles.icon} aria-hidden>
        {quizBadgeIconNode(badge.iconKey)}
      </span>
      <span className={styles.name} title={name}>
        {name}
      </span>
    </span>
  );
}
