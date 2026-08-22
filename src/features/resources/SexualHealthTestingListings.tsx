import { FiMapPin } from "react-icons/fi";
import { Button, EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useResourceListings } from "./api/useResourceListings";
import { contactHrefForListing } from "./api/resources.adapters";
import { CardGrid, ResourceCard, ResourceCardSkeleton } from "./ResourceCard";

/**
 * Live-mode body of the sexual-health testing tab: real published
 * `ResourceListing` rows, or the honest "coming soon" empty state when the
 * admins have not published any yet. The demo-mode mock clinic directory
 * lives in `SexualHealthTestingClinics`.
 */
export function TestingListings({ onSuggest }: { onSuggest: () => void }) {
  const { t } = useTranslation();
  const { listings, isLoading: listingsLoading } = useResourceListings(
    "sexual_health_testing",
  );

  if (listingsLoading) {
    return (
      <CardGrid busy>
        {Array.from({ length: 3 }).map((_, index) => (
          <ResourceCardSkeleton key={index} />
        ))}
      </CardGrid>
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={<FiMapPin />}
        title={t("resources:sexualHealth.testing.live.title")}
        description={t("resources:sexualHealth.testing.live.body")}
        action={{
          label: t("resources:suggest.cta"),
          onClick: onSuggest,
        }}
      />
    );
  }

  return (
    <>
      <CardGrid>
        {listings.map((listing, index) => (
          <ResourceCard
            key={listing.id}
            name={listing.title}
            spec={listing.description}
            tags={listing.region ? [listing.region] : []}
            loc={listing.region ?? ""}
            nameSize={19}
            ctaLabel={t("resources:directory.contactCta")}
            onCta={() => {
              const href = contactHrefForListing(listing);
              if (href) {
                window.open(href, listing.website ? "_blank" : "_self");
              }
            }}
            animation="fade"
            delay={Math.min(index, 8) * 60}
          />
        ))}
      </CardGrid>
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <Button variant="ghost" onClick={onSuggest}>
          {t("resources:suggest.cta")}
        </Button>
      </div>
    </>
  );
}
