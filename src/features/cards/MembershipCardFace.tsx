import { useId, useState } from "react";
import { useMotionPrefs } from "../../app/providers/MotionProvider";
import { useCardGloss } from "./useCardGloss";
import { useCardImagesReady } from "./useCardImagesReady";
import type { CardSkin, MyCardDTO } from "./api/cards.api";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CardBackFace } from "./CardBackFace";
import { CardFaceControls } from "./CardFaceControls";
import { CardFaceSkeleton } from "./CardFaceSkeleton";
import { CardFrontFace } from "./CardFrontFace";
import { backgroundPresetValue } from "./cardBackgrounds.data";
import styles from "./MembershipCardFace.module.css";

// Depends on the CSS module import, so it stays in this file rather than a
// colocated .data.ts (see the repo's decomposition rule).
const SKIN_CLASS: Record<CardSkin, string | undefined> = {
  plum: styles.skinPlum,
  cream: styles.skinCream,
  jade: styles.skinJade,
  coral: styles.skinCoral,
  ink: styles.skinInk,
};

/**
 * One membership card, with both of its sides.
 *
 * The front is the object: the community's flag or photo, its crest, and the
 * holder's name, under a gloss laminate that catches the pointer. The back is
 * the credential: the scannable code and the card's details. A cluster of
 * corner controls turns it over and, where the card sits behind a discreet
 * gate, puts it away again.
 *
 * The card does not assemble itself in front of its holder. Its three images
 * arrive on three independent timelines, and one of them — the ground — is a
 * CSS background that fires no load event at all, so they are preloaded
 * together and a ghost of the card holds its exact footprint until every one
 * of them has decoded (see `useCardImagesReady`).
 *
 * The code is the card's own permanent value and arrives with the card, so
 * nothing is minted while the card is on screen and an issuer reading a
 * member's card sees exactly the code that member shows. A card that is
 * expired, suspended, or revoked shows no code on either side, because there
 * is nothing valid to prove.
 */
export function MembershipCardFace({
  card,
  isActive,
  isPreview = false,
  isIssuerView = false,
  onHide,
}: {
  card: MyCardDTO;
  isActive: boolean;
  /**
   * Designer/preview rendering: no real token is ever minted for a card that
   * does not exist yet, so the code slot would otherwise be an empty hole on
   * the back. Fills it with the real QR geometry (decorative, `aria-hidden`,
   * pointing at a token that verifies as invalid) so the composition an owner
   * is designing is the composition a member gets.
   */
  isPreview?: boolean;
  /**
   * Someone other than the holder, an owner or mod reading the roster, is
   * looking at a REAL card. Every detail is the card's own, the code
   * included: it is a permanent property of the card rather than a live
   * assertion about who is holding the phone. This survives only to name the
   * back face correctly, since "your card" is wrong when a mod is reading
   * someone else's.
   */
  isIssuerView?: boolean;
  /**
   * Puts the card away again, where one is gated (see `DiscreetGate`, which
   * hands its child exactly this). It rides in the card's own corner cluster
   * rather than sitting under the card as a separate button: hiding is an act
   * on the object, the same as turning it over, and the gate's quick-hide is
   * the control a holder reaches for fastest — so it belongs where the thumb
   * already is rather than a row further down the page.
   */
  onHide?: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const flipperId = useId();
  const [isFlipped, setIsFlipped] = useState(false);
  const areImagesReady = useCardImagesReady(card);

  // A card that gets re-covered comes back showing its front. Without this, a
  // holder who hid the card while it was turned over would re-reveal it with
  // the code already facing the room.
  //
  // Adjusted DURING render rather than in an effect (the pattern React
  // documents for "resetting state when a prop changes"): an effect would let
  // the turned-over card paint once before flipping back, which is exactly the
  // frame this is meant to prevent.
  const [wasActive, setWasActive] = useState(isActive);
  if (wasActive !== isActive) {
    setWasActive(isActive);
    if (!isActive) setIsFlipped(false);
  }

  const { shellRef, onPointerMove, onPointerLeave } =
    useCardGloss(reducedMotion);

  // The card's ground: an uploaded photo, else a curated flag, else the flat
  // skin colour. At most one of the two is ever set (the backend clears the
  // other when either is written), so this order is a formality rather than a
  // real precedence question. It dresses the FRONT only — see CardBackFace.
  const ground = card.program.backgroundUrl
    ? `url(${JSON.stringify(card.program.backgroundUrl)}) center / cover no-repeat`
    : backgroundPresetValue(card.program.backgroundPreset);

  const skinClass = SKIN_CLASS[card.program.skin];

  return (
    <div
      ref={shellRef}
      className={styles.shell}
      // How many discs sit in the corner cluster. Both faces reserve room for
      // them in their bottom-right (see `--card-controls-reserve`), and that
      // reservation has to grow when the hide control is there.
      data-controls={onHide ? "2" : "1"}
      aria-busy={!areImagesReady}
      style={{
        // Threads the community's chosen accent token through as a CSS custom
        // property so the card face can actually render it (see
        // MembershipCardFace.module.css's `.accentBar`, and the comment there
        // on why the accent never carries text contrast).
        ["--card-accent" as string]: `var(--${card.program.accentToken})`,
        ...(ground ? { ["--card-ground" as string]: ground } : {}),
      }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerLeave}
    >
      {!areImagesReady ? (
        <CardFaceSkeleton skinClass={skinClass} />
      ) : (
        <>
          <div
            id={flipperId}
            className={styles.flipper}
            data-flipped={isFlipped ? "true" : "false"}
            data-reduced={reducedMotion ? "true" : "false"}
          >
            {/* Both sides stay mounted so the turn has something to reveal, so
                the hidden one is taken out of the accessibility tree AND out of
                tab order — otherwise every card would announce its details twice
                and park focus on a face nobody can see. */}
            <article
              className={[
                styles.face,
                styles.faceFront,
                styles.faceArriving,
                skinClass,
                // Withheld until the images are ready, so a half-loaded flag
                // never paints under the ghost.
                ground && styles.hasGround,
              ]
                .filter(Boolean)
                .join(" ")}
              data-reduced={reducedMotion ? "true" : "false"}
              /* Which legibility treatment the ground carries. Written
                 unconditionally: the CSS only reads it alongside
                 `.hasGround`, since a flat skin needs no treatment. */
              data-backdrop={card.program.textBackdrop}
              aria-label={t("cards:face.ariaLabel", {
                community: card.communityName,
              })}
              aria-hidden={isFlipped}
              inert={isFlipped}
            >
              <CardFrontFace card={card} isPreview={isPreview} />
            </article>

            <article
              className={[styles.face, styles.faceBack, skinClass]
                .filter(Boolean)
                .join(" ")}
              // "your card" is wrong when a mod is reading someone else's.
              aria-label={t(
                isIssuerView
                  ? "cards:face.backAriaLabelIssuer"
                  : "cards:face.backAriaLabel",
                { community: card.communityName },
              )}
              aria-hidden={!isFlipped}
              inert={!isFlipped}
            >
              <CardBackFace card={card} isPreview={isPreview} />
            </article>
          </div>

          {/* Mounted only once the card is real: there is nothing to turn over
              while the ghost is up, and a flip control on a placeholder is an
              affordance that does not work. */}
          <CardFaceControls
            flipperId={flipperId}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped((flipped) => !flipped)}
            onHide={onHide}
          />
        </>
      )}
    </div>
  );
}
