import { useMemo, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { ErrorFallback } from "../../shared/components/feedback/ErrorFallback";
import { useImagesReady } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDirectoryPlace } from "./api/useDirectory";
import { useDirectoryListings } from "./listBusiness/api/useDirectoryListings";
import { routes } from "../../app/routeMap";
import { galleryImageSources } from "./directoryGalleryShots";
import { DirectorySpaceDetail } from "./DirectorySpaceDetail";
import { DirectorySpaceLoader } from "./DirectorySpaceLoader";
import { PageMeta } from "../../shared/seo/PageMeta";
import s from "./DirectorySpacePage.module.css";

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

  // Warm the gallery's photos before the page is revealed, so they paint from
  // cache in one go instead of popping in over a half-drawn layout. Null while
  // the listing is still in flight: there is nothing to preload yet, and the
  // hook must not start its hard-cap clock against a wait it cannot see.
  const photoSources = useMemo(
    () => (place ? galleryImageSources(place) : null),
    [place],
  );
  const { isReady: arePhotosReady } = useImagesReady(photoSources);

  let body: ReactNode;
  // In live mode the fetch is async: hold the layout while it's in flight
  // rather than redirecting on the initial undefined. Only redirect once the
  // read has settled with no matching live listing.
  if (isLoading) {
    body = (
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
    // The read failed for a reason OTHER than "no such listing" (5xx, network):
    // offer a retry instead of a misleading redirect to the directory.
  } else if (isError) {
    body = (
      <PageShell>
        <ErrorFallback onReset={refetch} level="route" />
      </PageShell>
    );
    // Settled with no matching listing (a genuine 404 or demo miss). Show an
    // honest not-found state — a stale or mistyped link deserves an explanation
    // and a way back, not a silent bounce to the directory that leaves the
    // visitor wondering what happened. `noIndex` keeps the miss out of search.
  } else if (!place) {
    body = (
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
  } else {
    body = <DirectorySpaceDetail place={place} ownerRef={owned?.ref} />;
  }

  // The overlay gets ONE stable position in the tree, outside the branching
  // above: re-parenting it as the page moves from loading to loaded would
  // unmount it and restart its grace period, so the checklist would reset
  // exactly when it is meant to be finishing. It portals to document.body, so
  // sitting beside `body` rather than inside it costs nothing.
  return (
    <>
      {body}
      <DirectorySpaceLoader
        isFetchingListing={isLoading}
        hasPlace={Boolean(place)}
        arePhotosReady={arePhotosReady}
      />
    </>
  );
}
