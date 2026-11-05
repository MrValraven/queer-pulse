import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./AdminLead.module.css";

/**
 * The admin chrome around one lead. The topbar reads "Admin / Leads", with
 * "Leads" linking back to the list. The page keeps the reading width, so the
 * two columns stay close enough to scan side by side.
 */
export function AdminLeadFrame({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <AdminShell
      isFullBleed={false}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
      title={
        <Link to={routes.adminLeads} className={styles.crumbLink}>
          {t("admin:leads.title")}
        </Link>
      }
    >
      {children}
    </AdminShell>
  );
}
