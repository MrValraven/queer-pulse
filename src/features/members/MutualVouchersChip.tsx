import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ProfilePage.module.css";

/**
 * "2 members you know vouched for them" (SOC-15): the viewer-relative trust
 * cue on someone else's profile, rendered as one texture chip beside the
 * relationship chips in `HeroVouchRow`.
 *
 * The gate lives entirely in the backend. `count` is `null` when the viewer IS
 * this member, and when the member has hidden their voucher roster: a
 * viewer-relative count over people the viewer knows by name is a partial
 * roster, so hiding the roster hides this too. `0` means the real answer is
 * zero. Both render nothing: an absent chip is the honest rendering of "no
 * signal", and a chip reading "0 members you know" would be noise on every
 * profile of a stranger.
 *
 * Its own component so `HeroVouchRow` keeps its two lines and stays inside the
 * 200-line component cap.
 */
export function MutualVouchersChip({ count }: { count: number | null }) {
  const { t } = useTranslation();
  if (count === null || count <= 0) return null;
  return (
    <span className={styles.hereForChip}>
      {t("members:hero.vouch.mutualVouchers", { count })}
    </span>
  );
}
