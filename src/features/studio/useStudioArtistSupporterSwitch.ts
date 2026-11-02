import { useEffect, useState, type RefObject } from "react";
import type { StudioSupporterStateView } from "./api/studioListening.adapters";
import {
  useRemoveStudioSupporter,
  useSaveStudioSupporter,
} from "./api/useStudioSupporter";
import type { StudioSupporterStatus } from "./StudioArtistSupporterStates";

/** The top listener card's switch and picker. The member is shown by
 *  default: the switch turns it off, and turning it back on saves the
 *  identity the server kept (`shownAsSubprofileId`) without opening the
 *  picker. The picker opens from "Change how you appear", and on its own
 *  when the identity can no longer be read. */
export function useStudioArtistSupporterSwitch({
  subprofileId,
  state,
  switchId,
  headingRef,
}: {
  subprofileId: string;
  state: StudioSupporterStateView | null;
  switchId: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const saver = useSaveStudioSupporter(subprofileId);
  const remover = useRemoveStudioSupporter(subprofileId);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  // Only a picker the member opened takes focus when it mounts.
  const [isOpenedByMember, setIsOpenedByMember] = useState(false);
  // The member closed the picker opened for an unreadable identity.
  const [isRepickDismissed, setIsRepickDismissed] = useState(false);
  // Keys the save error to the latest save, so a refusal never outlives a
  // switch turned off or a picker opened again.
  const [hasSaveFailed, setHasSaveFailed] = useState(false);
  const [status, setStatus] = useState<StudioSupporterStatus | null>(null);
  // The switch's position while a show or hide is on its way; null follows
  // the saved state.
  const [pendingSwitch, setPendingSwitch] = useState<boolean | null>(null);
  // The picker keeps its options while the content folds away.
  const [shownState, setShownState] = useState(state);
  if (state !== null && state !== shownState) setShownState(state);
  // A 404 on save resets the read and folds the picker away under the
  // focus: the heading takes it, above the not-available line.
  const isStateResetAfterFailedSave = hasSaveFailed && state === null;
  useEffect(() => {
    if (isStateResetAfterFailedSave) headingRef.current?.focus();
  }, [isStateResetAfterFailedSave, headingRef]);

  const isSupporting = state?.isSupporting === true;
  const isIdentityMissing = isSupporting && state?.shownAs === null;
  // A kept persona the member can no longer show as: turning the switch
  // back on asks for an identity first.
  const isKeptIdentityGone =
    state !== null &&
    state.shownAsSubprofileId !== null &&
    (state.shownAs === null ||
      !state.options.some(
        (option) => option.shownAsSubprofileId === state.shownAsSubprofileId,
      ));
  const isPickerShown =
    state !== null &&
    (isPickerOpen || (isIdentityMissing && !isRepickDismissed));
  const isSwitchOn = pendingSwitch ?? (isSupporting || isPickerShown);

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
    setPendingSwitch(false);
    const isRemoved = await remover.remove();
    setPendingSwitch(null);
    setStatus(isRemoved ? "removed" : "removeFailed");
  };
  const turnOn = async (shownAsSubprofileId: string | null) => {
    setPendingSwitch(true);
    const isSaved = await saver.save(shownAsSubprofileId);
    setPendingSwitch(null);
    setHasSaveFailed(!isSaved);
    setStatus(isSaved ? "saved" : "turnOnFailed");
  };
  const changeSwitch = (isTurningOn: boolean) => {
    if (remover.isRemoving || saver.isSaving) return;
    setStatus(null);
    if (isTurningOn && isKeptIdentityGone) {
      openPicker();
      return;
    }
    closePicker();
    if (isTurningOn) void turnOn(state?.shownAsSubprofileId ?? null);
    else if (isSupporting) void turnOff();
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
  const closePickerToSwitch = () => {
    closePicker();
    focusSwitch();
  };

  return {
    saver,
    remover,
    status,
    shownState,
    isSupporting,
    isPickerShown,
    isSwitchOn,
    isOpenedByMember,
    hasSaveFailed,
    openPicker,
    changeSwitch,
    saveIdentity,
    closePickerToSwitch,
  };
}
