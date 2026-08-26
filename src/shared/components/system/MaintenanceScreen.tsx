import { Translation } from "../../i18n/Translation";
import { useTranslation } from "../../i18n/useTranslation";
import { Button } from "../ui";
import { routes } from "../../../app/routeMap";
import maintenancePageStyles from "../../../features/system/MaintenancePage.module.css";
import styles from "./MaintenanceScreen.module.css";

/**
 * Full-page render gate shown when the backend reports a platform lockdown
 * (503 PLATFORM_LOCKED). Deliberately not the routed `MaintenancePage`: that
 * page is a static prototype screen with hardcoded times and a live-status
 * CTA; this one carries the admin's live message and a retry, and can be
 * mounted above the router by `PlatformLockProvider` — so it never assumes a
 * router context is available (no `<Link>`, no route-aware `Button to=`).
 *
 * Reuses `MaintenancePage.module.css` for the shared visual language (orb
 * backdrop, brand wordmark, eyebrow/heading/lead rhythm); only the "still
 * signed in" pill and retry wiring are new.
 */
export function MaintenanceScreen({
  message,
  onRetry,
}: {
  /** The admin's maintenance copy, when they set one. */
  message: string | null;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  // `||`, not `??`: the backend normalises '' → null on write, but a message
  // can still arrive empty from a row written before that normalisation
  // existed, and an empty string must fall back too.
  const body = message || t("system:maintenance.body");

  return (
    <div className={maintenancePageStyles.root}>
      <div
        className={`${maintenancePageStyles.orb} ${maintenancePageStyles.orbA}`}
      />
      <div
        className={`${maintenancePageStyles.orb} ${maintenancePageStyles.orbB}`}
      />

      {/* Plain anchor, not a router <Link>: this screen can render above
          BrowserRouter (see PlatformLockProvider), so no router context is
          guaranteed to exist. */}
      <a href={routes.homepage} className={maintenancePageStyles.brand}>
        <span className={maintenancePageStyles.pulseDot} aria-hidden />
        <span>
          <Translation
            i18nKey="shared:brand.wordmark"
            components={{ em: <em /> }}
          />
        </span>
      </a>

      <div className={maintenancePageStyles.wrap}>
        <span className={maintenancePageStyles.eyebrow}>
          {t("system:maintenance.brandEyebrow")}
        </span>
        <h1 className={maintenancePageStyles.h1}>
          {t("system:maintenance.title")}
        </h1>
        <p className={maintenancePageStyles.lead}>{body}</p>

        <p className={styles.stillSignedIn}>
          {t("system:maintenance.stillSignedIn")}
        </p>

        <div className={maintenancePageStyles.actions}>
          <Button onClick={onRetry}>{t("system:maintenance.retry")}</Button>
        </div>
      </div>
    </div>
  );
}
