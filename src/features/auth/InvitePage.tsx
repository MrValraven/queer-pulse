import { useState } from "react";
import { Link } from "react-router-dom";
import { FiLink, FiMail } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { InviteEmailForm } from "./InviteEmailForm";
import { InviteLinkPanel } from "./InviteLinkPanel";
import { SentInvitesList } from "./SentInvitesList";
import { useInviteQuota, daysUntilReset } from "./api/useInviteQuota";
import styles from "./InvitePage.module.css";

type Mode = "email" | "link";

// Illustrative fixed dates for the static "invite sent" mock summary card —
// not wired to a real send time, so kept as constants rather than `Date.now()`.
const MOCK_SENT_AT = new Date(2026, 5, 6, 10, 42);
const MOCK_EXPIRES_AT = new Date(2026, 5, 13);

export function InvitePage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const {
    data: quota,
    isLoading: quotaLoading,
    isError: quotaError,
  } = useInviteQuota();
  // Derived at render (not cached) so the countdown stays correct if the page
  // is left open across midnight.
  const resetsInDays = quota ? daysUntilReset(quota.resetsAt) : 0;
  const [mode, setMode] = useState<Mode>("email");
  const [sentName, setSentName] = useState<string | null>(null);

  if (sentName) {
    return (
      <AppShell>
        <div className={styles.page}>
          <div className={styles.inner}>
            <div className={`${styles.card} ${styles.sent} ${styles.screenIn}`}>
              <div className={styles.sentIcon}>
                <svg
                  width={26}
                  height={26}
                  viewBox="0 0 26 26"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 13l21-10-8 10 8 10-21-10Z"
                    fill="rgba(74,140,111,.8)"
                  />
                </svg>
              </div>
              <div className={styles.sentHead}>
                <Translation
                  i18nKey="auth:invite.sent.headline"
                  components={{ em: <em /> }}
                  values={{ name: sentName }}
                />
              </div>
              <div className={styles.sentSub}>
                {t("auth:invite.sent.sub", { name: sentName })}
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.srRow}>
                  <span className={styles.srLabel}>
                    {t("auth:invite.sent.summary.invited")}
                  </span>
                  <span className={styles.srVal}>{sentName} Lima</span>
                </div>
                <div className={styles.srRow}>
                  <span className={styles.srLabel}>
                    {t("auth:invite.sent.summary.sent")}
                  </span>
                  <span className={styles.srVal}>
                    {t("auth:invite.sent.summary.sentToday", {
                      time: fmt.time(MOCK_SENT_AT),
                    })}
                  </span>
                </div>
                <div className={styles.srRow}>
                  <span className={styles.srLabel}>
                    {t("auth:invite.sent.summary.expires")}
                  </span>
                  <span className={styles.srVal}>
                    {fmt.date(MOCK_EXPIRES_AT)}
                  </span>
                </div>
              </div>
              <div className={styles.actions}>
                <Button variant="ghost" to={routes.accountProfile}>
                  {t("auth:common.backToProfile")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.inner}>
          <Link to={routes.accountProfile} className={styles.backLink}>
            ← {t("auth:common.backToProfile")}
          </Link>
          <div className={styles.eyebrow}>{t("auth:invite.eyebrow")}</div>
          <div className={styles.title}>
            <Translation
              i18nKey="auth:invite.title"
              components={{ em: <em /> }}
            />
          </div>
          <div className={styles.sub}>{t("auth:invite.sub")}</div>
          {/* Hidden entirely if the quota can't be loaded (live-mode fetch
              error) — the compose flow still works, and an absent row is
              less alarming than a stuck skeleton or a wrong count. */}
          {!quotaError && (
            <div className={styles.quotaRow}>
              {quotaLoading || !quota ? (
                <SkeletonLine width="220px" />
              ) : (
                <>
                  <div className={styles.quotaChip}>
                    {quota.remaining === 0
                      ? t("auth:invite.quota.none")
                      : t("auth:invite.quota.available", {
                          count: quota.remaining,
                        })}
                  </div>
                  <div className={styles.resetNote}>
                    {resetsInDays === 0
                      ? t("auth:invite.quota.resets_zero")
                      : t("auth:invite.quota.resets", {
                          count: resetsInDays,
                        })}
                  </div>
                </>
              )}
            </div>
          )}

          <div
            className={styles.segmented}
            role="tablist"
            aria-label={t("auth:invite.deliveryMethod.ariaLabel")}
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "email"}
              className={`${styles.segBtn} ${mode === "email" ? styles.segBtnActive : ""}`}
              onClick={() => setMode("email")}
            >
              <FiMail aria-hidden />
              {t("auth:invite.deliveryMethod.email")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "link"}
              className={`${styles.segBtn} ${mode === "link" ? styles.segBtnActive : ""}`}
              onClick={() => setMode("link")}
            >
              <FiLink aria-hidden />
              {t("auth:invite.deliveryMethod.link")}
            </button>
          </div>

          {mode === "email" ? (
            <InviteEmailForm onSent={(name) => setSentName(name)} />
          ) : (
            <InviteLinkPanel />
          )}

          <SentInvitesList />
        </div>
      </div>
    </AppShell>
  );
}
