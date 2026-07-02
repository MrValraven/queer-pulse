import { Fragment } from "react";
import { FiAlertCircle, FiCheck } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { PANELS, TOTAL_STEPS } from "./startCommunity.data";
import styles from "./StartCommunityPage.module.css";

/** The numbered "founding thread" rail; done nodes jump back to their step. */
export function FoundingThread({
  step,
  onJump,
}: {
  step: number;
  onJump: (n: number) => void;
}) {
  const fill = (step / (TOTAL_STEPS - 1)) * 100;
  const current = PANELS[step];
  return (
    <div className={styles.threadWrap}>
      <div className={styles.thread}>
        <span
          className={styles.threadFill}
          style={{ transform: `scaleX(${fill / 100})` }}
        />
        {PANELS.map((panel, i) => {
          const state =
            i < step ? styles.done : i === step ? styles.current : "";
          const done = i < step;
          const label = (
            <>
              <span className={styles.dot}>
                {done && <FiCheck size={11} aria-hidden />}
              </span>
              <span className={styles.nodeLabel}>{panel.thread}</span>
            </>
          );
          return (
            <Fragment key={panel.key}>
              {done ? (
                <button
                  type="button"
                  className={[styles.node, styles.nodeDone, state].join(" ")}
                  onClick={() => onJump(i)}
                  aria-label={`Back to ${panel.thread}`}
                >
                  {label}
                </button>
              ) : (
                <div
                  className={[styles.node, state].join(" ")}
                  aria-current={i === step ? "step" : undefined}
                >
                  {label}
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
      <div className={styles.threadMobile}>
        Step {step + 1} of {TOTAL_STEPS} · <b>{current?.thread}</b>
      </div>
    </div>
  );
}

/** Back / next footer with the "what's still needed" hint. */
export function PanelActions({
  onBack,
  backLabel = "← Back",
  onNext,
  nextLabel,
  missing,
  flush,
}: {
  onBack: () => void;
  backLabel?: string;
  onNext: () => void;
  nextLabel: string;
  missing: string[];
  flush?: boolean;
}) {
  const blocked = missing.length > 0;
  return (
    <div
      className={[styles.paneFooter, flush && styles.paneFooterFlush]
        .filter(Boolean)
        .join(" ")}
    >
      {blocked && (
        <div className={styles.neededBar}>
          <FiAlertCircle size={15} aria-hidden />
          <span>Still needed:</span>
          <span className={styles.neededChips}>
            {missing.map((m) => (
              <span key={m} className={styles.neededChip}>
                {m}
              </span>
            ))}
          </span>
        </div>
      )}
      <div className={styles.paneActions}>
        <Button variant="ghost" onClick={onBack}>
          {backLabel}
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={blocked}
          title={blocked ? "A few things left to fill in" : undefined}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}

/** Serif chapter header (with coral `<em>` where the title marks ⟪ ⟫). */
export function ChapterHead({ index }: { index: number }) {
  const panel = PANELS[index];
  if (!panel) return null;
  return (
    <>
      <div className={styles.chEyebrow}>{panel.eyebrow}</div>
      <h2 className={styles.chH}>{renderTitle(panel.title)}</h2>
      <p className={styles.chLead}>{panel.lead}</p>
    </>
  );
}

/** Split a title on the ⟪ ⟫ markers into text + coral `<em>` segments. */
function renderTitle(title: string) {
  const parts = title.split(/⟪|⟫/);
  return parts.map((part, i) =>
    i % 2 === 1 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>,
  );
}
