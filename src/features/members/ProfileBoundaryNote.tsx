import { FiSlash } from "react-icons/fi";
import type { Member } from "./data/members";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ProfileHeroMain.module.css";

/**
 * "Not here for" boundary note on the profile hero. Member-authored free
 * text (a single `notHereFor: string`, not a structured "lead + rest"), so
 * this renders it as one plain sentence rather than auto-bolding a leading
 * phrase. Renders nothing when unset — including for the owner viewing their
 * own profile: the empty-state nudge to add one belongs in the Task 16 edit
 * form, not here.
 */
export function ProfileBoundaryNote({
  profile,
  self,
}: {
  profile: Member;
  self: boolean;
}) {
  const { t } = useTranslation();
  if (!profile.notHereFor && !self) return null;
  if (!profile.notHereFor) return null; // self with nothing set: no empty-state nudge here, it belongs in the Task 16 edit form only
  return (
    <div className={styles.bounds}>
      <FiSlash aria-hidden />
      <span className={styles.boundsLabel}>
        {t("members:profile.hero.notHereFor.label")}
      </span>
      <span>{profile.notHereFor}</span>
    </div>
  );
}
