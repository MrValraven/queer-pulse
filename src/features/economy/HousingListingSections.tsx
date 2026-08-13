import { FiArrowRight, FiBriefcase, FiCalendar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Avatar, Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { HousingListing } from "./housingListings";
import { VerificationBadge } from "./VerificationBadge";
import { AffirmingBaselineBadge } from "./AffirmingBaseline";
import { ListingReviews } from "./ListingReviews";
import { HousingLocationCard } from "./HousingLocationCard";
import { HousingVirtualTour } from "./HousingVirtualTour";
import { GAL_BG } from "./housingListing.data";
import s from "./HousingListingPage.module.css";

export function HousingListingMain({ listing }: { listing: HousingListing }) {
  const { t } = useTranslation();
  return (
    <div>
      <section className={s.sec}>
        <div className={s.affirmingBaseline}>
          <AffirmingBaselineBadge />
          <span>{t("economy:affirmingBaseline.detailNote")}</span>
        </div>
        <h2>{t("economy:housingListing.section.about")}</h2>
        {listing.longDesc.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </section>

      <section className={s.sec}>
        <h2>{t("economy:housingListing.section.features")}</h2>
        <div className={s.features}>
          {listing.features.map((feature) => (
            <span key={feature} className={s.feature}>
              {feature}
            </span>
          ))}
        </div>
      </section>

      <section className={s.sec}>
        <h2>{t("economy:housingListing.section.facts")}</h2>
        <div className={s.facts}>
          {listing.facts.map((fact) => (
            <div key={fact.label} className={s.factRow}>
              <span>{fact.label}</span>
              <b>{fact.value}</b>
            </div>
          ))}
        </div>
      </section>

      <section className={s.sec}>
        <h2>{t("economy:housingListing.section.idealFor")}</h2>
        <div className={s.bullets}>
          {listing.idealFor.map((bullet) => (
            <div key={bullet} className={s.bullet}>
              <div className={s.bulletDot} />
              {bullet}
            </div>
          ))}
        </div>
      </section>

      {listing.accessibilityInfo && (
        <section className={s.sec}>
          <h2>{t("economy:housingListing.section.accessibility")}</h2>
          <p className={s.accessBody}>{listing.accessibilityInfo}</p>
        </section>
      )}

      {listing.virtualTourUrl && (
        <section className={s.sec}>
          <h2>{t("economy:housingListing.section.virtualTour")}</h2>
          <HousingVirtualTour url={listing.virtualTourUrl} />
        </section>
      )}

      <section className={s.sec}>
        <h2>{t("economy:housingListing.section.location")}</h2>
        <HousingLocationCard location={listing.location} title={listing.title} />
      </section>

      <section className={s.sec}>
        <h2>{t("economy:housingViewing.reviews.heading")}</h2>
        <ListingReviews slug={listing.slug} />
      </section>
    </div>
  );
}

export function HousingListingSidebar({
  listing,
  first,
  similar,
  onMessage,
  onRequestViewing,
  onReport,
}: {
  listing: HousingListing;
  first: string;
  similar: HousingListing[];
  onMessage: () => void;
  onRequestViewing: () => void;
  onReport: () => void;
}) {
  const { t } = useTranslation();
  return (
    <aside className={s.side}>
      <div className={s.priceCard}>
        <div className={s.priceBig}>
          {listing.price} <span>/ {listing.period}</span>
        </div>
        <div className={s.priceMeta}>
          {t("economy:housingListing.availableFrom", { date: listing.avail })}
        </div>
        {listing.billsIncluded !== undefined && (
          <div className={s.priceMeta}>
            {t(
              listing.billsIncluded
                ? "economy:housingListing.billsIncluded"
                : "economy:housingListing.billsExcluded",
            )}
          </div>
        )}
        <Button variant="ghost-dark" className={s.priceBtn} onClick={onMessage}>
          {t("economy:housingListing.messageCtaArrow", { name: first })}{" "}
          <FiArrowRight aria-hidden />
        </Button>
        <Button
          variant="jade"
          className={s.priceBtn}
          onClick={onRequestViewing}
        >
          <FiCalendar aria-hidden />{" "}
          {t("economy:housingViewing.request.cta")}
        </Button>
        <Link to={routes.housingViewings} className={s.viewingsLink}>
          {t("economy:housingViewing.request.myViewingsLink")}
        </Link>
      </div>

      <div className={s.sideCard}>
        <h4>{t("economy:housingListing.listedBy")}</h4>
        <div className={s.lister}>
          <Avatar
            initials={listing.poster.initials}
            tint={listing.poster.tint}
            size={44}
          />
          <div>
            <div className={s.listerName}>{listing.poster.fullName}</div>
            <div className={s.listerSince}>{listing.poster.memberSince}</div>
          </div>
        </div>
        <div className={s.badgeRow}>
          <span className={s.verifiedRow}>
            <VerificationBadge
              level={listing.poster.verificationLevel ?? "email"}
            />
          </span>
          {listing.listerKind === "agent" && (
            <span
              className={s.agentBadge}
              title={t("economy:housingListing.agentBadge.tooltip")}
            >
              <FiBriefcase aria-hidden className={s.agentIcon} />
              {t("economy:housingListing.agentBadge.label")}
            </span>
          )}
        </div>
        <p className={s.listerBio}>{listing.poster.bio}</p>
        <div className={s.replyRow}>
          <Translation
            i18nKey="economy:housingListing.repliesUsually"
            values={{ time: listing.poster.responseTime }}
            components={{ b: <b /> }}
          />
        </div>
        <Button variant="primary" className={s.sideFull} onClick={onMessage}>
          {t("economy:housingListing.messageCta", { name: first })}
        </Button>
      </div>

      <div className={s.sideCard}>
        <h4>{t("economy:housingListing.staySafe.title")}</h4>
        <div className={s.safety}>
          <Translation
            i18nKey="economy:housingListing.staySafe.body"
            components={{ b: <b /> }}
          />
        </div>
        <Button
          variant="ghost"
          className={s.reportBtn}
          onClick={onReport}
          aria-label={t("economy:housingListing.reportAriaLabel", {
            title: listing.title,
          })}
        >
          {t("economy:housingListing.report")}
        </Button>
      </div>

      <div className={s.sideCard}>
        <h4>{t("economy:housingListing.moreOnBoard")}</h4>
        <div className={s.more}>
          {similar.map((otherListing) => (
            <Link
              key={otherListing.slug}
              to={`${routes.housing}/${otherListing.slug}`}
              className={s.moreItem}
            >
              <div
                className={s.moreThumb}
                style={{ background: GAL_BG[otherListing.tint] }}
              />
              <div>
                <div className={s.moreName}>{otherListing.title}</div>
                <div className={s.morePrice}>
                  {otherListing.price} / {otherListing.period} ·{" "}
                  {otherListing.hood}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

/**
 * Shown when the listing fetch fails for a reason that ISN'T a genuine 404
 * (network drop, timeout, 5xx). A silent redirect to the board would hide the
 * failure and lose the URL; instead we keep the reader here with a retry.
 */
export function HousingListingError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={s.errorState} role="alert">
      <h1 className={s.errorTitle}>{t("economy:housingListing.error.title")}</h1>
      <p className={s.errorBody}>{t("economy:housingListing.error.body")}</p>
      <Button variant="primary" onClick={onRetry}>
        {t("economy:housingListing.error.retry")}
      </Button>
    </div>
  );
}
