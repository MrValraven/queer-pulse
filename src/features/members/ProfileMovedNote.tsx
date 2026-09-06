import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { FiCornerUpRight, FiX } from "react-icons/fi";
import { Card, IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MovedHandleNavigationState } from "./useMovedHandleRedirect";
import styles from "./ProfileMovedNote.module.css";

/**
 * The note a member sees after being forwarded from a username its owner
 * renamed away from (`useMovedHandleRedirect`).
 *
 * The forwarding is silent otherwise, and silence here is a safety problem, not
 * only a confusing one. Someone scanning a months-old membership card lands on
 * an address they never typed, and with nothing said they will read it as the
 * address that was always printed there. The forwarding also expires with the
 * 30-day reclaim cooldown, so the same card stops working later; a member who
 * was told what happened can make sense of that, and can ask the person for a
 * current link. So it says plainly which username was followed and where it
 * led, and then gets out of the way: it is dismissible, it names nothing the
 * profile below does not already say, and it never appears on a first-hand
 * visit.
 *
 * Renders nothing unless this very navigation carried the forwarding state, so
 * a reload of the destination, a fresh visit, or demo mode all show nothing.
 */
export function ProfileMovedNote() {
  const { t } = useTranslation();
  const locationState = useLocation()
    .state as MovedHandleNavigationState | null;
  const { slug } = useParams();
  const movedFromSlug = locationState?.movedFromSlug;
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
    if (!region || !movedFromSlug || !slug) return;
    region.textContent = t("members:profile.moved.announcement", {
      oldSlug: movedFromSlug,
      slug,
    });
  }, [movedFromSlug, slug, t]);

  if (!movedFromSlug || !slug || isDismissed) return null;

  return (
    <div className="wrap">
      <Card
        as="aside"
        padding="md"
        className={styles.card}
        aria-label={t("members:profile.moved.ariaLabel")}
      >
        <span className={styles.icon} aria-hidden>
          <FiCornerUpRight />
        </span>
        <p className={styles.body}>
          {t("members:profile.moved.body", { oldSlug: movedFromSlug, slug })}
        </p>
        <IconButton
          size="sm"
          className={styles.dismiss}
          aria-label={t("members:profile.moved.dismiss")}
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
