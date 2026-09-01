import { useState } from "react";
import { FiBriefcase } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  Button,
  EmptyState,
  LoadErrorState,
  Reveal,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { CardGrid, ResourceCard, ResourceCardSkeleton } from "./ResourceCard";
import { useResourceListings } from "./api/useResourceListings";
import { contactHrefForListing } from "./api/resources.adapters";
import { SuggestResourceModal } from "./SuggestResourceModal";
import { LAWYERS } from "./legal.data";
import styles from "./resources.module.css";

/**
 * `#lawyers` — the legal-aid directory section of `LegalPage`. It owns the
 * listing fetch and the suggest-a-resource modal state, since nothing else on
 * the page reads them.
 */
export function LegalLawyersSection() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const navigate = useNavigate();
  const loading = useSimulatedLoad();
  const {
    listings,
    isLoading: isLoadingListings,
    isError: hasListingsError,
    refetch: refetchListings,
  } = useResourceListings("legal_aid");
  const [suggestOpen, setSuggestOpen] = useState(false);
  return (
    <section
      className={`${styles.section} ${styles.sectionCream}`}
      id="lawyers"
      style={{ borderBottom: "none" }}
    >
      <div className="wrap">
        <Reveal as="h2">
          <Translation
            i18nKey="resources:legal.lawyers.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" className={styles.leadP}>
          {t("resources:legal.lawyers.lead")}
        </Reveal>
        {/* Three live states kept apart (DES-24): skeletons while the
            directory loads, `LoadErrorState` when the request fails, and
            the "coming soon" copy only for a request that came back with
            nothing in it. */}
        {!demoMode ? (
          isLoadingListings ? (
            <CardGrid busy>
              {Array.from({ length: 3 }).map((_, index) => (
                <ResourceCardSkeleton key={index} />
              ))}
            </CardGrid>
          ) : hasListingsError && listings.length === 0 ? (
            <LoadErrorState
              onRetry={refetchListings}
              title={
                <Translation
                  i18nKey="resources:legal.lawyers.loadError.title"
                  components={{ em: <em /> }}
                />
              }
              description={t("resources:legal.lawyers.loadError.body")}
            />
          ) : listings.length > 0 ? (
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
                <Button variant="ghost" onClick={() => setSuggestOpen(true)}>
                  {t("resources:suggest.cta")}
                </Button>
              </div>
            </>
          ) : (
            <EmptyState
              icon={<FiBriefcase />}
              title={t("resources:legal.lawyers.live.title")}
              description={t("resources:legal.lawyers.live.body")}
              action={{
                label: t("resources:suggest.cta"),
                onClick: () => setSuggestOpen(true),
              }}
            />
          )
        ) : (
          <CardGrid busy={loading}>
            {loading
              ? Array.from({ length: LAWYERS.length }).map((_, index) => (
                  <ResourceCardSkeleton key={index} />
                ))
              : LAWYERS.map((lawyer, index) => (
                  <ResourceCard
                    key={lawyer.name}
                    name={lawyer.name}
                    spec={lawyer.spec}
                    tags={lawyer.tags}
                    loc={lawyer.loc}
                    nameSize={19}
                    ctaLabel={t(
                      "resources:legal.lawyers.requestConsultationCta",
                    )}
                    // `navigate` returns a promise in react-router v7 and
                    // `onCta` is a void callback; nothing awaits the
                    // transition, so discard it explicitly.
                    onCta={() => {
                      void navigate(routes.contact);
                    }}
                    animation="fade"
                    delay={Math.min(index, 8) * 60}
                  />
                ))}
          </CardGrid>
        )}
        {suggestOpen && (
          <SuggestResourceModal
            category="legal_aid"
            onClose={() => setSuggestOpen(false)}
          />
        )}
      </div>
    </section>
  );
}
