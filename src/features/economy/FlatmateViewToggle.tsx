import type { ReactNode } from "react";
import { FiColumns, FiLayers } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./FlatmatesPage.module.css";

export type FlatmateView = "list" | "discovery";

/** Segmented control that swaps the flatmate board between the default list and
 * the opt-in one-at-a-time discovery deck. */
export function FlatmateViewToggle({
  view,
  setView,
}: {
  view: FlatmateView;
  setView: (view: FlatmateView) => void;
}) {
  const { t } = useTranslation();
  const options: { id: FlatmateView; label: string; icon: ReactNode }[] = [
    { id: "list", label: t("economy:flatmates.view.list"), icon: <FiColumns aria-hidden /> },
    {
      id: "discovery",
      label: t("economy:flatmates.view.discovery"),
      icon: <FiLayers aria-hidden />,
    },
  ];
  return (
    <div className={styles.viewToggle} role="group" aria-label={t("economy:flatmates.view.label")}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={[styles.viewChip, view === option.id && styles.viewChipOn]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={view === option.id}
          onClick={() => setView(option.id)}
        >
          {option.icon} {option.label}
        </button>
      ))}
    </div>
  );
}
