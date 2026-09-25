import { useSearchParams } from "react-router-dom";
import {
  EMAIL_DESIGN_VARIANTS,
  type EmailDesignVariant,
} from "./emailDesign.types";

/** The temporary `?emailDesign=` switch. Remove with the losing designs. */
export const EMAIL_DESIGN_PARAM = "emailDesign";

const DEFAULT_VARIANT: EmailDesignVariant = "current";

export function parseEmailDesignVariant(
  value: string | null,
): EmailDesignVariant {
  return (
    EMAIL_DESIGN_VARIANTS.find((variant) => variant === value) ??
    DEFAULT_VARIANT
  );
}

/** The design every render on this page uses, so the preview, "View HTML" and
 *  every copy action agree. The switch row shows on the dev server, and on any
 *  build whose URL already carries the param, so a preview link can be shared. */
export function useEmailDesignVariant(): {
  variant: EmailDesignVariant;
  isSwitchVisible: boolean;
  setVariant: (variant: EmailDesignVariant) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawValue = searchParams.get(EMAIL_DESIGN_PARAM);
  return {
    variant: parseEmailDesignVariant(rawValue),
    isSwitchVisible: import.meta.env.DEV || rawValue !== null,
    setVariant: (variant) =>
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set(EMAIL_DESIGN_PARAM, variant);
          return next;
        },
        { replace: true },
      ),
  };
}
