import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMemberTeamLinks } from "../marketing/listBusiness/api/useMemberTeamLinks";
import styles from "./ProfileNavAwaitingCount.module.css";

const POP_SCALE = 0.6;

/**
 * The accent count pill on the "Places" section link: how many business team
 * invitations are waiting on this member. Mounted for the owner's own view
 * only, because the query behind it (`GET /me/team-links`) is the member's
 * private list and must not fire on a visitor's profile. It shares its query
 * key with the inbox in `PlacesSection`, so it costs no extra request.
 *
 * Screen readers hear the spoken sentence; the bare figure is hidden from them.
 */
export function ProfileNavAwaitingCount({
  spokenKey,
}: {
  /** Plural base key of the spoken sentence (`_one` / `_other`). */
  spokenKey: string;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const { links } = useMemberTeamLinks();
  const awaitingCount = links?.awaitingYouCount ?? 0;
  const hiddenState = reducedMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: POP_SCALE };
  return (
    <AnimatePresence>
      {awaitingCount > 0 && (
        <m.span
          key="awaiting-count"
          className={styles.pill}
          initial={hiddenState}
          animate={{ opacity: 1, scale: 1 }}
          exit={hiddenState}
        >
          <span aria-hidden="true">{format.number(awaitingCount)}</span>
          <span className="visuallyHidden">
            {t(spokenKey, { count: awaitingCount })}
          </span>
        </m.span>
      )}
    </AnimatePresence>
  );
}
