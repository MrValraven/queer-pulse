import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { EmailDesign } from "./emailDesign.types";
import { DEFAULT_EMAIL_DESIGN, isEmailDesign } from "./emailDesigns";

/** Temporary `?emailDesign=` switch for comparing email designs side by side.
 *  Removed once a design is picked. */
const EMAIL_DESIGN_PARAM = "emailDesign";

export function useEmailDesign(): [EmailDesign, (design: EmailDesign) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedDesign = searchParams.get(EMAIL_DESIGN_PARAM);
  const design = isEmailDesign(requestedDesign)
    ? requestedDesign
    : DEFAULT_EMAIL_DESIGN;
  const setDesign = useCallback(
    (nextDesign: EmailDesign) =>
      setSearchParams(
        (currentParams) => {
          const nextParams = new URLSearchParams(currentParams);
          nextParams.set(EMAIL_DESIGN_PARAM, nextDesign);
          return nextParams;
        },
        { replace: true },
      ),
    [setSearchParams],
  );
  return [design, setDesign];
}

/** Always shown in dev; in production only once the param is in the URL. */
export function useIsEmailDesignSwitchVisible(): boolean {
  const [searchParams] = useSearchParams();
  return import.meta.env.DEV || searchParams.has(EMAIL_DESIGN_PARAM);
}
