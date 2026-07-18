import { Link } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RequestInviteOutcome } from "./RequestInviteForm";
import { WHAT_NEXT } from "./requestInvite.data";
import styles from "./auth.module.css";

/**
 * The confirmation after a request is submitted. `outcome: "already"` is the
 * 409 case — they'd asked before — and it deliberately lands on this same calm
 * confirmation rather than an error: nothing went wrong, we simply already have
 * it. Only the headline and the lead sentence change.
 */
export function RequestInviteSent({
  first,
  outcome = "sent",
}: {
  first: string;
  outcome?: RequestInviteOutcome;
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
      <div className={styles.screenIn} style={{ textAlign: "center" }}>
        <div className={styles.sentIc}>
          <svg
            viewBox="0 0 24 24"
            width={32}
            height={32}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12 5 5L20 7" />
          </svg>
        </div>
        <h1>
          <Translation i18nKey={titleKey} components={{ em: <em /> }} />
        </h1>
        <p
          className={styles.sub}
          style={{ maxWidth: "34ch", margin: "0 auto 28px" }}
        >
          {t(subKey, { name: trimmedFirst })}
        </p>

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
          <Link
            to={routes.homepage}
            style={{
              fontSize: 13.5,
              color: "var(--ink-60)",
              fontWeight: 500,
            }}
          >
            {t("auth:requestInvite.sent.backHome")}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
