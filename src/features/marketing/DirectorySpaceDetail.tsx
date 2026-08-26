import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { FeatureHelp } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta } from "../../shared/seo/PageMeta";
import { type DirectoryPlace } from "./directoryPlaces";
import { DirectorySpaceView } from "./DirectorySpaceView";
import { DirectoryNearbyPlaces } from "./DirectoryNearbyPlaces";
import { DirectoryRelatedPlaces } from "./DirectoryRelatedPlaces";
import { categoryLabel, normalizeCategory } from "./localCategories";
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
 * the staged loader that covers them — and so `place` arrives here already
 * narrowed to a real listing.
 */
export function DirectorySpaceDetail({ place, ownerRef }: Props) {
  const { t } = useTranslation();
  // Canonical slug for the filter link so the directory chip matches, plus the
  // resolved label (heals legacy display-string categories too).
  const categorySlug = normalizeCategory(place.cat);
  const categoryText = categoryLabel(t, place.cat);

  return (
    <PageShell>
      {/* This route is permanently member-gated (see authGate.ts) and excluded
          from the sitemap/prerender allowlist, so canonical/OG/structured-data
          tags can never reach a crawler or an unauthenticated link-preview
          bot — only `title`/`description` (browser tab, in-app value) are
          worth setting here. */}
      <PageMeta
        title={`${place.name} | QueerPulse`}
        description={clampDescription(place.tagline || place.desc)}
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
                </li>
                <li>
                  <Link to={`${routes.directory}?cat=${categorySlug}`}>
                    {categoryText}
                  </Link>
                </li>
                <li aria-current="page">
                  {place.name} <FeatureHelp id="local.directoryDetail" />
                </li>
              </ol>
            </nav>
            {ownerRef && (
              <Link
                to={routes.listBusinessEdit.replace(":ref", ownerRef)}
                className={s.ownerEdit}
              >
                {t("marketing:directory.editThisListing")}
              </Link>
            )}
          </div>
        </div>
      </div>
      <DirectorySpaceView place={place} ownerRef={ownerRef} />
      {/* Walk-able first, then the wider "more like this" row: an evening is
          usually planned by geography before category. Both sit outside
          `DirectorySpaceView`, so the moderation preview keeps showing only
          the listing under review. */}
      <DirectoryNearbyPlaces place={place} />
      <DirectoryRelatedPlaces place={place} />
    </PageShell>
  );
}
