import { useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta } from "../../shared/seo/PageMeta";
import { Collapse } from "../../shared/components/ui/Collapse";
import { useHasStaffRole } from "../auth/api/useMyStaffRoles";
import { type DirectoryPlace } from "./directoryPlaces";
import { DirectorySpaceView } from "./DirectorySpaceView";
import { DirectoryTopBands } from "./DirectoryTopBands";
import { DirectoryOwnerBand } from "./DirectoryOwnerBand";
import { DirectoryNearbyPlaces } from "./DirectoryNearbyPlaces";
import { DirectoryRelatedPlaces } from "./DirectoryRelatedPlaces";
import { categoryLabel } from "./localCategories";
import { directoryCategoryPath } from "./directoryBreadcrumb";
import s from "./DirectorySpacePage.module.css";

/** Truncate a listing's tagline/description to a sensible social-meta length. */
function clampDescription(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 200 ? `${clean.slice(0, 197).trimEnd()}…` : clean;
}

interface Props {
  place: DirectoryPlace;
  /** The viewer's own ref for this listing, present only when they own it. */
  ownerRef?: string;
}

/**
 * The resolved directory detail page. Split out of `DirectorySpacePage` so that
 * page is left holding only the read, its loading/error/not-found branches, and
 * the staged loader that covers them, and so `place` arrives here already
 * narrowed to a real listing.
 */
export function DirectorySpaceDetail({ place, ownerRef }: Props) {
  const { t } = useTranslation();
  // The resolved label (heals legacy display-string categories too) and the
  // filter link whose chip matches it, on the tab the listing lives in.
  const categoryText = categoryLabel(t, place.cat);
  const categoryPath = directoryCategoryPath(place);
  const isAdultsOnly = place.isAdultsOnly === true;
  // "View as visitor" is local UI state: it is not saved and starts off for
  // each listing, because the page is remounted per listing (see
  // `DirectorySpacePage`). It is offered only to someone with controls to hide
  // (a directory moderator or the listing's owner), so it can never be on for
  // anyone else.
  const isDirectoryModerator = useHasStaffRole("directory_moderator");
  const [isVisitorViewRequested, setIsVisitorViewRequested] = useState(false);
  const isVisitorView =
    isVisitorViewRequested && (isDirectoryModerator || Boolean(ownerRef));
  const handleEnterVisitorView = () => setIsVisitorViewRequested(true);
  const handleExitVisitorView = () => setIsVisitorViewRequested(false);

  return (
    <PageShell>
      {/* This route is permanently member-gated (see authGate.ts) and excluded
          from the sitemap/prerender allowlist, so canonical/OG/structured-data
          tags can never reach a crawler or an unauthenticated link-preview
          bot. Only `title`/`description` (browser tab, in-app value) are
          worth setting here. */}
      {/* An 18+ listing is member-only and never indexed. Its path shares the
          directory prefix, so no robots change applies (contract amendment
          2). */}
      <PageMeta
        title={`${place.name} | QueerPulse`}
        description={clampDescription(place.tagline || place.desc)}
        noIndex={isAdultsOnly}
      />
      {/* The moderator band sits above everything the listing says about
          itself, full bleed and in plum, so it reads as platform chrome that
          only some people are shown. It gates itself on the directory
          moderator role. In visitor view a slim plum strip takes its place. */}
      <DirectoryTopBands
        place={place}
        isDirectoryModerator={isDirectoryModerator}
        isVisitorView={isVisitorView}
        onEnterVisitorView={handleEnterVisitorView}
        onExitVisitorView={handleExitVisitorView}
      />
      <div className={s.coverHead}>
        <div className={s.coverInner}>
          <div className={s.coverTop}>
            <nav
              aria-label={t("marketing:directory.detail.breadcrumbAria")}
              className={s.breadcrumb}
            >
              <ol className={s.breadcrumbList}>
                <li>
                  <Link to={routes.directory}>
                    {t("marketing:directory.detail.breadcrumbHome")}
                  </Link>
                  <FiChevronRight className={s.crumbSep} aria-hidden />
                </li>
                <li>
                  <Link to={categoryPath}>{categoryText}</Link>
                  <FiChevronRight className={s.crumbSep} aria-hidden />
                </li>
                <li aria-current="page">{place.name}</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
      {/* The owner's own controls, which used to be a single uppercase "edit"
          pill floating opposite the breadcrumb. As a jade-edged card under the
          trail it reads as a tier of its own, and it has room to say where the
          listing stands and to offer the confirm-details prompt when that is
          worth asking for. Renders nothing for everybody else, and folds away
          in visitor view. An owner who is also a moderator already has the
          toggle in the moderator band, so only the others get it here. */}
      <Collapse isOpen={Boolean(ownerRef) && !isVisitorView}>
        <DirectoryOwnerBand
          place={place}
          ownerRef={ownerRef}
          onEnterVisitorView={
            isDirectoryModerator ? undefined : handleEnterVisitorView
          }
        />
      </Collapse>
      <DirectorySpaceView
        place={place}
        ownerRef={isVisitorView ? undefined : ownerRef}
        isVisitorView={isVisitorView}
      />
      {/* Walk-able first, then the wider "more like this" row: an evening is
          usually planned by geography before category. Both sit outside
          `DirectorySpaceView`, so the moderation preview keeps showing only
          the listing under review. */}
      <DirectoryNearbyPlaces place={place} />
      <DirectoryRelatedPlaces place={place} />
    </PageShell>
  );
}
