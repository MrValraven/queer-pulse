import { AnimatePresence, m } from "motion/react";
import {
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { FiTrash2 } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  VJ_FIT_MODES,
  VJ_LIMITS,
  type VjClipDTO,
  type VjFitMode,
  type VjPackDTO,
} from "../../../shared/contracts/vj";
import {
  Button,
  Collapse,
  FormField,
  Modal,
  SegmentedControl,
} from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useMediaQuery } from "../../../shared/hooks";
import { formatDate } from "../../../shared/lib/date";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useUpdateVjClip } from "../api/useVjClipMutations";
import { VjReasonLine } from "../VjReasonLine";
import { formatVjBytes } from "../vjFormat";
import { VjClipDeleteDialog } from "./VjClipDeleteDialog";
import { VjClipFavoriteButton } from "./VjClipFavoriteButton";
import { VjClipPacks } from "./VjClipPacks";
import { VjClipPlaybackFields } from "./VjClipPlaybackFields";
import { VjClipPreview } from "./VjClipPreview";
import { useVjClipPlaybackDraft } from "./useVjClipPlaybackDraft";
import playbackStyles from "./VjClipPlayback.module.css";
import styles from "./VjClips.module.css";

const EASE = [0.22, 0.68, 0.16, 1] as const;

function isVjFitMode(value: string): value is VjFitMode {
  return (VJ_FIT_MODES as readonly string[]).includes(value);
}

interface VjClipDialogProps {
  clip: VjClipDTO;
  packs: VjPackDTO[];
  currentPackId: string | null;
  onClose: () => void;
}

/** Every edit of one clip: preview, title and favorite, fit, playback,
 *  packs and delete. */
export function VjClipDialog({
  clip,
  packs,
  currentPackId,
  onClose,
}: VjClipDialogProps) {
  const { t, language } = useTranslation();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");
  // On touch, focusing the title would raise the keyboard over the sheet, so
  // focus lands on the dialog itself and a screen reader reads its heading.
  const dialogFocusRef = useMemo<RefObject<HTMLElement | null>>(
    () => ({
      get current() {
        return bodyRef.current?.closest<HTMLElement>('[role="dialog"]') ?? null;
      },
    }),
    [],
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const updateFit = useUpdateVjClip();
  const [chosenFit, setChosenFit] = useState<VjFitMode | null>(null);
  if (chosenFit !== null && chosenFit === clip.fitMode) setChosenFit(null);
  const shownFit = chosenFit ?? clip.fitMode;
  const playback = useVjClipPlaybackDraft(clip);

  const chooseFit = (value: string) => {
    if (!isVjFitMode(value) || value === shownFit) return;
    setChosenFit(value);
    updateFit.mutate(
      { clipId: clip.id, fitMode: value },
      { onError: () => setChosenFit(null) },
    );
  };

  const date = formatDate(clip.createdAt, language);

  return (
    <>
      <Modal
        title={t("vj:clipDialog.title")}
        wide
        initialFocusRef={isCoarsePointer ? dialogFocusRef : titleInputRef}
        onClose={onClose}
        footer={
          // Bare buttons, so the phone sheet shares the row between them.
          <>
            <Button
              variant="quiet"
              className={styles.deleteOpen}
              onClick={() => setIsDeleteOpen(true)}
            >
              <FiTrash2 aria-hidden="true" fill="none" focusable="false" />
              {t("vj:clipDialog.deleteOpen")}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {t("admin:common.close")}
            </Button>
          </>
        }
      >
        <div ref={bodyRef} className={styles.dialogBody}>
          <VjClipPreview
            clip={{ ...clip, fitMode: shownFit }}
            playback={playback.previewPlayback}
            scrubMs={playback.scrubMs}
          />
          <div className={playbackStyles.titleRow}>
            <VjClipTitleField clip={clip} inputRef={titleInputRef} />
            <VjClipFavoriteButton
              clip={clip}
              className={playbackStyles.titleStar}
            />
          </div>
          <VjClipFitField
            fitMode={shownFit}
            error={updateFit.error}
            onChange={chooseFit}
          />
          <VjClipPlaybackFields clip={clip} draft={playback} />
          <div className={styles.details}>
            <p>
              {t("vj:clipDialog.details", {
                width: clip.width,
                height: clip.height,
                size: formatVjBytes(clip.byteSize),
              })}
            </p>
            <p>
              {clip.createdBy === null
                ? t("vj:clipDialog.addedOn", { date })
                : t("vj:clipDialog.addedBy", {
                    name: clip.createdBy.displayName,
                    date,
                  })}
            </p>
          </div>
          <VjClipPacks
            clip={clip}
            packs={packs}
            currentPackId={currentPackId}
          />
        </div>
      </Modal>
      <AnimatePresence>
        {isDeleteOpen && (
          <VjClipDeleteDialog
            clip={clip}
            onClose={() => setIsDeleteOpen(false)}
            onDeleted={() => {
              setIsDeleteOpen(false);
              onClose();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function VjClipTitleField({
  clip,
  inputRef,
}: {
  clip: VjClipDTO;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const updateTitle = useUpdateVjClip();
  const [draft, setDraft] = useState(clip.title);
  const [baseline, setBaseline] = useState(clip.title);
  // A rename from elsewhere replaces the field only while it holds no edit.
  if (clip.title !== baseline) {
    setBaseline(clip.title);
    if (draft.trim() === baseline.trim()) setDraft(clip.title);
  }
  const trimmed = draft.trim();
  const isChanged = trimmed !== clip.title;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isChanged || updateTitle.isPending) return;
    updateTitle.mutate(
      { clipId: clip.id, title: trimmed },
      {
        onSuccess: (updated) => {
          setDraft(updated.title);
          showToast(t("vj:clipDialog.titleSaved"), "success");
        },
      },
    );
  };

  return (
    <form className={styles.titleForm} onSubmit={submit}>
      <FormField
        label={t("vj:clipDialog.titleLabel")}
        className={styles.titleField}
      >
        <input
          ref={inputRef}
          type="text"
          value={draft}
          maxLength={VJ_LIMITS.clipTitleMax}
          onChange={(event) => {
            setDraft(event.target.value);
            if (updateTitle.isError) updateTitle.reset();
          }}
        />
      </FormField>
      <Collapse isOpen={isChanged}>
        <div className={styles.formActions}>
          <Button
            type="submit"
            size="sm"
            aria-disabled={updateTitle.isPending || undefined}
          >
            {t("vj:clipDialog.saveTitle")}
          </Button>
        </div>
      </Collapse>
      <VjReasonLine error={updateTitle.error} />
    </form>
  );
}

function VjClipFitField({
  fitMode,
  error,
  onChange,
}: {
  fitMode: VjFitMode;
  error: unknown;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const labelId = useId();
  const fade = reducedMotion ? { duration: 0 } : { duration: 0.15, ease: EASE };

  return (
    <div className={styles.fitField}>
      <span id={labelId} className={styles.fieldLabel}>
        {t("vj:clipDialog.fitLabel")}
      </span>
      <SegmentedControl
        className={playbackStyles.tray}
        labelledBy={labelId}
        value={fitMode}
        onChange={onChange}
        options={VJ_FIT_MODES.map((mode) => ({
          value: mode,
          label: t(`vj:clipDialog.fit.${mode}`),
        }))}
      />
      <AnimatePresence mode="wait" initial={false}>
        <m.p
          key={fitMode}
          className={styles.fitHint}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
        >
          {t(`vj:clipDialog.fitHint.${fitMode}`)}
        </m.p>
      </AnimatePresence>
      <VjReasonLine error={error} />
    </div>
  );
}
