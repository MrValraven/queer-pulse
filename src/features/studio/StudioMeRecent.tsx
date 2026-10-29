import { useId } from "react";
import { routes } from "../../app/routeMap";
import { Collapse } from "../../shared/components/ui/Collapse";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioListeningRecent } from "./api/useStudioListening";
import { useStudioListeningHistorySwitch } from "./api/useStudioListeningHistorySwitch";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { StudioListeningRecentRow } from "./StudioListeningRecentRow";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioMeSectionHead } from "./StudioMeSectionHead";
import { StudioTrackRowSkeleton } from "./StudioSkeletons";
import styles from "./StudioListeningLists.module.css";

const TEASER_ROW_LIMIT = 5;
const SKELETON_ROW_COUNT = 3;

/** The newest few listens on the "You" page, with a link to the full
 *  history. The rows come from the same row component the history page
 *  uses, capped at five, and the list never offers Show more. */
export function StudioMeRecent() {
  const { t } = useTranslation();
  const { items, loadState, hasMore } = useStudioListeningRecent();
  const shouldHideExplicit = useStudioHideExplicit();
  const historySwitch = useStudioListeningHistorySwitch();
  const headingId = useId();
  const isHistoryPaused = !historySwitch.isOn && !historySwitch.isAwaitingRow;
  const teaserItems = items.slice(0, TEASER_ROW_LIMIT);
  const hasItems = teaserItems.length > 0;
  const isEmpty =
    !hasItems &&
    !loadState.isLoading &&
    !loadState.isError &&
    !loadState.isNotFound &&
    !hasMore;
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <StudioMeSectionHead
        id={headingId}
        title={t("studio:me.recent.heading")}
        seeAllHref={routes.studioListening}
        seeAllLabel={t("studio:me.recent.seeAll")}
      />
      <Collapse isOpen={loadState.isLoading}>
        <div className={styles.skeleton} aria-hidden="true">
          {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
            <StudioTrackRowSkeleton key={index} />
          ))}
        </div>
      </Collapse>
      <Collapse isOpen={!hasItems && loadState.isError}>
        <StudioLoadError
          loadState={loadState}
          what="studio:errors.what.listening"
        />
      </Collapse>
      <Collapse isOpen={isEmpty}>
        <p className={styles.empty}>
          {t(
            isHistoryPaused
              ? "studio:listening.paused.body"
              : "studio:me.recent.empty",
          )}
        </p>
      </Collapse>
      <Collapse isOpen={hasItems}>
        <ol className={styles.list} aria-labelledby={headingId}>
          {teaserItems.map((listen, index) => (
            <StudioListeningRecentRow
              key={listen.id}
              listen={listen}
              index={index}
              shouldHideExplicit={shouldHideExplicit}
            />
          ))}
        </ol>
      </Collapse>
    </section>
  );
}
