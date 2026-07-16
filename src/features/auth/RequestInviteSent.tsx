import { Link } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { WHAT_NEXT } from "./requestInvite.data";
import styles from "./auth.module.css";

export function RequestInviteSent({ first }: { first: string }) {
  const { t } = useTranslation();
  const trimmedFirst = first.trim();
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
          <Translation i18nKey="auth:requestInvite.sent.title" components={{ em: <em /> }} />
        </h1>
        <p
          className={styles.sub}
          style={{ maxWidth: "34ch", margin: "0 auto 28px" }}
        >
          {trimmedFirst
            ? t("auth:requestInvite.sent.sub_withName", { name: trimmedFirst })
            : t("auth:requestInvite.sent.sub_noName")}
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
