import { useMemo, useState } from "react";
import { Reveal, SubpageIndex } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HOUSING_LISTINGS as LISTINGS } from "./housingListings";
import { FILTERS, HOUSING_SUBPAGES } from "./housing.data";
import { HousingListingGrid } from "./HousingListingGrid";
import { HousingLandlords, HousingTips } from "./HousingSections";
import { ListSpaceModal } from "./ListSpaceModal";
import styles from "./HousingPage.module.css";

export function HousingBoard() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const loading = useSimulatedLoad();
  const [filter, setFilter] = useState("all");
  const [listing, setListing] = useState(false);
  const subpages = useMemo(
    () =>
      HOUSING_SUBPAGES.map((subpage) => ({
        to: subpage.to,
        label: t(subpage.labelKey),
        blurb: t(subpage.blurbKey),
      })),
    [t],
  );
  // The housing board has no live backend yet, so real listings/endorsements
  // only exist in demo mode ("Populate platform"). Live mode shows the empty
  // board rather than mock members' spaces.
  const source = demoMode ? LISTINGS : [];
  // With nothing on the board, the type filters have nothing to act on — hide
  // them and let the empty state carry the single call to action.
  const boardEmpty = source.length === 0;
  const visible = useMemo(
    () => (filter === "all" ? source : source.filter((l) => l.type === filter)),
    [filter, source],
  );

  return (
    <>
      <div className={styles.body}>
        <div className="wrap">
          {!boardEmpty && (
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
                    {t(f.labelKey)}
                  </button>
                ))}
              </Reveal>
              <Reveal
                as="button"
                className={styles.listBtn}
                delay={60}
                onClick={() => setListing(true)}
              >
                {t("economy:housing.listSpaceCta")}
              </Reveal>
            </div>
          )}
          <HousingListingGrid
            loading={loading}
            visible={visible}
            filtered={filter !== "all"}
            onClearFilter={() => setFilter("all")}
            onListSpace={() => setListing(true)}
          />
        </div>
      </div>

      {demoMode && <HousingLandlords />}

      <HousingTips />

      {listing && <ListSpaceModal onClose={() => setListing(false)} />}

      <SubpageIndex
        eyebrow={t("economy:housing.subpages.eyebrow")}
        title={t("economy:housing.subpages.title")}
        items={subpages}
      />
    </>
  );
}
