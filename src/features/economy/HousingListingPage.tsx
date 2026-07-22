import { useState } from "react";
import { FiMapPin } from "react-icons/fi";
import { Link, Navigate, useParams } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import { FadeIn } from "../../shared/components/ui";
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
import { useHousingListing } from "./api/useHousingListing";
import { useHousingListings } from "./api/useHousingListings";
import s from "./HousingListingPage.module.css";

export function HousingListingPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [messaging, setMessaging] = useState(false);
  const loading = useSimulatedLoad();

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
            <span
              className={s.type}
              style={{ background: listing.typeColor, color: listing.typeText }}
            >
              {typeLabel}
            </span>
            <h1 className={s.title}>{listing.title}</h1>
            <div className={s.metaRow}>
              <span className={s.metaPill}>
                <FiMapPin /> {listing.hood}
              </span>
              <span className={s.metaPill}>{listing.beds}</span>
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
    </PageShell>
  );
}
