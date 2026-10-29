import { useEffect, useRef, useState } from "react";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioOfferView } from "./api/studioPurchases.adapters";
import { StudioBuySheet } from "./StudioBuySheet";
import { StudioOfferState } from "./StudioOfferState";
import studioStyles from "./studio.module.css";
import styles from "./StudioBuyPanel.module.css";

interface Announcement {
  line: string;
  /** Counts every announcement, so the same line twice still moves focus. */
  serial: number;
}

/** The buy card both panels share: the format line as its heading, the
 *  offer's state block, the buy sheet while it is open and a status region.
 *  After "I've paid" the sheet plays its exit, the region says who confirms
 *  the payment and focus lands on the heading, since the Buy button has
 *  folded away into the pending state. */
export function StudioBuyPanelCard({
  offer,
  variant,
  className,
}: {
  offer: StudioOfferView;
  variant: "release" | "track";
  className: string;
}) {
  const { t } = useTranslation();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const buyButtonRef = useRef<HTMLButtonElement>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  // Runs after a closing dialog has handed focus back to its opener.
  useEffect(() => {
    if (announcement !== null) headingRef.current?.focus();
  }, [announcement]);
  const announce = (line: string) =>
    setAnnouncement((previous) => ({
      line,
      serial: (previous?.serial ?? 0) + 1,
    }));
  return (
    <section
      className={className}
      aria-label={t("studio:purchase.panel.label", { title: offer.item.title })}
    >
      <h2 ref={headingRef} tabIndex={-1} className={styles.eyebrow}>
        {t(offer.item.formatLabelKey)}
      </h2>
      <StudioOfferState
        offer={offer}
        variant={variant}
        onBuy={() => setIsSheetOpen(true)}
        buyButtonRef={buyButtonRef}
        onAnnounce={announce}
      />
      <div role="status" className={styles.status}>
        <Collapse isOpen={announcement !== null}>
          <p className={styles.statusLine}>{announcement?.line}</p>
        </Collapse>
      </div>
      {isSheetOpen && (
        <StudioBuySheet
          offer={offer}
          onClose={() => setIsSheetOpen(false)}
          onPurchased={(purchase) => {
            setIsSheetOpen(false);
            announce(
              t("studio:purchase.sheet.doneStatus", {
                artist: purchase.artist.name,
              }),
            );
          }}
        />
      )}
    </section>
  );
}

/** The release page's buy panel, in the side column above the support card.
 *  The page reads the offer and mounts this when the panel has something
 *  to show. */
export function StudioReleaseBuyPanel({ offer }: { offer: StudioOfferView }) {
  return (
    <StudioBuyPanelCard
      offer={offer}
      variant="release"
      className={`${studioStyles.sideCard} ${styles.panel}`}
    />
  );
}
