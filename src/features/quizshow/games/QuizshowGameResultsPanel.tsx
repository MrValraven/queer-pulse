import { useId, useRef } from "react";
import { FiX } from "react-icons/fi";
import { IconButton } from "../../../shared/components/ui";
import { useInertWhileCovered } from "../../../shared/components/ui/modalStack";
import {
  useDismiss,
  useScrimDismiss,
} from "../../../shared/components/ui/useDismiss";
import {
  useFocusHandBack,
  useModalExit,
} from "../../../shared/components/ui/useModalExit";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "../../../shared/lib/cx";
import { QuizshowResultsCard } from "../event/QuizshowResultsCard";
import type { QuizshowGameScope } from "../quizshowScope";
import styles from "./QuizshowGamePage.module.css";

/**
 * The game's kept results in a dark panel on the right of the studio, opened
 * from More, then Show results: the podium, the counts, the recap behind its
 * own toggle, and Delete results. The panel is the surface and its title
 * names the results, so the card inside drops its own box and heading. It renders inside the studio root, so it
 * reads the studio's dark tokens, and it leaves with the shared dialog exit
 * when an AnimatePresence parent removes it.
 */
export function QuizshowGameResultsPanel({
  scope,
  onClose,
}: {
  scope: QuizshowGameScope;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const exit = useModalExit(onClose);
  const panelRef = useDismiss(exit.close);
  useFocusHandBack(exit, panelRef);
  // The layer is a different element from the panel that carries `inert`
  // while closing, the same split `Modal` makes between its scrim and dialog.
  const layerRef = useRef<HTMLDivElement>(null);
  useInertWhileCovered(layerRef, exit.isClosing);
  const scrimProps = useScrimDismiss(exit.close);
  return (
    <div
      ref={layerRef}
      className={cx(
        styles.resultsLayer,
        exit.isClosing && styles.resultsLayerClosing,
      )}
      role="presentation"
      {...scrimProps}
    >
      <div
        ref={panelRef}
        className={cx(
          styles.resultsPanel,
          exit.isClosing && styles.resultsPanelClosing,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        inert={exit.isClosing}
        onAnimationEnd={exit.handleExitAnimationEnd}
      >
        <header className={styles.resultsHead}>
          <h2 id={titleId} className={styles.resultsTitle}>
            {t("quizshow:results.title")}
          </h2>
          <IconButton
            tone="dark"
            aria-label={t("quizshow:game.results.close")}
            onClick={exit.close}
          >
            <FiX aria-hidden />
          </IconButton>
        </header>
        <div className={styles.resultsBody}>
          <QuizshowResultsCard scope={scope} canDelete isInDarkStudio />
        </div>
      </div>
    </div>
  );
}
