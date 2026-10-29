import { useEffect, useId, useRef, useState } from "react";
import { Button, Collapse, RadioCardGroup } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  SUPPORTER_ACCOUNT_KEY,
  type StudioSupporterOptionView,
} from "./api/studioListening.adapters";
import {
  studioErrorMessageKey,
  studioErrorMessageKeyOf,
} from "./studioErrors.data";
import { StudioSupporterIdentity } from "./StudioSupporterIdentity";
import { studioReasonCopyKey } from "./studioReason";
import styles from "./StudioSupporter.module.css";

interface StudioSupporterIdentityPickerProps {
  personaName: string;
  options: StudioSupporterOptionView[];
  initialShownAsSubprofileId: string | null;
  isSaving: boolean;
  /** The refusal's catalog key, shown under the options; null when none. */
  errorKey: string | null;
  /** True when the member opened the picker; a picker the card opened on
   *  its own (an unreadable identity on page load) leaves focus alone. */
  shouldFocusOnOpen: boolean;
  onSave: (shownAsSubprofileId: string | null) => void;
  onClose: () => void;
  /** Replaces the "How {persona} sees you" legend. */
  legend?: string;
  /** False hides Save and Close (a picker that reports each change through
   *  `onSelect` instead). Defaults to true. */
  shouldShowActions?: boolean;
  /** Every change of the pick; the account arrives as null. */
  onSelect?: (shownAsSubprofileId: string | null) => void;
  /** True starts with no card checked and keeps Save disabled until the
   *  member picks (an identity that is gone has nothing to preselect). */
  isPickUnset?: boolean;
}

/** A refused save as a catalog key: a Studio code names its own line (the
 *  identity is not yours, the artist is unavailable), else the reason. */
function saveErrorKeyOf(error: unknown): string {
  const key = studioErrorMessageKeyOf(error, "save");
  return key === studioErrorMessageKey(null)
    ? studioReasonCopyKey("unknown", "save")
    : key;
}

/** The picker's place on the card: an always-mounted target for
 *  `aria-controls`, and the picker in a Collapse. `saveError` is the
 *  latest save's refusal, or null. */
export function StudioSupporterPickerRegion({
  id,
  isOpen,
  saveError,
  ...pickerProps
}: Omit<StudioSupporterIdentityPickerProps, "errorKey"> & {
  id: string;
  isOpen: boolean;
  saveError: unknown;
}) {
  return (
    <div id={id}>
      <Collapse isOpen={isOpen}>
        <StudioSupporterIdentityPicker
          {...pickerProps}
          errorKey={saveError ? saveErrorKeyOf(saveError) : null}
        />
      </Collapse>
    </div>
  );
}

/** The option id for an opt-in: the account's key, or the persona id. An
 *  identity the options no longer hold (a persona the member has since
 *  left) starts on the account, so the preview always shows a real pick. */
function initialKeyOf(
  options: StudioSupporterOptionView[],
  shownAsSubprofileId: string | null,
): string {
  const wantedKey = shownAsSubprofileId ?? SUPPORTER_ACCOUNT_KEY;
  const isOffered = options.some((option) => option.identity.key === wantedKey);
  return isOffered ? wantedKey : SUPPORTER_ACCOUNT_KEY;
}

/** "How {persona} sees you": one radio card per identity the member can
 *  show as, each previewing the exact avatar and name the artist sees. */
export function StudioSupporterIdentityPicker({
  personaName,
  options,
  initialShownAsSubprofileId,
  isSaving,
  errorKey,
  shouldFocusOnOpen,
  onSave,
  onClose,
  legend: legendOverride,
  shouldShowActions,
  onSelect,
  isPickUnset,
}: StudioSupporterIdentityPickerProps) {
  const { t } = useTranslation();
  const legendId = useId();
  const legend =
    legendOverride ??
    t("studio:supporter.pickerLegend", { persona: personaName });
  const groupWrapRef = useRef<HTMLDivElement>(null);
  const [selectedKey, setSelectedKeyState] = useState(() =>
    isPickUnset ? "" : initialKeyOf(options, initialShownAsSubprofileId),
  );
  const setSelectedKey = (key: string) => {
    setSelectedKeyState(key);
    onSelect?.(key === SUPPORTER_ACCOUNT_KEY ? null : key);
  };
  // The line keeps its last words while it folds away.
  const [shownErrorKey, setShownErrorKey] = useState(errorKey);
  if (errorKey !== null && errorKey !== shownErrorKey)
    setShownErrorKey(errorKey);

  // Opened by the member: focus lands on the checked card.
  useEffect(() => {
    if (!shouldFocusOnOpen) return;
    groupWrapRef.current
      ?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')
      ?.focus();
  }, [shouldFocusOnOpen]);

  const save = () => {
    if (isSaving || selectedKey === "") return;
    onSave(selectedKey === SUPPORTER_ACCOUNT_KEY ? null : selectedKey);
  };

  return (
    <div className={styles.picker}>
      <p id={legendId} className={styles.legend}>
        {legend}
      </p>
      <div ref={groupWrapRef}>
        <RadioCardGroup
          value={selectedKey}
          onChange={setSelectedKey}
          // Required by the primitive; the visible legend names the group.
          ariaLabel={legend}
          ariaLabelledBy={legendId}
          className={styles.options}
          optionClassName={styles.option}
          checkedClassName={styles.optionChecked}
          options={options.map(({ identity }) => ({
            id: identity.key,
            render: (
              <span className={styles.optionBody}>
                <StudioSupporterIdentity identity={identity} isLinked={false} />
                {identity.key === SUPPORTER_ACCOUNT_KEY && (
                  <span className={styles.accountTag}>
                    {t("studio:supporter.account")}
                  </span>
                )}
              </span>
            ),
          }))}
        />
      </div>
      <Collapse isOpen={errorKey !== null}>
        <p role="alert" className={styles.error}>
          {shownErrorKey !== null &&
            `${t("studio:supporter.saveFailed")}. ${t(shownErrorKey)}`}
        </p>
      </Collapse>
      <Collapse isOpen={shouldShowActions !== false}>
        <div className={styles.actions}>
          <Button
            variant="primary"
            size="sm"
            aria-disabled={isSaving || selectedKey === "" || undefined}
            aria-busy={isSaving || undefined}
            onClick={save}
          >
            {t("studio:supporter.saveCta")}
          </Button>
          <Button variant="quiet" size="sm" onClick={onClose}>
            {t("studio:supporter.closeCta")}
          </Button>
        </div>
      </Collapse>
    </div>
  );
}
