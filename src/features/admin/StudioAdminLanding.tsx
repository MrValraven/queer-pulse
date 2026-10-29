import { Collapse, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioLoadStateOf } from "../studio/api/studioLoadState";
import { useAdminStudioLanding } from "./api/useStudioAdminLanding";
import { StudioAdminLandingCards } from "./StudioAdminLandingCards";
import { StudioAdminLandingPhotos } from "./StudioAdminLandingPhotos";
import { StudioAdminLandingPreviews } from "./StudioAdminLandingPreviews";
import { StudioAdminLoadPanel } from "./StudioAdminWaitingRow";
import css from "./StudioAdminLanding.module.css";

/** The Studio page tab: what the public Studio page shows, edited by staff.
 *  Previews, artist cards and the two photos; each state (loading, failed,
 *  content) sits in its own fold. */
export function StudioAdminLanding() {
  const { t } = useTranslation();
  const query = useAdminStudioLanding();
  const { data } = query;
  // The error panel gates on the failed-attempt count: Retry on a read that
  // never loaded resets the query to pending, and the panel (with the focus
  // on its button) must stay until the read lands.
  const loadState = studioLoadStateOf(query, data !== undefined);
  const isLoading = loadState.isLoading;

  return (
    <div className={css.stack}>
      <Collapse isOpen={isLoading}>
        <div className={css.skeletons} aria-hidden>
          {[0, 1, 2].map((skeletonIndex) => (
            <SkeletonLine
              key={skeletonIndex}
              height={120}
              style={{ borderRadius: 14 }}
            />
          ))}
        </div>
      </Collapse>
      <Collapse isOpen={loadState.isError || loadState.isNotFound}>
        <StudioAdminLoadPanel
          loadState={loadState}
          error={query.error}
          title={t("admin:studioAdmin.landing.loadError")}
        />
      </Collapse>
      <Collapse isOpen={data !== undefined}>
        {data && (
          <div className={css.stack}>
            <StudioAdminLandingPreviews landing={data} />
            <StudioAdminLandingCards landing={data} />
            <StudioAdminLandingPhotos landing={data} />
          </div>
        )}
      </Collapse>
    </div>
  );
}
