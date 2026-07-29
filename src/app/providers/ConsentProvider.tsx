import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useDemoMode } from "./DemoModeProvider";
import { setMonitoringConsent } from "../../shared/observability/sentry";
import { useLocalStorage } from "../../shared/hooks";
import {
  POLICY_VERSION,
  fetchMyConsent,
  recordConsent,
  type ConsentCategories,
  type ConsentSource,
} from "../../shared/api/consent.api";
import { ConsentPreferences } from "../../shared/components/consent/ConsentPreferences";
import {
  ConsentContext,
  type ConsentValue,
  type ConsentStatus,
  type OptInCategory,
} from "./useConsent";

const STORAGE_KEY = "qp.consent.v1";

interface StoredConsent {
  analytics: boolean;
  monitoring: boolean;
  policyVersion: string;
}

function isStoredConsent(v: unknown): v is StoredConsent {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as StoredConsent).analytics === "boolean" &&
    typeof (v as StoredConsent).monitoring === "boolean" &&
    typeof (v as StoredConsent).policyVersion === "string"
  );
}

/**
 * Consent gate (spec 07). Strictly-necessary storage is always on; analytics and
 * error-monitoring are opt-in and default to OFF. The local mirror gives an
 * instant, flicker-free decision; in live mode we reconcile with the backend.
 * Error-monitoring (Sentry, spec 01) is wired here via `setMonitoringConsent`, so
 * nothing loads until the matching category is granted.
 */
export function ConsentProvider({ children }: { children: ReactNode }) {
  const { demoMode } = useDemoMode();
  const [stored, setStored] = useLocalStorage<StoredConsent | null>(
    STORAGE_KEY,
    null,
    (v): v is StoredConsent | null => v === null || isStoredConsent(v),
  );
  const [isPending, setPending] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  // A stored choice made under an older policy no longer applies → re-prompt.
  const active =
    stored && stored.policyVersion === POLICY_VERSION ? stored : null;
  const consent: ConsentCategories = useMemo(
    () => ({
      necessary: true,
      analytics: active?.analytics ?? false,
      monitoring: active?.monitoring ?? false,
    }),
    [active?.analytics, active?.monitoring],
  );
  const status: ConsentStatus = active ? "set" : "unknown";

  // Load-bearing contract with spec 01: error-monitoring only runs behind the
  // monitoring category. Re-runs whenever the granted state flips.
  useEffect(() => {
    setMonitoringConsent(consent.monitoring);
  }, [consent.monitoring]);

  // Live mode: reconcile with the caller's current effective consent on mount.
  const reconciled = useRef(false);
  useEffect(() => {
    if (reconciled.current) return;
    reconciled.current = true;
    let cancelled = false;
    void fetchMyConsent(demoMode).then((res) => {
      if (cancelled || !res) return;
      setStored({
        analytics: res.categories.analytics,
        monitoring: res.categories.monitoring,
        policyVersion: res.policyVersion,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [demoMode, setStored]);

  const setConsent = useCallback(
    (next: Record<OptInCategory, boolean>, source: ConsentSource) => {
      setStored({ ...next, policyVersion: POLICY_VERSION });
      const categories: ConsentCategories = { necessary: true, ...next };
      setPending(true);
      void recordConsent(
        { categories, policyVersion: POLICY_VERSION, source },
        demoMode,
      ).finally(() => setPending(false));
    },
    [demoMode, setStored],
  );

  const acceptAll = useCallback(
    (source: ConsentSource = "banner") =>
      setConsent({ analytics: true, monitoring: true }, source),
    [setConsent],
  );
  const rejectAll = useCallback(
    (source: ConsentSource = "banner") =>
      setConsent({ analytics: false, monitoring: false }, source),
    [setConsent],
  );
  const openPreferences = useCallback(() => setPrefsOpen(true), []);

  const value = useMemo<ConsentValue>(
    () => ({
      consent,
      status,
      isPending,
      prefsOpen,
      setConsent,
      acceptAll,
      rejectAll,
      openPreferences,
    }),
    [
      consent,
      status,
      isPending,
      prefsOpen,
      setConsent,
      acceptAll,
      rejectAll,
      openPreferences,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {prefsOpen && (
        <ConsentPreferences
          consent={consent}
          onSave={(next) => {
            setConsent(next, "preference_center");
            setPrefsOpen(false);
          }}
          onClose={() => setPrefsOpen(false)}
        />
      )}
    </ConsentContext.Provider>
  );
}
