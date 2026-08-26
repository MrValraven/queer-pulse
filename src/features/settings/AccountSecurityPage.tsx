import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  AccountErasureSection,
  CompromisedAccountNote,
  DataExportRow,
  DisclosurePolicyRow,
  NotYetAvailableSection,
  PushDevicesRow,
  SessionsRow,
  SignInAlertsSection,
  SignInMethodRow,
} from "./AccountSecuritySections";
import styles from "./AccountSecurityPage.module.css";

/**
 * The member's own security hub (ID-15).
 *
 * `/account/security` used to render the responsible-disclosure policy written
 * for security researchers, so a member who clicked "Security" in settings got
 * a bug-bounty document instead of their devices and sign-ins. The policy moved
 * to `/policies/security` (`src/features/marketing/SecurityPolicyPage.tsx`) and
 * this page took the path.
 *
 * Every number on it is read from the endpoint that already backs the page it
 * links to: sessions from `useSessions`, push devices from `usePushDevices`,
 * a pending erasure from `GET /account/deletion-request`. Nothing here is a
 * control without an endpoint behind it. What the platform genuinely cannot do
 * yet (a second factor, a way back in without Google) is stated in words in
 * `NotYetAvailableSection` rather than mocked up as a disabled switch.
 */
export function AccountSecurityPage() {
  const { t } = useTranslation();

  return (
    <AppShell>
      <div className={styles.page}>
        {/* Back to the pane this page is opened from: Settings → Account. */}
        <Link to={`${routes.settings}?pane=account`} className={styles.back}>
          <FiArrowLeft aria-hidden /> {t("settings:accountSecurity.back")}
        </Link>

        <div className={styles.eyebrow}>
          {t("settings:accountSecurity.eyebrow")}
        </div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="settings:accountSecurity.h1"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>{t("settings:accountSecurity.lead")}</p>

        <h2 className={styles.sectionH}>
          {t("settings:accountSecurity.section.signIn")}
        </h2>
        <div className={styles.list}>
          <SignInMethodRow />
          <SignInAlertsSection />
        </div>

        <h2 className={styles.sectionH}>
          {t("settings:accountSecurity.section.devices")}
        </h2>
        <div className={styles.list}>
          <SessionsRow />
          <PushDevicesRow />
        </div>

        <h2 className={styles.sectionH}>
          {t("settings:accountSecurity.section.data")}
        </h2>
        <div className={styles.list}>
          <DataExportRow />
          <AccountErasureSection />
        </div>

        <h2 className={styles.sectionH}>
          {t("settings:accountSecurity.section.more")}
        </h2>
        <div className={styles.list}>
          <DisclosurePolicyRow />
        </div>
        <NotYetAvailableSection />

        <CompromisedAccountNote />
      </div>
    </AppShell>
  );
}
