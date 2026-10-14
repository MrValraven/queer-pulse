import { useId } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { FadeIn, tabPanelProps } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioLibraryPanel } from "./StudioLibraryPanels";
import { LIVE_LIBRARY_TABS } from "./studioLibrary.data";
import { STUDIO_LIBRARY_TABS, type StudioLibraryTab } from "./studioPaths";
import { StudioShell } from "./StudioShell";
import { StudioTablist } from "./StudioTablist";
import { useStudioShowcase } from "./useStudioShowcase";
import s from "./studioPages.module.css";
import css from "./StudioLibrary.module.css";

/** The demo's lifetime paid-to-artists line: showcase only (Studio has no
 *  money in v2). Numbers, formatted through useFormat. */
const LIFETIME_PAID_AMOUNT = 312;
const LIFETIME_ARTIST_COUNT = 47;

const KNOWN_TABS: ReadonlySet<string> = new Set(STUDIO_LIBRARY_TABS);
const isLibraryTab = (value: string | null): value is StudioLibraryTab =>
  value !== null && KNOWN_TABS.has(value);

/** The library (Studio v2): your playlists and saved ones (Liked songs
 *  first), saved releases, and the artists you follow. The tab lives in
 *  `?tab=`. The old `?tab=tracks` link opens Liked songs. */
export function StudioLibraryPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isShowcase = useStudioShowcase();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: StudioLibraryTab = isLibraryTab(tabParam) ? tabParam : "playlists";
  const idPrefix = useId();
  if (tabParam === "tracks")
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
        onChange={(next) =>
          setSearchParams(next === "playlists" ? {} : { tab: next }, {
            replace: true,
          })
        }
      />
      <div {...tabPanelProps(idPrefix, tab)} className={css.panel}>
        <FadeIn key={tab}>
          <StudioLibraryPanel tab={tab} />
        </FadeIn>
      </div>
    </StudioShell>
  );
}
