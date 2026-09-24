import { useState } from "react";
import { Button } from "../../../../shared/components/ui";
import { usePrefersReducedMotion } from "../../../../shared/hooks/usePrefersReducedMotion";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ListingDeleteFlow } from "../delete/ListingDeleteFlow";
import { LISTING_EDITOR_SECTION_BY_KEY } from "./listingEditor.data";
import { jumpToEditorSection } from "./jumpToEditorSection";
import styles from "./ListingEditor.module.css";

/**
 * The owner's Danger zone, the editor's last block: the one place in the
 * editor a listing can be deleted from.
 *
 * The button only opens `ListingDeleteFlow`, the same heavy confirmation the
 * profile's places grid and the moderation queue use. Its two gentler exits,
 * hide it or mark it closed, both live in this editor's trading and
 * visibility section, so each one brings the owner up to it on this same
 * page.
 *
 * Owner-only by construction: `ListingEditorSections` renders this for the
 * owner alone, and the backend refuses anybody else's delete.
 */
export function ListingDangerZoneSection({
  listingName,
  onConfirmDelete,
}: {
  listingName: string;
  /** Resolves once the server has deleted the listing, rejects on failure. */
  onConfirmDelete: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isFlowOpen, setIsFlowOpen] = useState(false);

  // The flow closes itself first, and a closing dialog releases its scroll
  // lock and hands focus back to the button that opened it. Jumping in the
  // same tick would scroll a page that is still pinned in place, so the jump
  // waits one task for the dialog to be gone.
  const jumpToTrading = () => {
    window.setTimeout(
      () =>
        jumpToEditorSection(
          LISTING_EDITOR_SECTION_BY_KEY.trading.id,
          prefersReducedMotion,
        ),
      0,
    );
  };

  return (
    <>
      <div className={styles.dangerZone}>
        <p className={styles.dangerCopy}>
          {t("marketing:listBusiness.editor.dangerZone.body")}
        </p>
        <Button variant="danger" onClick={() => setIsFlowOpen(true)}>
          {t("marketing:listBusiness.editor.dangerZone.deleteCta")}
        </Button>
      </div>

      {isFlowOpen && (
        <ListingDeleteFlow
          listingName={listingName}
          variant="owner"
          onConfirmDelete={() => onConfirmDelete()}
          onClose={() => setIsFlowOpen(false)}
          gentlerOptions={{
            onHideInstead: jumpToTrading,
            onMarkClosedInstead: jumpToTrading,
          }}
        />
      )}
    </>
  );
}
