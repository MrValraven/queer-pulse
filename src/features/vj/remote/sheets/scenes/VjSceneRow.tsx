import { AnimatePresence } from "motion/react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
} from "react";
import { FiEdit2, FiPlay, FiTrash2 } from "react-icons/fi";
import {
  Button,
  Collapse,
  ConfirmDialog,
} from "../../../../../shared/components/ui";
import { VJ_LIMITS, type VjSceneDTO } from "../../../../../shared/contracts/vj";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { useQuizshowDarkDialog } from "../../../../quizshow/builder/useQuizshowDarkDialog";
import type { useVjSceneMutations } from "../../../api/useVjSceneMutations";
import type { TranslateOptions } from "../../../../../shared/i18n/types";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import type { useVjCommandRunner } from "../../useVjCommandRunner";
import { vjErrorKeyOf, vjErrorValuesOf } from "../../../vjErrors";
import { VjSheetAlert } from "../../VjSheetAlert";
import styles from "./VjScenesSheet.module.css";

export type VjRun = ReturnType<typeof useVjCommandRunner>["run"];
export type VjSceneMutations = ReturnType<typeof useVjSceneMutations>;

/**
 * `actions.requestSceneFlashConsent`: a look with a flash-capable effect or
 * transition waits on the flash warning, anchored on the tapped button, and
 * any other look runs `onConsented` at once.
 */
export type VjSceneFlashConsentRequest = (
  scene: Pick<VjSceneDTO, "name" | "look">,
  anchor: HTMLElement | null,
  onConsented: () => void,
) => void;

/** What the sheet lends its rows and its set list section: one pending
 *  command at a time, one alert line naming the reason, one status line. */
export interface VjScenesSheetFeedback {
  /** The stage is out of reach: socket commands hold, REST writes still go. */
  isBlocked: boolean;
  /** Which command waits for its ack (`recall:<id>`, `setlist`), or null. */
  pendingKey: string | null;
  runCommand: (
    pendingKey: string,
    send: () => Promise<VjCommandOutcome>,
  ) => void;
  showCause: (cause: unknown) => void;
  clearAlert: () => void;
  announce: (line: string) => void;
}

interface VjRowError {
  key: string;
  values?: TranslateOptions;
}

function rowErrorOf(cause: unknown): VjRowError {
  return { key: vjErrorKeyOf(cause), values: vjErrorValuesOf(cause) };
}

/** The inline rename form: a labelled field and Save name, checked here for
 *  a blank name before the server sees it. */
function VjSceneRenameForm({
  scene,
  sceneMutations,
  feedback,
  onDone,
}: {
  scene: VjSceneDTO;
  sceneMutations: VjSceneMutations;
  feedback: VjScenesSheetFeedback;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draftName, setDraftName] = useState(scene.name);
  const [rowError, setRowError] = useState<VjRowError | null>(null);
  const { updateScene } = sceneMutations;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (updateScene.isPending) return;
    const name = draftName.trim();
    if (name === "") {
      setRowError({ key: "vj:scenes.nameRequired" });
      return;
    }
    if (name === scene.name) {
      onDone();
      return;
    }
    void updateScene.mutateAsync({ sceneId: scene.id, name }).then(
      () => {
        setRowError(null);
        feedback.announce(t("vj:libraryScenes.saved"));
        onDone();
      },
      (cause: unknown) => setRowError(rowErrorOf(cause)),
    );
  };

  const changeDraft = (event: ChangeEvent<HTMLInputElement>) => {
    setDraftName(event.target.value);
    if (rowError?.key === "vj:scenes.nameRequired") setRowError(null);
  };

  return (
    <form className={styles.renameForm} onSubmit={submit} noValidate>
      <label className={styles.fieldLabel} htmlFor={fieldId}>
        {t("vj:scenes.nameLabel")}
      </label>
      <input
        ref={inputRef}
        id={fieldId}
        className={styles.input}
        type="text"
        value={draftName}
        maxLength={VJ_LIMITS.sceneNameMax}
        enterKeyHint="done"
        autoComplete="off"
        aria-invalid={rowError === null ? undefined : true}
        onChange={changeDraft}
      />
      <VjSheetAlert
        errorKey={rowError?.key ?? null}
        values={rowError?.values}
      />
      <Button
        type="submit"
        variant="stage-ghost"
        aria-disabled={updateScene.isPending || undefined}
        aria-busy={updateScene.isPending || undefined}
      >
        {t("vj:scenes.saveName")}
      </Button>
    </form>
  );
}

