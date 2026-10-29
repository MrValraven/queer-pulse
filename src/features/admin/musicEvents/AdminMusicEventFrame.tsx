import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./AdminMusicEvents.module.css";

/**
 * The admin chrome around the create wizard and one event's dashboard. The
 * topbar reads "Admin / Music events", with "Music events" linking back to
 * the list. Full bleed, because the wizard's chapter rail and the
 * dashboard's sidebar both need the width.
 */
export function AdminMusicEventFrame({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <AdminShell
      isFullBleed
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
      title={
        <Link to={routes.adminMusicEvents} className={styles.crumbLink}>
          {t("admin:musicEvents.title")}
        </Link>
      }
    >
      {children}
    </AdminShell>
  );
}
