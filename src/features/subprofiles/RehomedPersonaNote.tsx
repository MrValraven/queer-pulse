import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiCornerUpRight, FiX } from "react-icons/fi";
import { Card, IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RehomedPersonaNavigationState } from "./useMovedPersonaRedirect";
import styles from "./PersonaMovedNote.module.css";

/**
 * The note a visitor sees after being forwarded from a nested persona address
 * whose creator role transferred to another member
 * (`useRehomedPersonaRedirect`).
 *
 * Modelled directly on `PersonaMovedNote` (same reasoning applies: a scanned
 * months-old card or pasted link that goes quiet on the visitor reads as
 * still-correct, when it is not). It shares that component's CSS module
 * rather than duplicating it, since the two render the identical row shape.
 *
 * Deliberately says only that the address changed, and never the owner slug
 * on either end of the move. `PersonaMovedNote` can safely name both handles
 * it shows because a persona handle is pseudonymous and belongs to the SAME
 * persona on both sides. An owner slug is a member's own username, and the
 * old one named here would be the persona's PREVIOUS creator, a member who
 * left the persona (or was erased) and has nothing to do with it any more:
 * naming them would out them as a former co-owner of a persona they no
 * longer have any connection to, on a page they may never see. So this note
 * carries no handle interpolation at all, unlike the two notes it sits
 * beside.
 *
 * Renders nothing unless this very navigation carried the forwarding state,
 * so a reload of the destination, a fresh visit, or demo mode all show
 * nothing.
 */
export function RehomedPersonaNote() {
  const { t } = useTranslation();
  const locationState = useLocation()
    .state as RehomedPersonaNavigationState | null;
  const rehomedFromOwnerSlug = locationState?.rehomedFromOwnerSlug;
  const rehomedFromSlug = locationState?.rehomedFromSlug;
  const [isDismissed, setIsDismissed] = useState(false);
  const announcementRef = useRef<HTMLParagraphElement>(null);

  // The live region renders empty and is filled from here, one commit later. A
  // screen reader only announces a CHANGE inside a region it was already
  // watching, so text present in the region's first render is read by nothing.
  // Written to the DOM rather than held in state: this is the effect telling an
  // external system (the accessibility tree) about a navigation that already
  // happened, and re-rendering for it would buy nothing.
  useEffect(() => {
    const region = announcementRef.current;
    if (!region || !rehomedFromOwnerSlug || !rehomedFromSlug) return;
    region.textContent = t("subprofiles:page.rehomed.announcement");
  }, [rehomedFromOwnerSlug, rehomedFromSlug, t]);

  if (!rehomedFromOwnerSlug || !rehomedFromSlug || isDismissed) return null;

  return (
    <div className="wrap">
      <Card
        as="aside"
        padding="md"
        className={styles.card}
        aria-label={t("subprofiles:page.rehomed.ariaLabel")}
      >
        <span className={styles.icon} aria-hidden>
          <FiCornerUpRight />
        </span>
        <p className={styles.body}>{t("subprofiles:page.rehomed.body")}</p>
        <IconButton
          size="sm"
          className={styles.dismiss}
          aria-label={t("subprofiles:page.rehomed.dismiss")}
          onClick={() => setIsDismissed(true)}
        >
          <FiX aria-hidden />
        </IconButton>
      </Card>
      <p
        ref={announcementRef}
        className="visuallyHidden"
        role="status"
        aria-live="polite"
      />
    </div>
  );
}
