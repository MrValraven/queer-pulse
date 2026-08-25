import { useState } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { HousingListingCard } from "./HousingListingCard";
import {
  getHousingListings,
  type HousingListingId,
} from "./housingShowcase.data";
import styles from "./HousingShowcase.module.css";

/**
 * Owns which of the two example listing cards is "front". The back card peeks
 * out top-right; clicking it swaps the two, matching the prototype's
 * click-to-bring-forward interaction but driven by React state instead of
 * imperative `dataset` mutation.
 */
export function HousingListingStage() {
  const [frontListingId, setFrontListingId] = useState<HousingListingId>("a");
  const { t } = useTranslation();
  const housingListings = getHousingListings(t);

  return (
    <div className={styles.lstStage}>
      {housingListings.map((listing) => (
        <HousingListingCard
          key={listing.id}
          listing={listing}
          position={listing.id === frontListingId ? "front" : "back"}
          onBringToFront={() => setFrontListingId(listing.id)}
        />
      ))}
    </div>
  );
}
