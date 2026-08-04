import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { ImageSlot, Tag, type ImageSlotTint } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../../shared/i18n/format";
import type { CalendarEvent } from "../data";
import { timeBucketOf, timeBucketLabelKey } from "./pickHighlights";
import { sizedCover } from "./coverUrl";
import styles from "./EventPosterCard.module.css";

export type PosterVariant = "lead" | "featured" | "list" | "compact";

/** Retina-aware (~2×) download width per variant's rendered CSS size. The
 *  `lead` poster is already the big hero image, so it keeps the source width. */
const COVER_TARGET_WIDTH: Record<PosterVariant, number | undefined> = {
  lead: undefined,
  featured: 640,
  list: 320,
  compact: 128,
};

interface EventPosterCardProps {
  event: CalendarEvent;
  variant: PosterVariant;
  now?: Date;
  /** Above-the-fold poster (the hero lead) — eager-loads at high priority. */
  priority?: boolean;
}

/** Small top-left pill naming the event's time bucket ("Tonight", "This weekend" …). */
function WhenRibbon({ date, now }: { date: Date; now: Date }) {
  const { t } = useTranslation();
  return (
    <span className={styles.ribbon}>{t(timeBucketLabelKey(timeBucketOf(date, now)))}</span>
  );
}

/** Day + month pill, e.g. "6 Jun". */
function DateChip({ date, fmt }: { date: Date; fmt: Formatters }) {
  return (
    <span className={styles.dateChip}>
      {fmt.date(date, { day: "numeric", month: "short" })}
    </span>
  );
}

/** Event-vs-gathering badge. `onScrim` swaps to the opaque, always-legible
 *  variant used when the chip sits directly over cover artwork. */
function KindTag({ kind, onScrim }: { kind: CalendarEvent["kind"]; onScrim?: boolean }) {
  const { t } = useTranslation();
  const isEvent = kind === "event";
  const className = isEvent
    ? onScrim
      ? styles.kindEventScrim
      : styles.kindEvent
    : onScrim
      ? styles.kindGatheringScrim
      : styles.kindGathering;
  return (
    <Tag className={className}>
      {t(isEvent ? "gatherings:events.kindEvent" : "gatherings:events.kindGathering")}
    </Tag>
  );
}

/** Sliding-scale / fixed price pill, only rendered for ticketed events. */
function PricePill({
  event,
  fmt,
  onScrim,
}: {
  event: CalendarEvent;
  fmt: Formatters;
  onScrim?: boolean;
}) {
  const { t } = useTranslation();
  if (!event.ticketed) return null;
  const label =
    event.priceMin === undefined
      ? t("gatherings:events.ticketedTag")
      : event.priceMax !== undefined
        ? t("gatherings:events.priceRange", {
            min: fmt.currency(event.priceMin),
            max: fmt.currency(event.priceMax),
          })
        : t("gatherings:events.priceSingle", { price: fmt.currency(event.priceMin) });
  return <span className={onScrim ? styles.pricePillScrim : styles.pricePill}>{label}</span>;
}

/** "See it" hover/focus affordance for `featured`/`list`. Purely decorative —
 *  the whole card is already the single accessible link — so it's `aria-hidden`
 *  and inert (`pointer-events: none` in CSS). */
function CtaPill({ className }: { className: string }) {
  const { t } = useTranslation();
  return (
    <span className={className} aria-hidden="true">
      {t("gatherings:hub.card.cta")}
      {" "}
      <FiArrowRight aria-hidden />
    </span>
  );
}

function MetaRow({ event, fmt }: { event: CalendarEvent; fmt: Formatters }) {
  return (
    <span className={styles.meta}>
      <span className={styles.metaItem}>{event.hood}</span>
      <span className={styles.dot} aria-hidden />
      <span className={styles.metaItem}>{fmt.time(event.date)}</span>
    </span>
  );
}

/**
 * The shared poster-forward event card — Studio `.heroArt` pattern (aspect-ratio
 * frame + overflow-hidden + absolutely-positioned image fill) with a plum scrim
 * and cream overlay text for `lead`/`featured`/`compact`; a plain thumb-beside-text
 * row for `list`. One `<Link>` per card; `aria-label` pins the accessible name to
 * the event title regardless of how much text sits inside.
 */
export function EventPosterCard({ event, variant, now, priority = false }: EventPosterCardProps) {
  const fmt = useFormat();
  const effectiveNow = now ?? new Date();
  const tint: ImageSlotTint = event.orgColor === "var(--accent)" ? "coral" : "plum";
  const loading: "eager" | "lazy" = priority ? "eager" : "lazy";
  const targetWidth = COVER_TARGET_WIDTH[variant];
  const imageProps = {
    src: targetWidth === undefined ? event.coverImageUrl : sizedCover(event.coverImageUrl, targetWidth),
    alt: "",
    tint,
    placeholder: event.title,
    width: "100%",
    height: "100%",
    radius: 0,
    loading,
    fetchPriority: priority ? ("high" as const) : undefined,
    style: { position: "absolute", inset: 0 } as const,
  };

  if (variant === "list") {
    return (
      <Link to={event.to} aria-label={event.title} className={`${styles.link} ${styles.list}`}>
        <span className={styles.thumb}>
          <ImageSlot {...imageProps} />
        </span>
        <span className={styles.listBody}>
          <span className={styles.badgeRow}>
            <KindTag kind={event.kind} />
          </span>
          <h3 className={styles.titleList}>{event.title}</h3>
          <MetaRow event={event} fmt={fmt} />
          <PricePill event={event} fmt={fmt} />
        </span>
        <CtaPill className={`${styles.listCta}`} />
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link to={event.to} aria-label={event.title} className={`${styles.link} ${styles.compact}`}>
        <span className={styles.thumb}>
          <ImageSlot {...imageProps} />
        </span>
        <span className={styles.compactBody}>
          <span className={styles.compactTitle}>{event.title}</span>
          <span className={styles.compactTime}>{fmt.time(event.date)}</span>
        </span>
      </Link>
    );
  }

  const showRibbon = variant === "lead" || variant === "featured";

  return (
    <Link to={event.to} aria-label={event.title} className={`${styles.link} ${styles[variant]}`}>
      <span className={styles.frame}>
        <ImageSlot {...imageProps} />
        <span className={styles.scrim} aria-hidden />
        <span className={styles.scrimHover} aria-hidden />
        {showRibbon && <WhenRibbon date={event.date} now={effectiveNow} />}
        {variant === "featured" && <CtaPill className={`${styles.cta}`} />}
        <span className={styles.overlay}>
          <span className={styles.badgeRow}>
            <DateChip date={event.date} fmt={fmt} />
            <KindTag kind={event.kind} onScrim />
          </span>
          <h3 className={styles.title}>{event.title}</h3>
          <MetaRow event={event} fmt={fmt} />
          <PricePill event={event} fmt={fmt} onScrim />
        </span>
      </span>
    </Link>
  );
}
