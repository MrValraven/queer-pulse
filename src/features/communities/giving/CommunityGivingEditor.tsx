import { useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence } from "motion/react";
import { FiPlus } from "react-icons/fi";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { isAccountRestricted } from "../../../shared/api/errorMessage";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  Button,
  Collapse,
  CollapseListItem,
  ConfirmDialog,
  FormField,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityGivingDTO } from "../api/communityGiving.api";
import { useSaveCommunityGiving } from "../api/useCommunityGiving";
import { GIVING_LIMITS } from "./givingConstants";
import {
  draftFromGiving,
  draftToBody,
  isGivingDraftDirty,
  validateGivingDraft,
} from "./givingDraft";
import { GivingMethodEditorRow } from "./GivingMethodEditorRow";
import { useGivingDraft } from "./useGivingDraft";
import givingStyles from "./Giving.module.css";
import styles from "./GivingEditor.module.css";

const INTRO_FIELD_ID = "intro";
const EDITOR_KEY = "communities:detail.giving.editor";

interface CommunityGivingEditorProps {
  slug: string;
  communityName: string;
  /** The section as it stood when the editor opened. Read once. */
  giving: CommunityGivingDTO | null;
  /** Closes the editor; a save passes the stored section, so the tab can
   *  wait for its data to match before it moves focus. */
  onClose: (saved?: CommunityGivingDTO) => void;
}

/**
 * The owner's inline editor for the support section. The draft starts once
 * from `giving`, so a background refetch or a language switch never resets
 * what is being typed. Errors show per row after its first blur, and on every
 * row once Save has been tried; Save sends nothing while any field is
 * invalid and puts focus on the first one. Values go out normalized.
 */
