import { useState, type ReactNode } from "react";
import { FiMusic } from "react-icons/fi";
import { EmptyState, LoadErrorState } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import type { StudioLoadState } from "./api/studioLoadState";
import { StudioCardGridSkeleton, StudioLine } from "./StudioSkeletons";
import { studioReasonCopyKey } from "./studioReason";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

/** A failed Studio read. Stays mounted while Retry runs (isRetrying), so the
 *  focused button never disappears under the member. The title names the
 *  thing ("We couldn't load this release") and the body names the reason, so
 *  an offline member reads "You're offline" and never "this one is on us". */
export function StudioLoadError({
  loadState,
  title,
  what,
  onRetry,
}: {
  loadState: StudioLoadState;
  /** Replaces the "We couldn't load {what}" title. */
  title?: ReactNode;
  /** Catalog key naming the thing that failed, e.g.
   *  `"studio:errors.what.release"` ("this release"). */
  what: string;
  /** Replaces `loadState.retry`, for a panel that retries more than one read. */
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  const liveReason = loadState.reason ?? "unknown";
  // A retry resets the query's error to null, so the reason would read
  // "unknown" mid-retry. Hold the last settled reason until it lands.
  const [settledReason, setSettledReason] = useState(liveReason);
  if (!loadState.isRetrying && settledReason !== liveReason)
    setSettledReason(liveReason);
  const reason = loadState.isRetrying ? settledReason : liveReason;
  return (
    <LoadErrorState
      onRetry={onRetry ?? loadState.retry}
      isRetrying={loadState.isRetrying}
      title={
        title ?? (
          <Translation
            i18nKey="studio:errors.load.title"
            components={{ em: <em /> }}
            values={{ what: t(what) }}
          />
        )
      }
      description={t(studioReasonCopyKey(reason, "load"))}
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
      aria-label={t("studio:loading.detail")}
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
