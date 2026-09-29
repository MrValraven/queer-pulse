import type { ReactNode } from "react";
import { routes } from "../../../app/routeMap";
import { ApiError } from "../../../shared/api/client";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./GuidePreview.module.css";

/** The admin frame the non-page states render in, with the same breadcrumb
 *  as the guide workspace. */
function PreviewStateShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const breadcrumb = [
    { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
    {
      label: t("admin:guideWorkspace.breadcrumb"),
      to: routes.adminResourceGuides,
    },
  ];
  return (
    <AdminShell
      title={t("admin:guidePreview.shellTitle")}
      breadcrumb={breadcrumb}
      isFullBleed
    >
      <div className={styles.state}>{children}</div>
    </AdminShell>
  );
}

/**
 * The guide could not be loaded: no such id (demo mode always lands here,
 * since its guide list is honestly empty), no permission, or a failed request.
 * Only the last one offers a retry.
 */
export function GuidePreviewUnavailable({
  error,
  onRetry,
}: {
  error: Error | null;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const isNotFound =
    error === null || (error instanceof ApiError && error.status === 404);
  const isForbidden = error instanceof ApiError && error.status === 403;

  return (
    <PreviewStateShell>
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
      <div className={styles.stateActions}>
        {!isNotFound && !isForbidden && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            {t("admin:guideWorkspace.retryCta")}
          </Button>
        )}
        <Button variant="primary" size="sm" to={routes.adminResourceGuides}>
          {t("admin:guideWorkspace.backToGuidesCta")}
        </Button>
      </div>
    </PreviewStateShell>
  );
}

/**
 * A guide with no sections in the editor and no hardcoded page in this
 * bundle. Readers would get nothing at its address, so the preview says so
 * and points at the editor, where adding a section gives it a page.
 */
export function GuidePreviewNoPage({
  guideId,
  title,
}: {
  guideId: string;
  title: string;
}) {
  const { t } = useTranslation();
  return (
    <PreviewStateShell>
      <h2 className={styles.stateTitle}>
        {t("admin:guidePreview.noPage.title", { title })}
      </h2>
      <p className={styles.stateText}>{t("admin:guidePreview.noPage.body")}</p>
      <div className={styles.stateActions}>
        <Button
          variant="primary"
          size="sm"
          to={`${routes.adminResourceGuideEdit}/${guideId}`}
        >
          {t("admin:adminResourceGuides.row.editCta")}
        </Button>
        <Button variant="ghost" size="sm" to={routes.adminResourceGuides}>
          {t("admin:guideWorkspace.backToGuidesCta")}
        </Button>
      </div>
    </PreviewStateShell>
  );
}
