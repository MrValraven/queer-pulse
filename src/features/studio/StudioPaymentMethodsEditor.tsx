import { useEffect, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence } from "motion/react";
import { CollapseListItem } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  isGivingDraftDirty,
  validateGivingDraft,
  type GivingDraft,
} from "../communities/giving/givingDraft";
import { GivingMethodEditorRow } from "../communities/giving/GivingMethodEditorRow";
import { useGivingDraft } from "../communities/giving/useGivingDraft";
import type { StudioArtistRefView } from "./api/studio.adapters";
import {
  paymentMethodErrorIndexOf,
  type StudioPaymentMethodsView,
} from "./api/studioPurchases.adapters";
import { useSaveStudioPaymentMethods } from "./api/useStudioPaymentMethods";
import {
  focusMovedRowControl,
  givingDraftOf,
  replaceBodyOf,
  saveFailureLineOf,
} from "./studioPaymentMethodsDraft";
import {
  PaymentMethodsAddArea,
  PaymentMethodsNotices,
  PaymentMethodsSaveArea,
} from "./StudioPaymentMethodsParts";
import styles from "./StudioGettingPaid.module.css";

interface SaveFailure {
  line: string;
  /** The draft that was refused; the line hides once the draft changes. */
  draft: GivingDraft;
}

/**
 * One persona's Getting paid editor. The draft starts once from the stored
 * list (the section keys this editor by persona id), so a background refetch
 * never resets what is being typed. Errors show per row after its first blur
 * and on every row once Save has been tried. A refusal from the server names
 * its reason, and names the row when the server did.
 */
export function StudioPaymentMethodsEditor({
  persona,
  paymentMethods,
}: {
  persona: StudioArtistRefView;
  paymentMethods: StudioPaymentMethodsView;
}) {
  const { t } = useTranslation();
  const { save, isSaving } = useSaveStudioPaymentMethods(persona.id);
  const [initialDraft] = useState(() => givingDraftOf(paymentMethods));
  const { draft, updateRow, addRow, removeRow, moveRow, isAtCap } =
    useGivingDraft(initialDraft);
  const [savedDraft, setSavedDraft] = useState<GivingDraft | null>(null);
  const [saveFailure, setSaveFailure] = useState<SaveFailure | null>(null);
  const [blurredRowIds, setBlurredRowIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [hasTriedSave, setHasTriedSave] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const valueInputs = useRef(new Map<string, HTMLInputElement>());
  const refusedRowId = useRef<string | null>(null);
  const errors = validateGivingDraft(draft);
  const isDirty = isGivingDraftDirty(draft, savedDraft ?? initialDraft);
  const isLastWayWarned =
    paymentMethods.hasItemsForSale && draft.rows.length === 0;
  const isSavedShown = savedDraft !== null && savedDraft === draft;
  const isFailureShown = saveFailure?.draft === draft && !isSavedShown;

  // A refused row's value takes focus once the rows are enabled again.
  useEffect(() => {
    const draftId = refusedRowId.current;
    if (draftId === null || isSaving) return;
    refusedRowId.current = null;
    valueInputs.current.get(draftId)?.focus();
  });

  const markBlurred = (draftId: string) =>
    setBlurredRowIds((previous) =>
      previous.has(draftId) ? previous : new Set(previous).add(draftId),
    );

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
    focusMovedRowControl(formRef.current, draftId, offset);
  };

  const saveDraft = async (submittedDraft: GivingDraft) => {
    const body = replaceBodyOf(submittedDraft);
    if (body === null) {
      flushSync(() => setHasTriedSave(true));
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
      return;
    }
    try {
      await save(body);
      setSavedDraft(submittedDraft);
    } catch (error) {
      const rowIndex = paymentMethodErrorIndexOf(error);
      setSaveFailure({
        line: saveFailureLineOf(t, error, rowIndex),
        draft: submittedDraft,
      });
      const refusedRow =
        rowIndex === null ? undefined : submittedDraft.rows[rowIndex];
      if (refusedRow) refusedRowId.current = refusedRow.draftId;
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving || !isDirty) return;
    void saveDraft(draft);
  };

  return (
    <form
      ref={formRef}
      className={styles.editor}
      noValidate
      onSubmit={handleSubmit}
    >
      <ul
        className={styles.rows}
        aria-label={t("studio:paymentMethods.listLabel", {
          name: persona.name,
        })}
      >
        <AnimatePresence initial={false}>
          {draft.rows.map((row, rowIndex) => (
            <CollapseListItem key={row.draftId}>
              <GivingMethodEditorRow
                row={row}
                position={rowIndex + 1}
                total={draft.rows.length}
                errors={errors.rows[row.draftId] ?? {}}
                isErrorVisible={hasTriedSave || blurredRowIds.has(row.draftId)}
                isBusy={isSaving}
                legendKey="studio:paymentMethods.rowLegend"
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
      <PaymentMethodsNotices
        isEmpty={draft.rows.length === 0}
        isLastWayWarned={isLastWayWarned}
        personaName={persona.name}
      />
      <PaymentMethodsAddArea
        addButtonRef={addButtonRef}
        isAtCap={isAtCap}
        isSaving={isSaving}
        onAdd={handleAdd}
      />
      <PaymentMethodsSaveArea
        isDisabled={isSaving || !isDirty}
        isSavedShown={isSavedShown}
        failureLine={saveFailure?.line}
        isFailureShown={isFailureShown}
        personaName={persona.name}
      />
    </form>
  );
}
