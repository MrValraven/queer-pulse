// src/features/messages/InboundSafetyCaution.tsx
import { FiShield } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./InboundSafetyCaution.module.css";

/**
 * A small, calm caution shown under an INBOUND text bubble when it trips an
 * off-platform-push, external-payment or banking signal (PRD-367's
 * recipient-side half of the same advisory `ComposerSafetyNotice` already
 * shows the sender while typing — see `contactSafetyDetector.ts`). Never
 * rendered on the viewer's OWN outgoing bubbles: `TextBubble` in
 * `MessageBubbleBody` gates on `isSent` before ever mounting this. One
 * generic message regardless of which signal(s) tripped, matching
 * `ComposerSafetyNotice`'s own reasoning for staying non-specific.
 *
 * Purely presentational and stateless — no dismissal, unlike the composer's
 * notice: this reads a message someone already sent, not a live draft, so
 * there is nothing to keep re-showing across a re-render to dismiss. It sits
 * inside the bubble's own flow (not floated/absolute), so a virtualized row's
 * `measureElementRef` picks up the height it adds like any other content —
 * see `MessageAreaRow`'s ref, which measures the whole row after every
 * render, prepend or resize.
 */
export function InboundSafetyCaution() {
  const { t } = useTranslation();
  return (
    <div className={styles.caution} role="note">
      <FiShield aria-hidden />
      <span>{t("messages:safety.inboundCaution")}</span>
    </div>
  );
}
