import { createContext, useContext } from "react";

/** What a chapter card knows about one control slot, shared with the
 *  control's field frame (`SkinRefinedField`). */
export interface SkinFieldSlot {
  /** Filled with a value the page will show: `isControlFilled` and
   *  `isControlValueValid`, the rule the card's fill count reads. The fill
   *  check follows it. */
  isFilled: boolean;
  /** Holds a value at all (`isControlFilled` alone), valid or not. The input
   *  surface reads it, so a value the page drops still sits on paper. */
  hasValue: boolean;
}

/** Provided per control slot by `ControlSlot` in `SkinChapterControlSlot.tsx`.
 *  `null` outside a chapter slot, where the fill is unknown: no fill check,
 *  and the input surface skips its empty (recessed) styling. */
export const SkinFieldSlotContext = createContext<SkinFieldSlot | null>(null);

/** The enclosing chapter slot, or `null` outside one. */
export function useSkinFieldSlot(): SkinFieldSlot | null {
  return useContext(SkinFieldSlotContext);
}
