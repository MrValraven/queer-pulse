import { FiSlash } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./NowBoundaryNote.module.css";

/**
 * The "Not here for" boundary row inside the Now card: a circle-slash icon, the
 * bold label, then the member's own words.
 *
 * Member-authored free text (a single string, not a structured "lead + rest"),
 * so it renders as one plain sentence rather than auto-bolding a leading
 * phrase. Renders nothing when unset, for the owner too: the nudge to write one
 * belongs in the edit form, not on the card.
 *
 * This is the hero's `ProfileBoundaryNote` restyled for the card's dark ground.
 * Task 13 removes the hero copy, at which point this is the only one left.
 */
export function NowBoundaryNote({ notHereFor }: { notHereFor?: string }) {
  const { t } = useTranslation();
  if (!notHereFor?.trim()) return null;
  return (
    <p className={styles.bounds}>
      <FiSlash className={styles.icon} aria-hidden />
      <span className={styles.label}>
        {t("members:profile.hero.notHereFor.label")}
      </span>
      <span className={styles.text}>{notHereFor}</span>
    </p>
  );
}
