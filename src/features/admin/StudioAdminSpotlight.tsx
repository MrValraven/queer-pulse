import { Collapse, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioLoadStateOf } from "../studio/api/studioLoadState";
import { useAdminStudioSpotlight } from "./api/StudioAdminSpotlightHooks";
import { StudioAdminArtistOfTheMonth } from "./StudioAdminArtistOfTheMonth";
import { StudioAdminNewStars } from "./StudioAdminNewStars";
import { StudioAdminLoadPanel } from "./StudioAdminWaitingRow";
import css from "./StudioAdminSpotlight.module.css";

/** The Artists tab: Artist of the month, then New stars, in the order
 *  Studio home shows them. */
export function StudioAdminSpotlight() {
  const { t } = useTranslation();
  const query = useAdminStudioSpotlight();
  const spotlight = query.data;
  const loadState = studioLoadStateOf(query, spotlight !== undefined);

  return (
    <div className={css.tab}>
      <Collapse isOpen={loadState.isLoading}>
        <div className={css.skeletons}>
          <SkeletonLine
            height={160}
            style={{ borderRadius: "var(--radius-card)" }}
          />
          <SkeletonLine
            height={240}
            style={{ borderRadius: "var(--radius-card)" }}
          />
        </div>
      </Collapse>
      <Collapse isOpen={loadState.isError}>
        <StudioAdminLoadPanel
          loadState={loadState}
          error={query.error}
          title={t("admin:studioAdmin.loadError")}
        />
      </Collapse>
      <Collapse isOpen={spotlight !== undefined}>
        <div className={css.tab}>
          <StudioAdminArtistOfTheMonth
            spotlightArtist={spotlight?.artistOfTheMonth ?? null}
          />
          <StudioAdminNewStars stars={spotlight?.newStars ?? []} />
        </div>
      </Collapse>
    </div>
  );
}
