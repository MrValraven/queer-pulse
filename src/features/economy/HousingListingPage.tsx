import { useState } from "react";
import { FiArrowLeft, FiMapPin } from "react-icons/fi";
import { Link, Navigate, useParams } from "react-router-dom";
import { useSaved } from "../../app/providers/useSaved";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import { FadeIn, FeatureHelp, SaveButton } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { ApiError } from "../../shared/api/client";
import { useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FILTERS } from "./housing.data";
import { HousingGallery } from "./HousingGallery";
import { MessageModal } from "./HousingModals";
import { RequestViewingModal } from "./RequestViewingModal";
import { VerifiedListingBadge } from "./VerifiedListingBadge";
import { HousingListingSkeleton } from "./HousingListingSkeleton";
import {
  HousingListingError,
  HousingListingMain,
  HousingListingSidebar,
} from "./HousingListingSections";
import { ReportListingModal } from "./ReportListingModal";
import { useHousingListing } from "./api/useHousingListing";
import { useHousingListings } from "./api/useHousingListings";
import s from "./HousingListingPage.module.css";

export function HousingListingPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [messaging, setMessaging] = useState(false);
  const [requestingViewing, setRequestingViewing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const loading = useSimulatedLoad();
  const { isSaved, toggleSave } = useSaved();
  const { showToast } = useToast();

  const { data, isLoading, isError, error, refetch } = useHousingListing(slug);
  const { data: allListings = [] } = useHousingListings();

  if (isLoading || loading) {
    return (
      <PageShell>
        <div className={s.page}>
          <Link to={routes.housing} className={s.back}>
            <FiArrowLeft aria-hidden />{" "}
            {t("economy:housingListing.back")}
          </Link>
          <HousingListingSkeleton />
        </div>
      </PageShell>
    );
  }

  // Only a genuine 404 (or a demo slug that simply doesn't exist → data is null
  // with no error) means "not found" and earns the redirect. Any OTHER failure
  // — network drop, timeout, 5xx — keeps the reader here with a retry instead of
  // silently bouncing them to the board.
  const isNotFound =
    (error instanceof ApiError && error.status === 404) || (!isError && !data);
  if (isNotFound) return <Navigate to={routes.housing} replace />;

  if (isError || !data) {
    return (
      <PageShell>
        <div className={s.page}>
          <Link to={routes.housing} className={s.back}>
            <FiArrowLeft aria-hidden />{" "}
            {t("economy:housingListing.back")}
          </Link>
          <HousingListingError onRetry={() => void refetch()} />
        </div>
      </PageShell>
    );
  }

  const listing = data.listing;
  const similar = allListings
    .filter((other) => other.slug !== listing.slug)
    .slice(0, 3);

  const first =
    listing.poster.fullName.split(" ")[0] ?? listing.poster.fullName;
  const typeLabel = t(
    FILTERS.find((filterOption) => filterOption.value === listing.type)
      ?.labelKey ?? "economy:housing.filter.all",
  );

  const savedId = `housing:${listing.slug}`;
  const saved = isSaved(savedId);

  function handleToggleSave() {
    const now = toggleSave({
      id: savedId,
      kind: "housing",
      title: listing.title,
      href: `${routes.housing}/${listing.slug}`,
      meta: listing.hood,
    });
    showToast(
      t(
        now
          ? "economy:housingListing.savedToast"
          : "economy:housingListing.unsavedToast",
        { title: listing.title },
      ),
      now ? "success" : "info",
    );
  }

  return (
    <PageShell>
      <div className={s.page}>
        <Link to={routes.housing} className={s.back}>
          <FiArrowLeft aria-hidden />{" "}
            {t("economy:housingListing.back")}
        </Link>

        <FadeIn>
          <HousingGallery listing={listing} />

          <header className={s.head}>
            <div className={s.headTop}>
              <span
                className={s.type}
                style={{
                  background: listing.typeColor,
                  color: listing.typeText,
                }}
              >
                {typeLabel}
              </span>
              <SaveButton
                saved={saved}
                onToggle={handleToggleSave}
                label={t(
                  saved
                    ? "economy:housingListing.saved"
                    : "economy:housingListing.save",
                )}
              />
            </div>
            <h1 className={s.title}>
              {listing.title} <FeatureHelp id="housing.listing" />
            </h1>
            <div className={s.metaRow}>
              {listing.verified && (
                <VerifiedListingBadge verified={listing.verified} />
              )}
              <span className={s.metaPill}>
                <FiMapPin /> {listing.hood}
              </span>
              {listing.beds && (
                <span className={s.metaPill}>{listing.beds}</span>
              )}
              <span className={s.metaPill}>
                {t("economy:housing.listing.from", { date: listing.avail })}
              </span>
              <span className={s.metaPill}>
                {listing.price} / {listing.period}
              </span>
            </div>
          </header>

          <div className={s.grid}>
            <HousingListingMain listing={listing} />
            <HousingListingSidebar
              listing={listing}
              first={first}
              similar={similar}
              onMessage={() => setMessaging(true)}
              onRequestViewing={() => setRequestingViewing(true)}
              onReport={() => setReporting(true)}
            />
          </div>
        </FadeIn>
      </div>

      {messaging && (
        <MessageModal
          toName={listing.poster.fullName}
          listingTitle={listing.title}
          responseTime={listing.poster.responseTime}
          listingRef={data.ref}
          onClose={() => setMessaging(false)}
        />
      )}

      {requestingViewing && (
        <RequestViewingModal
          listingTitle={listing.title}
          listingRef={data.ref}
          onClose={() => setRequestingViewing(false)}
        />
      )}

      {reporting && (
        <ReportListingModal
          subjectType="housing"
          subjectId={listing.slug}
          subjectName={listing.title}
          onClose={() => setReporting(false)}
        />
      )}
    </PageShell>
  );
}
