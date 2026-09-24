import { useLocalStorage } from "../../shared/hooks/useLocalStorage";

/** How the owner personas dashboard lays out "On your profile": the card grid
 *  (the default) or one compact row per persona. */
export type PersonaDashboardView = "cards" | "list";

const STORAGE_KEY = "qp.personaDashboard.view";
const DEFAULT_VIEW: PersonaDashboardView = "cards";

function isPersonaDashboardView(value: unknown): value is PersonaDashboardView {
  return value === "cards" || value === "list";
}

/**
 * The dashboard's Cards / List choice, remembered on this device.
 *
 * Device-local on purpose: it is a layout preference, the same kind of thing as
 * the other `panelLayout` keys in the storage inventory (collapsed rails, open
 * filter panels). A member may want the dense list on a laptop and the cards on
 * a phone, so the choice stays with this browser.
 * A missing, corrupt or unknown stored value falls back to `"cards"`.
 */
export function usePersonaDashboardView(): [
  PersonaDashboardView,
  (view: PersonaDashboardView) => void,
] {
  const [view, setView] = useLocalStorage<PersonaDashboardView>(
    STORAGE_KEY,
    DEFAULT_VIEW,
    isPersonaDashboardView,
  );
  return [view, setView];
}
