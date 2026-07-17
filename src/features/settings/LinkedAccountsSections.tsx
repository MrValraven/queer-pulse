import { type NavigateFunction } from "react-router-dom";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SIGN_IN_METHODS, CONNECTED_APPS } from "./linkedAccounts.data";
import styles from "./LinkedAccountsPage.module.css";

const iconClass: Record<string, string | undefined> = {
  google: styles.iconGoogle,
  apple: styles.iconApple,
  magic: styles.iconMagic,
  passkey: styles.iconPasskey,
  discord: styles.iconDiscord,
  bluesky: styles.iconBluesky,
  arena: styles.iconArena,
  calendar: styles.iconCalendar,
};

/** Mirrors a connection .row so there's no layout shift when content loads. */
export function ConnectionSkeleton() {
  return (
    <div className={styles.row}>
      <SkeletonLine width={48} height={48} style={{ borderRadius: 12 }} />
      <div className={styles.info}>
        <SkeletonLine width="50%" height={15} />
        <SkeletonLine width="78%" height={13} style={{ marginTop: 7 }} />
      </div>
      <div className={styles.state}>
        <SkeletonLine width={64} height={18} style={{ borderRadius: 5 }} />
        <SkeletonLine width={78} height={32} style={{ borderRadius: 999 }} />
      </div>
    </div>
  );
}

export function SignInMethodsList({
  loading,
  revokedIds,
  linkedIds,
  onUnlink,
  onLink,
  navigate,
}: {
  loading: boolean;
  revokedIds: Set<string>;
  linkedIds: Set<string>;
  onUnlink: (id: string) => void;
  onLink: (id: string) => void;
  navigate: NavigateFunction;
}) {
  const { t } = useTranslation();
  if (loading)
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <ConnectionSkeleton key={i} />
        ))}
      </>
    );
  return (
    <>
      {SIGN_IN_METHODS.map((m, i) => {
        const revoked = revokedIds.has(m.id);
        const linked = linkedIds.has(m.id);
        const badgeLabel = revoked
          ? t("settings:linkedAccounts.badge.unlinked")
          : linked
            ? t("settings:linkedAccounts.badge.linked")
            : t(m.badgeKey, { count: m.badgeCount });
        return (
          <FadeIn key={m.id} delay={Math.min(i, 8) * 60} className={styles.row}>
            <div className={`${styles.icon} ${iconClass[m.id] ?? ""}`}>
              <SignInIcon id={m.id} />
            </div>
            <div className={styles.info}>
              <b className={styles.infoName}>{m.name}</b>
              <span className={styles.infoDetail}>{m.detail}</span>
            </div>
            <div className={styles.state}>
              <span
                className={`${styles.badge} ${m.linked || linked ? styles.badgeLinked : styles.badgeUnlinked}`}
              >
                {badgeLabel}
              </span>
              {m.canUnlink && !revoked && (
                <Button
                  variant="ghost"
                  className={`${styles.rowBtn} ${styles.rowBtnUnlink}`}
                  onClick={() => onUnlink(m.id)}
                >
                  {t("settings:linkedAccounts.action.unlink")}
                </Button>
              )}
              {m.canLink && !linked && (
                <Button
                  variant="primary"
                  className={`${styles.rowBtn} ${styles.rowBtnConnect}`}
                  onClick={() => onLink(m.id)}
                >
                  {t("settings:linkedAccounts.action.link")}
                </Button>
              )}
              {m.defaultDisabled && (
                <Button
                  variant="ghost"
                  className={`${styles.rowBtn} ${styles.rowBtnDisabled}`}
                  disabled
                >
                  {t("settings:linkedAccounts.action.default")}
                </Button>
              )}
              {m.canManage && (
                <Button
                  variant="ghost"
                  className={styles.rowBtn}
                  onClick={() => navigate(routes.sessions)}
                >
                  {t("settings:linkedAccounts.action.manage")}
                </Button>
              )}
            </div>
          </FadeIn>
        );
      })}
    </>
  );
}

export function ConnectedAppsList({
  loading,
  revokedIds,
  onUnlink,
  onCopyCalendar,
}: {
  loading: boolean;
  revokedIds: Set<string>;
  onUnlink: (id: string) => void;
  onCopyCalendar: () => void;
}) {
  const { t } = useTranslation();
  if (loading)
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <ConnectionSkeleton key={i} />
        ))}
      </>
    );
  return (
    <>
      {CONNECTED_APPS.map((app, i) => {
        const revoked = revokedIds.has(app.id);
        return (
          <FadeIn
            key={app.id}
            delay={Math.min(i, 8) * 60}
            className={styles.row}
          >
            <div className={`${styles.icon} ${iconClass[app.id] ?? ""}`}>
              <AppIcon id={app.id} />
            </div>
            <div className={styles.info}>
              <b className={styles.infoName}>{app.name}</b>
              <span className={styles.infoDetail}>{app.detail}</span>
            </div>
            <div className={styles.state}>
              <span className={`${styles.badge} ${styles.badgeLinked}`}>
                {revoked
                  ? t("settings:linkedAccounts.badge.revoked")
                  : t(app.badgeKey)}
              </span>
              {app.canRevoke && !revoked && (
                <Button
                  variant="ghost"
                  className={`${styles.rowBtn} ${styles.rowBtnUnlink}`}
                  onClick={() => onUnlink(app.id)}
                >
                  {t("settings:linkedAccounts.action.revoke")}
                </Button>
              )}
              {app.canCopy && (
                <Button
                  variant="ghost"
                  className={styles.rowBtn}
                  onClick={onCopyCalendar}
                >
                  {t("settings:linkedAccounts.action.copyUrl")}
                </Button>
              )}
            </div>
          </FadeIn>
        );
      })}
    </>
  );
}

function SignInIcon({ id }: { id: string }) {
  if (id === "google") return <span>G</span>;
  if (id === "apple")
    return (
      <svg viewBox="0 0 24 24" fill="#fff" width="22" height="22">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    );
  if (id === "magic")
    return (
      <svg viewBox="0 0 24 24" fill="#fff" width="22" height="22">
        <path
          d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"
          stroke="#fff"
          strokeWidth="1.6"
          fill="none"
        />
        <path
          d="M8 12l3 3 5-6"
          stroke="#fff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (id === "passkey")
    return (
      <svg viewBox="0 0 24 24" fill="#fff" width="22" height="22">
        <path
          d="M19 11H5m14 0a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2m14 0V7a7 7 0 1 0-14 0v4"
          stroke="#fff"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  return null;
}

function AppIcon({ id }: { id: string }) {
  if (id === "discord")
    return (
      <svg viewBox="0 0 24 24" fill="#fff" width="22" height="22">
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <path
          d="M5 8c2.5-1.5 9.5-1.5 14 0M5 16c2.5 1.5 9.5 1.5 14 0"
          stroke="#fff"
          fill="none"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  if (id === "bluesky")
    return (
      <svg viewBox="0 0 24 24" fill="#fff" width="22" height="22">
        <path d="M5 4l9.5 9.5L5 23h2.5l8.5-8.5L21 21h-3l-7-7-7 7H1.5L11 11.5 1.5 2H5z" />
      </svg>
    );
  if (id === "arena")
    return (
      <svg viewBox="0 0 24 24" fill="#fff" width="22" height="22">
        <rect x="3" y="4" width="18" height="16" rx="3" />
      </svg>
    );
  if (id === "calendar")
    return (
      <svg viewBox="0 0 24 24" fill="#fff" width="22" height="22">
        <path
          d="M3 10h18M3 14h18M7 6v12M17 6v12"
          stroke="#fff"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  return null;
}
