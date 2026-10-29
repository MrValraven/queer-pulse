import { useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { Collapse, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLoadState } from "./api/studioLoadState";
import type { StudioBuyerPurchaseView } from "./api/studioPurchases.adapters";
import { useStudioOffer } from "./api/useStudioOffer";
import { StudioBuySheet } from "./StudioBuySheet";
import { studioErrorMessageKey } from "./studioErrors.data";
import { StudioLoadError } from "./StudioLoadStates";
import styles from "./StudioBuyPanel.module.css";

/** The small dialog while the track's offer loads, or the failure named:
 *  a load error with Retry, or the not-found line with none. */
function StudioTrackSheetWaiting({
  loadState,
  onClose,
}: {
  loadState: StudioLoadState;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isGone =
    loadState.isNotFound ||
    loadState.isWithdrawn ||
    Boolean(loadState.isTrackWithheld);
  return (
    <Modal
      title={t("studio:purchase.panel.buy.track")}
      onClose={onClose}
      isStudioPlayerSurface
    >
      <div role="status">
        <Collapse isOpen={loadState.isLoading}>
          <p className={styles.loadingLine}>
            {t("studio:purchase.sheet.loading")}
          </p>
        </Collapse>
      </div>
      <Collapse isOpen={loadState.isError}>
        <StudioLoadError
          loadState={loadState}
          what="studio:errors.what.offer"
        />
      </Collapse>
      <Collapse isOpen={isGone}>
        <p role="alert" className={styles.refusal}>
          {t(studioErrorMessageKey("studio_purchase_item_not_found"))}
        </p>
      </Collapse>
    </Modal>
  );
}

/** Reads one track's offer and shows its sheet; used by the tracklist
 *  overflow. A small dialog holds the wait (or the failure, named) and
 *  plays its exit before the sheet comes in. */
export function StudioTrackBuySheetHost({
  trackId,
  onClose,
  onPurchased,
}: {
  trackId: string;
  onClose: () => void;
  onPurchased: (purchase: StudioBuyerPurchaseView) => void;
}) {
  const { offer, loadState } = useStudioOffer("track", trackId, {
    isEnabled: true,
  });
  const [isDismissed, setIsDismissed] = useState(false);
  let shownDialog: ReactNode = null;
  if (!isDismissed && offer !== null) {
    shownDialog = (
      <StudioBuySheet
        key="sheet"
        offer={offer}
        onClose={onClose}
        onPurchased={onPurchased}
      />
    );
  } else if (!isDismissed) {
    shownDialog = (
      <StudioTrackSheetWaiting
        key="loading"
        loadState={loadState}
        onClose={() => setIsDismissed(true)}
      />
    );
  }
  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        if (isDismissed) onClose();
      }}
    >
      {shownDialog}
    </AnimatePresence>
  );
}
