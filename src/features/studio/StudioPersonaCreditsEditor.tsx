import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  STUDIO_DISCOVERY_LIMITS,
  type StudioCreditRole,
} from "./api/studio.types";
import { isSettledCreditError } from "./api/studioCreditCache";
import { useStudioCreditCandidate } from "./api/useStudioCreditCandidate";
import {
  useAddStudioPersonaCredit,
  useRemoveStudioPersonaCredit,
} from "./api/useStudioPersonaCreditMutations";
import { useStudioTrackPersonaCredits } from "./api/useStudioTrackPersonaCredits";
import { StudioCreditCandidateCard } from "./StudioCreditCandidateCard";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioPersonaCreditRow } from "./StudioPersonaCreditRow";
import { normalizeCreditHandle } from "./studioCreditHandle";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import css from "./StudioCreditEditor.module.css";

type EditorFocusTarget = "handle" | "limitNote";

/** Where focus goes once the control that held it leaves: the handle field,
 *  or the limit line while the field is folded away at the limit. Both live
 *  in a Collapse, so a target that is not mounted yet takes focus as soon as
 *  it mounts. The wait ends at the next focusOn call, the next key press or
 *  pointer press, or focus landing anywhere (a screen reader's browse mode
 *  moves focus without key events), so a late mount never pulls focus from
 *  where the member has moved on. */
function useCreditEditorFocus() {
  const elementsRef = useRef<Record<EditorFocusTarget, HTMLElement | null>>({
    handle: null,
    limitNote: null,
  });
  const pendingTargetRef = useRef<EditorFocusTarget | null>(null);
  useEffect(() => {
    const cancelPendingFocus = () => {
      pendingTargetRef.current = null;
    };
    const cancellingEvents = ["keydown", "pointerdown", "focusin"] as const;
    for (const eventName of cancellingEvents)
      document.addEventListener(eventName, cancelPendingFocus, true);
    return () => {
      for (const eventName of cancellingEvents)
        document.removeEventListener(eventName, cancelPendingFocus, true);
    };
  }, []);
  const attach = useCallback(
    (target: EditorFocusTarget, element: HTMLElement | null) => {
      elementsRef.current[target] = element;
      if (element && pendingTargetRef.current === target) {
        pendingTargetRef.current = null;
        element.focus();
      }
    },
    [],
  );
  const attachHandleField = useCallback(
    (element: HTMLInputElement | null) => attach("handle", element),
    [attach],
  );
  const attachLimitNote = useCallback(
    (element: HTMLParagraphElement | null) => attach("limitNote", element),
    [attach],
  );
  const focusOn = useCallback((target: EditorFocusTarget) => {
    const element = elementsRef.current[target];
    pendingTargetRef.current = element ? null : target;
    element?.focus();
  }, []);
  return { attachHandleField, attachLimitNote, focusOn };
}

/**
 * "Credit a persona": type an exact handle, confirm the preview card, pick a
 * role, add. Each row shows its status, and Remove credit works on every
 * row (a declined one is dismissed and still blocks a repeat request). No
 * persona search exists, so personas cannot be listed from here. Each add
 * and remove is its own request, apart from the track details form.
 */
