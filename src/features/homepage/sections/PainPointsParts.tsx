import { FiArrowRight, FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { linkToPath } from "../../../app/routeMap";
import type { GapExchange, GapHero, GapMarker } from "../data/types";
import styles from "./PainPoints.module.css";

/** Rich-text heading (prefix + coral-italic accent + optional suffix), shared
 * by heroes and rows — `headingKey`'s catalog value carries the `<em>` run. */
function GapHeading({
  className,
  headingKey,
}: {
  className?: string;
  headingKey: string;
}) {
  return (
    <h3 className={className}>
      <Translation i18nKey={headingKey} components={{ em: <em /> }} />
    </h3>
  );
}

/** The jade "we built this" beat used on the hero panels. */
function BuiltBeat({ labelKey }: { labelKey: string }) {
  const { t } = useTranslation();
  return (
    <div className={`${styles.built} ${styles.heroBuilt}`}>
      <span className={styles.builtChk} aria-hidden="true">
        <FiCheck />
      </span>
      {t(labelKey)}
    </div>
  );
}

/** A full-width plum hero panel that interrupts the thread. */
export function GapHeroPanel({ item }: { item: GapHero }) {
  const { t } = useTranslation();
  return (
    <div className={styles.hero}>
      <div>
        <div className={styles.heroEye}>{t(item.eyebrowKey)}</div>
        <p className={styles.heroBubble}>{t(item.questionKey)}</p>
        <GapHeading className={styles.heroAns} headingKey={item.headingKey} />
      </div>
      <div>
        <p className={styles.heroBody}>{t(item.bodyKey)}</p>
        <BuiltBeat labelKey={item.builtLabelKey} />
        <div className={styles.heroCta}>
          <Button variant="primary" to={linkToPath(item.href)}>
            {t(item.ctaLabelKey)}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** A serif "chapter" caption that masks the thread line between beats. */
export function GapMarkerRow({ item }: { item: GapMarker }) {
  const { t } = useTranslation();
  return (
    <div className={styles.marker}>
      <span>{t(item.labelKey)}</span>
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
  const { t } = useTranslation();
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
        <p className={styles.bubble}>{t(item.questionKey)}</p>
      </div>
      <div className={styles.answer}>
        <GapHeading className={styles.ansH} headingKey={item.headingKey} />
        <p className={styles.ansBody}>{t(item.bodyKey)}</p>
        <Link to={linkToPath(item.href)} className={styles.link}>
          {t(item.ctaLabelKey)}
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
      <span className={styles.node} aria-hidden="true" />
    </div>
  );
}
