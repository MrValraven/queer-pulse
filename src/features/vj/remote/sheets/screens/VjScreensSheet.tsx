import { useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiMonitor } from "react-icons/fi";
import {
  Button,
  Collapse,
  CollapseListItem,
} from "../../../../../shared/components/ui";
import type {
  VjClipDTO,
  VjScreenOverride,
  VjScreenStatus,
  VjStageState,
} from "../../../../../shared/contracts/vj";
import { useMotionPrefs } from "../../../../../app/providers/motionPrefs";
import type { TranslateOptions } from "../../../../../shared/i18n/types";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type {
  VjCommandOutcome,
  VjIdentifyOutcome,
  VjRenderModeOutcome,
} from "../../../live/vjStageCommands";
import { VjSheetFrame } from "../../kit/VjSheetFrame";
import type { VjRun } from "../../useVjCommandRunner";
import { VjSheetAlert } from "../../VjSheetAlert";
import { useVjRenderModeSwitch } from "./useVjRenderModeSwitch";
import { VjRenderModeSwitch } from "./VjRenderModeSwitch";
import { VjScreenRow } from "./VjScreenRow";
import styles from "./VjScreensSheet.module.css";

/** The pending key of Show every screen's number. */
const IDENTIFY_ALL_KEY = "all";

interface VjSheetAlertLine {
  key: string | null;
  values?: TranslateOptions;
}

export interface VjScreensSheetProps {
  /** `stage.screens`, every screen this stage has seen. */
  screens: readonly VjScreenStatus[];
  /** `stage.latestState.screenOverrides`. */
  overrides: VjStageState["screenOverrides"];
  /** The active pack's clips, in pack order. */
  packClips: readonly VjClipDTO[];
  run: VjRun;
  isBlocked: boolean;
  onClose: () => void;
}

/**
 * The Screens sheet: Simple renderer on every screen and Show every screen's
 * number on top, then one row per screen in number order with its health
 * (the load warning offers Switch to simple renderer), what it shows and
 * Show number. Every send goes through `run`; a refusal (a screen that left,
 * zero screens connected, too many screens with their own look) names its
 * reason over the rows.
 */