export function StudioPersonaCreditsEditor({
  trackId,
  releaseId,
}: {
  trackId: string;
  releaseId: string;
}) {
  const { t } = useTranslation();
  const hintId = useId();
  const handleFieldId = useId();
  const { attachHandleField, attachLimitNote, focusOn } =
    useCreditEditorFocus();
  const { rows, loadState: rowsLoadState } =
    useStudioTrackPersonaCredits(trackId);
  const [handleInput, setHandleInput] = useState("");
  const [lookupHandle, setLookupHandle] = useState<string | null>(null);
  const { candidate, loadState: candidateLoadState } =
    useStudioCreditCandidate(lookupHandle);
  const [role, setRole] = useState<StudioCreditRole>("featured");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const addCredit = useAddStudioPersonaCredit();
  const removeCredit = useRemoveStudioPersonaCredit();
  const limit = STUDIO_DISCOVERY_LIMITS.personaCreditsPerTrack;
  const isLimitReached = rows.length >= limit;
  // The field waits for the rows, so a track at the limit never flashes it.
  const isHandleFieldShown = !rowsLoadState.isLoading && !isLimitReached;
  // The field folds away at the limit, so focus lands on the limit line.
  const focusAfterRowCount = (rowCount: number) =>
    focusOn(rowCount >= limit ? "limitNote" : "handle");

  function findPersona() {
    const handle = normalizeCreditHandle(handleInput);
    setErrorKey(null);
    setLookupHandle(handle.length > 0 ? handle : null);
    // An empty Find lands on the field, which reads out the hint above it.
    if (handle.length === 0) focusOn("handle");
  }

  function clearLookup() {
    setLookupHandle(null);
    setHandleInput("");
  }

  async function addFoundCredit() {
    if (!candidate || !lookupHandle || addCredit.isPending) return;
    setErrorKey(null);
    const rowCountAfter = rows.length + 1;
    try {
      await addCredit.mutateAsync({
        trackId,
        releaseId,
        handle: lookupHandle,
        role,
      });
      setStatusMessage(
        t("studio:credits.editor.added", { name: candidate.name }),
      );
      clearLookup();
      focusAfterRowCount(rowCountAfter);
    } catch (error) {
      setErrorKey(studioErrorMessageKeyOf(error));
    }
  }

  async function removeRow(creditId: string) {
    if (removeCredit.isPending) return;
    setErrorKey(null);
    const rowCountAfter = rows.length - 1;
    try {
      await removeCredit.mutateAsync({ trackId, releaseId, creditId });
      setStatusMessage(t("studio:credits.editor.removed"));
    } catch (error) {
      setErrorKey(studioErrorMessageKeyOf(error));
      // The row and its focused button stay, unless the server says the
      // credit is already settled: then the row leaves as well.
      if (!isSettledCreditError(error)) return;
    }
    // The pressed button left with its row.
    focusAfterRowCount(rowCountAfter);
  }

  return (
    <fieldset className={css.editor} aria-describedby={hintId}>
      <legend className={css.legend}>
        {t("studio:credits.editor.heading")}
      </legend>
      <p id={hintId} className={css.hint}>
        {t("studio:credits.editor.hint")}
      </p>
      <Collapse isOpen={isHandleFieldShown}>
        <label htmlFor={handleFieldId} className={css.fieldLabel}>
          {t("studio:credits.editor.handleLabel")}
        </label>
        <div className={css.lookupRow}>
          <input
            id={handleFieldId}
            ref={attachHandleField}
            type="text"
            value={handleInput}
            maxLength={STUDIO_DISCOVERY_LIMITS.creditHandleMaxLength + 1}
            autoComplete="off"
            spellCheck={false}
            aria-describedby={hintId}
            onChange={(event) => {
              setHandleInput(event.target.value);
              // A previewed card belongs to the handle that found it.
              setLookupHandle(null);
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              findPersona();
            }}
          />
          <Button variant="ghost" onClick={findPersona}>
            {t("studio:credits.editor.findCta")}
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={isLimitReached}>
        <p ref={attachLimitNote} className={css.note} tabIndex={-1}>
          {t("studio:credits.editor.limit", { limit })}
        </p>
      </Collapse>
      <Collapse isOpen={lookupHandle !== null && isHandleFieldShown}>
        <StudioCreditCandidateCard
          candidate={candidate}
          loadState={candidateLoadState}
          role={role}
          onRoleChange={(nextRole) => {
            setRole(nextRole);
            setErrorKey(null);
          }}
          onAdd={() => void addFoundCredit()}
          onClear={() => {
            clearLookup();
            focusOn("handle");
          }}
          isAdding={addCredit.isPending}
        />
      </Collapse>
      <Collapse isOpen={errorKey !== null}>
        <p className={css.error} role="alert">
          {/* `limit` fills the limit line (studio_credit_limit maps to it);
              every other key ignores it. */}
          {errorKey ? t(errorKey, { limit }) : null}
        </p>
      </Collapse>
      <Collapse isOpen={rowsLoadState.isError}>
        <StudioLoadError loadState={rowsLoadState} />
      </Collapse>
      <ul
        className={css.rows}
        aria-label={t("studio:credits.editor.listLabel")}
      >
        <AnimatePresence initial={false}>
          {rows.map((row) => (
            <StudioPersonaCreditRow
              key={row.id}
              row={row}
              onRemove={() => void removeRow(row.id)}
              isBusy={removeCredit.isPending}
            />
          ))}
        </AnimatePresence>
      </ul>
      <p className="visuallyHidden" role="status">
        {statusMessage}
      </p>
    </fieldset>
  );
}
