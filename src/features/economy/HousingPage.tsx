import { useMemo, useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { Reveal, SubpageIndex } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { HOUSING_LISTINGS as LISTINGS } from "./housingListings";
import { FILTERS, HOUSING_SUBPAGES } from "./housing.data";
import { HousingListingGrid } from "./HousingListingGrid";
import { HousingLandlords, HousingTips } from "./HousingSections";
import { ListSpaceModal } from "./ListSpaceModal";
import styles from "./HousingPage.module.css";

export function HousingPage() {
  const loading = useSimulatedLoad();
  const [filter, setFilter] = useState("all");
  const [listing, setListing] = useState(false);
  const visible = useMemo(
    () =>
      filter === "all" ? LISTINGS : LISTINGS.filter((l) => l.type === filter),
    [filter],
  );

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            Housing Board
          </Reveal>
          <Reveal as="h1" delay={60}>
            Find a home among <em>people you can trust.</em>
          </Reveal>
          <Reveal as="p" delay={120}>
            A queer-specific housing board for Lisbon. Sublets, room shares,
            short-term stays, and landlord recommendations — all within the
            community network.
          </Reveal>
          <Reveal className={styles.note} delay={160}>
            <span className={styles.noteDot} />
            Every listing is posted by a verified QueerPulse member
          </Reveal>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.top}>
            <Reveal as="div" className={styles.filters}>
              {FILTERS.map((f) => (
                <button
                  type="button"
                  key={f.value}
                  className={[
                    styles.chip,
                    filter === f.value && styles.chipActive,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </Reveal>
            <Reveal
              as="button"
              className={styles.listBtn}
              delay={60}
              onClick={() => setListing(true)}
            >
              + List your space
            </Reveal>
          </div>
          <HousingListingGrid
            loading={loading}
            visible={visible}
            onClearFilter={() => setFilter("all")}
          />
        </div>
      </div>

      <HousingLandlords />

      <HousingTips />

      {listing && <ListSpaceModal onClose={() => setListing(false)} />}

      <SubpageIndex
        eyebrow="Housing"
        title="More on housing"
        items={HOUSING_SUBPAGES}
      />
    </PageShell>
  );
}