export function CommunityGivingEditor({
  slug,
  communityName,
  giving,
  onClose,
}: CommunityGivingEditorProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const save = useSaveCommunityGiving(slug);
  const [initialDraft] = useState(() => draftFromGiving(giving));
  const { draft, setIntro, updateRow, addRow, removeRow, moveRow, isAtCap } =
    useGivingDraft(initialDraft);
  const [blurredFieldIds, setBlurredFieldIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [hasTriedSave, setHasTriedSave] = useState(false);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const valueInputs = useRef(new Map<string, HTMLInputElement>());
  const methodsLabelId = useId();
  const errors = validateGivingDraft(draft);
  const isBusy = save.isPending;

  const isErrorVisible = (fieldId: string) =>
    hasTriedSave || blurredFieldIds.has(fieldId);
  const markBlurred = (fieldId: string) =>
    setBlurredFieldIds((previous) =>
      previous.has(fieldId) ? previous : new Set(previous).add(fieldId),
    );

  // Focus moves right after each list change commits (flushSync), so the
  // keyboard lands on the new row, the Add button or the moved control.
  const handleAdd = () => {
    const newDraftId = flushSync(() => addRow());
    if (newDraftId) valueInputs.current.get(newDraftId)?.focus();
  };
  const handleRemove = (draftId: string) => {
    flushSync(() => removeRow(draftId));
    addButtonRef.current?.focus();
  };
  const handleMove = (draftId: string, offset: -1 | 1) => {
    flushSync(() => moveRow(draftId, offset));
    const rowElement = formRef.current?.querySelector(
      `[data-giving-row="${draftId}"]`,
    );
    const direction = offset < 0 ? "up" : "down";
    const target =
      rowElement?.querySelector<HTMLButtonElement>(
        `[data-giving-move="${direction}"]:not(:disabled)`,
      ) ??
      rowElement?.querySelector<HTMLButtonElement>(
        "[data-giving-move]:not(:disabled)",
      );
    target?.focus();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy) return;
    const body = draftToBody(draft);
    if (body === null) {
      flushSync(() => setHasTriedSave(true));
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
      return;
    }
    save.mutate(body, {
      onSuccess: (saved) => {
        showToast(t(`${EDITOR_KEY}.savedToast`), "success");
        onClose(saved);
      },
      // The mutation is a silentError one, so the editor names a moderation
      // restriction itself, with the copy the global handler uses.
      onError: (error) =>
        showToast(
          t(
            isAccountRestricted(error)
              ? "shared:apiError.accountRestricted"
              : `${EDITOR_KEY}.errorToast`,
          ),
          "error",
        ),
    });
  };

  const handleCancel = () => {
    if (isGivingDraftDirty(draft, initialDraft)) setIsDiscardOpen(true);
    else onClose();
  };

  return (
    <form
      ref={formRef}
      className={styles.editor}
      aria-label={t("communities:detail.giving.heading", {
        name: communityName,
      })}
      noValidate
      onSubmit={handleSubmit}
    >
      {/* Tells the owner they are editing; the eyebrow above names the
          section and the field labels below share its small caps. */}
      <h3 className={`${givingStyles.emptyTitle} ${styles.editorTitle}`}>
        {t(`${EDITOR_KEY}.editingTitle`)}
      </h3>
      <FormField
        label={t(`${EDITOR_KEY}.introLabel`)}
        helper={t(`${EDITOR_KEY}.introHelper`, { max: GIVING_LIMITS.introMax })}
        error={
          errors.intro && isErrorVisible(INTRO_FIELD_ID)
            ? t("communities:detail.giving.error.tooLong", {
                max: GIVING_LIMITS.introMax,
              })
            : undefined
        }
      >
        <textarea
          rows={3}
          maxLength={GIVING_LIMITS.introMax}
          placeholder={t(`${EDITOR_KEY}.introPlaceholder`)}
          value={draft.intro}
          disabled={isBusy}
          onChange={(event) => setIntro(event.target.value)}
          onBlur={() => markBlurred(INTRO_FIELD_ID)}
        />
      </FormField>

      <p id={methodsLabelId} className={styles.groupLabel}>
        {t(`${EDITOR_KEY}.methodsLabel`)}
      </p>
      <ul className={styles.rows} aria-labelledby={methodsLabelId}>
        <AnimatePresence initial={false}>
          {draft.rows.map((row, rowIndex) => (
            <CollapseListItem key={row.draftId}>
              <GivingMethodEditorRow
                row={row}
                position={rowIndex + 1}
                total={draft.rows.length}
                errors={errors.rows[row.draftId] ?? {}}
                isErrorVisible={isErrorVisible(row.draftId)}
                isBusy={isBusy}
                valueInputRef={(element) => {
                  if (element) valueInputs.current.set(row.draftId, element);
                  return () => {
                    valueInputs.current.delete(row.draftId);
                  };
                }}
                onChange={(patch) => updateRow(row.draftId, patch)}
                onBlurField={() => markBlurred(row.draftId)}
                onMoveUp={() => handleMove(row.draftId, -1)}
                onMoveDown={() => handleMove(row.draftId, 1)}
                onRemove={() => handleRemove(row.draftId)}
              />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>

      <GivingEditorActions
        addButtonRef={addButtonRef}
        isAtCap={isAtCap}
        isBusy={isBusy}
        isDemoMode={demoMode}
        onAdd={handleAdd}
        onCancel={handleCancel}
      />

      <AnimatePresence>
        {isDiscardOpen && (
          <ConfirmDialog
            open
            onClose={() => setIsDiscardOpen(false)}
            onConfirm={() => {
              setIsDiscardOpen(false);
              onClose();
            }}
            title={t(`${EDITOR_KEY}.discardTitle`)}
            description={t(`${EDITOR_KEY}.discardBody`)}
            confirmLabel={t(`${EDITOR_KEY}.discardCta`)}
            cancelLabel={t(`${EDITOR_KEY}.keepEditingCta`)}
            tone="destructive"
          />
        )}
      </AnimatePresence>
    </form>
  );
}

interface GivingEditorActionsProps {
  addButtonRef: RefObject<HTMLButtonElement | null>;
  isAtCap: boolean;
  isBusy: boolean;
  isDemoMode: boolean;
  onAdd: () => void;
  onCancel: () => void;
}

/** The editor's lower half: Add (with the cap note), the history and demo
 *  notes, then Cancel and Save. */
function GivingEditorActions({
  addButtonRef,
  isAtCap,
  isBusy,
  isDemoMode,
  onAdd,
  onCancel,
}: GivingEditorActionsProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.addArea}>
        <Button
          ref={addButtonRef}
          variant="ghost"
          size="sm"
          className={styles.addButton}
          disabled={isAtCap || isBusy}
          onClick={onAdd}
        >
          <FiPlus aria-hidden />
          {t(`${EDITOR_KEY}.addCta`)}
        </Button>
        <Collapse isOpen={isAtCap}>
          <p className={styles.note}>
            {t(`${EDITOR_KEY}.capReached`, { max: GIVING_LIMITS.maxMethods })}
          </p>
        </Collapse>
      </div>

      <p className={styles.note}>{t(`${EDITOR_KEY}.historyNote`)}</p>
      <Collapse isOpen={isDemoMode}>
        <p className={styles.note}>{t(`${EDITOR_KEY}.demoNote`)}</p>
      </Collapse>

      <div className={styles.footer}>
        <Button variant="ghost" disabled={isBusy} onClick={onCancel}>
          {t(`${EDITOR_KEY}.cancelCta`)}
        </Button>
        <Button type="submit" variant="primary" disabled={isBusy}>
          {t(isBusy ? `${EDITOR_KEY}.savingCta` : `${EDITOR_KEY}.saveCta`)}
        </Button>
      </div>
    </>
  );
}
