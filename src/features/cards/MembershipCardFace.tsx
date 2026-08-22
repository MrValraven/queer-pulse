import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { FiRefreshCw } from "react-icons/fi";
import { IconButton } from "../../shared/components/ui";
import { useMotionPrefs } from "../../app/providers/MotionProvider";
import { useCardToken } from "./api/useCardToken";
import type { CardSkin, MyCardDTO } from "./api/cards.api";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CardBackFace } from "./CardBackFace";
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
 * the credential: the scannable code and the card's details. A corner control
 * turns it over.
 *
 * Two gates sit on the code. `isActive` says the card is genuinely on screen
 * and unlocked, and `isFlipped` says its holder has actually turned it over
 * to be scanned — so a revealed card that nobody has flipped mints no token
 * at all. A card that is expired, suspended, or revoked shows no code on
 * either side, because there is nothing valid to prove.
 */
export function MembershipCardFace({
  card,
  isActive,
  isPreview = false,
  isIssuerView = false,
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
   * Someone other than the holder — an owner or mod reading the roster — is
   * looking at a REAL card. Every printed detail is the card's own, but the
   * code is not: it is minted from `/me/cards`, which by definition only the
   * holder can call. So this suppresses the mint entirely and the back says
   * plainly that only the holder can show the code, rather than leaving an
   * empty slot or, worse, drawing the preview's decoy symbol on a live card.
   */
  isIssuerView?: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const flipperId = useId();
  const [isFlipped, setIsFlipped] = useState(false);

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

  const canProve = card.status === "active";
  const { token, isMinting, error } = useCardToken(card.id, {
    isActive: isActive && canProve && !isPreview && !isIssuerView && isFlipped,
  });

  const shellRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const pointRef = useRef<{ x: number; y: number } | null>(null);

  // The sheen is written straight onto the node as custom properties inside a
  // single coalesced frame, never through state: a pointer emits moves far
  // faster than React can usefully re-render, and re-rendering a card to move
  // a highlight would re-run the whole QR module grid with it.
  const paintGloss = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const node = shellRef.current;
      const point = pointRef.current;
      if (!node || !point) return;
      node.style.setProperty("--gloss-x", `${point.x}%`);
      node.style.setProperty("--gloss-y", `${point.y}%`);
    });
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    pointRef.current = {
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    };
    event.currentTarget.style.setProperty("--gloss-lit", "1");
    paintGloss();
  };

  const onPointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--gloss-lit", "0");
  };

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
          className={[styles.face, styles.faceFront, skinClass, ground && styles.hasGround]
            .filter(Boolean)
            .join(" ")}
          aria-label={t("cards:face.ariaLabel", { community: card.communityName })}
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
          <CardBackFace
            card={card}
            token={token}
            isMinting={isMinting}
            hasError={error}
            isPreview={isPreview}
            isIssuerView={isIssuerView}
          />
        </article>
      </div>

      {/* Outside the flipper on purpose: inside, it would rotate with the
          card and land mirrored on the back. Its own fixed plate reads on
          every skin, since it cannot inherit either face's ink. */}
      <IconButton
        className={styles.flipButton}
        tone="dark"
        size="sm"
        aria-controls={flipperId}
        // The name carries the state, rather than `aria-pressed`: this is a
        // toggle between two equal sides, not a control that is on or off.
        aria-label={t(isFlipped ? "cards:face.flipToFront" : "cards:face.flipToBack")}
        onClick={() => setIsFlipped((flipped) => !flipped)}
      >
        <FiRefreshCw aria-hidden="true" />
      </IconButton>
    </div>
  );
}
