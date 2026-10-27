import { useEffect, useId, useRef, useState } from "react";
import { Collapse, Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistView } from "./api/studio.adapters";
import {
  useRemoveStudioSupporter,
  useSaveStudioSupporter,
  useStudioSupporterState,
} from "./api/useStudioSupporter";
import { useStudioListeningHistorySwitch } from "./api/useStudioListeningHistorySwitch";
import {
  StudioArtistSupporterConfirmation,
  StudioArtistSupporterStates,
  StudioArtistSupporterStatus,
  type StudioSupporterStatus,
} from "./StudioArtistSupporterStates";
import { StudioSupporterPickerRegion } from "./StudioSupporterIdentityPicker";
import studioStyles from "./studio.module.css";
import styles from "./StudioSupporter.module.css";

/** "Show me as a supporter" on an artist page, for anyone who is not one of
 *  its owners. Turning it on opens the identity picker, which previews the
 *  exact name and photo the artist will see among their top supporters;
 *  nothing is shared until the member saves. */
export function StudioArtistSupporterCard({
  artist,
}: {
  artist: StudioArtistView;
}) {
  const { t } = useTranslation();
  const subprofileId = artist.artist.id;
  const personaName = artist.artist.name;
  const { state, loadState } = useStudioSupporterState(
    subprofileId,
    !artist.isOwner,
  );
  const historySwitch = useStudioListeningHistorySwitch();
  const isHistoryPaused = !historySwitch.isOn && !historySwitch.isAwaitingRow;
  const saver = useSaveStudioSupporter(subprofileId);
  const remover = useRemoveStudioSupporter(subprofileId);
  const headingId = useId();
  const switchId = useId();
  const bodyId = useId();
  const pickerId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  // Only a picker the member opened takes focus when it mounts.
  const [isOpenedByMember, setIsOpenedByMember] = useState(false);
  // The member closed the picker opened for an unreadable identity.
  const [isRepickDismissed, setIsRepickDismissed] = useState(false);
  // Keys the save error to the latest save, so a refusal never outlives a
  // switch turned off or a picker opened again.
  const [hasSaveFailed, setHasSaveFailed] = useState(false);
  const [status, setStatus] = useState<StudioSupporterStatus | null>(null);
  // The picker keeps its options while the content folds away.
  const [shownState, setShownState] = useState(state);
  if (state !== null && state !== shownState) setShownState(state);
  // A 404 on save resets the read and folds the picker away under the
  // focus: the heading takes it, above the not-available line.
  const isStateResetAfterFailedSave = hasSaveFailed && state === null;
  useEffect(() => {
    if (isStateResetAfterFailedSave) headingRef.current?.focus();
  }, [isStateResetAfterFailedSave]);
  if (artist.isOwner) return null;

  // A member of this artist (403 `studio_supporter_own_persona`) cannot
  // support it, so the card folds away.
  const isOwnPersona = loadState.isError && loadState.reason === "forbidden";
  const isSupporting = state?.isSupporting === true;
  const isIdentityMissing = isSupporting && state?.shownAs === null;
  const isPickerShown =
    state !== null &&
    (isPickerOpen || (isIdentityMissing && !isRepickDismissed));

  const focusSwitch = () => document.getElementById(switchId)?.focus();
  const openPicker = () => {
    setStatus(null);
    setHasSaveFailed(false);
    setIsPickerOpen(true);
    setIsOpenedByMember(true);
  };
  const closePicker = () => {
    setIsPickerOpen(false);
    setIsOpenedByMember(false);
    setIsRepickDismissed(true);
    setHasSaveFailed(false);
  };
  const turnOff = async () => {
    const isRemoved = await remover.remove();
    setStatus(isRemoved ? "removed" : "removeFailed");
  };
  const changeSwitch = (isTurningOn: boolean) => {
    if (remover.isRemoving) return;
    if (isTurningOn) {
      openPicker();
      return;
    }
    setStatus(null);
    closePicker();
    if (isSupporting) void turnOff();
  };
  const saveIdentity = async (shownAsSubprofileId: string | null) => {
    setHasSaveFailed(false);
    const isSaved = await saver.save(shownAsSubprofileId);
    if (!isSaved) {
      setHasSaveFailed(true);
      return;
    }
    setIsPickerOpen(false);
    setIsOpenedByMember(false);
    setIsRepickDismissed(false);
    setStatus("saved");
    focusSwitch();
  };

  return (
    <Collapse isOpen={!isOwnPersona}>
      <section
        className={`${studioStyles.sideCard} ${styles.card}`}
        aria-labelledby={headingId}
      >
        <h2
          ref={headingRef}
          id={headingId}
          tabIndex={-1}
          className={styles.heading}
        >
          {t("studio:supporter.heading")}
        </h2>
        <StudioArtistSupporterStates
          loadState={
            isOwnPersona ? { ...loadState, isError: false } : loadState
          }
          hasState={state !== null}
        />
        <Collapse isOpen={state !== null}>
          <div className={styles.switchRow}>
            <p id={bodyId} className={styles.body}>
              {t("studio:supporter.body", { persona: personaName })}
            </p>
            <Toggle
              id={switchId}
              label={t("studio:supporter.heading")}
              aria-describedby={bodyId}
              checked={isSupporting || isPickerShown}
              onChange={changeSwitch}
            />
          </div>
          <Collapse isOpen={isHistoryPaused}>
            <p className={styles.pausedNote}>
              {t("studio:supporter.pausedNote")}
            </p>
          </Collapse>
          <StudioArtistSupporterConfirmation
            personaName={personaName}
            isSupporting={isSupporting}
            shownAs={state?.shownAs ?? null}
            pickerId={pickerId}
            isPickerShown={isPickerShown}
            onChange={openPicker}
          />
          <StudioSupporterPickerRegion
            id={pickerId}
            isOpen={isPickerShown}
            personaName={personaName}
            options={shownState?.options ?? []}
            initialShownAsSubprofileId={shownState?.shownAsSubprofileId ?? null}
            isSaving={saver.isSaving}
            shouldFocusOnOpen={isOpenedByMember}
            saveError={hasSaveFailed ? saver.error : null}
            onSave={(shownAsSubprofileId) => {
              void saveIdentity(shownAsSubprofileId);
            }}
            onClose={() => {
              closePicker();
              focusSwitch();
            }}
          />
        </Collapse>
        <StudioArtistSupporterStatus
          status={status}
          personaName={personaName}
          shownAsName={state?.shownAs?.name ?? null}
          removeError={remover.error}
        />
      </section>
    </Collapse>
  );
}
