import { useId, useRef, useState } from "react";
import { FiAlertTriangle, FiPlay, FiSkipForward } from "react-icons/fi";
import { Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { contentWarningLabels } from "../../../forum/forumWarnings.helpers";
import { useStudioPlayer, type StudioQueueItem } from "../studioPlayerContext";
import css from "./StudioWarningGate.module.css";

/** A player surface (the bar's section, the mini card, Now playing's stage)
 *  and its play or pause button. The transport's own button is the direct
 *  button child of the transport row inside `data-studio-transport`. */
const SURFACE_SELECTOR = "[data-studio-player-surface]";
const PLAY_TOGGLE_SELECTOR =
  "[data-studio-play-toggle], [data-studio-transport] > div > button";

/** The play or pause button of the surface this gate sits in. The bar's
 *  section carries no marker, so the wrapper's parent stands in for it. */
function findSurfacePlayToggle(
  wrapper: HTMLElement | null,
): HTMLElement | null {
  const surface =
    wrapper?.closest<HTMLElement>(SURFACE_SELECTOR) ?? wrapper?.parentElement;
  return surface?.querySelector<HTMLElement>(PLAY_TOGGLE_SELECTOR) ?? null;
}

/**
 * The player's pause before a warned track (spec 6.3, D5): "Waiting:
 * {title}", "Warning: {themes}", Play it and Skip. The warned track is
 * already the current item, so the line names it as waiting. It shows in
 * Now playing, the bar and the mini player while `pendingWarning` is set.
 * The last item stays on screen while the row folds away, so the text never
 * blanks mid-animation. Nothing about an answer leaves the browser.
 */
export function StudioWarningGate({ className }: { className?: string }) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const headingId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const pending = player.pendingWarning;
  const [shownItem, setShownItem] = useState<StudioQueueItem | null>(pending);
  if (pending && pending !== shownItem) setShownItem(pending);
  const isOpen = pending !== null;
  // The row folds and goes inert on either answer, so focus moves to the
  // same surface's play or pause button, or to the status line (which stays
  // mounted) when there is none. Nothing is focused on first show.
  const moveFocusAfterAnswer = () => {
    const playToggle = findSurfacePlayToggle(wrapperRef.current);
    (playToggle ?? statusRef.current)?.focus();
  };
  const title = shownItem?.title ?? "";
  const themes = contentWarningLabels(shownItem?.contentWarnings, t).join(", ");
  return (
    <div
      ref={wrapperRef}
      className={[css.gate, className].filter(Boolean).join(" ")}
    >
      <p ref={statusRef} tabIndex={-1} className="visuallyHidden" role="status">
        {isOpen ? (
          <>
            <span>{t("studio:player.gate.waiting", { title })}</span>{" "}
            <span>{t("studio:player.gate.warning", { themes })}</span>
          </>
        ) : null}
      </p>
      <Collapse isOpen={isOpen} className={css.row}>
        <section className={css.card} aria-labelledby={headingId}>
          <FiAlertTriangle aria-hidden className={css.icon} />
          <div className={css.text}>
            <p id={headingId} className={css.next}>
              {t("studio:player.gate.waiting", { title })}
            </p>
            <p className={css.warning}>
              {t("studio:player.gate.warning", { themes })}
            </p>
          </div>
          <div className={css.actions}>
            <button
              type="button"
              className={css.play}
              onClick={() => {
                moveFocusAfterAnswer();
                player.playWarnedTrack();
              }}
            >
              <FiPlay aria-hidden />
              {t("studio:player.gate.play")}
            </button>
            <button
              type="button"
              className={css.skip}
              onClick={() => {
                moveFocusAfterAnswer();
                player.skipWarnedTrack();
              }}
            >
              <FiSkipForward aria-hidden />
              {t("studio:player.gate.skip")}
            </button>
          </div>
        </section>
      </Collapse>
    </div>
  );
}
