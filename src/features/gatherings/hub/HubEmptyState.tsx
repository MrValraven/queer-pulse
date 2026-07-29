import { Button, Reveal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./HubEmptyState.module.css";

interface HubEmptyStateProps {
  titleKey: string;
  bodyKey?: string;
  ctaLabelKey?: string;
  ctaTo?: string;
  /** Lighter treatment for a scoped/filtered empty (e.g. Browse's "no
   *  matches") — smaller art, tighter padding, no forced CTA. */
  compact?: boolean;
  className?: string;
}

/**
 * Shared Events Hub empty state. Replaces the generic `EmptyState` primitive
 * in HighlightsView/BrowseView with a warm, on-brand moment: a small
 * code-authored spot illustration (an open calendar catching a spark — the
 * page is blank, but something's about to happen) plus title/body copy and
 * an optional CTA. Gently reveals in; the illustration's spark is the only
 * moving part, and it's reduced-motion safe (see `.spark` in the CSS module).
 */
export function HubEmptyState({
  titleKey,
  bodyKey,
  ctaLabelKey,
  ctaTo,
  compact = false,
  className,
}: HubEmptyStateProps) {
  const { t } = useTranslation();
  const cls = [styles.empty, compact && styles.compact, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Reveal as="div" className={cls} role="status">
      <HubSparkCalendar />
      <h3 className={styles.title}>{t(titleKey)}</h3>
      {bodyKey && <p className={styles.body}>{t(bodyKey)}</p>}
      {ctaLabelKey && ctaTo && (
        <div className={styles.actions}>
          <Button variant="primary" to={ctaTo}>
            {t(ctaLabelKey)}
          </Button>
        </div>
      )}
    </Reveal>
  );
}

/**
 * Decorative spot illustration: an open calendar with empty (dotted) rows
 * and a coral spark catching its top-right corner, plus a jade "mark it"
 * dot — "your calendar's a blank page; something's about to happen." Flat
 * 2D, ≤2 stroke weights, token-built so it themes in light and dark.
 * Purely decorative (the copy beside it carries the meaning) → `aria-hidden`.
 */
function HubSparkCalendar() {
  return (
    <svg className={styles.art} viewBox="0 0 200 140" aria-hidden focusable="false">
      <defs>
        <radialGradient id="hubEmptyGlow">
          <stop offset="0%" stopColor="rgba(var(--accent-rgb), 0.22)" />
          <stop offset="70%" stopColor="rgba(var(--accent-rgb), 0)" />
        </radialGradient>
      </defs>

      <circle cx={100} cy={72} r={66} fill="url(#hubEmptyGlow)" />

      {/* calendar body */}
      <rect
        x={46}
        y={36}
        width={108}
        height={86}
        rx={14}
        fill="var(--paper)"
        stroke="var(--line-strong)"
        strokeWidth={2}
      />
      {/* binder tabs */}
      <rect x={68} y={26} width={7} height={18} rx={3.5} fill="var(--line-strong)" />
      <rect x={125} y={26} width={7} height={18} rx={3.5} fill="var(--line-strong)" />
      {/* header divider */}
      <line x1={46} y1={62} x2={154} y2={62} stroke="var(--line-strong)" strokeWidth={2} />

      {/* empty, dotted rows — the calendar has nothing on it yet */}
      <line
        x1={62}
        y1={80}
        x2={112}
        y2={80}
        stroke="rgba(var(--line-rgb), 0.3)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="1 8"
      />
      <line
        x1={62}
        y1={96}
        x2={130}
        y2={96}
        stroke="rgba(var(--line-rgb), 0.3)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="1 8"
      />
      <line
        x1={62}
        y1={112}
        x2={100}
        y2={112}
        stroke="rgba(var(--line-rgb), 0.22)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="1 8"
      />

      {/* jade "mark it" dot */}
      <circle cx={62} cy={80} r={3.5} fill="var(--jade)" />

      {/* spark ring + mark, catching the calendar's top-right corner */}
      <g className={styles.spark}>
        <circle
          cx={144}
          cy={40}
          r={13}
          fill="none"
          stroke="rgba(var(--accent-rgb), 0.35)"
          strokeWidth={1.4}
        />
        <path
          d="M144 30 L146.6 37.4 L154 40 L146.6 42.6 L144 50 L141.4 42.6 L134 40 L141.4 37.4 Z"
          fill="var(--accent)"
        />
      </g>
    </svg>
  );
}

/**
 * Small vibey loading line shown above a view's skeletons — reassures
 * without a spinner. The dot's gentle pulse is the only motion and is
 * reduced-motion safe (see `.loadingDot`); announced to assistive tech via
 * `aria-live` since it stands in for a busy state.
 */
export function HubLoadingLine({ labelKey }: { labelKey: string }) {
  const { t } = useTranslation();
  return (
    <p className={styles.loadingLine} aria-live="polite">
      <span className={styles.loadingDot} aria-hidden />
      {t(labelKey)}
    </p>
  );
}
