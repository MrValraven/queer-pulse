import type { HTMLAttributes } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./VisibilityBadge.module.css";

export type VisibilityMode = "open" | "network" | "private";

const LABEL_KEY: Record<VisibilityMode, string> = {
  open: "shared:visibilityBadge.open",
  network: "shared:visibilityBadge.network",
  private: "shared:visibilityBadge.private",
};

interface VisibilityBadgeProps extends HTMLAttributes<HTMLDivElement> {
  mode?: VisibilityMode;
}

export function VisibilityBadge({
  mode = "open",
  className,
  ...rest
}: VisibilityBadgeProps) {
  const { t } = useTranslation();
  const label = t(LABEL_KEY[mode]);
  return (
    <div
      className={[styles.badge, styles[mode], className]
        .filter(Boolean)
        .join(" ")}
      title={t("shared:visibilityBadge.titleTemplate", { label })}
      {...rest}
    >
      <span className={styles.dot} aria-hidden />
      {label}
    </div>
  );
}
