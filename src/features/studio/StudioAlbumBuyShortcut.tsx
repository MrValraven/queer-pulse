import type { RefObject } from "react";
import { FiShoppingBag } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioOfferView } from "./api/studioPurchases.adapters";
import { useLastPresent } from "./StudioOfferState";
import { buyLabelKeyOf, offerPanelStateOf } from "./studioPurchaseRules";
import styles from "./studio.module.css";

/** The offer the shortcut points to: one whose panel shows a Buy button. */
function buyableOfferOf(offer: StudioOfferView | null): StudioOfferView | null {
  if (offer === null || offer.price === null) return null;
  return offerPanelStateOf(offer.viewer) === "can_buy" ? offer : null;
}

/**
 * Phones stack the side column under the tracklist, so the Buy panel can sit
 * far down the page. Under the hero, at phone widths only, this button
 * scrolls to the panel and moves focus to its heading. It folds in once the
 * offer shows a Buy button.
 */
export function StudioAlbumBuyShortcut({
  offer,
  panelRef,
}: {
  offer: StudioOfferView | null;
  panelRef: RefObject<HTMLDivElement | null>;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const buyableOffer = buyableOfferOf(offer);
  const shownOffer = useLastPresent(buyableOffer);
  function goToPanel() {
    const panel = panelRef.current;
    panel?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
    panel?.querySelector("h2")?.focus({ preventScroll: true });
  }
  return (
    <div className={styles.buyShortcut}>
      <Collapse isOpen={buyableOffer !== null}>
        {shownOffer !== null && (
          <div className={styles.buyShortcutRow}>
            <Button variant="ghost" size="sm" onClick={goToPanel}>
              <FiShoppingBag aria-hidden />
              {t(buyLabelKeyOf(shownOffer.item))}
            </Button>
          </div>
        )}
      </Collapse>
    </div>
  );
}
