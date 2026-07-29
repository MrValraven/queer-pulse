import { useEffect, useState } from "react";
import { Button, Eyebrow, ImageSlot, type ImageSlotTint } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { usePrefersReducedMotion } from "../../../shared/hooks";
import { routes } from "../../../app/routeMap";
import type { CalendarEvent } from "../data";
import { timeBucketOf, timeBucketLabelKey } from "./pickHighlights";
import { hubCopy } from "./hub.data";
import styles from "./EventsHubHero.module.css";

interface EventsHubHeroProps {
  /** The single, most-worth-showing-up-for upcoming event; `null` when the
   *  calendar is empty. */
  lead: CalendarEvent | null;
  now: Date;
  /** Jumps the hub to the "Browse" tab. */
  onSeeAll: () => void;
}

const TAGLINE_COUNT = 4;
const TAGLINE_INTERVAL_MS = 3500;

/** Cycles `0..count-1` on an interval; frozen at `0` — and never ticking —
 *  under `prefers-reduced-motion: reduce`, so the tagline reads as one
 *  static line instead of a moving one. */
function useRotatingIndex(count: number, intervalMs: number): number {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [reducedMotion, count, intervalMs]);

  return reducedMotion ? 0 : index;
}

/** The hero's signature vibey flourish — a short rotating line above the
 *  eyebrow. `aria-live="off"` keeps it from interrupting screen readers as
 *  it cycles; it's a mood line, not information the title doesn't already
 *  carry. */
function RotatingTagline({ className }: { className?: string }) {
  const { t } = useTranslation();
  const index = useRotatingIndex(TAGLINE_COUNT, TAGLINE_INTERVAL_MS);

  return (
    <p className={className} aria-live="off">
      <span className={styles.taglineMark} aria-hidden />
      <span key={index} className={styles.taglineText}>
        {t(`gatherings:hub.hero.tagline.${index}`)}
      </span>
    </p>
  );
}

/** QueerPulse's signature spot mark for the hub — a small hand-drawn
 *  sparkle cluster riding the orb glow. Purely decorative (`aria-hidden`),
 *  built from tokens so it reads in both themes and both hero variants. */
function HeroSparkMark() {
  return (
    <svg className={styles.sparkMark} viewBox="0 0 120 120" aria-hidden focusable="false">
      <path
        className={styles.sparkBig}
        d="M60 8c3 26 14 37 40 40-26 3-37 14-40 40-3-26-14-37-40-40 26-3 37-14 40-40Z"
        fill="var(--accent)"
      />
      <path
        d="M96 64c1.3 10 5.7 14.4 16 16-10.3 1.3-14.7 5.7-16 16-1.3-10.3-5.7-14.7-16-16 10.3-1.6 14.7-6 16-16Z"
        fill="var(--jade)"
        opacity="0.8"
      />
      <path
        d="M20 76c.9 7.4 3.9 10.4 11 11-7.1.9-10.1 3.9-11 11-.9-7.1-3.9-10.1-11-11 7.1-.6 10.1-3.6 11-11Z"
        fill="var(--accent)"
        opacity="0.5"
      />
    </svg>
  );
}

/** Warm, poster-free hero shown when there's nothing upcoming yet. Stays on
 *  `--cream` (never plum — that pattern is reserved for success states) with
 *  the same ambient orb glow as the photo hero, so the section still feels
 *  like part of the same place. */
function EmptyHero() {
  const { t } = useTranslation();
  return (
    <section className={styles.emptyHero}>
      <span className={styles.orbAccent} aria-hidden />
      <span className={styles.orbJade} aria-hidden />
      <HeroSparkMark />
      <div className="wrap">
        <div className={styles.emptyInner}>
          <RotatingTagline className={styles.taglineEmpty} />
          <Eyebrow>{t(hubCopy.eyebrowKey)}</Eyebrow>
          <h1 className={styles.emptyTitle}>{t("gatherings:hub.empty.title")}</h1>
          <p className={styles.emptySub}>{t("gatherings:hub.empty.body")}</p>
          <div className={styles.cta}>
            <Button size="lg" to={routes.host}>
              {t("gatherings:hub.host.cta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The Events Hub's immersive, Shotgun-style lead — the page's one LCP image.
 * Full-bleed cover art behind a plum scrim (guarantees AA for the cream
 * overlay text regardless of the artwork) plus the homepage's orb-glow
 * technique layered on top for warmth. Falls back to a calm, poster-free
 * `EmptyHero` when there's no upcoming lead.
 */
export function EventsHubHero({ lead, now, onSeeAll }: EventsHubHeroProps) {
  const { t } = useTranslation();
  const fmt = useFormat();

  if (!lead) return <EmptyHero />;

  const bucket = timeBucketOf(lead.date, now);
  const tint: ImageSlotTint = lead.orgColor === "var(--accent)" ? "coral" : "plum";

  return (
    <section className={styles.hero}>
      <ImageSlot
        src={lead.coverImageUrl}
        alt=""
        tint={tint}
        placeholder={lead.title}
        width="100%"
        height="100%"
        radius={0}
        loading="eager"
        fetchPriority="high"
        className={styles.bgImage}
      />
      <span className={styles.scrim} aria-hidden />
      <span className={styles.orbAccent} aria-hidden />
      <span className={styles.orbJade} aria-hidden />
      <HeroSparkMark />
      <div className="wrap">
        <div className={styles.inner}>
          <RotatingTagline className={styles.tagline} />
          <Eyebrow live={bucket === "tonight"} className={styles.eyebrow}>
            {t(timeBucketLabelKey(bucket))}
          </Eyebrow>
          <h1 className={styles.title}>{lead.title}</h1>
          <p className={styles.meta}>
            <span className={styles.metaItem}>
              {fmt.date(lead.date, { weekday: "long", day: "numeric", month: "long" })}
              {" · "}
              {fmt.time(lead.date)}
            </span>
            <span className={styles.dot} aria-hidden />
            <span className={styles.metaItem}>{lead.hood}</span>
          </p>
          <div className={styles.cta}>
            <Button size="lg" to={lead.to}>
              {t("gatherings:hub.hero.rsvp")}
            </Button>
            <Button size="lg" variant="ghost-dark" onClick={onSeeAll}>
              {t(hubCopy.seeAllKey)}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
