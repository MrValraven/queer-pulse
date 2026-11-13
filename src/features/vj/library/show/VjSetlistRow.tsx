import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, m } from "motion/react";
import { FiEdit2, FiList, FiTrash2 } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import {
  VJ_LIMITS,
  type VjClipDTO,
  type VjSceneDTO,
  type VjSetlistDTO,
  type VjTempo,
} from "../../../../shared/contracts/vj";
import { Button, Collapse, IconButton } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjSetlistMutations } from "../../api/useVjSetlistMutations";
import { VjNameForm } from "./VjNameForm";
import { VjOrderRow } from "./VjOrderRow";
import { VjSetlistDeleteDialog } from "./VjSetlistDeleteDialog";
import { VjSetlistItemsEditor } from "./VjSetlistItemsEditor";
import { VjSetlistSettings } from "./VjSetlistSettings";
import {
  useVjSetlistItemsSender,
  useVjSetlistSettingsSender,
} from "./vjSetlistSlots";
import styles from "./VjSetlists.module.css";

/** The app's `--dur-fast`, for the swap between the rename form and the
 *  steps panel. */
const SWAP_SECONDS = 0.15;

/** What folds open under a sequence: one at a time. */
type VjSetlistRowPanel = "rename" | "items";

export interface VjSetlistRowProps {
  setlist: VjSetlistDTO;
  scenes: readonly VjSceneDTO[];
  /** The library's clips, newest first: the Add clip choices. */
  clips: readonly VjClipDTO[];
  clipsById: ReadonlyMap<string, VjClipDTO>;
  /** The live tempo for a run time in beats; null when none is known. */
  tempo: VjTempo | null;
  /** The row's index in the list, from 0. */
  position: number;
  total: number;
  isDragging: boolean;
  gripProps: { onPointerDown: (event: ReactPointerEvent) => void };
  onMove: (direction: -1 | 1) => void;
  /** Opens the steps panel once, for a sequence just created. */
  isItemsEditorOpenedOnCreate?: boolean;
}

