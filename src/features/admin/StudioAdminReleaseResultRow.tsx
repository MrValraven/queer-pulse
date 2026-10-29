import { AnimatePresence, m } from "motion/react";
import { FiCheck } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { STUDIO_FADE } from "../studio/studioMotion";
import type { AdminStudioReleaseCardDTO } from "./api/studioDiscoveryAdmin.api";
import css from "./StudioAdminPickDialog.module.css";
import { StudioAdminReleaseSummary } from "./StudioAdminReleaseSummary";

/** One release in the results: cover, title, then artist and facts on one
 *  line. The chosen row takes the accent edge, a light wash and a check; a
 *  release already on the shelf stays dimmed with its chip and cannot be
 *  chosen. The chip text sits inside the button, so it is part of its name. */
export function StudioAdminReleaseResultRow({
  release,
  isChosen,
  isTaken,
  takenLabel,
  onChoose,
}: {
  release: AdminStudioReleaseCardDTO;
  isChosen: boolean;
  isTaken: boolean;
  takenLabel: string;
  onChoose: (release: AdminStudioReleaseCardDTO) => void;
}) {
  const { reducedMotion } = useMotionPrefs();
  const pop = reducedMotion ? { duration: 0 } : STUDIO_FADE;
  return (
    <li className={css.resultItem}>
      <button
        type="button"
        className={css.result}
        aria-pressed={isTaken ? undefined : isChosen}
        aria-disabled={isTaken || undefined}
        onClick={() => {
          if (!isTaken) onChoose(release);
        }}
      >
        <StudioAdminReleaseSummary release={release} size="sm" />
        <span className={css.resultEnd}>
          {isTaken ? (
            <span className={css.resultChip}>{takenLabel}</span>
          ) : (
            <AnimatePresence initial={false}>
              {isChosen ? (
                <m.span
                  key="check"
                  className={css.resultCheck}
                  aria-hidden
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={pop}
                >
                  <FiCheck />
                </m.span>
              ) : null}
            </AnimatePresence>
          )}
        </span>
      </button>
    </li>
  );
}
