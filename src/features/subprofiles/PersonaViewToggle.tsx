import type { ReactNode } from "react";
import { FiGrid, FiList } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PersonaDashboardView } from "./usePersonaDashboardView";
import styles from "./PersonaViewToggle.module.css";

/**
 * Segmented control that switches the owner personas dashboard between the
 * card grid and the one-row-per-persona list. Mirrors the house precedent
 * (`FlatmateViewToggle`): a labelled `role="group"` of `aria-pressed` buttons,
 * so a screen reader hears "Show personas as, group" and which option is on.
 *
 * On a narrow dashboard the text labels collapse to icons only. The label text
 * stays in the DOM (visually hidden by the container query in the CSS module),
 * so each button keeps its accessible name at every width.
 */
export function PersonaViewToggle({
  view,
  onChange,
}: {
  view: PersonaDashboardView;
  onChange: (view: PersonaDashboardView) => void;
}) {
  const { t } = useTranslation();
  const options: {
    id: PersonaDashboardView;
    label: string;
    icon: ReactNode;
  }[] = [
    {
      id: "cards",
      label: t("subprofiles:mine.view.cards"),
      icon: <FiGrid aria-hidden />,
    },
    {
      id: "list",
      label: t("subprofiles:mine.view.list"),
      icon: <FiList aria-hidden />,
    },
  ];
  return (
    <div
      className={styles.viewToggle}
      role="group"
      aria-label={t("subprofiles:mine.view.label")}
    >
      {options.map((option) => {
        const isPressed = view === option.id;
        return (
          <button
            key={option.id}
            type="button"
            className={[styles.viewChip, isPressed && styles.viewChipOn]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={isPressed}
            title={option.label}
            onClick={() => onChange(option.id)}
          >
            {option.icon}
            <span className={styles.viewChipLabel}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
