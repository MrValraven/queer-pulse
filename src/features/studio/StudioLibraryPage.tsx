import { useId } from "react";
import { m } from "motion/react";
import { Navigate } from "react-router-dom";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { routes } from "../../app/routeMap";
import { Collapse, tabPanelProps } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioLibraryPanel } from "./StudioLibraryPanels";
import { StudioLibraryToolbar } from "./StudioLibraryToolbar";
import { LIVE_LIBRARY_TABS } from "./studioLibrary.data";
import {
  STUDIO_LIBRARY_ARTIST_SORTS,
  STUDIO_LIBRARY_SORTS,
} from "./studioLibrarySort.data";
import { STUDIO_FADE } from "./studioMotion";
import { StudioShell } from "./StudioShell";
import { StudioTablist } from "./StudioTablist";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import { useStudioLibraryParams } from "./useStudioLibraryParams";
import { useStudioShowcase } from "./useStudioShowcase";
import s from "./studioPages.module.css";
import css from "./StudioLibrary.module.css";

/** The demo's lifetime paid-to-artists line: showcase only (Studio has no
 *  money in v2). Numbers, formatted through useFormat. */
const LIFETIME_PAID_AMOUNT = 312;
const LIFETIME_ARTIST_COUNT = 47;

const REDUCED_FADE = { duration: 0.12 } as const;

/** The library (Studio v2): your playlists and saved ones (Liked songs
 *  first), saved releases, and the artists you follow. The tab lives in
 *  `?tab=`, the filter in `?q=` and the sort in `?sort=`, and both carry
 *  across tabs. The old `?tab=tracks` link opens Liked songs. */
export function StudioLibraryPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isShowcase = useStudioShowcase();
  const params = useStudioLibraryParams();
  const { tab } = params;
  const idPrefix = useId();
  const { reducedMotion } = useMotionPrefs();
  useStudioDocumentTitle(t("studio:library.eyebrow"));
  if (params.tabParam === "tracks")
    return <Navigate to={routes.studioLiked} replace />;
  return (
    <StudioShell>
      <div className={s.pageH}>
        <div className={s.eb}>{t("studio:library.eyebrow")}</div>
        <h1>
          <Translation
            i18nKey="studio:library.title"
            components={{ em: <em /> }}
          />
        </h1>
        <div className={s.dek}>
          {isShowcase ? (
            <Translation
              i18nKey="studio:library.dek"
              components={{ em: <em /> }}
              values={{
                amount: fmt.currency(LIFETIME_PAID_AMOUNT),
                artistCount: LIFETIME_ARTIST_COUNT,
              }}
            />
          ) : (
            t("studio:libraryLive.dek")
          )}
        </div>
      </div>
      <StudioTablist
        tabs={LIVE_LIBRARY_TABS}
        activeId={tab}
        idPrefix={idPrefix}
        label={t("studio:libraryLive.tablistLabel")}
        onChange={params.setTab}
      />
      {/* Purchases keep their own order, so the filter and sort fold away. */}
      <Collapse isOpen={tab !== "purchases"}>
        <StudioLibraryToolbar
          query={params.query}
          onQueryChange={params.setQuery}
          sort={params.sort}
          onSortChange={params.setSort}
          options={
            tab === "artists"
              ? STUDIO_LIBRARY_ARTIST_SORTS
              : STUDIO_LIBRARY_SORTS
          }
        />
      </Collapse>
      <div {...tabPanelProps(idPrefix, tab)} className={css.panel}>
        {/* The tab's content fades in on arrival and on every tab change,
            on the Studio fade (a lift with full motion). */}
        <m.div
          key={tab}
          initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? REDUCED_FADE : STUDIO_FADE}
        >
          <StudioLibraryPanel
            tab={tab}
            query={params.query}
            sort={params.sort}
            onClearQuery={() => params.setQuery("")}
          />
        </m.div>
      </div>
    </StudioShell>
  );
}
