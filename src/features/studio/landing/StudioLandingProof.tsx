import { useId } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StudioLandingView } from "../api/studioLanding.adapters";
import { useStudioLanding } from "../api/useStudioLanding";
import { STUDIO_DISCLOSURE, STUDIO_EXIT } from "../studioMotion";
import { StudioLandingNextEvent } from "./StudioLandingNextEvent";
import styles from "./StudioLandingProof.module.css";

type StudioLandingCounts = StudioLandingView["counts"];

interface ProofFigure {
  figureId: "artists" | "releases" | "events";
  labelKey: string;
  count: number;
}

/** The figures with a public count, in reading order. A null count (under the
 *  floor) leaves its figure out. */
function proofFiguresOf(counts: StudioLandingCounts): ProofFigure[] {
  const figures: ProofFigure[] = [];
  if (counts.artists !== null) {
    figures.push({
      figureId: "artists",
      labelKey: "studio:landing.proof.artists",
      count: counts.artists,
    });
  }
  if (counts.releases !== null) {
    figures.push({
      figureId: "releases",
      labelKey: "studio:landing.proof.releases",
      count: counts.releases,
    });
  }
  if (counts.eventsThisMonth !== null) {
    figures.push({
      figureId: "events",
      labelKey: "studio:landing.proof.events",
      count: counts.eventsThisMonth,
    });
  }
  return figures;
}

function StudioLandingFigures({ counts }: { counts: StudioLandingCounts }) {
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const fade = reducedMotion ? { duration: 0 } : STUDIO_DISCLOSURE;
  return (
    <ul className={styles.figures}>
      <AnimatePresence initial={false}>
        {proofFiguresOf(counts).map((figure) => (
          <m.li
            key={figure.figureId}
            className={styles.figure}
            layout={reducedMotion ? false : "position"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: reducedMotion ? { duration: 0 } : STUDIO_EXIT,
            }}
            transition={fade}
          >
            <Translation
              i18nKey={figure.labelKey}
              values={{ count: figure.count }}
              slots={{
                count: (
                  <span className={styles.numeral}>
                    <RollingNumber
                      value={fmt.number(figure.count)}
                      numericValue={figure.count}
                    />
                  </span>
                ),
              }}
            />
          </m.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

/**
 * The proof strip and the "Next on stage" card, from the public landing read.
 * The strip shows only with an artist count; the card shows with a next
 * event. The whole section folds away when neither has anything to say.
 */
export function StudioLandingProof() {
  const { t } = useTranslation();
  const headingId = useId();
  const { landing } = useStudioLanding();
  const isStripShown = landing?.isProofShown === true;
  const isEventShown = landing?.nextEvent != null;
  return (
    <Collapse isOpen={isStripShown || isEventShown}>
      <section aria-labelledby={headingId} className={styles.section}>
        <h2 id={headingId} className="visuallyHidden">
          {t("studio:landing.proof.label")}
        </h2>
        <div className={styles.layout}>
          <Collapse isOpen={isStripShown} className={styles.stripSlot}>
            {landing ? <StudioLandingFigures counts={landing.counts} /> : null}
          </Collapse>
          <Collapse isOpen={isEventShown} className={styles.eventSlot}>
            {landing?.nextEvent ? (
              <StudioLandingNextEvent event={landing.nextEvent} />
            ) : null}
          </Collapse>
        </div>
      </section>
    </Collapse>
  );
}
