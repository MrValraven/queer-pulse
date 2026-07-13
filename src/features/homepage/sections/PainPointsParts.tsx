import { FiArrowRight, FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui";
import { linkToPath } from "../../../app/routeMap";
import type { GapExchange, GapHero, GapMarker } from "../data/types";
import styles from "./PainPoints.module.css";

/** prefix + coral-italic emphasis + optional suffix, shared by heroes and rows. */
function GapHeading({
  className,
  headingPrefix,
  accent,
  headingSuffix,
}: {
  className?: string;
  headingPrefix: string;
  accent: string;
  headingSuffix?: string;
}) {
  return (
    <h3 className={className}>
      {headingPrefix}
      <em>{accent}</em>
      {headingSuffix}
    </h3>
  );
}

/** The jade "we built this" beat used on the hero panels. */
function BuiltBeat({ label }: { label: string }) {
  return (
    <div className={`${styles.built} ${styles.heroBuilt}`}>
      <span className={styles.builtChk} aria-hidden="true">
        <FiCheck />
      </span>
      {label}
    </div>
  );
}

/** A full-width plum hero panel that interrupts the thread. */
export function GapHeroPanel({ item }: { item: GapHero }) {
  return (
    <div className={styles.hero}>
      <div>
        <div className={styles.heroEye}>{item.eyebrow}</div>
        <p className={styles.heroBubble}>{item.question}</p>
        <GapHeading
          className={styles.heroAns}
          headingPrefix={item.headingPrefix}
          accent={item.accent}
          headingSuffix={item.headingSuffix}
        />
      </div>
      <div>
        <p className={styles.heroBody}>{item.body}</p>
        <BuiltBeat label={item.builtLabel} />
        <div className={styles.heroCta}>
          <Button variant="primary" to={linkToPath(item.href)}>
            {item.ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** A serif "chapter" caption that masks the thread line between beats. */
export function GapMarkerRow({ item }: { item: GapMarker }) {
  return (
    <div className={styles.marker}>
      <span>{item.label}</span>
    </div>
  );
}

/** A light conversational exchange row: question bubble ↔ answer. */
export function GapExchangeRow({
  item,
  flip,
}: {
  item: GapExchange;
  flip: boolean;
}) {
  const cls = [
    styles.exch,
    flip && styles.flip,
    item.tone === "safe" && styles.safe,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>
      <div className={styles.qside}>
        <p className={styles.bubble}>{item.question}</p>
      </div>
      <div className={styles.answer}>
        <GapHeading
          className={styles.ansH}
          headingPrefix={item.headingPrefix}
          accent={item.accent}
          headingSuffix={item.headingSuffix}
        />
        <p className={styles.ansBody}>{item.body}</p>
        <Link to={linkToPath(item.href)} className={styles.link}>
          {item.ctaLabel}
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
      <span className={styles.node} aria-hidden="true" />
    </div>
  );
}
