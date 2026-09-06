import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { FiCornerUpRight, FiX } from "react-icons/fi";
import { Card, IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MovedPersonaNavigationState } from "./useMovedPersonaRedirect";
import styles from "./PersonaMovedNote.module.css";

/**
 * The note a visitor sees after being forwarded from a persona handle its owner
 * renamed away from (`useMovedPersonaRedirect`).
 *
 * The forwarding is silent otherwise, and silence here is a safety problem
 * rather than only a confusing one. Someone scanning a months-old card lands on
 * an address they never typed, and with nothing said they will read it as the
 * address that was always printed there. The forwarding also expires with the
 * 30-day reclaim cooldown, so the same card stops working later; a visitor who
 * was told what happened can make sense of that, and can ask for a current
 * link. So it says plainly which handle was followed and where it led, and then
 * gets out of the way: it is dismissible and it never appears on a first-hand
 * visit.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS A SEPARATE COMPONENT FROM `members/ProfileMovedNote`
 * ---------------------------------------------------------------------------
 * Two reasons, and the first is structural. `ProfileMovedNote` names the
 * destination from `useParams().slug`, and the standalone persona route is
 * `/p/:handle`, which has no `slug` param at all: reused there it would render
 * nothing. The second is the copy. That note says a USERNAME changed, and a
 * persona handle is not a username: `/p/:handle` is the one member-adjacent
 * page that deliberately never names the human behind it (the by-handle read
 * strips the owner ref entirely), so borrowing the member's word for the
 * address would miscue the reader on exactly the page built to say less.
 *
 * What it names is safe to name. Both handles it shows belong to the SAME
 * persona: the backend forwards only from a reservation whose previous owner
 * was a persona, to that persona's own current handle. Neither is a member
 * username, and this page carries no owner reference, so the note links one
 * pseudonymous address to another and never a persona to a person.
 *
 * The nested `/members/:slug/:subslug` route forwards on an OWNER rename
 * instead, which really is a username change and really does name a member —
 * `SubprofilePage` renders the member note for that case, unchanged.
 *
 * Renders nothing unless this very navigation carried the forwarding state, so
 * a reload of the destination, a fresh visit, or demo mode all show nothing.
 */
export function PersonaMovedNote() {
  const { t } = useTranslation();
  const locationState = useLocation()
    .state as MovedPersonaNavigationState | null;
  const { handle } = useParams();
  const movedFromHandle = locationState?.movedFromHandle;
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
    if (!region || !movedFromHandle || !handle) return;
    region.textContent = t("subprofiles:page.moved.announcement", {
      oldHandle: movedFromHandle,
      handle,
    });
  }, [movedFromHandle, handle, t]);

  if (!movedFromHandle || !handle || isDismissed) return null;

  return (
    <div className="wrap">
      <Card
        as="aside"
        padding="md"
        className={styles.card}
        aria-label={t("subprofiles:page.moved.ariaLabel")}
      >
        <span className={styles.icon} aria-hidden>
          <FiCornerUpRight />
        </span>
        <p className={styles.body}>
          {t("subprofiles:page.moved.body", {
            oldHandle: movedFromHandle,
            handle,
          })}
        </p>
        <IconButton
          size="sm"
          className={styles.dismiss}
          aria-label={t("subprofiles:page.moved.dismiss")}
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
