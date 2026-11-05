import { createElement, useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiAlertCircle, FiInfo } from "react-icons/fi";
import { Button, Collapse, FormField } from "../../shared/components/ui";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileView } from "./api/subprofiles.adapters";
import type { SubprofileKind } from "./api/subprofiles.api";
import { useChangeSubprofileKind } from "./api/useSubprofileMutations";
import { KIND_FAMILIES } from "./kindFamilies.data";
import { describePersonaKindChangeError } from "./personaKindChangeCopy";
import { KIND_LABEL_KEYS, kindIcon } from "./subprofile-kinds";
import { kindsSwitchableFrom, SKIN_OF } from "./subprofile-skins";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { SubprofileKindChangeDialog } from "./SubprofileKindChangeDialog";
import { SubprofileKindPicker } from "./SubprofileKindPicker";
import { useHeldKindChange } from "./useHeldKindChange";
import styles from "./SubprofileKindField.module.css";

/** The helper under the Type label: an "Other" persona may take any type,
 *  a type alone in its group stays as it is, and every other type picks
 *  from its own group. */
function kindFieldHelper(
  kind: SubprofileKind,
  hasSwitchableKinds: boolean,
  t: TFunction,
): string {
  if (kind === "generic") return t("subprofiles:kindChange.helpGeneric");
  const familyGroup = KIND_FAMILIES.find(
    (candidate) => candidate.family === SKIN_OF[kind],
  );
  const family = familyGroup ? t(familyGroup.labelKey) : SKIN_OF[kind];
  if (!hasSwitchableKinds) {
    return t("subprofiles:kindChange.onlyType", {
      kind: t(KIND_LABEL_KEYS[kind]),
      family,
    });
  }
  return t("subprofiles:kindChange.help", { family });
}

/**
 * The Identity pane's "Type" field: the persona's current type with a
 * "Change type" toggle that folds open the types it may switch to. Picking
 * one opens a confirmation naming the sections the switch hides, adds and
 * keeps. The change saves on its own, outside the editor's global Save, so it
 * waits until the editor has nothing unsaved. On success the dialog and list
 * fold away, then the editor re-seeds from the new type and the hook shows
 * the toast; a refusal is named here as an inline alert.
 */
export function SubprofileKindField({
  subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const { t } = useTranslation();
  const { dirty, saving } = useSubprofileEditorContext();
  const changeKind = useChangeSubprofileKind(subprofile.id);
  const heldChange = useHeldKindChange(changeKind.applyKindChange);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pendingKind, setPendingKind] = useState<SubprofileKind | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pickerId = useId();
  const hintId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  const isChangeBlocked = dirty || saving;
  // An edit folds the list away, so it stays shut after Save until the owner
  // opens it again.
  if (isChangeBlocked && isPickerOpen) setIsPickerOpen(false);
  const isPickerShown = isPickerOpen && !isChangeBlocked;
  const switchableKinds = kindsSwitchableFrom(subprofile.kind);
  const hasSwitchableKinds = switchableKinds.length > 0;

  // The bottom close button sits far below the toggle in the long list, so
  // focus goes back up to the toggle as the list folds away.
  const closePickerFromBottom = () => {
    setIsPickerOpen(false);
    toggleRef.current?.focus();
  };

  const pickKind = (kind: SubprofileKind) => {
    setErrorMessage(null);
    setPendingKind(kind);
  };

  const confirmChange = () => {
    if (pendingKind === null) return;
    const requestedKind = pendingKind;
    void changeKind
      .mutateAsync(requestedKind)
      .then((saved) => {
        // Applied once the dialog and, when open, the list have folded away
        // (their onExitComplete handlers below).
        heldChange.hold(saved, isPickerShown ? 2 : 1);
        setPendingKind(null);
        setIsPickerOpen(false);
      })
      .catch((error: unknown) => {
        setPendingKind(null);
        setErrorMessage(
          describePersonaKindChangeError(error, requestedKind, t),
        );
      });
  };

  return (
    <div className={styles.kindField}>
      <FormField
        className={styles.formField}
        label={t("subprofiles:kindChange.label")}
        helper={kindFieldHelper(subprofile.kind, hasSwitchableKinds, t)}
      >
        {/* A fragment keeps FormField from wiring its label to the row:
            the row holds a name and a button, and neither is the field's
            input. */}
        <>
          <div className={styles.current}>
            <span className={styles.kindName}>
              {createElement(kindIcon(subprofile.kind), {
                "aria-hidden": true,
                className: styles.kindIcon,
              })}
              {t(KIND_LABEL_KEYS[subprofile.kind])}
            </span>
            {hasSwitchableKinds && (
              <Button
                ref={toggleRef}
                variant="ghost"
                size="sm"
                className={styles.toggle}
                aria-expanded={isPickerShown}
                aria-controls={pickerId}
                aria-describedby={isChangeBlocked ? hintId : undefined}
                disabled={isChangeBlocked}
                onClick={() => setIsPickerOpen((isOpen) => !isOpen)}
              >
                {t(
                  isPickerShown
                    ? "subprofiles:kindChange.close"
                    : "subprofiles:kindChange.open",
                )}
              </Button>
            )}
          </div>
        </>
      </FormField>

      {hasSwitchableKinds && (
        <Collapse isOpen={isChangeBlocked}>
          <p id={hintId} className={styles.hint}>
            <FiInfo aria-hidden className={styles.noteIcon} />
            <span>{t("subprofiles:kindChange.saveFirst")}</span>
          </p>
        </Collapse>
      )}

      <Collapse isOpen={errorMessage !== null}>
        <p role="alert" className={styles.error}>
          <FiAlertCircle aria-hidden className={styles.noteIcon} />
          <span>{errorMessage}</span>
        </p>
      </Collapse>

      {/* Always mounted, so the toggle's aria-controls names an element on
          the page while the list is folded away. */}
      <div id={pickerId}>
        <Collapse
          isOpen={hasSwitchableKinds && isPickerShown}
          onExitComplete={heldChange.release}
        >
          <div className={styles.fold}>
            <SubprofileKindPicker
              currentKind={subprofile.kind}
              pendingKind={pendingKind}
              onPickKind={pickKind}
              onClose={closePickerFromBottom}
            />
          </div>
        </Collapse>
      </div>

      <AnimatePresence onExitComplete={heldChange.release}>
        {pendingKind !== null && (
          <SubprofileKindChangeDialog
            currentKind={subprofile.kind}
            nextKind={pendingKind}
            isSaving={changeKind.isPending}
            onConfirm={confirmChange}
            onClose={() => setPendingKind(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
