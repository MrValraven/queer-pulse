import { useParams } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { ApiError } from "../../../shared/api/client";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { Button, SkeletonLine } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useAdminResourceGuide } from "../api/useAdminResourceGuides";
import { GuideWorkspaceScreen } from "./GuideWorkspaceScreen";
import styles from "./AdminGuideWorkspacePage.module.css";

/**
 * The guide workspace route: `/admin/resource-guides/new` (no id) and
 * `/admin/resource-guides/edit/:id`. Loads the guide, then hands it to
 * `GuideWorkspaceScreen` keyed by id.
 */
export function AdminGuideWorkspacePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const guideQuery = useAdminResourceGuide(id);
  const breadcrumb = [
    { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
    {
      label: t("admin:guideWorkspace.breadcrumb"),
      to: routes.adminResourceGuides,
    },
  ];

  if (id === undefined) {
    return (
      <GuideWorkspaceScreen key="new" guide={null} breadcrumb={breadcrumb} />
    );
  }

  const shellTitle = t("admin:guideWorkspace.breadcrumb");
  if (guideQuery.isPending) {
    return (
      <AdminShell title={shellTitle} breadcrumb={breadcrumb} isFullBleed>
        <div className={styles.state} aria-busy="true">
          {[44, 120, 120].map((height, lineIndex) => (
            <SkeletonLine
              key={lineIndex}
              height={height}
              style={{ borderRadius: 14 }}
            />
          ))}
        </div>
      </AdminShell>
    );
  }

  const { error, data } = guideQuery;
  // A guide already loaded stays mounted even when a background refetch fails
  // (react-query keeps `data` and sets `isError`), so an open draft survives.
  if (data) {
    return (
      <GuideWorkspaceScreen
        key={data.id}
        guide={data}
        breadcrumb={breadcrumb}
      />
    );
  }

  const isNotFound =
    data === null || (error instanceof ApiError && error.status === 404);
  const isForbidden = error instanceof ApiError && error.status === 403;
  return (
    <AdminShell title={shellTitle} breadcrumb={breadcrumb} isFullBleed>
      <div className={styles.state}>
        <h2 className={styles.stateTitle}>
          {isNotFound
            ? t("admin:guideWorkspace.notFound.title")
            : t("admin:guideWorkspace.loadError")}
        </h2>
        <p className={styles.stateText} role="alert">
          {isNotFound
            ? t("admin:guideWorkspace.notFound.body")
            : isForbidden
              ? t("admin:common.panelForbidden")
              : t("admin:adminResourceGuides.loadError")}
        </p>
        <div>
          {!isNotFound && !isForbidden && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void guideQuery.refetch()}
            >
              {t("admin:guideWorkspace.retryCta")}
            </Button>
          )}{" "}
          <Button variant="primary" size="sm" to={routes.adminResourceGuides}>
            {t("admin:guideWorkspace.backToGuidesCta")}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}
