import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioDashboardReleaseView } from "./api/studioDashboard.adapters";
import { RELEASE_HEALTH_ROWS_SHOWN } from "./studioReleaseHealth";
import { StudioReleaseHealthRow } from "./StudioReleaseHealthRow";
import css from "./StudioReleaseHealth.module.css";

/** "Release checklist": the releases with something left to add, the first
 *  few shown and the rest folded behind a toggle. Rows that join or leave
 *  either list animate. `isFirst` drops the top rule when nothing sits above
 *  it in the card. */
export function StudioReleaseHealthList({
  releases,
  isFirst = false,
}: {
  releases: StudioDashboardReleaseView[];
  isFirst?: boolean;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const restId = useId();
  const [isShowingAll, setIsShowingAll] = useState(false);
  const shownReleases = releases.slice(0, RELEASE_HEALTH_ROWS_SHOWN);
  const restReleases = releases.slice(RELEASE_HEALTH_ROWS_SHOWN);
  // A rest that empties closes, so one that grows back starts folded.
  if (restReleases.length === 0 && isShowingAll) setIsShowingAll(false);
  return (
    <div className={`${css.checklist} ${isFirst ? css.isFirst : ""}`}>
      <h3 id={headingId} className={css.heading}>
        {t("studio:numbers.health.heading")}
      </h3>
      <ul className={css.rows} aria-labelledby={headingId}>
        <AnimatePresence initial={false}>
          {shownReleases.map((releaseRow) => (
            <StudioReleaseHealthRow
              key={releaseRow.release.id}
              releaseRow={releaseRow}
            />
          ))}
        </AnimatePresence>
      </ul>
      <div id={restId}>
        <Collapse isOpen={isShowingAll && restReleases.length > 0}>
          <ul
            className={`${css.rows} ${css.restRows}`}
            aria-labelledby={headingId}
          >
            <AnimatePresence initial={false}>
              {restReleases.map((releaseRow) => (
                <StudioReleaseHealthRow
                  key={releaseRow.release.id}
                  releaseRow={releaseRow}
                />
              ))}
            </AnimatePresence>
          </ul>
        </Collapse>
      </div>
      <Collapse isOpen={restReleases.length > 0}>
        <Button
          className={css.moreToggle}
          variant="quiet"
          size="sm"
          aria-expanded={isShowingAll}
          aria-controls={restId}
          onClick={() => setIsShowingAll((isShowing) => !isShowing)}
        >
          {isShowingAll
            ? t("studio:numbers.health.showFewer")
            : t("studio:numbers.health.showMore", {
                count: restReleases.length,
              })}
        </Button>
      </Collapse>
    </div>
  );
}
