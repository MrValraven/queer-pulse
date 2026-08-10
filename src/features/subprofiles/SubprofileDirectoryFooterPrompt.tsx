import { FiStar } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useNudges } from "../../app/providers/useNudges";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SubprofileDirectoryFooterPrompt.module.css";

/**
 * A small closing nudge under the directory grid + pager: every persona
 * listed here belongs to someone who joined QueerPulse for something else
 * first. Static copy only — no dual-mode branching needed, it never reads
 * live data. Dismissible for good (`nudge_key: "directory_footer"`) via the
 * shared discovery-moment store; once dismissed, or once the member has
 * dismissed 2 other discovery moments (the shared cap), it renders nothing.
 */
export function SubprofileDirectoryFooterPrompt() {
  const { t } = useTranslation();
  const { isDismissed, isCapped, dismiss } = useNudges();

  if (isDismissed("directory_footer") || isCapped) return null;

  return (
    <div className={styles.prompt} role="note">
      <FiStar aria-hidden className={styles.icon} />
      <p className={styles.message}>
        <Translation
          i18nKey="subprofiles:directory.footerPrompt.message"
          components={{ em: <em /> }}
        />
      </p>
      <div className={styles.actions}>
        <Button variant="ghost" size="sm" to={routes.subprofilesDashboard}>
          {t("subprofiles:directory.footerPrompt.cta")}
        </Button>
        <button
          type="button"
          className={styles.dismiss}
          onClick={() => dismiss("directory_footer")}
        >
          {t("subprofiles:directory.footerPrompt.notNow")}
        </button>
      </div>
    </div>
  );
}
