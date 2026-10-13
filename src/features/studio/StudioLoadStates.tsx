import type { ReactNode } from "react";
import { FiMusic } from "react-icons/fi";
import { EmptyState, LoadErrorState } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLoadState } from "./api/studioLoadState";
import { StudioCardGridSkeleton, StudioLine } from "./StudioSkeletons";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

/** A failed Studio read. Stays mounted while Retry runs (isRetrying), so the
 *  focused button never disappears under the member. */
export function StudioLoadError({
  loadState,
  title,
}: {
  loadState: StudioLoadState;
  title?: ReactNode;
}) {
  return (
    <LoadErrorState
      onRetry={loadState.retry}
      isRetrying={loadState.isRetrying}
      title={title}
      compact
      className={kit.loadError}
    />
  );
}

/** The detail pages' first paint: eyebrow, title, byline, a row of cards. */
export function StudioDetailSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className={kit.pageSkeleton}
      role="status"
      aria-label={t("studio:states.loadingLabel")}
    >
      <StudioLine width="30%" height={14} />
      <StudioLine width="55%" height={36} />
      <StudioLine width="40%" height={14} />
      <StudioCardGridSkeleton count={4} className={styles.rowGrid} />
    </div>
  );
}

/** A release, track or artist this member cannot see: missing, a draft, or
 *  taken down. The wording never says which. */
export function StudioNotFound() {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiMusic />}
      title={t("studio:states.notFoundTitle")}
      description={t("studio:states.notFoundBody")}
      action={{ label: t("studio:states.backHomeCta"), to: routes.studio }}
      headingLevel={2}
    />
  );
}