export function VjScreensSheet({
  screens,
  overrides,
  packClips,
  run,
  isBlocked,
  onClose,
}: VjScreensSheetProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const emptyId = useId();
  const noConnectedId = useId();
  const [pendingIdentifyKeys, setPendingIdentifyKeys] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const [pendingOverrideValues, setPendingOverrideValues] = useState<
    Readonly<Record<string, string>>
  >({});
  const [alertLine, setAlertLine] = useState<VjSheetAlertLine>({ key: null });

  const orderedScreens = [...screens].sort(
    (first, second) => first.number - second.number,
  );
  const hasConnectedScreen = screens.some((screen) => screen.isConnected);
  // Screens listed, none of them connected: the held show-wide controls say why.
  const isNoneConnected = screens.length > 0 && !hasConnectedScreen;
  const showWideHeldReasonId =
    screens.length === 0
      ? emptyId
      : isNoneConnected
        ? noConnectedId
        : undefined;
  const isIdentifyAllHeld =
    isBlocked ||
    !hasConnectedScreen ||
    pendingIdentifyKeys.has(IDENTIFY_ALL_KEY);

  const noteOutcome = (
    outcome: VjCommandOutcome | VjIdentifyOutcome | VjRenderModeOutcome,
  ) => {
    setAlertLine(
      outcome.ok
        ? { key: null }
        : { key: outcome.errorKey, values: { ...outcome.errorValues } },
    );
  };

  const renderModeSwitchRef = useRef<HTMLButtonElement>(null);
  const {
    isOn: isSimpleOn,
    isPending: isRenderModePending,
    pendingMode: renderModePendingMode,
    requestMode,
  } = useVjRenderModeSwitch({
    screens,
    run,
    isBlocked,
    onOutcome: noteOutcome,
  });

  // The warning that sent simple folds away once its screen reports simple,
  // taking its button with it: focus moves to the show-wide switch first
  // without the instant jump a plain focus() makes, then the sheet glides
  // just far enough to show the switch, its pending line and any refusal.
  const switchToSimpleFromRow = () => {
    const switchElement = renderModeSwitchRef.current;
    if (switchElement !== null) {
      switchElement.focus({ preventScroll: true });
      switchElement.scrollIntoView({
        block: "nearest",
        behavior: reducedMotion ? "auto" : "smooth",
      });
    }
    void requestMode("simple");
  };

  const setIdentifyPending = (key: string, isPending: boolean) => {
    setPendingIdentifyKeys((current) => {
      const next = new Set(current);
      if (isPending) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const identify = async (screenId: string | null) => {
    const key = screenId ?? IDENTIFY_ALL_KEY;
    if (isBlocked || pendingIdentifyKeys.has(key)) return;
    setIdentifyPending(key, true);
    noteOutcome(await run("identifyScreen", screenId));
    setIdentifyPending(key, false);
  };

  const pickOverride = async (
    screenId: string,
    override: VjScreenOverride | null,
    value: string,
  ) => {
    if (isBlocked || pendingOverrideValues[screenId] !== undefined) return;
    setPendingOverrideValues((current) => ({ ...current, [screenId]: value }));
    noteOutcome(await run("setScreenOverride", screenId, override));
    setPendingOverrideValues((current) => {
      const next = { ...current };
      delete next[screenId];
      return next;
    });
  };

  return (
    <VjSheetFrame
      title={t("vj:screensSheet.title")}
      intro={t("vj:screensSheet.intro")}
      closeLabel={t("vj:screensSheet.close")}
      onClose={onClose}
    >
      <div className={styles.sheetBody} data-vj-screens-sheet="">
        <div className={styles.showControls}>
          <VjRenderModeSwitch
            ref={renderModeSwitchRef}
            isOn={isSimpleOn}
            isPending={isRenderModePending}
            pendingMode={renderModePendingMode}
            isHeld={isBlocked || !hasConnectedScreen}
            heldReasonId={showWideHeldReasonId}
            onToggle={() => void requestMode(isSimpleOn ? "effects" : "simple")}
          />
          <Button
            variant="stage-ghost"
            className={styles.identifyAllButton}
            aria-disabled={isIdentifyAllHeld}
            aria-describedby={showWideHeldReasonId}
            onClick={() => {
              if (!isIdentifyAllHeld) void identify(null);
            }}
          >
            <FiMonitor aria-hidden fill="none" />
            {t("vj:screensSheet.identifyAll")}
          </Button>
        </div>
        <VjSheetAlert errorKey={alertLine.key} values={alertLine.values} />
        <Collapse isOpen={screens.length === 0}>
          <p id={emptyId} className={styles.hint}>
            {t("vj:screensSheet.empty")}
          </p>
        </Collapse>
        <Collapse isOpen={isNoneConnected}>
          <p
            id={noConnectedId}
            className={styles.hint}
            data-vj-screens-none-connected=""
          >
            {t("vj:error.socket.noScreensConnected")}
          </p>
        </Collapse>
        <ul className={styles.rowList}>
          <AnimatePresence initial={false}>
            {orderedScreens.map((screen) => (
              <CollapseListItem key={screen.screenId}>
                <div className={styles.rowSlot}>
                  <VjScreenRow
                    screen={screen}
                    override={overrides[screen.screenId] ?? null}
                    packClips={packClips}
                    isBlocked={isBlocked}
                    isIdentifyPending={pendingIdentifyKeys.has(screen.screenId)}
                    isRenderModeHeld={
                      isBlocked || isRenderModePending || !screen.isConnected
                    }
                    pendingOverrideValue={
                      pendingOverrideValues[screen.screenId] ?? null
                    }
                    onIdentify={(screenId) => void identify(screenId)}
                    onSwitchToSimple={switchToSimpleFromRow}
                    onPickOverride={(screenId, override, value) =>
                      void pickOverride(screenId, override, value)
                    }
                  />
                </div>
              </CollapseListItem>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </VjSheetFrame>
  );
}
