import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiAlertTriangle,
  FiDownload,
  FiKey,
  FiMonitor,
  FiShield,
  FiSmartphone,
} from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useAuth } from "../../app/providers/authContext";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { ConsentToggleRow } from "./NotificationVolumeSections";
import { ToggleList } from "./SettingsControls";
import { useLoginAlerts } from "./api/useLoginAlerts";
import { useSessions } from "./api/useSessions";
import { usePushDevices } from "./api/usePushDevices";
import { useGetDeletionRequest } from "./api/useAccountMutations";
import styles from "./AccountSecurityPage.module.css";

/**
 * One line of security posture: what it is, where it stands right now, and the
 * page that changes it. `action` is optional so a read-only fact (how you sign
 * in) uses the same row without growing a button that does nothing.
 */
export function SecurityRow({
  icon,
  title,
  value,
  note,
  actionLabel,
  actionTo,
  tone = "default",
}: {
  icon: ReactNode;
  title: string;
  value: ReactNode;
  note?: string;
  actionLabel?: string;
  actionTo?: string;
  tone?: "default" | "danger";
}) {
  const rowClassName = [styles.row, tone === "danger" && styles.rowDanger]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={rowClassName}>
      <div className={styles.ic}>{icon}</div>
      <div>
        <div className={styles.rowTitle}>{title}</div>
        <div className={styles.rowValue}>{value}</div>
        {note && <div className={styles.rowNote}>{note}</div>}
      </div>
      {actionLabel && actionTo && (
        <Button variant="ghost" className={styles.rowAction} to={actionTo}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * How the member gets in. Google OAuth is the only credential the backend
 * knows (`users.google_id`), so this states that rather than offering a
 * password change, a second factor, or an unlink that no endpoint backs.
 */
export function SignInMethodRow() {
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <SecurityRow
      icon={<FiKey aria-hidden />}
      title={t("settings:accountSecurity.signIn.title")}
      value={
        <Translation
          i18nKey="settings:accountSecurity.signIn.value"
          components={{ strong: <b /> }}
          values={{
            email: user?.email ?? t("settings:accountSecurity.signIn.noEmail"),
          }}
        />
      }
      note={t("settings:accountSecurity.signIn.note")}
    />
  );
}

/** The one security switch that is genuinely wired: `GET|PUT /me/login-alerts`. */
export function SignInAlertsSection() {
  const { t } = useTranslation();
  const { isEnabled, setEnabled } = useLoginAlerts();
  return (
    <ToggleList>
      <ConsentToggleRow
        title={t("settings:accountSecurity.alerts.title")}
        description={t("settings:accountSecurity.alerts.desc")}
        checked={isEnabled}
        onChange={setEnabled}
      />
    </ToggleList>
  );
}

/** Live session count, straight from the list the sessions page renders. */
export function SessionsRow() {
  const { t } = useTranslation();
  const { sessions, loading, failed } = useSessions();
  return (
    <SecurityRow
      icon={<FiMonitor aria-hidden />}
      title={t("settings:accountSecurity.sessions.title")}
      value={
        loading
          ? t("settings:accountSecurity.counting")
          : failed
            ? t("settings:accountSecurity.countUnavailable")
            : t("settings:accountSecurity.sessions.count", {
                count: sessions.length,
              })
      }
      note={t("settings:accountSecurity.sessions.note")}
      actionLabel={t("settings:accountSecurity.sessions.cta")}
      actionTo={routes.sessions}
    />
  );
}

/** Live push-subscription count, from `GET /push/subscriptions`. */
export function PushDevicesRow() {
  const { t } = useTranslation();
  const { devices, loading, failed } = usePushDevices();
  return (
    <SecurityRow
      icon={<FiSmartphone aria-hidden />}
      title={t("settings:accountSecurity.push.title")}
      value={
        loading
          ? t("settings:accountSecurity.counting")
          : failed
            ? t("settings:accountSecurity.countUnavailable")
            : t("settings:accountSecurity.push.count", {
                count: devices.length,
              })
      }
      note={t("settings:accountSecurity.push.note")}
      actionLabel={t("settings:accountSecurity.push.cta")}
      actionTo={routes.pushDevices}
    />
  );
}

/**
 * Export. There is no endpoint listing past export jobs (only
 * `GET /account/export/:jobId`), so this deliberately shows no "last exported"
 * date rather than inventing one.
 */
export function DataExportRow() {
  const { t } = useTranslation();
  return (
    <SecurityRow
      icon={<FiDownload aria-hidden />}
      title={t("settings:accountSecurity.export.title")}
      value={t("settings:accountSecurity.export.value")}
      note={t("settings:accountSecurity.export.note")}
      actionLabel={t("settings:accountSecurity.export.cta")}
      actionTo={routes.dataExport}
    />
  );
}

/**
 * Erasure. A deletion request already in its grace period is the single most
 * important thing on this page while it exists, so it is read live from
 * `GET /account/deletion-request` and stated with its real erasure date.
 */
export function AccountErasureSection() {
  const { t } = useTranslation();
  const format = useFormat();
  const getDeletionRequest = useGetDeletionRequest();
  const { data: pendingDeletion } = useQuery({
    queryKey: ["account", "deletion-request"],
    // Coerced to `null`: `GET /account/deletion-request` answers with an empty
    // body when nothing is pending, which reaches `apiGet` as `undefined`, and
    // react-query rejects an `undefined` result outright.
    queryFn: async () => (await getDeletionRequest()) ?? null,
  });

  return (
    <>
      {pendingDeletion && (
        <div className={styles.pending}>
          <Translation
            i18nKey="settings:accountSecurity.erasure.pending"
            components={{ strong: <b /> }}
            values={{
              date: format.date(new Date(pendingDeletion.scheduledErasureAt)),
            }}
          />
        </div>
      )}
      <SecurityRow
        tone="danger"
        icon={<FiAlertTriangle aria-hidden />}
        title={t("settings:accountSecurity.erasure.title")}
        value={t("settings:accountSecurity.erasure.value")}
        note={t("settings:accountSecurity.erasure.note")}
        actionLabel={
          pendingDeletion
            ? t("settings:accountSecurity.erasure.ctaPending")
            : t("settings:accountSecurity.erasure.cta")
        }
        actionTo={routes.deleteAccount}
      />
    </>
  );
}

/**
 * What this page cannot do yet, in words. Prose on purpose: a disabled control
 * for a capability with no endpoint behind it is the exact thing this whole
 * page was built to stop doing.
 */
export function NotYetAvailableSection() {
  const { t } = useTranslation();
  return (
    <div className={styles.notYet}>
      <div className={styles.notYetTitle}>
        {t("settings:accountSecurity.notYet.title")}
      </div>
      <ul className={styles.notYetList}>
        <li>{t("settings:accountSecurity.notYet.twoFactor")}</li>
        <li>{t("settings:accountSecurity.notYet.recovery")}</li>
      </ul>
    </div>
  );
}

/** Real next steps for a member who thinks somebody else is in their account. */
export function CompromisedAccountNote() {
  return (
    <div className={styles.footNote}>
      <Translation
        i18nKey="settings:accountSecurity.compromised"
        components={{
          strong: <b />,
          sessions: <Link to={routes.sessions} />,
          contact: <Link to={`${routes.contact}?topic=account`} />,
        }}
      />
    </div>
  );
}

/** Where the disclosure policy went, for anyone who came here looking for it. */
export function DisclosurePolicyRow() {
  const { t } = useTranslation();
  return (
    <SecurityRow
      icon={<FiShield aria-hidden />}
      title={t("settings:accountSecurity.disclosure.title")}
      value={t("settings:accountSecurity.disclosure.value")}
      actionLabel={t("settings:accountSecurity.disclosure.cta")}
      actionTo={routes.policiesSecurity}
    />
  );
}
