import { useState, type JSX } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import type {
  VjEventCardDTO,
  VjEventCardUnavailableReason,
  VjScreenHealth,
} from "../../../shared/contracts/vj";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { VjRendererState } from "./vjRendererKind";
import styles from "./VjScreen.module.css";

export interface VjScreenSetupFactsProps {
  renderer: VjRendererState;
  /** The latest health reading; null until the renderer reports one. */
  health: VjScreenHealth | null;
  eventCard: {
    isUnlinked: boolean;
    unavailableReason: VjEventCardUnavailableReason | null;
    /** The linked event's card; when present the setup card names its event. */
    card?: Pick<VjEventCardDTO, "title"> | null;
  };
}

/**
 * One setup card line that folds in and out. While it folds away it keeps
 * the words it last showed, so the text never blanks mid-fold.
 */
function VjSetupFactLine({
  text,
  isAlert,
  factKey,
}: {
  text: string | null;
  isAlert: boolean;
  factKey: string;
}): JSX.Element {
  const [lastText, setLastText] = useState(text);
  if (text !== null && text !== lastText) setLastText(text);
  const shownText = text ?? lastText;
  return (
    <Collapse isOpen={text !== null}>
      {isAlert ? (
        <p className={styles.setupAlert} data-vj-setup-fact={factKey}>
          <FiAlertTriangle
            aria-hidden="true"
            className={styles.setupAlertIcon}
          />
          {shownText}
        </p>
      ) : (
        <p className={styles.setupFactLine} data-vj-setup-fact={factKey}>
          {shownText}
        </p>
      )}
    </Collapse>
  );
}

/** The renderer line: the engine is ready, holds the show while it restores, the DOM renderer runs for a named reason, or the remote picked the simple renderer. */
function useRendererLine(renderer: VjRendererState): {
  text: string | null;
  isAlert: boolean;
} {
  const { t } = useTranslation();
  switch (renderer.phase) {
    case "probing":
      return { text: null, isAlert: false };
    case "webgl2":
      return { text: t("vj:screen.renderer.webgl2"), isAlert: false };
    case "webgl2Restoring":
      return { text: t("vj:screen.renderer.restoring"), isAlert: true };
    case "dom":
      return {
        text: t("vj:screen.renderer.dom", {
          reason:
            renderer.reason === null
              ? t("vj:screen.renderer.reason.webgl2Missing")
              : t(`vj:screen.renderer.reason.${renderer.reason}`),
        }),
        isAlert: true,
      };
    case "simple":
      return { text: t("vj:screen.renderer.simple"), isAlert: false };
  }
}

/**
 * Why the event card stays hidden, the linked event the card will show, or
 * null while the pack's event is still unknown.
 */
function useEventCardLine(
  eventCard: VjScreenSetupFactsProps["eventCard"],
): string | null {
  const { t } = useTranslation();
  if (eventCard.unavailableReason !== null) {
    return t(`vj:screen.eventCard.unavailable.${eventCard.unavailableReason}`);
  }
  if (eventCard.isUnlinked) return t("vj:screen.eventCard.unlinked");
  const linkedTitle = eventCard.card?.title ?? null;
  return linkedTitle === null
    ? null
    : t("vj:screen.eventCard.linked", { title: linkedTitle });
}

/**
 * The engine facts on the setup card: which renderer draws and why, the
 * frame rate (refreshed with each health reading, every 2 s), the warning
 * when the effects outrun this laptop, and why the event card stays hidden
 * or which event it will show.
 * The card mounts it inside its status region.
 */
export function VjScreenSetupFacts({
  renderer,
  health,
  eventCard,
}: VjScreenSetupFactsProps): JSX.Element {
  const { t } = useTranslation();
  const rendererLine = useRendererLine(renderer);
  const eventCardLine = useEventCardLine(eventCard);
  const hasFrameReading = health !== null && health.fps > 0;
  const healthLine = hasFrameReading
    ? t("vj:screen.health.line", {
        fps: Math.round(health.fps),
        count: health.droppedFrames,
      })
    : null;
  const effectLoadLine =
    health?.isEffectLoadHigh === true ? t("vj:screen.health.effectLoad") : null;

  return (
    <div className={styles.setupEngineFacts}>
      <VjSetupFactLine
        factKey="renderer"
        text={rendererLine.text}
        isAlert={rendererLine.isAlert}
      />
      <VjSetupFactLine factKey="health" text={healthLine} isAlert={false} />
      <VjSetupFactLine
        factKey="effectLoad"
        text={effectLoadLine}
        isAlert={true}
      />
      <VjSetupFactLine
        factKey="eventCard"
        text={eventCardLine}
        isAlert={false}
      />
    </div>
  );
}
