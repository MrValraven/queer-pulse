import { AnimatePresence, m } from "motion/react";
import { useId, useRef, useState, type FormEvent, type RefObject } from "react";
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
import { formatDate } from "../../../shared/lib/date";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useUpdateVjClip } from "../api/useVjClipMutations";
import { VjReasonLine } from "../VjReasonLine";
import { formatVjBytes } from "../vjFormat";
import { VjClipDeleteDialog } from "./VjClipDeleteDialog";
import { VjClipPacks } from "./VjClipPacks";
import { VjClipPreview } from "./VjClipPreview";
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

/** Every edit of one clip: preview, title, fit, packs and delete. */
export function VjClipDialog({
  clip,
  packs,
  currentPackId,
  onClose,
}: VjClipDialogProps) {
  const { t, language } = useTranslation();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const updateFit = useUpdateVjClip();
  const [chosenFit, setChosenFit] = useState<VjFitMode | null>(null);
  if (chosenFit !== null && chosenFit === clip.fitMode) setChosenFit(null);
  const shownFit = chosenFit ?? clip.fitMode;

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
        initialFocusRef={titleInputRef}
        onClose={onClose}
        footer={
          // Bare buttons, so the phone sheet shares the row between them.
          <>
            <Button
              variant="danger"
              className={styles.deleteOpen}
              onClick={() => setIsDeleteOpen(true)}
            >
              {t("vj:clipDialog.deleteOpen")}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {t("admin:common.close")}
            </Button>
          </>
        }
      >
        <div className={styles.dialogBody}>
          <VjClipPreview clip={{ ...clip, fitMode: shownFit }} />
          <VjClipTitleField clip={clip} inputRef={titleInputRef} />
          <VjClipFitField
            fitMode={shownFit}
            error={updateFit.error}
            onChange={chooseFit}
          />
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
      <FormField label={t("vj:clipDialog.titleLabel")}>
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
