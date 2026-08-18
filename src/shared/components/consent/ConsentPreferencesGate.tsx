import { useConsent } from "../../../app/providers/useConsent";
import { ConsentPreferences } from "./ConsentPreferences";

/**
 * Mounts the preference-center modal. Lives here (rendered in App.tsx next to
 * ConsentBanner, inside I18nProvider) rather than inside ConsentProvider
 * itself, because ConsentProvider sits above I18nProvider in the provider
 * tree — a modal rendered directly from there couldn't call useTranslation().
 */
export function ConsentPreferencesGate() {
  const { prefsOpen, consent, setConsent, closePreferences } = useConsent();
  if (!prefsOpen) return null;

  return (
    <ConsentPreferences
      consent={consent}
      onSave={(next) => {
        setConsent(next, "preference_center");
        closePreferences();
      }}
      onClose={closePreferences}
    />
  );
}
