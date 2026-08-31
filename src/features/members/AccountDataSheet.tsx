import { Button, SideSheet } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AccountData.module.css";

/** One signposted destination: what it does, and the page that does it. */
function AccountDataDestination({
  title,
  description,
  cta,
  to,
}: {
  title: string;
  description: string;
  cta: string;
  to: string;
}) {
  return (
    <div className={styles.block}>
      <h4 className={styles.subheading}>{title}</h4>
      <p className={styles.body}>{description}</p>
      <Button variant="ghost" to={to}>
        {cta}
      </Button>
    </div>
  );
}

/**
 * "Your data" side sheet: the member-profile entry point to the
 * account-lifecycle actions GDPR requires, download (Art. 20), pause or erase
 * (Art. 17), and a data-subject request (Arts. 15/16/21).
 *
 * PRD-09: this sheet used to BUILD all four of those, alongside a dedicated
 * page for each and a third copy of two of them in the Settings danger zone.
 * Nothing told a member which surface was authoritative, and the duplication is
 * how the Settings "pause my account" ended up mounting a confirmation dialog
 * with no request behind it: it showed a success panel while `users.status`
 * never changed. So each action now has exactly one home, and this sheet points
 * at them:
 *
 * - download → `/account/data-export` (`DataExportPage`), which is also the
 *   richer of the two: it picks categories and formats.
 * - pause or erase → `/account/delete-account` (`DeleteAccountSection`), the
 *   one place that takes a typed confirmation, a Google step-up token and the
 *   owned-community / live-listing gate before erasure.
 * - data request → `/policies/privacy/data-request` (`DsarPage`).
 *
 * `ownerSlug` is no longer read here (the erasure confirmation that named the
 * member's profile moved with the flow), and stays accepted so the profile page
 * keeps calling this unchanged.
 */
export function AccountDataSheet({
  onClose,
}: {
  onClose: () => void;
  ownerSlug?: string;
}) {
  const { t } = useTranslation();
  return (
    <SideSheet title={t("members:profile.accountData.title")} onClose={onClose}>
      <section className={styles.section}>
        <AccountDataDestination
          title={t("settings:accountData.download.title")}
          description={t("settings:accountData.download.desc")}
          cta={t("settings:accountData.download.cta")}
          to={routes.dataExport}
        />
        <AccountDataDestination
          title={t("settings:accountData.stepAway.title")}
          description={t("settings:accountData.stepAway.desc")}
          cta={t("settings:accountData.stepAway.cta")}
          to={routes.deleteAccount}
        />
        <AccountDataDestination
          title={t("settings:accountData.dsar.title")}
          description={t("settings:accountData.dsar.desc")}
          cta={t("settings:accountData.dsar.cta")}
          to={routes.dsar}
        />
        <p className={styles.hint}>{t("settings:accountData.note")}</p>
      </section>
    </SideSheet>
  );
}
