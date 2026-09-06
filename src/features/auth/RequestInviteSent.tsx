import { Link } from "react-router-dom";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { AuthLayout } from "./AuthLayout";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RequestInviteOutcome } from "./RequestInviteForm";
import { RequestInviteReference } from "./RequestInviteReference";
import { WHAT_NEXT } from "./requestInvite.data";
import styles from "./auth.module.css";

/**
 * The confirmation after a request is submitted. `outcome: "already"` is the
 * 409 case — they'd asked before — and it deliberately lands on this same calm
 * confirmation rather than an error: nothing went wrong, we simply already have
 * it. Only the headline, the lead sentence and the reference block change.
 *
 * This screen is also the ONLY delivery of the applicant's status token (see
 * `RequestInviteReference`): it is never emailed, never re-issued, and exists
 * nowhere on the server in readable form. Everything else here is reassurance;
 * that block is the product.
 */
export function RequestInviteSent({
  first,
  outcome = "sent",
  statusToken = null,
}: {
  first: string;
  outcome?: RequestInviteOutcome;
  /** The one-time status token. Null on the 409 path, which mints none. */
  statusToken?: string | null;
}) {
  const { t } = useTranslation();
  const trimmedFirst = first.trim();
  const already = outcome === "already";
  const titleKey = already
    ? "auth:requestInvite.already.title"
    : "auth:requestInvite.sent.title";
  const subKey = already
    ? trimmedFirst
      ? "auth:requestInvite.already.sub_withName"
      : "auth:requestInvite.already.sub_noName"
    : trimmedFirst
      ? "auth:requestInvite.sent.sub_withName"
      : "auth:requestInvite.sent.sub_noName";
  return (
    <AuthLayout wide>
      {/* DES-170: centring, the confirmation copy's measure and the footer
          link's type all live in auth.module.css now. */}
      <div className={`${styles.screenIn} ${styles.sentScreen}`}>
        <div className={styles.sentIc}>
          <FiCheck aria-hidden />
        </div>
        <h1>
          <Translation i18nKey={titleKey} components={{ em: <em /> }} />
        </h1>
        <p className={`${styles.sub} ${styles.sentSub}`}>
          {t(subKey, { name: trimmedFirst })}
        </p>

        <RequestInviteReference token={already ? null : statusToken} />

        <ol className={styles.nextList}>
          {WHAT_NEXT.map((step, i) => (
            <li key={step.titleKey} className={styles.nextRow}>
              <span className={styles.nextNum}>{i + 1}</span>
              <span className={styles.nextText}>
                <span className={styles.nextTitle}>{t(step.titleKey)}</span>
                <span className={styles.nextBody}>{t(step.bodyKey)}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className={styles.footer}>
          <Link to={routes.homepage} className={styles.backHomeLink}>
            <FiArrowLeft aria-hidden /> {t("auth:requestInvite.sent.backHome")}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
