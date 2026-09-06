import { FiMapPin } from "react-icons/fi";
import { Button, EmptyState, LoadErrorState } from "../../shared/components/ui";
import { useAuth } from "../../app/providers/authContext";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useResourceListings } from "./api/useResourceListings";
import { contactHrefForListing } from "./api/resources.adapters";
import { CardGrid, ResourceCard, ResourceCardSkeleton } from "./ResourceCard";

/**
 * Live-mode body of the sexual-health testing tab: real published
 * `ResourceListing` rows, or the honest "coming soon" empty state when the
 * admins have not published any yet. The demo-mode mock clinic directory
 * lives in `SexualHealthTestingClinics`.
 *
 * Three states, told apart on purpose (DES-24). Loading is skeletons. A
 * failed request is `LoadErrorState`, which says the directory did not load
 * and offers a retry. Only a request that came back with zero rows gets the
 * "coming soon" copy. Before this split, a failed fetch told someone looking
 * for HIV or STI testing that the clinic directory did not exist yet.
 *
 * The read itself is public (PRD-260) so nobody has to sign up before finding
 * a testing clinic. Suggesting one is a member-only write, so that affordance
 * is hidden for a signed-out visitor rather than shown and then answered with
 * a 401.
 */
export function TestingListings({ onSuggest }: { onSuggest: () => void }) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const canSuggestResource = loggedIn;
  const {
    listings,
    isLoading: isLoadingListings,
    isError: hasListingsError,
    refetch: refetchListings,
  } = useResourceListings("sexual_health_testing");

  if (isLoadingListings) {
    return (
      <CardGrid busy>
        {Array.from({ length: 3 }).map((_, index) => (
          <ResourceCardSkeleton key={index} />
        ))}
      </CardGrid>
    );
  }

  if (hasListingsError && listings.length === 0) {
    return (
      <LoadErrorState
        onRetry={refetchListings}
        title={
          <Translation
            i18nKey="resources:sexualHealth.testing.loadError.title"
            components={{ em: <em /> }}
          />
        }
        description={t("resources:sexualHealth.testing.loadError.body")}
      />
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={<FiMapPin />}
        title={t("resources:sexualHealth.testing.live.title")}
        description={t("resources:sexualHealth.testing.live.body")}
        action={
          canSuggestResource
            ? {
                label: t("resources:suggest.cta"),
                onClick: onSuggest,
              }
            : undefined
        }
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
      {canSuggestResource && (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Button variant="ghost" onClick={onSuggest}>
            {t("resources:suggest.cta")}
          </Button>
        </div>
      )}
    </>
  );
}
