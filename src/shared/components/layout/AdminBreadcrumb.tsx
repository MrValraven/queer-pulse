import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import type { AdminCrumb } from "./AdminTopbar";
import { useAdminBreadcrumb } from "./useAdminBreadcrumb";
import styles from "./AdminShell.module.css";

/** One linked crumb with the dot separator after it. */
function CrumbLink({ crumb }: { crumb: AdminCrumb }) {
  return (
    <span className={styles.crumbCrumb}>
      {crumb.to ? (
        <Link to={crumb.to} className={styles.crumbLink}>
          {crumb.label}
        </Link>
      ) : (
        <span>{crumb.label}</span>
      )}
    </span>
  );
}

/**
 * The top bar's breadcrumb, one rule on every admin page: "Admin" and then the
 * rail's own name for the destination, so the crumb always reads the same as
 * the highlighted link. A page nested under a destination (a community's mod
 * panel, a listing's editor) adds its own title after the destination's link.
 * A page the rail does not list falls back to its title, and to any crumbs it
 * passes beyond the Admin root.
 *
 * A phone keeps the last crumb alone on one line (the CSS hides the parents),
 * ending in an ellipsis when it runs past the bar.
 */
export function AdminBreadcrumb({
  title,
  breadcrumb,
}: {
  title: ReactNode;
  breadcrumb: AdminCrumb[];
}) {
  const { t } = useTranslation();
  const { item, isExact, isHome } = useAdminBreadcrumb();

  const root: AdminCrumb = {
    label: t("admin:common.adminBreadcrumb"),
    to: isHome ? undefined : routes.admin,
  };
  const parents: AdminCrumb[] = [root];
  let current: ReactNode = title;
  if (item && isExact) {
    current = t(item.labelKey);
  } else if (item) {
    parents.push({ label: t(item.labelKey), to: item.to });
  } else {
    parents.push(...breadcrumb.filter((crumb) => crumb.to !== routes.admin));
  }

  return (
    <div className={styles.crumb}>
      {parents.map((crumb) => (
        <CrumbLink key={crumb.to ?? crumb.label} crumb={crumb} />
      ))}
      <span className={styles.crumbTitle} aria-current="page">
        {current}
      </span>
    </div>
  );
}
