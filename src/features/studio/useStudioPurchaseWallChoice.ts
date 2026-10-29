import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SUPPORTER_ACCOUNT_KEY } from "./api/studioListening.adapters";
import type {
  StudioBuyerPurchaseView,
  StudioPurchaseWallStateView,
} from "./api/studioPurchases.adapters";
import { useStudioPurchaseWall } from "./api/useStudioPurchaseLists";
import { useStudioPurchaseMutations } from "./api/useStudioPurchaseMutations";
import { studioErrorMessageKeyOf } from "./studioErrors.data";

/** The last value that was present, so a block keeps its words while it
 *  folds away after the value turns null. */
function useLastPresent<Value>(value: Value | null): Value | null {
  const [lastValue, setLastValue] = useState(value);
  if (value !== null && value !== lastValue) setLastValue(value);
  return value ?? lastValue;
}

/** The wall choice of one purchase: the switch, the picker and the latest
 *  save. A saved answer shows until the purchase list refetches. */
export function useStudioPurchaseWallChoice(
  purchase: StudioBuyerPurchaseView,
  switchId: string,
) {
  const { t } = useTranslation();
  const { saveWall, isSavingWall } = useStudioPurchaseMutations();
  // A saved answer shows until the purchase list refetches a fresh wall.
  const [savedWall, setSavedWall] =
    useState<StudioPurchaseWallStateView | null>(null);
  const [seenWall, setSeenWall] = useState(purchase.wall);
  if (seenWall !== purchase.wall) {
    setSeenWall(purchase.wall);
    setSavedWall(null);
  }
  const wall = savedWall ?? purchase.wall;
  const [pendingIsOn, setPendingIsOn] = useState<boolean | null>(null);
  const isOn = pendingIsOn ?? wall.isOnWall;
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isOpenedByMember, setIsOpenedByMember] = useState(false);
  const [isRepickDismissed, setIsRepickDismissed] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [failureKey, setFailureKey] = useState<string | null>(null);
  // The picker also opens for a spot that is still off (no identity yet).
  const isPickerShown =
    isPickerOpen || (isOn && wall.needsNewIdentity && !isRepickDismissed);
  const { wall: pickerWall, loadState } = useStudioPurchaseWall(
    purchase.id,
    isPickerShown,
  );
  const isWaiting = isPickerShown && pickerWall === null;
  const shownPickerWall = useLastPresent(pickerWall);
  const shownIdentity = useLastPresent(wall.shownAs);
  const shownStatusText = useLastPresent(statusText);
  const shownFailureKey = useLastPresent(failureKey);

  const closePicker = () => {
    setIsPickerOpen(false);
    setIsOpenedByMember(false);
    setIsRepickDismissed(true);
  };
  const openPicker = () => {
    setStatusText(null);
    setFailureKey(null);
    setIsRepickDismissed(false);
    setIsPickerOpen(true);
    setIsOpenedByMember(true);
  };
  const save = async (
    isOnWall: boolean,
    shownAsSubprofileId: string | null,
  ): Promise<boolean> => {
    setFailureKey(null);
    setPendingIsOn(isOnWall);
    try {
      const next = await saveWall(purchase.id, purchase.item.releaseId, {
        isOnWall,
        shownAsSubprofileId,
      });
      setSavedWall(next);
      if (!isOnWall) setStatusText(t("studio:purchase.wall.removed"));
      else if (next.shownAs !== null)
        setStatusText(
          t("studio:purchase.wall.saved", { name: next.shownAs.name }),
        );
      return true;
    } catch (error) {
      setFailureKey(studioErrorMessageKeyOf(error, "save"));
      return false;
    } finally {
      setPendingIsOn(null);
    }
  };
  const changeSwitch = (isTurningOn: boolean) => {
    if (pendingIsOn !== null) return;
    setStatusText(null);
    if (!isTurningOn) closePicker();
    // A picker opened for a spot that was never saved on folds away alone.
    if (!isTurningOn && !wall.isOnWall) return;
    if (isTurningOn && wall.shownAs === null) {
      openPicker();
      return;
    }
    // Turning the spot off keeps the identity, so turning it on reuses it.
    const key = wall.shownAs?.key ?? SUPPORTER_ACCOUNT_KEY;
    void save(isTurningOn, key === SUPPORTER_ACCOUNT_KEY ? null : key);
  };
  const savePicked = async (shownAsSubprofileId: string | null) => {
    if (!(await save(true, shownAsSubprofileId))) return;
    closePicker();
    setIsRepickDismissed(false);
    document.getElementById(switchId)?.focus();
  };
  return {
    wall,
    isOn,
    isPickerShown,
    isWaiting,
    isOpenedByMember,
    isSavingWall,
    pickerWall,
    shownPickerWall,
    loadState,
    shownIdentity,
    statusText,
    shownStatusText,
    failureKey,
    shownFailureKey,
    openPicker,
    closePicker,
    changeSwitch,
    savePicked,
  };
}
