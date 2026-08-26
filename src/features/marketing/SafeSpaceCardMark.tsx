import { FiPauseCircle, FiShield } from "react-icons/fi";
import { Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  safeSpaceCardBadgeOf,
  type DirectoryPlace,
  type SafeSpaceCardBadgeState,
} from "./directoryPlaces";
import styles from "./SafeSpaceCardMark.module.css";

/** The words each card state says, in its tooltip and its accessible name. */
const LABEL_KEYS: Record<SafeSpaceCardBadgeState, string> = {
  verified: "marketing:directory.card.verifiedBadge",
  due: "marketing:directory.card.safeSpaceDueBadge",
  paused: "marketing:directory.card.safeSpacePausedBadge",
};

/**
 * The safe-space mark in a directory card's photo corner, rendered from the
 * card payload alone.
 *
 * Three states, and the whole point of the component is that they can never
 * collapse into one:
 *
 * - **verified** — the badge stands. Jade shield, as before.
 * - **due** — the badge stands AND is past its yearly check. A badge due for
 *   re-review is STILL VALID, so it keeps the identical mark and only the
 *   wording carries the age of the claim. Dimming it would tell a member the
 *   place had lost something it has not lost.
 * - **paused** — the platform has put the badge on hold while a review runs.
 *   The mark changes outright, because "verified" has stopped being true.
 *
 * The paused wording is a statement about the BADGE, never about the venue:
 * this is a real business on a real street, and a card in a public grid is the
 * last place to imply a finding nobody has made yet. It also carries no flag
 * count and names no one, for the same reason the badge-state endpoint refuses
 * to publish a tally: a public count would turn a safety mechanism into a
 * pillory and make flagging unsafe for the person who did it.
 *
 * Renders nothing for a place with no badge to speak of (never reviewed, or
 * removed).
 */
export function SafeSpaceCardMark({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const badgeState = safeSpaceCardBadgeOf(place);
  if (badgeState === null) return null;

  const label = t(LABEL_KEYS[badgeState]);
  const isPaused = badgeState === "paused";
  const Icon = isPaused ? FiPauseCircle : FiShield;

  return (
    <Tooltip label={label} placement="top">
      {/* Not a button: the whole card is already one link, and this only ever
          names itself. `role="img"` + the label is what a screen reader
          announces; the tooltip bubble is decorative. */}
      <span
        className={`${styles.mark} ${isPaused ? styles.paused : ""}`}
        role="img"
        aria-label={label}
      >
        <Icon aria-hidden />
      </span>
    </Tooltip>
  );
}
