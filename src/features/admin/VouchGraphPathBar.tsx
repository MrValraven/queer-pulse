import type { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import type { TrustPath } from "./trustGraph/trustPath";
import { describeTrustPath } from "./trustGraph/trustPathSentence";
import styles from "./vouchGraphCanvas.module.css";

/** The bar is centred with a -50% x offset (motion owns its transform), and
 *  slides down a few pixels as it fades in. */
const HIDDEN_STATE = { opacity: 0, x: "-50%", y: -8 };
const SHOWN_STATE = { opacity: 1, x: "-50%", y: 0 };
const ENTER_EASE = [0.22, 0.68, 0.16, 1] as const;

/** B8: names the trust path between the two picked members as a sentence,
 *  or says there is none at the current replay step. Fades in when the
 *  first endpoint is picked and out when the path is cleared. The canvas fit
 *  keeps nodes below it (the reserve marker). */
export function VouchGraphPathBar({
  pathA,
  pathB,
  path,
  onClear,
}: {
  pathA: string | null;
  pathB: string | null;
  path: TrustPath | null;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  const { reducedMotion } = useMotionPrefs();
  const nameOf = (personId: string): string =>
    graph.peopleById[personId]?.name ?? personId;

  let content: ReactNode = null;
  if (pathA && pathB && path) {
    content = (
      <span>
        <b>
          {t("admin:vouchGraph.pathbar.stepPath", {
            count: path.steps.length,
          })}
        </b>{" "}
        {describeTrustPath(path, graph, t)}
      </span>
    );
  } else if (pathA && pathB) {
    content = (
      <span>
        {t("admin:vouchGraph.pathbar.noPath", {
          a: nameOf(pathA),
          b: nameOf(pathB),
        })}
      </span>
    );
  } else if (pathA) {
    content = (
      <span>
        {t("admin:vouchGraph.pathbar.fromHint", { name: nameOf(pathA) })}
      </span>
    );
  }
  return (
    <AnimatePresence>
      {content && (
        <m.div
          key="pathbar"
          className={styles.pathbar}
          data-fit-reserve="top"
          initial={HIDDEN_STATE}
          animate={SHOWN_STATE}
          exit={HIDDEN_STATE}
          transition={{ duration: reducedMotion ? 0 : 0.2, ease: ENTER_EASE }}
        >
          {content}
          <button
            type="button"
            className={styles.pathbarClear}
            onClick={onClear}
          >
            {t("admin:vouchGraph.pathbar.clearCta")}
          </button>
        </m.div>
      )}
    </AnimatePresence>
  );
}