/** Asks before deleting, and says how many set list spots go with it. */
function VjSceneDeleteDialog({
  scene,
  sceneMutations,
  feedback,
  onClose,
}: {
  scene: VjSceneDTO;
  sceneMutations: VjSceneMutations;
  feedback: VjScenesSheetFeedback;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const darkDialogRef = useQuizshowDarkDialog();
  const [rowError, setRowError] = useState<VjRowError | null>(null);
  const { deleteScene } = sceneMutations;

  const confirm = () => {
    if (deleteScene.isPending) return;
    void deleteScene.mutateAsync({ sceneId: scene.id }).then(
      () => {
        feedback.announce(t("vj:libraryScenes.deleted", { name: scene.name }));
        onClose();
      },
      (cause: unknown) => setRowError(rowErrorOf(cause)),
    );
  };

  return (
    <ConfirmDialog
      open
      tone="destructive"
      initialFocus="cancel"
      title={t("vj:scenes.deleteTitle", { name: scene.name })}
      description={
        scene.setlistItemCount > 0
          ? t("vj:libraryScenes.deleteBodySetlists", {
              count: scene.setlistItemCount,
            })
          : t("vj:libraryScenes.deleteBody")
      }
      confirmLabel={t("vj:scenes.delete")}
      loading={deleteScene.isPending}
      onClose={onClose}
      onConfirm={confirm}
    >
      <div ref={darkDialogRef}>
        <VjSheetAlert
          errorKey={rowError?.key ?? null}
          values={rowError?.values}
        />
      </div>
    </ConfirmDialog>
  );
}

/**
 * One saved scene: its name, Recall scene, Rename scene (an inline field
 * that folds open) and Delete scene (asks first). The parent wraps it in a
 * `CollapseListItem`, so it grows in and folds away.
 */
export function VjSceneRow({
  scene,
  sceneMutations,
  feedback,
  onRecall,
}: {
  scene: VjSceneDTO;
  sceneMutations: VjSceneMutations;
  feedback: VjScenesSheetFeedback;
  /** The tapped Recall scene button anchors the flash warning. */
  onRecall: (scene: VjSceneDTO, anchor: HTMLElement) => void;
}) {
  const { t } = useTranslation();
  const nameId = useId();
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const recallKey = `recall:${scene.id}`;
  const isRecallHeld = feedback.isBlocked || feedback.pendingKey !== null;

  return (
    <div className={styles.row} data-vj-scene-row={scene.id}>
      <p id={nameId} className={styles.rowName}>
        {scene.name}
      </p>
      <div className={styles.rowActions}>
        <Button
          variant="stage"
          size="sm"
          aria-describedby={nameId}
          aria-disabled={isRecallHeld || undefined}
          aria-busy={feedback.pendingKey === recallKey || undefined}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            if (!isRecallHeld) onRecall(scene, event.currentTarget);
          }}
        >
          <FiPlay aria-hidden fill="none" />
          {t("vj:scenes.recall")}
        </Button>
        <Button
          variant="stage-ghost"
          size="sm"
          aria-describedby={nameId}
          aria-expanded={isRenaming}
          onClick={() => setIsRenaming((wasRenaming) => !wasRenaming)}
        >
          <FiEdit2 aria-hidden fill="none" />
          {t("vj:scenes.rename")}
        </Button>
        <Button
          variant="stage-ghost"
          size="sm"
          aria-describedby={nameId}
          onClick={() => setIsDeleteOpen(true)}
        >
          <FiTrash2 aria-hidden fill="none" />
          {t("vj:scenes.delete")}
        </Button>
      </div>
      <Collapse isOpen={isRenaming}>
        <VjSceneRenameForm
          scene={scene}
          sceneMutations={sceneMutations}
          feedback={feedback}
          onDone={() => setIsRenaming(false)}
        />
      </Collapse>
      <AnimatePresence>
        {isDeleteOpen && (
          <VjSceneDeleteDialog
            scene={scene}
            sceneMutations={sceneMutations}
            feedback={feedback}
            onClose={() => setIsDeleteOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
