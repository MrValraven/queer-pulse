import { Button } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { subprofileEditPath } from "../../../app/routeMap";
import type { SubprofileView } from "../api/subprofiles.adapters";
import { FEED_IMPORT_PANE } from "./feedImportKinds";
import { useFeedsNeedingReview } from "./useFeedsNeedingReview";
import styles from "./FeedReviewBanner.module.css";

/**
 * "New episodes are ready to review": one accent-tinted `.banner` row (the
 * dashboard's shared class, as `PersonaInvitesBanner` uses) per connected feed
 * with episodes waiting, each linking to that persona's editor Import pane
 * (`?pane=import`). A nudge, never an empty-state placeholder: it renders
 * nothing when no feed has anything waiting.
 */
export function FeedReviewBanner({
  subprofiles,
}: {
  subprofiles: SubprofileView[];
}) {
  const { t } = useTranslation();
  const waiting = useFeedsNeedingReview(subprofiles);
  if (waiting.length === 0) return null;

  return (
    <div
      className={styles.list}
      role="region"
      aria-label={t("subprofiles:feedImport.banner.region")}
    >
      {waiting.map(({ subprofile, feed }) => (
        <div key={feed.id} className="banner">
          <p>
            <Translation
              i18nKey="subprofiles:feedImport.banner.message"
              components={{ em: <em /> }}
              values={{
                count: feed.pendingCount,
                show: feed.title || subprofile.displayName,
              }}
            />
          </p>
          <div className={styles.actions}>
            <Button
              variant="jade"
              size="sm"
              to={`${subprofileEditPath(subprofile.id)}?pane=${FEED_IMPORT_PANE}`}
            >
              {t("subprofiles:feedImport.banner.review")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
