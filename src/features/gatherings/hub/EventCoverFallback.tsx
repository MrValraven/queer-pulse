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
 * The cover a gathering wears when its host never added a photo: a deep plum
 * field washed in its family's colour, a few soft orbs of light for depth,
 * and the family's icon drawn large and faint in cream. It never repeats the
 * title, which the card already sets in type beside it.
 *
 * It fills its positioned parent (`position: absolute; inset: 0`) and is
 * decorative, so it is hidden from assistive tech. The field's colours are
 * fixed in both themes, like a photo would be. `size="hero"` scales the icon
 * and the orbs up for the featured slot.
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
      <span className={`${styles.orb} ${styles.orbGlow}`} />
      <span className={`${styles.orb} ${styles.orbHue}`} />
      <span className={`${styles.orb} ${styles.orbPair}`} />
      <FamilyIcon className={styles.icon} aria-hidden />
    </span>
  );
}
