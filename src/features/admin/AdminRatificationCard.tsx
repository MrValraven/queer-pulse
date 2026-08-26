import { FiClock, FiInfo } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminCat } from "./ui";
import type { Ratification } from "./adminModeration.data";
import styles from "./AdminModerationPage.module.css";

/** Which way a second moderator went on a pending ban (TS-12). */
export type RatifyDecision = "ratify" | "decline";

/* ── Pending ratifications (TS-12) ──────────────────────────────────────── */

/**
 * One permanent ban waiting on a second moderator.
 *
 * Built around the first moderator's own words. The card leads with who is
 * being removed and who asked, then quotes the reason in full rather than
 * truncating it: this is the one surface where a moderator decides whether to
 * put their name to ending somebody's account, and a 140-character preview of
 * the case is not enough to do that on.
 *
 * The two buttons are deliberately unequal. Confirming is the destructive one
 * and is styled as such; refusing is the ordinary path and needs no ceremony,
 * because refusing to remove someone must never be the harder click.
 */
export function RatificationCard({
  ratification,
  isOwnRequest,
  onDecide,
}: {
  ratification: Ratification;
  /** True when the signed-in moderator is the one who ASKED for this ban. The
   *  server refuses their confirmation outright; showing them the buttons
   *  anyway would be an affordance that only ever errors. */
  isOwnRequest: boolean;
  onDecide: (ratification: Ratification, decision: RatifyDecision) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const lapsesAt = new Date(ratification.expiresAt);

  return (
    <article className={styles.ratifyCard}>
      <div className={styles.ratifyHead}>
        <AdminCat tone="danger">
          {t("admin:moderation.ratification.badge")}
        </AdminCat>
        <span
          className={[
            styles.ratifyLapse,
            ratification.isExpired && styles.ratifyLapsed,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <FiClock aria-hidden />{" "}
          {ratification.isExpired
            ? t("admin:moderation.ratification.lapsed")
            : t("admin:moderation.ratification.lapsesAt", {
                date: `${fmt.date(lapsesAt, { day: "numeric", month: "short" })} ${fmt.time(lapsesAt)}`,
              })}
        </span>
      </div>

      <h3 className={styles.ratifyTitle}>
        {t("admin:moderation.ratification.title", {
          name: ratification.targetName,
        })}
      </h3>

      <p className={styles.ratifyMeta}>
        {t("admin:moderation.ratification.askedBy", {
          name: ratification.requestedByName,
          date: fmt.date(new Date(ratification.requestedAt), {
            day: "numeric",
            month: "short",
          }),
        })}
      </p>

      <blockquote className={styles.ratifyReason}>
        {ratification.note ?? t("admin:moderation.ratification.noReason")}
      </blockquote>

      <p className={styles.ratifyInterim}>
        <FiInfo aria-hidden /> {t("admin:moderation.ratification.interim")}
      </p>

      {isOwnRequest ? (
        <p className={styles.ratifyOwn}>
          <FiInfo aria-hidden /> {t("admin:moderation.ratification.ownRequest")}
        </p>
      ) : (
        !ratification.isExpired && (
          <div className={styles.ratifyActions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDecide(ratification, "decline")}
            >
              {t("admin:moderation.ratification.declineCta")}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDecide(ratification, "ratify")}
            >
              {t("admin:moderation.ratification.confirmCta")}
            </Button>
          </div>
        )
      )}
    </article>
  );
}
