import type { ReactElement } from "react";
import { useParams } from "react-router-dom";
import { FiCheckCircle, FiClock, FiSlash, FiXCircle } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { SkeletonLine } from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCardVerification } from "./api/useCardVerification";
import type { EffectiveCardStatus } from "./api/cards.api";
import styles from "./CardVerifyPage.module.css";

const STATUS_ICON: Record<EffectiveCardStatus, ReactElement> = {
  active: <FiCheckCircle aria-hidden="true" />,
  expired: <FiClock aria-hidden="true" />,
  suspended: <FiXCircle aria-hidden="true" />,
  revoked: <FiSlash aria-hidden="true" />,
};

/**
 * What a scanned card resolves to. Public and logged-out on purpose: the
 * point of a membership card is that a stranger at a door can check it
 * without holding a QueerPulse account.
 *
 * Every failure renders the same "could not be verified" result. The backend
 * already collapses bad signature, expired token, and unknown card into one
 * 404, and this page must not re-open that distinction. The DTO never
 * carries a revocation reason, so none is rendered here either.
 */
export function CardVerifyPage() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const { verification, isLoading, isInvalid } = useCardVerification(token);

  return (
    <PageShell>
      {/* Deliberately generic: this URL is public and unauthenticated, and a
          browser tab or a shared-link preview must not name the member or
          the community it belongs to. `noIndex` keeps a search engine from
          surfacing it at all, mirroring SubprofilePage's use of the same
          flag for the same reason. */}
      <PageMeta title={t("cards:verify.metaTitle")} noIndex />
      <div className={styles.page}>
        <div className={styles.panel}>
          {isLoading ? (
            <SkeletonLine height={180} />
          ) : isInvalid || !verification ? (
            <p className={`${styles.result} ${styles.bad}`} role="status">
              <FiXCircle aria-hidden="true" /> {t("cards:verify.unverified")}
            </p>
          ) : (
            <>
              <p
                className={`${styles.result} ${
                  verification.status === "active" ? styles.good : styles.bad
                }`}
                role="status"
              >
                {STATUS_ICON[verification.status]}{" "}
                {t(`cards:verify.status.${verification.status}`)}
              </p>
              {/* Pronouns beside the name, exactly as the card prints them,
                  so whoever just scanned it can address the person in front of
                  them correctly. Present only when the card itself carries
                  them: this page never says more about a holder than the
                  object in the verifier's hand does. */}
              <p className={styles.holder}>
                {verification.holderName}
                {verification.holderPronouns ? (
                  <span className={styles.holderPronouns}>
                    {" "}
                    ({verification.holderPronouns})
                  </span>
                ) : null}
              </p>
              <p className={styles.issuer}>{verification.issuerName}</p>
              <dl className={styles.meta}>
                <div>
                  <dt>{t("cards:verify.role")}</dt>
                  <dd>{t(`cards:role.${verification.role}`)}</dd>
                </div>
                <div>
                  <dt>{t("cards:verify.serial")}</dt>
                  <dd>{verification.serial}</dd>
                </div>
                <div>
                  <dt>{t("cards:verify.memberSince")}</dt>
                  <dd>{new Date(verification.memberSince).getFullYear()}</dd>
                </div>
              </dl>

              {/* One permanent code serves both a phone screen and a printed
                  card, so this page cannot tell which it just resolved. That
                  makes the face on the card the only thing binding it to a
                  person, and this says whether there is one to check.

                  Only for a card that is currently good: telling a door how
                  to check the face on a revoked card is an instruction with
                  no purpose. */}
              {verification.status === "active" && (
                <p className={styles.check}>
                  {verification.hasPhoto
                    ? t("cards:verify.checkPhoto")
                    : t("cards:verify.checkNoPhoto")}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
