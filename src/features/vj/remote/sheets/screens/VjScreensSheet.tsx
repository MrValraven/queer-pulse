import { useId, useState } from "react";
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
import type { TranslateOptions } from "../../../../../shared/i18n/types";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type {
  VjCommandOutcome,
  VjIdentifyOutcome,
} from "../../../live/vjStageCommands";
import { VjSheetFrame } from "../../kit/VjSheetFrame";
import type { VjRun } from "../../useVjCommandRunner";
import { VjSheetAlert } from "../../VjSheetAlert";
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
 * The Screens sheet: Show every screen's number on top, then one row per
 * screen in number order with its health, what it shows and Show number.
 * Every send goes through `run`; a refusal (a screen that left, too many
 * screens with their own look) names its reason over the rows.
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
  const emptyId = useId();
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
  const isIdentifyAllHeld =
    isBlocked ||
    !hasConnectedScreen ||
    pendingIdentifyKeys.has(IDENTIFY_ALL_KEY);

  const noteOutcome = (outcome: VjCommandOutcome | VjIdentifyOutcome) => {
    setAlertLine(
      outcome.ok
        ? { key: null }
        : { key: outcome.errorKey, values: { ...outcome.errorValues } },
    );
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
      closeLabel={t("vj:screensSheet.close")}
      onClose={onClose}
    >
      <div className={styles.sheetBody} data-vj-screens-sheet="">
        <Button
          variant="stage-ghost"
          className={styles.identifyAllButton}
          aria-disabled={isIdentifyAllHeld}
          aria-describedby={screens.length === 0 ? emptyId : undefined}
          onClick={() => {
            if (!isIdentifyAllHeld) void identify(null);
          }}
        >
          <FiMonitor aria-hidden fill="none" />
          {t("vj:screensSheet.identifyAll")}
        </Button>
        <VjSheetAlert errorKey={alertLine.key} values={alertLine.values} />
        <Collapse isOpen={screens.length === 0}>
          <p id={emptyId} className={styles.hint}>
            {t("vj:screensSheet.empty")}
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
                    pendingOverrideValue={
                      pendingOverrideValues[screen.screenId] ?? null
                    }
                    onIdentify={(screenId) => void identify(screenId)}
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
