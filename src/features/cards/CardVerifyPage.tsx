import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Spinner } from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCardVerification } from "./api/useCardVerification";
import { CardVerifyFailure } from "./CardVerifyFailure";
import { CardVerifyResult } from "./CardVerifyResult";
import { STATUS_TONE } from "./cardVerify.data";
import styles from "./CardVerifyPage.module.css";

/**
 * What a scanned card resolves to. Public and logged-out on purpose: the
 * point of a membership card is that a stranger at a door can check it
 * without holding a QueerPulse account.
 *
 * The page gives one of four answers, and the panel's tone carries which:
 * a card that stands (jade), a card that no longer does (amber or coral), a
 * code that resolves to nothing (coral), and a check that never happened
 * (neutral). The last of those is the one worth keeping separate: the backend
 * collapses bad signature, expired token and unknown card into a single 404 so
 * nothing leaks about the platform's card population, but a device that never
 * got a response has not been told anything at all, and a door must not read
 * its own lost signal as a refusal.
 */
export function CardVerifyPage() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const { verification, isLoading, isInvalid, failure, retry, isRetrying } =
    useCardVerification(token);

  const tone = verification
    ? STATUS_TONE[verification.status]
    : failure === "unverified"
      ? "bad"
      : "neutral";

  return (
    <PageShell>
      {/* Deliberately generic: this URL is public and unauthenticated, and a
          browser tab or a shared-link preview must not name the member or
          the community it belongs to. `noIndex` keeps a search engine from
          surfacing it at all, mirroring SubprofilePage's use of the same
          flag for the same reason. */}
      <PageMeta title={t("cards:verify.metaTitle")} noIndex />
      <div className={styles.page} data-tone={tone}>
        <article className={styles.panel}>
          {isLoading ? (
            <p className={styles.checking}>
              <Spinner /> {t("cards:verify.checking")}
            </p>
          ) : verification ? (
            <CardVerifyResult verification={verification} />
          ) : (
            <CardVerifyFailure
              kind={isInvalid && failure ? failure : "unverified"}
              onRetry={retry}
              isRetrying={isRetrying}
            />
          )}
        </article>
      </div>
    </PageShell>
  );
}
