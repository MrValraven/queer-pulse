import { FiAlertTriangle, FiWifiOff } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CardVerdictBanner } from "./CardVerdictBanner";
import { UNVERIFIED_REASON_KEYS } from "./cardVerify.data";
import type { CardVerifyFailure as FailureKind } from "./api/useCardVerification";
import styles from "./CardVerifyPage.module.css";

/**
 * A scan that produced no card.
 *
 * Two different things wear this panel and it matters which. `unverified` is
 * the platform's answer: the code does not resolve to a card that stands. It
 * still cannot say WHY — bad signature, expired token and unknown card all
 * collapse into one 404 so that a stranger with a scanner learns nothing about
 * who holds a card here — so the page lists the ordinary possibilities and says
 * plainly that it is withholding which one applies, rather than leaving a
 * verifier to read the silence as evasion.
 *
 * `unreachable` is not an answer at all. It gets its own neutral tone, its own
 * words, and a retry, because a door that treats its own lost signal as a
 * verdict turns people away for nothing.
 */
export function CardVerifyFailure({
  kind,
  onRetry,
  isRetrying,
}: {
  kind: FailureKind;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  const { t } = useTranslation();

  if (kind === "unreachable") {
    return (
      <>
        <CardVerdictBanner
          icon={<FiWifiOff aria-hidden="true" />}
          title={t("cards:verify.unreachable.title")}
          lead={t("cards:verify.unreachable.lead")}
        />
        <div className={`${styles.body} ${styles.failureBody}`}>
          <p className={styles.next}>{t("cards:verify.unreachable.next")}</p>
          <div className={styles.actions}>
            <Button
              variant="ghost-dark"
              onClick={onRetry}
              disabled={isRetrying}
              type="button"
            >
              {isRetrying
                ? t("cards:verify.retrying")
                : t("cards:verify.retry")}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CardVerdictBanner
        icon={<FiAlertTriangle aria-hidden="true" />}
        title={t("cards:verify.unverified")}
        lead={t("cards:verify.unverified.lead")}
      />
      <div className={`${styles.body} ${styles.failureBody}`}>
        <section className={styles.why}>
          <h2 className={styles.whyTitle}>
            {t("cards:verify.unverified.whyTitle")}
          </h2>
          <ul className={styles.whyList}>
            {UNVERIFIED_REASON_KEYS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
          <p className={styles.privacy}>
            {t("cards:verify.unverified.privacy")}
          </p>
        </section>
        <p className={styles.next}>{t("cards:verify.unverified.next")}</p>
        {/* The last word on the panel, because it is the one a door is most
            likely to get wrong: a code that does not resolve is a fact about a
            code. */}
        <p className={styles.fair}>{t("cards:verify.unverified.fair")}</p>
      </div>
    </>
  );
}
