import { AnimatePresence } from "motion/react";
import { useCallback, useId, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import {
  Button,
  Collapse,
  CollapseListItem,
} from "../../../../../shared/components/ui";
import {
  VJ_LIMITS,
  vjSceneLookOf,
  type VjSceneDTO,
  type VjStageState,
} from "../../../../../shared/contracts/vj";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { selectVjScenesForPack, useVjScenes } from "../../../api/useVjScenes";
import { useVjSceneMutations } from "../../../api/useVjSceneMutations";
import { useVjSetlists } from "../../../api/useVjSetlists";
import type { TranslateOptions } from "../../../../../shared/i18n/types";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import { vjErrorKeyOf, vjErrorValuesOf } from "../../../vjErrors";
import { VjSheetFrame } from "../../kit/VjSheetFrame";
import { VjSheetAlert } from "../../VjSheetAlert";
import {
  VjSceneRow,
  type VjRun,
  type VjSceneFlashConsentRequest,
  type VjSceneMutations,
  type VjScenesSheetFeedback,
} from "./VjSceneRow";
import { VjSetlistSection } from "./VjSetlistSection";
import styles from "./VjScenesSheet.module.css";

interface VjSheetAlertLine {
  key: string;
  values?: TranslateOptions;
}

/** "Scene 4": counts on from the list's length and skips any number a name
 *  already holds (compared trimmed, ignoring case). */
function nextVjDefaultName(
  takenNames: readonly string[],
  nameFor: (number: number) => string,
): string {
  const taken = new Set(
    takenNames.map((name) => name.trim().toLocaleLowerCase()),
  );
  let number = takenNames.length + 1;
  while (taken.has(nameFor(number).trim().toLocaleLowerCase())) number += 1;
  return nameFor(number);
}

/** One pending command at a time, the alert line naming the last reason and
 *  the status line a screen reader hears. */
function useVjScenesSheetFeedback(isBlocked: boolean): {
  feedback: VjScenesSheetFeedback;
  alertLine: VjSheetAlertLine | null;
  statusLine: string;
} {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [alertLine, setAlertLine] = useState<VjSheetAlertLine | null>(null);
  const [statusLine, setStatusLine] = useState("");

  const showCause = useCallback((cause: unknown) => {
    setAlertLine({ key: vjErrorKeyOf(cause), values: vjErrorValuesOf(cause) });
  }, []);
  const clearAlert = useCallback(() => setAlertLine(null), []);

  const runCommand = useCallback(
    (nextPendingKey: string, send: () => Promise<VjCommandOutcome>) => {
      setPendingKey(nextPendingKey);
      void send()
        .then((outcome) => {
          if (outcome.ok) setAlertLine(null);
          else if (outcome.errorKey !== null) {
            setAlertLine({
              key: outcome.errorKey,
              values: { ...outcome.errorValues },
            });
          }
        })
        .finally(() => setPendingKey(null));
    },
    [],
  );

  const feedback = useMemo<VjScenesSheetFeedback>(
    () => ({
      isBlocked,
      pendingKey,
      runCommand,
      showCause,
      clearAlert,
      announce: setStatusLine,
    }),
    [isBlocked, pendingKey, runCommand, showCause, clearAlert],
  );
  return { feedback, alertLine, statusLine };
}

/** One titled group of scene rows; it folds away while it holds none. */
function VjSceneGroup({
  title,
  scenes,
  sceneMutations,
  feedback,
  onRecall,
}: {
  title: string;
  scenes: readonly VjSceneDTO[];
  sceneMutations: VjSceneMutations;
  feedback: VjScenesSheetFeedback;
  onRecall: (scene: VjSceneDTO, anchor: HTMLElement) => void;
}) {
  const headingId = useId();
  return (
    <Collapse isOpen={scenes.length > 0}>
      <section className={styles.group} aria-labelledby={headingId}>
        <h3 id={headingId} className={styles.groupTitle}>
          {title}
        </h3>
        <ul className={styles.list}>
          <AnimatePresence initial={false}>
            {scenes.map((scene) => (
              <CollapseListItem key={scene.id}>
                <VjSceneRow
                  scene={scene}
                  sceneMutations={sceneMutations}
                  feedback={feedback}
                  onRecall={onRecall}
                />
              </CollapseListItem>
            ))}
          </AnimatePresence>
        </ul>
      </section>
    </Collapse>
  );
}

export interface VjScenesSheetProps {
  /** `stage.latestState`: Save scene stores its look. */
  state: VjStageState;
  activePackId: string | null;
  run: VjRun;
  isBlocked: boolean;
  /** Asks the flash warning first for a look that flashes. */
  requestSceneFlashConsent: VjSceneFlashConsentRequest;
  onClose: () => void;
}

/**
 * Scenes and set lists. Save scene stores the current look under the next
 * default name ("Scene 4"), filed under the active pack. This pack's scenes
 * come first, then the scenes of any pack, each with Recall, Rename and
 * Delete. Below them the set lists start, step and stop. A recall, a set
 * list start or a step onto a look that flashes asks the flash warning first.
 * REST refusals and socket refusals both land in one alert line that names
 * the reason.
 */
export function VjScenesSheet({
  state,
  activePackId,
  run,
  isBlocked,
  requestSceneFlashConsent,
  onClose,
}: VjScenesSheetProps) {
  const { t } = useTranslation();
  const scenesQuery = useVjScenes();
  const setlistsQuery = useVjSetlists();
  const sceneMutations = useVjSceneMutations();
  const { createScene } = sceneMutations;
  const { feedback, alertLine, statusLine } =
    useVjScenesSheetFeedback(isBlocked);

  const allScenes = useMemo(() => scenesQuery.data ?? [], [scenesQuery.data]);
  const setlists = setlistsQuery.data ?? [];
  const shownScenes = useMemo(
    () => selectVjScenesForPack(allScenes, activePackId),
    [allScenes, activePackId],
  );
  const packScenes = shownScenes.filter(
    (scene) => activePackId !== null && scene.packId === activePackId,
  );
  const anyPackScenes = shownScenes.filter((scene) => scene.packId === null);
  const loadError = scenesQuery.error ?? setlistsQuery.error ?? null;
  const shownAlert =
    alertLine ??
    (loadError === null
      ? null
      : { key: vjErrorKeyOf(loadError), values: vjErrorValuesOf(loadError) });

  const saveScene = () => {
    if (createScene.isPending) return;
    const name = nextVjDefaultName(
      allScenes.map((scene) => scene.name),
      (number) => t("vj:scenes.defaultName", { number }),
    );
    void createScene
      .mutateAsync({ name, packId: activePackId, look: vjSceneLookOf(state) })
      .then(() => {
        feedback.clearAlert();
        feedback.announce(t("vj:libraryScenes.saved"));
      }, feedback.showCause);
  };

  const scenesById = useMemo(
    () => new Map(allScenes.map((scene) => [scene.id, scene])),
    [allScenes],
  );

  const recallScene = (scene: VjSceneDTO, anchor: HTMLElement) => {
    requestSceneFlashConsent(scene, anchor, () => {
      feedback.runCommand(`recall:${scene.id}`, () =>
        run("recallScene", scene.id),
      );
    });
  };

  return (
    <VjSheetFrame
      title={t("vj:scenes.title")}
      intro={t("vj:scenes.intro")}
      closeLabel={t("vj:scenes.close")}
      onClose={onClose}
    >
      <div className={styles.sheetBody} data-vj-scenes-sheet="">
        <Button
          variant="stage"
          className={styles.wideButton}
          aria-disabled={createScene.isPending || undefined}
          aria-busy={createScene.isPending || undefined}
          onClick={saveScene}
        >
          <FiPlus aria-hidden fill="none" />
          {t("vj:strip.saveScene")}
        </Button>
        <VjSheetAlert
          errorKey={shownAlert?.key ?? null}
          values={shownAlert?.values}
        />
        <p role="status" className={styles.visuallyHidden}>
          {statusLine}
        </p>
        <Collapse isOpen={scenesQuery.isSuccess && shownScenes.length === 0}>
          <p className={styles.empty}>{t("vj:strip.noScenes")}</p>
        </Collapse>
        <VjSceneGroup
          title={t("vj:scenes.thisPack")}
          scenes={packScenes}
          sceneMutations={sceneMutations}
          feedback={feedback}
          onRecall={recallScene}
        />
        <VjSceneGroup
          title={t("vj:scenes.anyPack")}
          scenes={anyPackScenes}
          sceneMutations={sceneMutations}
          feedback={feedback}
          onRecall={recallScene}
        />
        <VjSetlistSection
          setlists={setlists}
          state={state}
          sceneIdsForNewSetlist={shownScenes
            .slice(0, VJ_LIMITS.setlistItemsMax)
            .map((scene) => scene.id)}
          nextSetlistName={nextVjDefaultName(
            setlists.map((setlist) => setlist.name),
            (number) => t("vj:scenes.setlistDefaultName", { number }),
          )}
          scenesById={scenesById}
          run={run}
          requestSceneFlashConsent={requestSceneFlashConsent}
          feedback={feedback}
        />
      </div>
    </VjSheetFrame>
  );
}
