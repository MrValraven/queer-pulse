import type { HTMLAttributes, ReactNode } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import { cx } from "../../lib/cx";
import styles from "./VisibilityBadge.module.css";

export type VisibilityMode = "open" | "network" | "private";

const LABEL_KEY: Record<VisibilityMode, string> = {
  open: "shared:visibilityBadge.open",
  network: "shared:visibilityBadge.network",
  private: "shared:visibilityBadge.private",
};

interface VisibilityBadgeProps extends HTMLAttributes<HTMLDivElement> {
  mode?: VisibilityMode;
  /** The words beside the dot. Defaults to the mode's own label ("Open to
   *  connect"). A surface with its own vocabulary, such as a gathering's
   *  audience, passes its label and keeps the mode's look. */
  label?: ReactNode;
}

export function VisibilityBadge({
  mode = "open",
  label,
  className,
  ...rest
}: VisibilityBadgeProps) {
  const { t } = useTranslation();
  const modeLabel = t(LABEL_KEY[mode]);
  // The tooltip takes plain text: a string label names itself, and a richer
  // label leaves the tooltip on the mode's own words.
  const titleLabel = typeof label === "string" ? label : modeLabel;
  return (
    <div
      className={cx(styles.badge, styles[mode], className)}
      title={t("shared:visibilityBadge.titleTemplate", { label: titleLabel })}
      {...rest}
    >
      <span className={styles.dot} aria-hidden />
      {label ?? modeLabel}
    </div>
  );
}
