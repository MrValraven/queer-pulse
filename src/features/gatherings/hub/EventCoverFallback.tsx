import { FiStar } from "react-icons/fi";
import type { CalendarEvent } from "../data";
import { GATHERING_FAMILIES, type GatheringFamily } from "../gatheringCatalog";
import styles from "./EventCoverFallback.module.css";

/** The colour a cover field is washed in. Each maps to a class in the
 *  stylesheet that sets the field's hue channels. */
type FallbackTone = "plum" | "coral" | "amber" | "violet" | "rose" | "jade";

/** One tone per family, so a board of coverless gatherings still reads as a
 *  mix of evenings. A full `Record`, so a new family fails to compile until
 *  it is given a tone. */
const FAMILY_TONE: Record<GatheringFamily, FallbackTone> = {
  meet: "coral",
  eat: "amber",
  party: "violet",
  music: "violet",
  make: "rose",
  learn: "plum",
  watch: "violet",
  move: "jade",
  care: "jade",
  organise: "coral",
};

export interface EventCoverFallbackProps {
  event: CalendarEvent;
  size: "card" | "hero";
}

/**
 * The cover an event wears when its host never added a photo: a quiet paper
 * surface tinted in its family's colour, two soft pools of light for depth,
 * and the family's icon centred in a tinted disc. It never repeats the title,
 * which the card already sets in type beside it.
 *
 * It fills its positioned parent (`position: absolute; inset: 0`) and is
 * decorative, so it is hidden from assistive tech. The surface is built on
 * `--paper`, so it flips with the theme like the card around it, and the icon
 * takes its family's ink, which flips too. `size="hero"` adds a fine dot
 * screen for the featured slot. A caller can resize or move the disc through
 * `--cover-fallback-mark-size` and `--cover-fallback-mark-align`.
 */
export function EventCoverFallback({ event, size }: EventCoverFallbackProps) {
  const family = event.gatheringFamily;
  const familyEntry = family
    ? GATHERING_FAMILIES.find((entry) => entry.key === family)
    : undefined;
  const FamilyIcon = familyEntry?.icon ?? FiStar;
  const tone: FallbackTone = family ? FAMILY_TONE[family] : "plum";
  const className = [
    styles.field,
    styles[tone],
    size === "hero" ? styles.hero : styles.card,
  ].join(" ");
  return (
    <span className={className} data-cover-fallback="" aria-hidden>
      <span className={styles.mark}>
        <FamilyIcon className={styles.icon} aria-hidden />
      </span>
    </span>
  );
}