/** Rename sequence: the name form with the PATCH behind it. */
function VjSetlistRenameForm({
  setlist,
  onDone,
}: {
  setlist: VjSetlistDTO;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { updateSetlist } = useVjSetlistMutations();
  const [refusal, setRefusal] = useState<unknown>(null);

  const rename = async (name: string) => {
    setRefusal(null);
    try {
      const renamed = await updateSetlist.mutateAsync({
        setlistId: setlist.id,
        name,
      });
      showToast(
        t("vj:librarySetlists.renamed", { name: renamed.name }),
        "success",
      );
      onDone();
    } catch (cause) {
      setRefusal(cause);
    }
  };

  return (
    <VjNameForm
      label={t("vj:librarySetlists.create.label")}
      initialName={setlist.name}
      submitLabel={t("vj:librarySetlists.renameSubmit")}
      maxLength={VJ_LIMITS.setlistNameMax}
      blankCode="VJ_SETLIST_NAME_REQUIRED"
      isPending={updateSetlist.isPending}
      refusal={refusal}
      onSubmit={(name) => void rename(name)}
      onCancel={onDone}
    />
  );
}

/**
 * One sequence: its name and step count, then Edit steps, rename and delete.
 * Rename and the steps panel (the sequence settings above its steps) fold
 * open under the row, one at a time, with a fade when switching between them.
 */
export function VjSetlistRow({
  setlist,
  scenes,
  clips,
  clipsById,
  tempo,
  position,
  total,
  isDragging,
  gripProps,
  onMove,
  isItemsEditorOpenedOnCreate = false,
}: VjSetlistRowProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  // The row keeps the writes, so its step count and the steps panel read
  // the values on their way, and a save outlives the panel folding away.
  const itemsSender = useVjSetlistItemsSender(setlist);
  const settingsSender = useVjSetlistSettingsSender(setlist);
  const [openPanel, setOpenPanel] = useState<VjSetlistRowPanel | null>(
    isItemsEditorOpenedOnCreate ? "items" : null,
  );
  const [hasTakenOpenRequest, setHasTakenOpenRequest] = useState(
    isItemsEditorOpenedOnCreate,
  );
  if (isItemsEditorOpenedOnCreate && !hasTakenOpenRequest) {
    setHasTakenOpenRequest(true);
    setOpenPanel("items");
  }
  // Keeps the last panel drawn while the fold closes, so it does not empty
  // mid-motion.
  const [lastPanel, setLastPanel] = useState<VjSetlistRowPanel>("items");
  if (openPanel !== null && openPanel !== lastPanel) setLastPanel(openPanel);
  const shownPanel = openPanel ?? lastPanel;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const renameButtonRef = useRef<HTMLButtonElement>(null);

  const toggle = (panel: VjSetlistRowPanel) => {
    setOpenPanel((currentPanel) => (currentPanel === panel ? null : panel));
  };

  const closeRename = () => {
    setOpenPanel(null);
    // The field that held focus folds away; focus goes back to its opener.
    renameButtonRef.current?.focus({ preventScroll: true });
  };

  const below = (
    <Collapse isOpen={openPanel !== null}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={shownPanel}
          className={styles.rowPanel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : SWAP_SECONDS }}
        >
          {shownPanel === "rename" ? (
            <VjSetlistRenameForm setlist={setlist} onDone={closeRename} />
          ) : (
            <>
              <VjSetlistSettings setlist={setlist} sender={settingsSender} />
              <VjSetlistItemsEditor
                setlist={setlist}
                sender={itemsSender}
                stepDuration={settingsSender.shownStepDuration}
                scenes={scenes}
                clips={clips}
                clipsById={clipsById}
                tempo={tempo}
              />
            </>
          )}
        </m.div>
      </AnimatePresence>
    </Collapse>
  );

  return (
    <VjOrderRow
      position={position}
      total={total}
      isDragging={isDragging}
      gripProps={gripProps}
      moveUpLabel={t("vj:librarySetlists.moveUp", { name: setlist.name })}
      moveDownLabel={t("vj:librarySetlists.moveDown", { name: setlist.name })}
      onMove={onMove}
      below={below}
    >
      <div className={styles.rowBody}>
        <span className={styles.rowMark} aria-hidden="true">
          <FiList fill="none" focusable="false" />
        </span>
        <span className={styles.rowText}>
          <span className={styles.rowName}>{setlist.name}</span>
          <span className={styles.rowMeta}>
            {t("vj:librarySetlists.stepCount", {
              count: itemsSender.visibleSlots.length,
            })}
          </span>
        </span>
        <span className={styles.rowActions}>
          <Button
            variant="quiet"
            size="sm"
            className={styles.editSteps}
            aria-expanded={openPanel === "items"}
            aria-label={t("vj:librarySetlists.editStepsAria", {
              name: setlist.name,
            })}
            onClick={() => toggle("items")}
          >
            {t("vj:librarySetlists.editSteps")}
          </Button>
          <IconButton
            ref={renameButtonRef}
            aria-label={t("vj:librarySetlists.renameAria", {
              name: setlist.name,
            })}
            aria-expanded={openPanel === "rename"}
            onClick={() => toggle("rename")}
          >
            <FiEdit2 aria-hidden="true" fill="none" focusable="false" />
          </IconButton>
          <IconButton
            aria-label={t("vj:librarySetlists.deleteAria", {
              name: setlist.name,
            })}
            onClick={() => setIsDeleteOpen(true)}
          >
            <FiTrash2 aria-hidden="true" fill="none" focusable="false" />
          </IconButton>
        </span>
      </div>
      <AnimatePresence>
        {isDeleteOpen && (
          <VjSetlistDeleteDialog
            setlist={setlist}
            onClose={() => setIsDeleteOpen(false)}
            onDeleted={() => setIsDeleteOpen(false)}
          />
        )}
      </AnimatePresence>
    </VjOrderRow>
  );
}
