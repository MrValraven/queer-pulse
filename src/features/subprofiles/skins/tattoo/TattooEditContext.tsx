import { createContext, useContext, useMemo, type ReactNode } from "react";
import { tattooEditHref, type TattooEditTarget } from "./tattooEditLinks.data";

export type { TattooEditTarget } from "./tattooEditLinks.data";

/** The persona being viewed, when its owner is viewing it; null otherwise. */
const TattooEditContext = createContext<{ subprofileId: string } | null>(null);

interface TattooEditProviderProps {
  subprofileId: string;
  /** True only in owner mode: public, visitor and preview get no links. */
  isOwner: boolean;
  children: ReactNode;
}

/** Lets every block of the tattoo page render the owner's "Edit" links
 *  without threading the persona id and mode through each one. */
export function TattooEditProvider({
  subprofileId,
  isOwner,
  children,
}: TattooEditProviderProps) {
  const value = useMemo(
    () => (isOwner ? { subprofileId } : null),
    [isOwner, subprofileId],
  );
  return (
    <TattooEditContext.Provider value={value}>
      {children}
    </TattooEditContext.Provider>
  );
}

/** The editor address for `target`, or null unless the owner is viewing. */
export function useTattooEditHref(target: TattooEditTarget): string | null {
  const context = useContext(TattooEditContext);
  return context ? tattooEditHref(context.subprofileId, target) : null;
}
