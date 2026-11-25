import { useEffect, useMemo, useState, type ReactNode } from "react";
import { NavigationType, useNavigationType, useParams } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, LoadErrorState } from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
import { useImagesReady } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDirectoryPlace } from "./api/useDirectory";
import { useDirectoryListings } from "./listBusiness/api/useDirectoryListings";
import { routes } from "../../app/routeMap";
import { galleryImageSources, galleryShotsOf } from "./directoryGalleryShots";
import { DirectorySpaceDetail } from "./DirectorySpaceDetail";
import { DirectorySpaceSkeleton } from "./DirectorySpaceSkeleton";
import { PageMeta } from "../../shared/seo/PageMeta";
import s from "./DirectorySpacePage.module.css";

/**
 * How long a wait runs before the skeleton fades in. A warm cache or a
 * back-navigation settles well inside it, and the page then appears in one
 * step with no skeleton blink and no fade.
 */
const SKELETON_GRACE_MS = 150;

/**
 * Whether the skeleton for this wait has been on screen: true once `isWaiting`
 * has held for the grace period. Recorded per `waitKey` (the slug), so moving
 * to another listing starts from "not shown" without resetting any state.
 */
function useHasSkeletonShown(isWaiting: boolean, waitKey: string): boolean {
  const [shownForKey, setShownForKey] = useState<string | null>(null);
  useEffect(() => {
    if (!isWaiting) return;
    const graceTimer = window.setTimeout(
      () => setShownForKey(waitKey),
      SKELETON_GRACE_MS,
    );
    return () => window.clearTimeout(graceTimer);
  }, [isWaiting, waitKey]);
  return shownForKey === waitKey;
}

export function DirectorySpacePage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { place, isLoading, isError, error, refetch } = useDirectoryPlace(slug);
  // A genuine 404 is an ANSWER ("no listing has this slug"), so it earns the
  // not-found panel below. Everything else that
  // failed (5xx, a network drop) is retryable. The demo miss (settled, no
  // error, no place) is the same answer reached without a request. Same shape
  // as `HousingListingPage`'s `isNotFound`.
  const isNotFound =
    (error instanceof ApiError && error.status === 404) || (!isError && !place);
  // Owner detection: match the viewer's own listings against this slug.
  // `useDirectoryListings` is the same demo-aware "is this mine" source
  // `PlacesSection` reads (the session overlay in demo, overlay + GET
  // /listings/mine deduped in live). `useAllMyListings` is hook-disabled in
  // demo mode (`enabled: !demoMode`) and so left `owned` permanently undefined
  // there; this one resolves in both modes. Logged-out
  // visitors simply never match (an empty `submitted`), same as before.
  const { submitted } = useDirectoryListings();
  const owned = submitted.find((listing) => listing.slug === slug);

  // Warm the gallery's photos before the page is revealed, so they paint from
  // cache in one go together with the rest of the layout. Null while
  // the listing is still in flight: there is nothing to preload yet, and the
  // hook must not start its hard-cap clock against a wait it cannot see.
  const photoSources = useMemo(
    () => (place ? galleryImageSources(place) : null),
    [place],
  );
  const { isReady: arePhotosReady } = useImagesReady(photoSources);

  // The skeleton holds the page's place while the listing is in flight and,
  // once it arrives, until its photos are decoded, so they paint in one go
  // with the rest of the page. A read that settles with no listing goes
  // straight to the not-found or retry state below.
  //
  // Back/forward skips the photo hold. ScrollManager restores the saved offset
  // once, on the first render, so the full page has to be there to land on;
  // the photos were seen on the way out and come from the browser cache.
  const isHistoryReturn = useNavigationType() === NavigationType.Pop;
  const isWaitingForPhotos =
    Boolean(place) && !arePhotosReady && !isHistoryReturn;
  const isWaitingForPage = isLoading || isWaitingForPhotos;
  const hasSkeletonShown = useHasSkeletonShown(isWaitingForPage, slug ?? "");

  let body: ReactNode;
  // In live mode the fetch is async: hold the layout while it's in flight
  // and wait for the read to settle before deciding the listing is missing.
  if (isWaitingForPage) {
    body = (
      <DirectorySpaceSkeleton
        photoCount={place ? galleryShotsOf(place).length : undefined}
        graceMs={SKELETON_GRACE_MS}
      />
    );
    // Settled with no matching listing (a genuine 404 or demo miss). Show an
    // honest not-found state: a stale or mistyped link deserves an explanation
    // and a way back to the directory, so the visitor knows what happened.
    // `noIndex` keeps the miss out of search.
    // Checked BEFORE `isError`: a 404 arrives as a rejected query now, and
    // reading it as an outage would offer a retry that can only 404 again.
  } else if (isNotFound) {
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
    // The read failed for a reason OTHER than "no such listing" (5xx, network):
    // offer a retry. `!place` rides along so the branch below gets a narrowed
    // place with no cast.
  } else if (isError || !place) {
    body = (
      <PageShell>
        <LoadErrorState onRetry={() => void refetch()} />
      </PageShell>
    );
  } else {
    body = (
      <DirectorySpaceDetail
        key={place.slug}
        place={place}
        ownerRef={owned?.ref}
        shouldFadeIn={hasSkeletonShown}
      />
    );
  }

  return body;
}
