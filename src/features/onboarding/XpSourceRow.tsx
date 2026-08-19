import { useTranslation } from "../../shared/i18n/useTranslation";
import type { XpBreakdownItem } from "../members/api/recognition.adapters";
import { xpSourceMetaFor } from "../members/xpBreakdown.data";
import styles from "./GettingStartedPage.module.css";

/**
 * One "what earned it" row: an icon chip, the source label, the XP it's
 * earned so far, and — for a source that can be earned more than once
 * (communities joined, vouches given, …) — a slim progress track toward its
 * cap. Sources capped at 1 (profile complete, verified) skip the track: a
 * one-shot signal has nothing left to show progress toward once it's done.
 * Shared by the onboarding teaser and its full-breakdown modal so both stay
 * visually identical.
 *
 * Always shows a one-line description of what the source actually is (the
 * teaser and the modal both read like the checklist rows this way: title,
 * description, amount). `detailed` (used by `XpBreakdownModal`, not the
 * compact teaser) adds, for a capped source, the exact count and the XP rate
 * behind the progress track — so the numbers (units, cap, rate) aren't just
 * implied by a bar there.
 */
export function XpSourceRow({
  source,
  detailed = false,
}: {
  source: XpBreakdownItem;
  detailed?: boolean;
}) {
  const { t } = useTranslation();
  const { labelKey, descKey, icon: Icon } = xpSourceMetaFor(source.key);
  const percent =
    source.cap > 0 ? Math.min(100, (source.units / source.cap) * 100) : 0;

  return (
    <li className={styles.xpSourceRow}>
      <span className={styles.xpSourceIcon} aria-hidden>
        <Icon />
      </span>
      <span className={styles.xpSourceBody}>
        <span className={styles.xpSourceTop}>
          <span className={styles.xpSourceLabel}>{t(labelKey)}</span>
          <span className={styles.xpSourceAmount}>
            {t("auth:gettingStarted.xpSources.amount", {
              xp: String(source.xp),
            })}
          </span>
        </span>
        <p className={styles.xpSourceDesc}>{t(descKey)}</p>
        {source.cap > 1 && (
          <>
            <span className={styles.xpSourceTrack} role="presentation">
              <span
                className={styles.xpSourceFill}
                style={{ width: `${percent}%` }}
              />
            </span>
            {detailed && (
              <span className={styles.xpSourceMetrics}>
                {t("members:badges.xpBreakdown.progress", {
                  units: source.units,
                  cap: source.cap,
                })}
                {" · "}
                {t("members:badges.xpBreakdown.perUnitAmount", {
                  xp: String(source.perUnit),
                })}
              </span>
            )}
          </>
        )}
      </span>
    </li>
  );
}
