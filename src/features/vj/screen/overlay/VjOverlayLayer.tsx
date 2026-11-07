import type { JSX } from "react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import type {
  VjCountdown,
  VjEventCard,
  VjEventCardDTO,
  VjLogo,
  VjOverlay,
} from "../../../../shared/contracts/vj";
import { cx } from "../../../../shared/lib/cx";
import type { VjClockReader } from "../../engine/vjEngineLook";
import { VjCountdownTimer } from "./VjCountdown";
import { VjEventCardPanel } from "./VjEventCardPanel";
import { VjLogoMark } from "./VjLogoMark";
import { VjOverlayLine, type VjBesideCard } from "./VjOverlayLine";
import { VJ_OVERLAY_FADE_SECONDS } from "./vjOverlayStyle";
import styles from "./VjOverlay.module.css";

export interface VjOverlayLayerProps {
  overlay: VjOverlay;
  countdown: VjCountdown;
  logo: VjLogo;
  eventCard: VjEventCard;
  eventCardData: VjEventCardDTO | null;
  clock: VjClockReader;
  size: "screen" | "mirror";
}

/**
 * The crisp DOM layer over the stage, bottom to top: the overlay line, the
 * countdown, the event card and the logo. It fills its positioned parent and
 * sizes everything from that box (a size container), so the projector and
 * the remote's mirror (size "mirror") draw the same layout at their own scale.
 *
 * The projector keeps every fade and loop at full timing whatever the
 * laptop's reduced-motion setting, because they are the show; the mirror
 * follows the setting. Pointer events pass through; on the projector the
 * layer is hidden from assistive tech.
 */
export function VjOverlayLayer({
  overlay,
  countdown,
  logo,
  eventCard,
  eventCardData,
  clock,
  size,
}: VjOverlayLayerProps): JSX.Element {
  const { reducedMotion } = useMotionPrefs();
  const isMirror = size === "mirror";
  const isStill = isMirror && reducedMotion;
  const fadeSeconds = isStill ? 0 : VJ_OVERLAY_FADE_SECONDS;
  const isLineAtTop = overlay.isVisible && overlay.position === "top";
  const isLogoBottomLeft = logo.isVisible && logo.corner === "bottomLeft";
  const cardSide = isLogoBottomLeft ? "right" : "left";
  const isLineAtBottom = overlay.isVisible && overlay.position === "bottom";
  // A bottom line shares the bottom edge with the card and a bottom-corner
  // logo, so it keeps their sides clear. A top line moves the countdown to
  // that same bottom edge, where it keeps the same clearance.
  const besideCard: VjBesideCard | null =
    eventCard.isVisible && eventCardData !== null
      ? { side: cardSide, kind: eventCard.kind }
      : null;
  const bottomLogoSide = !logo.isVisible
    ? null
    : logo.corner === "bottomLeft"
      ? "left"
      : logo.corner === "bottomRight"
        ? "right"
        : null;
  return (
    <div
      className={cx(
        styles.layer,
        isMirror ? styles.layerMirror : styles.layerScreen,
      )}
      data-vj-overlay=""
      data-vj-overlay-layer={size}
      aria-hidden={isMirror ? undefined : true}
    >
      <VjOverlayLine
        overlay={overlay}
        clock={clock}
        isMirror={isMirror}
        isStatic={isStill}
        fadeSeconds={fadeSeconds}
        besideCard={isLineAtBottom ? besideCard : null}
        besideLogo={isLineAtBottom ? bottomLogoSide : null}
      />
      <VjCountdownTimer
        countdown={countdown}
        clock={clock}
        placement={isLineAtTop ? "bottom" : "top"}
        fadeSeconds={fadeSeconds}
        besideCard={isLineAtTop ? besideCard : null}
        besideLogo={isLineAtTop ? bottomLogoSide : null}
      />
      <VjEventCardPanel
        eventCard={eventCard}
        eventCardData={eventCardData}
        side={cardSide}
        fadeSeconds={fadeSeconds}
      />
      <VjLogoMark logo={logo} fadeSeconds={fadeSeconds} />
    </div>
  );
}
