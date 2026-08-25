import { useState, type KeyboardEvent } from "react";
import { FiArrowRight } from "react-icons/fi";
import { usePrefersReducedMotion } from "../../../shared/hooks/usePrefersReducedMotion";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { HousingRoomPanel } from "./HousingRoomPanel";
import { HousingLandlordPanel } from "./HousingLandlordPanel";
import type { HousingListing, HousingTabKey } from "./housingShowcase.data";
import styles from "./HousingShowcase.module.css";

interface HousingListingCardProps {
  listing: HousingListing;
  position: "front" | "back";
  /** Bring this card to front. Only wired up while it's the back card. */
  onBringToFront: () => void;
}

/**
 * One listing card in the housing showcase stack. The front card is fully
 * interactive (tab switch, foot links); the back card is a dimmed, rotated
 * peek that only exists to be clicked/activated to swap to front, so its
 * inner tabs and links render as inert text (no nested interactive controls
 * under the card's own button role).
 */
export function HousingListingCard({
  listing,
  position,
  onBringToFront,
}: HousingListingCardProps) {
  const [activeTab, setActiveTab] = useState<HousingTabKey>("room");
  const prefersReducedMotion = usePrefersReducedMotion();
  const { t } = useTranslation();
  const isFront = position === "front";

  const TABS: Array<{ key: HousingTabKey; label: string }> = [
    { key: "room", label: t("homepage:housing.tabRoom") },
    { key: "landlord", label: t("homepage:housing.tabLandlord") },
  ];

  const handleBackKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isFront) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onBringToFront();
    }
  };

  return (
    <div
      className={styles.lst}
      data-position={position}
      onClick={isFront ? undefined : onBringToFront}
      onKeyDown={isFront ? undefined : handleBackKeyDown}
      role={isFront ? undefined : "button"}
      tabIndex={isFront ? undefined : 0}
      aria-label={
        isFront
          ? undefined
          : t("homepage:housing.bringToFrontAria", { label: listing.peekLabel })
      }
    >
      <div className={styles.lstIn}>
        <div className={styles.lstTabs}>
          {TABS.map((tab) =>
            isFront ? (
              <button
                key={tab.key}
                type="button"
                className={[styles.lt, activeTab === tab.key && styles.on]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ) : (
              <span
                key={tab.key}
                className={[styles.lt, activeTab === tab.key && styles.on]
                  .filter(Boolean)
                  .join(" ")}
              >
                {tab.label}
              </span>
            ),
          )}
          <span className={styles.lstNote}>
            <span className={styles.dot} aria-hidden />{" "}
            {t("homepage:housing.postedByMember")}
          </span>
        </div>
        <div
          key={activeTab}
          className={prefersReducedMotion ? undefined : styles.panelIn}
        >
          {activeTab === "room" ? (
            <HousingRoomPanel room={listing.room} />
          ) : (
            <HousingLandlordPanel
              landlord={listing.landlord}
              interactive={isFront}
            />
          )}
        </div>
      </div>
      <div className={styles.lstPeek}>
        {listing.peekLabel} <FiArrowRight aria-hidden />
      </div>
    </div>
  );
}
