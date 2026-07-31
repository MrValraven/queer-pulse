import { createContext, useContext } from "react";
import {
  type ConsentCategories,
  type ConsentSource,
} from "../../shared/api/consent.api";

/** The two opt-in categories a member controls. `necessary` is always true. */
export type OptInCategory = "analytics" | "monitoring";

/** "unknown" → the banner shows and everything opt-in is treated as off. */
export type ConsentStatus = "unknown" | "set";

export interface ConsentValue {
  consent: ConsentCategories;
  status: ConsentStatus;
  isPending: boolean;
  /** True while the preference center modal is open (banner hides itself). */
  prefsOpen: boolean;
  /** Persist a new choice (local mirror always; backend in live mode). */
  setConsent: (
    next: Record<OptInCategory, boolean>,
    source: ConsentSource,
  ) => void;
  acceptAll: (source?: ConsentSource) => void;
  rejectAll: (source?: ConsentSource) => void;
  openPreferences: () => void;
}

export const ConsentContext = createContext<ConsentValue | null>(null);

export function useConsent(): ConsentValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
  return ctx;
}
