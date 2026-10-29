import { useRef, useState, type RefObject } from "react";
import type { StudioPriceView } from "./api/studioPurchases.adapters";
import type { StudioPriceInput, StudioReleaseType } from "./api/studio.types";
import { useStudioRelease } from "./api/useStudioRelease";
import {
  centsFromEuroText,
  isSellableReleaseType,
  priceErrorKeyOf,
} from "./studioPurchaseRules";
import {
  priceFormOf,
  priceInputOf,
  type StudioPriceFormMode,
} from "./studioUploadDraft.data";

interface TypedPrice {
  priceMode: StudioPriceFormMode;
  priceText: string;
}

/** Whether the typed price differs from the stored one. An unreadable amount
 *  counts as a change, so the checks name it. */
function isPriceChanged(
  typed: TypedPrice,
  storedPrice: StudioPriceView | null,
): boolean {
  const input = priceInputOf(typed.priceMode, typed.priceText);
  if (input === "invalid") return true;
  if (input === null || storedPrice === null) return input !== storedPrice;
  return (
    input.mode !== storedPrice.mode ||
    input.amountCents !== storedPrice.amountCents
  );
}

/** The price one track's details panel is drafting. It starts as the stored
 *  price, shows only on album, EP and single tracks, and goes on the save
 *  only once it changed. `check` runs before the save so a refused price
 *  names its reason and takes focus. */
export function useTrackPriceDraft({
  releaseId,
  trackId,
  releaseType,
}: {
  releaseId: string;
  trackId: string;
  releaseType: StudioReleaseType;
}): {
  isShown: boolean;
  priceMode: StudioPriceFormMode;
  priceText: string;
  setPriceMode: (mode: StudioPriceFormMode) => void;
  setPriceText: (text: string) => void;
  isDirty: boolean;
  errorKey: string | null;
  amountInputRef: RefObject<HTMLInputElement | null>;
  /** False, with the amount focused and the error shown, when the price must wait. */
  check: () => boolean;
  /** `{}` when unchanged, else `{ price }` (null takes the track off sale). */
  saveFields: () => { price?: StudioPriceInput | null };
  subprofileId: string | null;
  isReleaseOut: boolean;
} {
  const { release } = useStudioRelease(releaseId);
  const storedPrice =
    release?.ownerTracks?.find((track) => track.id === trackId)?.price ?? null;
  const [typed, setTyped] = useState<TypedPrice | null>(null);
  const [isShowingError, setIsShowingError] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const isShown = isSellableReleaseType(releaseType);
  const current: TypedPrice = typed ?? priceFormOf(storedPrice, ".");
  const errorKeyOfCurrent =
    current.priceMode === "not_for_sale"
      ? null
      : priceErrorKeyOf(
          current.priceMode,
          centsFromEuroText(current.priceText),
        );
  return {
    isShown,
    priceMode: current.priceMode,
    priceText: current.priceText,
    setPriceMode: (priceMode) =>
      setTyped({
        priceMode,
        priceText: priceMode === "not_for_sale" ? "" : current.priceText,
      }),
    setPriceText: (priceText) => setTyped({ ...current, priceText }),
    isDirty: isShown && typed !== null && isPriceChanged(typed, storedPrice),
    errorKey: isShowingError ? errorKeyOfCurrent : null,
    amountInputRef,
    check: () => {
      if (!isShown || errorKeyOfCurrent === null) return true;
      setIsShowingError(true);
      amountInputRef.current?.focus();
      return false;
    },
    saveFields: () => {
      if (!isShown || typed === null || !isPriceChanged(typed, storedPrice))
        return {};
      const input = priceInputOf(typed.priceMode, typed.priceText);
      return input === "invalid" ? {} : { price: input };
    },
    subprofileId: release?.artist.id ?? null,
    isReleaseOut: release?.status === "published",
  };
}
