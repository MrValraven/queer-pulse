import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { FiAlertTriangle, FiPlay, FiSkipForward } from "react-icons/fi";
import { Button, Collapse } from "../../../../shared/components/ui";
import { intlLocale } from "../../../../shared/i18n/locale";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { contentWarningLabels } from "../../../forum/forumWarnings.helpers";
import { useStudioPlayer, type StudioQueueItem } from "../studioPlayerContext";
import css from "./StudioWarningGate.module.css";

/** A player surface (the bar's section, the mini card, Now playing's stage)
 *  and its play or pause button. The transport's own button carries
 *  `data-studio-play-toggle` (its tooltip wraps it); the older direct-child
 *  match stays for any surface still built that way. */
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

/** A little past Collapse's 280ms grow, so the scroll reads the open row's
 *  full height. */
const GATE_REVEAL_MS = 300;

/** Brings the open gate into view where its surface scrolls (Now playing
 *  on a phone, where it opens under the transport, below the fold). It
 *  waits for the row to finish growing; reduced motion jumps. A gate that
 *  already shows (the bar, the mini card) does not move anything. */
function useRevealOpenGate(
  isOpen: boolean,
  cardRef: RefObject<HTMLElement | null>,
) {
  const { reducedMotion } = useMotionPrefs();
  useEffect(() => {
    if (!isOpen) return;
    const revealTimeoutId = window.setTimeout(
      () =>
        cardRef.current?.scrollIntoView({
          block: "nearest",
          behavior: reducedMotion ? "auto" : "smooth",
        }),
      reducedMotion ? 0 : GATE_REVEAL_MS,
    );
    return () => window.clearTimeout(revealTimeoutId);
  }, [isOpen, reducedMotion, cardRef]);
}

/**
 * The player's pause before a warned track (spec 6.3, D5): "Waiting:
 * {title}", "Warning: {themes}", Play it and Skip. The warned track is
 * already the current item, so the line names it as waiting. It shows in
 * Now playing, the bar and the mini player while `pendingWarning` is set.
 * The last item stays on screen while the row folds away, so the text never
 * blanks mid-animation. Nothing about an answer leaves the browser.
 */
export function StudioWarningGate({
  className,
  layout = "stacked",
}: {
  className?: string;
  /** `bar`: the desktop bar's row, where Play it and Skip sit right after
   *  the text. `stacked`: Now playing and the mini card. */
  layout?: "bar" | "stacked";
}) {
  const { t, language } = useTranslation();
  const player = useStudioPlayer();
  const headingId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const pending = player.pendingWarning;
  const [shownItem, setShownItem] = useState<StudioQueueItem | null>(pending);
  if (pending && pending !== shownItem) setShownItem(pending);
  const isOpen = pending !== null;
  useRevealOpenGate(isOpen, cardRef);
  // The row folds and goes inert on either answer, so focus moves to the
  // same surface's play or pause button, or to the status line (which stays
  // mounted) when there is none. Nothing is focused on first show.
  const moveFocusAfterAnswer = () => {
    const playToggle = findSurfacePlayToggle(wrapperRef.current);
    (playToggle ?? statusRef.current)?.focus();
  };
  const title = shownItem?.title ?? "";
  // DES-100: "A, B and C" in English, "A, B e C" in Portuguese.
  const themes = new Intl.ListFormat(intlLocale(language), {
    style: "long",
    type: "conjunction",
  }).format(contentWarningLabels(shownItem?.contentWarnings, t));
  return (
    <div
      ref={wrapperRef}
      className={[css.gate, className].filter(Boolean).join(" ")}
      data-layout={layout}
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
        <section ref={cardRef} className={css.card} aria-labelledby={headingId}>
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
            <Button
              variant="primary"
              className={css.play}
              onClick={() => {
                moveFocusAfterAnswer();
                player.playWarnedTrack();
              }}
            >
              <FiPlay aria-hidden />
              {t("studio:player.gate.play")}
            </Button>
            <Button
              variant="quiet"
              className={css.skip}
              onClick={() => {
                moveFocusAfterAnswer();
                player.skipWarnedTrack();
              }}
            >
              <FiSkipForward aria-hidden />
              {t("studio:player.gate.skip")}
            </Button>
          </div>
        </section>
      </Collapse>
    </div>
  );
}
