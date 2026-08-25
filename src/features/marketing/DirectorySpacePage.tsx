import { Link, useParams } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, FeatureHelp, SkeletonLine } from "../../shared/components/ui";
import { ErrorFallback } from "../../shared/components/feedback/ErrorFallback";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDirectoryPlace } from "./api/useDirectory";
import { useDirectoryListings } from "./listBusiness/api/useDirectoryListings";
import { routes } from "../../app/routeMap";
import { DirectorySpaceView } from "./DirectorySpaceView";
import { DirectoryNearbyPlaces } from "./DirectoryNearbyPlaces";
import { DirectoryRelatedPlaces } from "./DirectoryRelatedPlaces";
import { categoryLabel, normalizeCategory } from "./localPlaces";
import { PageMeta } from "../../shared/seo/PageMeta";
import s from "./DirectorySpacePage.module.css";

/** Truncate a listing's tagline/description to a sensible social-meta length. */
function clampDescription(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 200 ? `${clean.slice(0, 197).trimEnd()}…` : clean;
}

export function DirectorySpacePage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { place, isLoading, isError, refetch } = useDirectoryPlace(slug);
  // Owner detection: match the viewer's own listings against this slug.
  // `useDirectoryListings` is the same demo-aware "is this mine" source
  // `PlacesSection` reads (the session overlay in demo, overlay + GET
  // /listings/mine deduped in live) — unlike `useAllMyListings`, which is
  // hook-disabled in demo mode (`enabled: !demoMode`) and so left `owned`
  // permanently undefined there, this resolves in both modes. Logged-out
  // visitors simply never match (an empty `submitted`), same as before.
  const { submitted } = useDirectoryListings();
  const owned = submitted.find((listing) => listing.slug === slug);

  // In live mode the fetch is async: hold the layout while it's in flight
  // rather than redirecting on the initial undefined. Only redirect once the
  // read has settled with no matching live listing.
  if (isLoading) {
    return (
      <PageShell>
        <div className={s.page}>
          <div className={s.grid}>
            <div>
              <SkeletonLine width="45%" height={16} />
              <SkeletonLine width="80%" height={34} style={{ marginTop: 12 }} />
              <SkeletonLine width="60%" height={16} style={{ marginTop: 12 }} />
            </div>
            <SkeletonLine width="100%" height={220} />
          </div>
        </div>
      </PageShell>
    );
  }
  // The read failed for a reason OTHER than "no such listing" (5xx, network):
  // offer a retry instead of a misleading redirect to the directory.
  if (isError) {
    return (
      <PageShell>
        <ErrorFallback onReset={refetch} level="route" />
      </PageShell>
    );
  }
  // Settled with no matching listing (a genuine 404 or demo miss). Show an
  // honest not-found state — a stale or mistyped link deserves an explanation
  // and a way back, not a silent bounce to the directory that leaves the
  // visitor wondering what happened. `noIndex` keeps the miss out of search.
  if (!place) {
    return (
      <PageShell>
        <PageMeta
          title={`${t("marketing:directory.detail.notFound.title")} | QueerPulse`}
          noIndex
        />
        <div className={s.notFound}>
          <EmptyState
            icon={<FiMapPin />}
            title={t("marketing:directory.detail.notFound.title")}
            description={t("marketing:directory.detail.notFound.body")}
            action={{
              label: t("marketing:directory.detail.notFound.cta"),
              to: routes.directory,
            }}
          />
        </div>
      </PageShell>
    );
  }

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
            {owned && (
              <Link
                to={routes.listBusinessEdit.replace(":ref", owned.ref)}
                className={s.ownerEdit}
              >
                {t("marketing:directory.editThisListing")}
              </Link>
            )}
          </div>
        </div>
      </div>
      <DirectorySpaceView place={place} ownerRef={owned?.ref} />
      {/* Walk-able first, then the wider "more like this" row: an evening is
          usually planned by geography before category. Both sit outside
          `DirectorySpaceView`, so the moderation preview keeps showing only
          the listing under review. */}
      <DirectoryNearbyPlaces place={place} />
      <DirectoryRelatedPlaces place={place} />
    </PageShell>
  );
}
