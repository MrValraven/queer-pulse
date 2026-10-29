import { Collapse } from "../../shared/components/ui";
import type { StudioTrackView } from "./api/studio.adapters";
import { isBuyPanelShown } from "./api/studioPurchases.adapters";
import { useStudioOffer } from "./api/useStudioOffer";
import { useLastPresent } from "./StudioOfferState";
import { isSellableReleaseType } from "./studioPurchaseRules";
import { StudioBuyPanelCard } from "./StudioReleaseBuyPanel";
import styles from "./StudioBuyPanel.module.css";

// The tracklist overflow's sheet host lives in its own file; this path
// keeps working for callers that import it from here.
export { StudioTrackBuySheetHost } from "./StudioTrackBuySheetHost";

/** The track page's compact buy card, first in the sidebar. Only tracks of
 *  albums, EPs and singles read an offer; the card folds in once the offer
 *  has something to show and stays out while it loads or fails. */
export function StudioTrackBuyPanel({ track }: { track: StudioTrackView }) {
  const isSellable = isSellableReleaseType(track.release.type);
  const { offer } = useStudioOffer("track", track.id, {
    isEnabled: isSellable,
  });
  const isShown = offer !== null && isBuyPanelShown(offer);
  const shownOffer = useLastPresent(isShown ? offer : null);
  if (!isSellable) return null;
  return (
    <Collapse isOpen={isShown}>
      {shownOffer !== null && (
        <StudioBuyPanelCard
          offer={shownOffer}
          variant="track"
          className={`${styles.panel} ${styles.trackCard}`}
        />
      )}
    </Collapse>
  );
}
