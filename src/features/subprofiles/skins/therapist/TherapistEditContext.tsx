import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  therapistEditHref,
  type TherapistEditTarget,
} from "./therapistEditLinks.data";

export type { TherapistEditTarget } from "./therapistEditLinks.data";

/** The persona being viewed, when its owner is viewing it; null otherwise. */
const TherapistEditContext = createContext<{ subprofileId: string } | null>(
  null,
);

interface TherapistEditProviderProps {
  subprofileId: string;
  /** True only in owner mode: public, visitor and preview get no links. */
  isOwner: boolean;
  children: ReactNode;
}

/** Lets every section of the therapist page render the owner's "Edit"
 *  links without threading the persona id and mode through each one. */
export function TherapistEditProvider({
  subprofileId,
  isOwner,
  children,
}: TherapistEditProviderProps) {
  const value = useMemo(
    () => (isOwner ? { subprofileId } : null),
    [isOwner, subprofileId],
  );
  return (
    <TherapistEditContext.Provider value={value}>
      {children}
    </TherapistEditContext.Provider>
  );
}

/** The editor address for `target`, or null unless the owner is viewing. */
export function useTherapistEditHref(
  target: TherapistEditTarget,
): string | null {
  const context = useContext(TherapistEditContext);
  return context ? therapistEditHref(context.subprofileId, target) : null;
}
