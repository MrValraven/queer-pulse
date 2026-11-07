import type { CSSProperties, JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import type { VjEventCard, VjOverlay } from "../../../../shared/contracts/vj";
import { cx } from "../../../../shared/lib/cx";
import type { VjClockReader } from "../../engine/vjEngineLook";
import { useVjServerDeadline } from "./useVjServerDeadline";
import { VjOverlayTicker } from "./VjOverlayTicker";
import {
  vjOverlayClassesOf,
  vjOverlayMirrorFontSizeOf,
  vjPaletteVariableOf,
} from "./vjOverlayStyle";
import styles from "./VjOverlay.module.css";

const CLASS_BY_KEY = styles as Readonly<Record<string, string | undefined>>;

/** Typewriter: each character appears 60 ms after the one before, and a caret follows. */
function VjTypewriterText({
  text,
  isStatic,
}: {
  text: string;
  isStatic: boolean;
}): JSX.Element {
  if (isStatic) return <p className={styles.lineText}>{text}</p>;
  const characters = Array.from(text);
  const lastIndex = characters.length - 1;
  return (
    <p className={styles.lineText}>
      {characters.map((character, characterIndex) => (
        <span
          // Position is the identity: the text only changes as a whole line.
          key={characterIndex}
          className={cx(
            styles.typeCharacter,
            characterIndex === lastIndex && styles.typeCharacterLast,
          )}
          style={{ "--vj-type-index": characterIndex } as CSSProperties}
        >
          {character}
        </span>
      ))}
    </p>
  );
}

/** The text plus copies drawn behind or over it (glitch, stacked). */
function VjCopiedText({
  text,
  copyClasses,
}: {
  text: string;
  /** CSS module lookups, so each one may be missing; a missing one draws no copy. */
  copyClasses: readonly (string | undefined)[];
}): JSX.Element {
  const presentCopyClasses = copyClasses.filter(
    (copyClass): copyClass is string => copyClass !== undefined,
  );
  return (
    <p className={cx(styles.lineText, styles.copiedText)}>
      {text}
      {presentCopyClasses.map((copyClass) => (
        <span key={copyClass} aria-hidden="true" className={copyClass}>
          {text}
        </span>
      ))}
    </p>
  );
}

function VjOverlayText({
  overlay,
  text,
  isMirror,
  isStatic,
}: {
  overlay: VjOverlay;
  text: string;
  isMirror: boolean;
  isStatic: boolean;
}): JSX.Element {
  switch (overlay.style) {
    case "ticker":
      return <VjOverlayTicker text={text} isStatic={isMirror} />;
    case "typewriter":
      return <VjTypewriterText text={text} isStatic={isStatic} />;
    case "glitch":
      return (
        <VjCopiedText
          text={text}
          copyClasses={[styles.glitchCopyFirst, styles.glitchCopySecond]}
        />
      );
    case "stacked":
      return (
        <VjCopiedText
          text={text}
          copyClasses={[styles.stackedCopyNear, styles.stackedCopyFar]}
        />
      );
    default:
      return <p className={styles.lineText}>{text}</p>;
  }
}

/** A shown event card that a bottom-edge element keeps clear of: its side and kind. */
export interface VjBesideCard {
  side: "left" | "right";
  kind: VjEventCard["kind"];
}

/** The side of a logo in a bottom corner that a bottom-edge element keeps clear. */
export type VjBesideLogo = "left" | "right";

export interface VjOverlayLineProps {
  overlay: VjOverlay;
  clock: VjClockReader;
  isMirror: boolean;
  /** The mirror under reduced motion: no typewriter reveal. */
  isStatic: boolean;
  fadeSeconds: number;
  /**
   * The shown event card a bottom line must keep clear of: its side and
   * kind. Null (the default) when no card shares the bottom edge.
   */
  besideCard?: VjBesideCard | null;
  /** The side of a logo in a bottom corner that a bottom line keeps clear. */
  besideLogo?: VjBesideLogo | null;
}

/**
 * The overlay line in one of eight styles, at the top, centre or bottom. It
 * hides itself on this screen's synced clock at `hideAt` (contract 7.14), the
 * same moment the server hides it.
 */
export function VjOverlayLine({
  overlay,
  clock,
  isMirror,
  isStatic,
  fadeSeconds,
  besideCard = null,
  besideLogo = null,
}: VjOverlayLineProps): JSX.Element {
  const text = overlay.text.trim();
  const hasHideTimePassed = useVjServerDeadline(
    overlay.isVisible ? overlay.hideAt : null,
    clock,
  );
  const isShown = overlay.isVisible && text !== "" && !hasHideTimePassed;
  const classes = vjOverlayClassesOf(overlay);
  const lineStyle = {
    "--vj-overlay-color": classes.colorValue,
    "--vj-overlay-rgb": vjPaletteVariableOf(overlay.colorToken),
    "--vj-overlay-font-size": isMirror
      ? vjOverlayMirrorFontSizeOf(overlay)
      : `var(${classes.sizeToken})`,
  } as CSSProperties;
  const lineKey = [
    overlay.style,
    overlay.position,
    overlay.size,
    overlay.colorToken,
    text,
    // Making room for a card fades the line out and back in beside it.
    besideCard === null ? "" : `${besideCard.side}:${besideCard.kind}`,
    besideLogo ?? "",
  ].join("|");
  return (
    <div
      className={styles.lineSlot}
      data-vj-overlay-line={isShown ? "shown" : "hidden"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isShown ? (
          <m.div
            key={lineKey}
            className={cx(
              styles.lineFrame,
              CLASS_BY_KEY[classes.styleClass],
              CLASS_BY_KEY[classes.positionClass],
            )}
            style={lineStyle}
            data-vj-overlay-style={overlay.style}
            data-vj-overlay-position={overlay.position}
            data-vj-overlay-size={overlay.size}
            data-vj-overlay-color={overlay.colorToken}
            data-vj-beside-card={besideCard?.side}
            data-vj-beside-card-kind={besideCard?.kind}
            data-vj-beside-logo={besideLogo ?? undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeSeconds, ease: "linear" }}
          >
            <VjOverlayText
              overlay={overlay}
              text={text}
              isMirror={isMirror}
              isStatic={isStatic}
            />
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
