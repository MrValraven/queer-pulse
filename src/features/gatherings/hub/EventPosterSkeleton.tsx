import { SkeletonLine } from "../../../shared/components/ui";
import styles from "./EventPosterCard.module.css";
import agendaStyles from "./EventAgendaRow.module.css";
import ticketStyles from "./EventTicketCard.module.css";

interface EventPosterSkeletonProps {
  variant: "featured" | "list" | "compact" | "ticket" | "agenda";
}

/** Mirrors `EventTicketCard`: the same `.surface`/`.media`/`.body` classes, so
 *  the 4:3 cover and the body's rhythm hold their place while loading. Every
 *  skeleton adds its module's `.isSkeleton`, which drops pointer events so
 *  the borrowed card classes never lift or tint on hover. */
function TicketSkeleton() {
  return (
    <div
      className={`${ticketStyles.card} ${ticketStyles.isSkeleton}`}
      aria-hidden
    >
      <div className={ticketStyles.surface}>
        <div className={ticketStyles.media}>
          <SkeletonLine
            width="100%"
            height="100%"
            style={{ borderRadius: 0 }}
          />
        </div>
        <div className={ticketStyles.body}>
          <SkeletonLine width="38%" height={11} />
          <SkeletonLine
            width="86%"
            height={22}
            style={{ marginBlockStart: 4 }}
          />
          <SkeletonLine width="58%" height={22} />
          <SkeletonLine
            width="48%"
            height={13}
            style={{ marginBlockStart: 4 }}
          />
          <div className={ticketStyles.foot}>
            <SkeletonLine
              width={84}
              height={13}
              style={{ marginBlockStart: 4 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mirrors `EventAgendaRow`: stamp column, 16:9 cover, body. The row's own
 *  narrow-screen rules stack it exactly as they stack the real row. */
function AgendaSkeleton() {
  return (
    <div
      className={`${agendaStyles.row} ${agendaStyles.isSkeleton}`}
      aria-hidden
    >
      <div className={agendaStyles.stampColumn}>
        <SkeletonLine width={44} height={56} style={{ borderRadius: 8 }} />
      </div>
      <div className={agendaStyles.cover}>
        <SkeletonLine width="100%" height="100%" style={{ borderRadius: 0 }} />
      </div>
      <div className={agendaStyles.body}>
        <SkeletonLine width="30%" height={11} />
        <SkeletonLine width="78%" height={22} style={{ marginBlockStart: 4 }} />
        <SkeletonLine width="44%" height={13} style={{ marginBlockStart: 4 }} />
        <SkeletonLine width={84} height={13} style={{ marginBlockStart: 4 }} />
      </div>
      <span className={agendaStyles.arrow} />
    </div>
  );
}

/**
 * Loading placeholder that mirrors each `EventPosterCard` variant's real
 * footprint 1:1 (reuses the same `.frame`/`.thumb`/`.list`/`.compact` layout
 * classes as the live card, same aspect ratios, same text-line rhythm) so
 * swapping in real content causes no layout shift. The shimmer itself comes
 * from `SkeletonLine`, which already honours `prefers-reduced-motion`.
 */
export function EventPosterSkeleton({ variant }: EventPosterSkeletonProps) {
  if (variant === "ticket") return <TicketSkeleton />;
  if (variant === "agenda") return <AgendaSkeleton />;

  if (variant === "list") {
    return (
      <div className={`${styles.list} ${styles.isSkeleton}`} aria-hidden>
        <div className={styles.thumb}>
          <SkeletonLine
            width="100%"
            height="100%"
            style={{ borderRadius: 0 }}
          />
        </div>
        <div className={styles.listBody}>
          <SkeletonLine width={64} height={18} style={{ borderRadius: 999 }} />
          <SkeletonLine
            width="82%"
            height={20}
            style={{ marginBlockStart: 4 }}
          />
          <SkeletonLine
            width="45%"
            height={13}
            style={{ marginBlockStart: 4 }}
          />
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`${styles.compact} ${styles.isSkeleton}`} aria-hidden>
        <div className={styles.thumb}>
          <SkeletonLine
            width="100%"
            height="100%"
            style={{ borderRadius: 0 }}
          />
        </div>
        <div className={styles.compactBody}>
          <SkeletonLine width="70%" height={14} />
          <SkeletonLine
            width={44}
            height={11}
            style={{ marginBlockStart: 3 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.featured} ${styles.isSkeleton}`} aria-hidden>
      <div className={styles.frame}>
        <SkeletonLine width="100%" height="100%" style={{ borderRadius: 0 }} />
        {/* Mirrors `.overlay`'s absolute position — the real card's text sits
            on top of the frame and adds zero flow height, so the skeleton
            must too, or swapping loading→loaded jumps the layout (CLS). */}
        <div className={styles.overlay}>
          <SkeletonLine width={72} height={18} style={{ borderRadius: 999 }} />
          <SkeletonLine
            width="88%"
            height={22}
            style={{ marginBlockStart: 8 }}
          />
          <SkeletonLine
            width="40%"
            height={13}
            style={{ marginBlockStart: 6 }}
          />
        </div>
      </div>
    </div>
  );
}
