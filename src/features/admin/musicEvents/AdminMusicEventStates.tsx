import { FiMusic } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { reasonFor } from "../../../shared/api/errorMessage";
import {
  EmptyState,
  LoadErrorState,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminMusicEventFrame } from "./AdminMusicEventFrame";
import styles from "./AdminMusicEvents.module.css";

/** Placeholder rows while the first page of a bucket loads. */
const LIST_SKELETON_ROWS = [0, 1, 2];

/**
 * The page for a slug that is not a QueerPulse music event (the server's
 * `music_event_not_found`, or a demo slug outside the house registry). It
 * names that reason and offers the way back to the list. A retry would get
 * the same answer, so there is none.
 */
export function AdminMusicEventNotFound() {
  const { t } = useTranslation();
  return (
    <AdminMusicEventFrame>
      <div className={styles.statePage}>
        <EmptyState
          headingLevel={1}
          icon={<FiMusic aria-hidden />}
          title={t("admin:musicEvents.notFound.title")}
          description={t("admin:musicEvents.notFound.body")}
          action={{
            label: t("admin:musicEvents.backCta"),
            to: routes.adminMusicEvents,
          }}
        />
      </div>
    </AdminMusicEventFrame>
  );
}

/** Any other failure to load the event: the frame, the reason the server
 *  gave (when it gave one) and a retry. */
export function AdminMusicEventLoadError({
  error,
  isRetrying,
  onRetry,
}: {
  error: unknown;
  isRetrying: boolean;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <AdminMusicEventFrame>
      <div className={styles.statePage}>
        <LoadErrorState
          headingLevel={2}
          title={t("admin:musicEvents.manageLoadError")}
          description={reasonFor(error) ?? undefined}
          isRetrying={isRetrying}
          onRetry={onRetry}
        />
      </div>
    </AdminMusicEventFrame>
  );
}

/** The dashboard's outline while the live event loads. */
export function AdminMusicEventManageSkeleton() {
  return (
    <AdminMusicEventFrame>
      <div className={styles.statePage} aria-busy="true">
        <SkeletonLine width="30%" height={18} />
        <SkeletonLine width="60%" height={40} />
        <SkeletonLine width="90%" height={16} />
      </div>
    </AdminMusicEventFrame>
  );
}

/** Row-shaped placeholders for the list. */
export function AdminMusicEventsSkeleton() {
  return (
    <div className={styles.skeletonRows} aria-hidden>
      {LIST_SKELETON_ROWS.map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={104}
          style={{ borderRadius: "var(--radius-card)" }}
        />
      ))}
    </div>
  );
}
