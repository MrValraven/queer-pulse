import { ImageSlot, type ImageSlotTint } from "../../../shared/components/ui";
import type { CalendarEvent } from "../data";
import { sizedCover } from "./coverUrl";
import { WhenRibbon } from "./eventCardParts";
import { EventCoverFallback } from "./EventCoverFallback";
import { EventDateStamp } from "./EventDateStamp";
import posterStyles from "./EventPosterCard.module.css";
import styles from "./FeaturedEventCard.module.css";

/** Retina-aware download width for the hero cover, which spans about 690 CSS
 *  px side by side and up to about 850 stacked on a tablet. */
const HERO_COVER_WIDTH = 1400;

/** The ambient glow only ever shows blurred, so a thumbnail is plenty. */
const GLOW_COVER_WIDTH = 128;

/**
 * The hero's cover, edge to edge in its column, with the time bucket ribbon
 * ("Tonight", "Happening now", "This weekend" ...) on a coral fill. Every
 * bucket shows here: the lead is the one gathering on the page that earns
 * the reminder, whatever its date. It sits above the fold, so it loads eager
 * at high priority. A coverless lead gets the drawn family fallback, and
 * while the hero is stacked the cover also carries the cream date stub.
 */
export function FeaturedEventMedia({
  lead,
  now,
}: {
  lead: CalendarEvent;
  now: Date;
}) {
  const tint: ImageSlotTint =
    lead.orgColor === "var(--accent)" ? "coral" : "plum";
  return (
    <div className={styles.media}>
      {lead.coverImageUrl ? (
        <ImageSlot
          src={lead.coverImageUrl}
          srcSize={HERO_COVER_WIDTH}
          alt=""
          tint={tint}
          placeholder={lead.title}
          width="100%"
          height="100%"
          radius={0}
          loading="eager"
          fetchPriority="high"
          style={{ position: "absolute", inset: 0 }}
        />
      ) : (
        <EventCoverFallback event={lead} size="hero" />
      )}
      <span className={styles.coverStamp}>
        <EventDateStamp event={lead} size="card" surface="onImage" />
      </span>
      <WhenRibbon
        event={lead}
        now={now}
        className={`${posterStyles.ribbon} ${styles.ribbon}`}
      />
    </div>
  );
}

/**
 * A blurred, faint, slightly scaled copy of the cover over a coral wash behind
 * the card, so each lead tints the page around it with its own colours. A
 * coverless gathering has no colours to lend, so it gets the wash alone.
 * Purely decorative.
 */
export function FeaturedEventGlow({ lead }: { lead: CalendarEvent }) {
  const glowSource = sizedCover(lead.coverImageUrl, GLOW_COVER_WIDTH);
  return (
    <span className={styles.glow} aria-hidden>
      {glowSource && <img src={glowSource} alt="" decoding="async" />}
    </span>
  );
}
