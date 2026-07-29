import { createContext, useContext, useEffect, useRef } from "react";
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

/**
 * The seam spec 01 must use: runs `effect` only once the given category is
 * granted, and tears it down when consent is withdrawn. Never initialises a
 * tracker/monitor pre-consent.
 */
export function useConsentedEffect(
  category: OptInCategory,
  effect: () => void | (() => void),
): void {
  const { consent, status } = useConsent();
  const granted = status === "set" && consent[category];
  const effectRef = useRef(effect);
  // Keep the latest effect without mutating the ref during render.
  useEffect(() => {
    effectRef.current = effect;
  });
  useEffect(() => {
    if (!granted) return;
    return effectRef.current();
  }, [granted]);
}
