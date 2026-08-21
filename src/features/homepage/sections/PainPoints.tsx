import { Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { gapsThread } from "../data/painPoints";
import { GapExchangeRow, GapHeroPanel, GapMarkerRow } from "./PainPointsParts";
import styles from "./PainPoints.module.css";

/**
 * "We built this because we felt these gaps." — Direction E: a threaded
 * question↔answer conversation down a central line, interrupted by two
 * full-width plum hero panels at the pivotal beats. See `gapsThread` for
 * the ordered content; the left/right alternation of exchange rows is
 * derived from their position (every other exchange flips).
 */
export function PainPoints() {
  const { t } = useTranslation();
  // Every other exchange flips to the mirrored layout. Derive it purely from
  // how many exchanges precede this one, so the render stays side-effect free.
  const isFlipped = (index: number) =>
    gapsThread.slice(0, index).filter((i) => i.kind === "exchange").length %
      2 ===
    0;

  return (
    <section className={styles.pain} id="why">
      <Reveal className={styles.head}>
        <div className={styles.eyebrow}>
          <span className={styles.live} aria-hidden="true" />
          {t("homepage:painPoints.eyebrow")}
        </div>
        <h2 className={styles.title}>
          <Translation
            i18nKey="homepage:painPoints.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.sub}>{t("homepage:painPoints.sub")}</p>
        <p className={styles.sub}>{t("homepage:painPoints.sub2")}</p>
      </Reveal>

      <div className={styles.thread}>
        {gapsThread.map((item, index) => {
          const key = `${item.kind}-${index}`;
          if (item.kind === "hero") {
            return (
              <Reveal key={key}>
                <GapHeroPanel item={item} />
              </Reveal>
            );
          }
          if (item.kind === "marker") {
            return (
              <Reveal key={key}>
                <GapMarkerRow item={item} />
              </Reveal>
            );
          }
          return (
            <Reveal key={key}>
              <GapExchangeRow item={item} flip={isFlipped(index)} />
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
