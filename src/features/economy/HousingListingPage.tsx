import { useState } from "react";
import { FiBookmark, FiMapPin } from "react-icons/fi";
import { Link, Navigate, useParams } from "react-router-dom";
import { useSaved } from "../../app/providers/useSaved";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GAL_BG } from "./housingListing.data";
import { FILTERS } from "./housing.data";
import { MessageModal } from "./HousingModals";
import { HousingListingSkeleton } from "./HousingListingSkeleton";
import {
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
  const [reporting, setReporting] = useState(false);
  const loading = useSimulatedLoad();
  const { isSaved, toggleSave } = useSaved();
  const { showToast } = useToast();

  const { data, isLoading, isError } = useHousingListing(slug);
  const { data: allListings = [] } = useHousingListings("all");

  if (isLoading || loading) {
    return (
      <PageShell>
        <div className={s.page}>
          <Link to={routes.housing} className={s.back}>
            {t("economy:housingListing.back")}
          </Link>
          <HousingListingSkeleton />
        </div>
      </PageShell>
    );
  }

  if (isError || !data) return <Navigate to={routes.housing} replace />;

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
          {t("economy:housingListing.back")}
        </Link>

        <FadeIn>
          <div className={s.gallery}>
            {listing.gallery.map((caption, index) => (
              <div
                key={index}
                className={s.gCell}
                style={{ background: GAL_BG[listing.tint] }}
              >
                <span className={s.gCap}>{caption}</span>
              </div>
            ))}
          </div>

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
              <Button
                variant="ghost"
                className={s.saveBtn}
                onClick={handleToggleSave}
                aria-pressed={saved}
                aria-label={t(
                  saved
                    ? "economy:housingListing.unsaveAriaLabel"
                    : "economy:housingListing.saveAriaLabel",
                  { title: listing.title },
                )}
              >
                <FiBookmark
                  aria-hidden
                  style={{ fill: saved ? "currentColor" : "none" }}
                />
                {t(
                  saved
                    ? "economy:housingListing.saved"
                    : "economy:housingListing.save",
                )}
              </Button>
            </div>
            <h1 className={s.title}>{listing.title}</h1>
            <div className={s.metaRow}>
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
