import { useId, type ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioAccountMenuItem } from "./studioAccountMenu.data";
import { StudioAccountMenuLink } from "./StudioAccountMenuRows";
import styles from "./StudioAccountMenu.module.css";

/** One group of the menu's scroll region under a hairline. With a heading
 *  it reads as a named group; `children` (a toggle) follow the rows. It
 *  draws nothing while it has neither rows nor children. */
export function StudioAccountMenuGroup({
  headingKey,
  items,
  onNavigate,
  children,
}: {
  headingKey?: string;
  items: StudioAccountMenuItem[];
  onNavigate: () => void;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  if (items.length === 0 && !children) return null;
  return (
    <>
      <div className={styles.divider} />
      {headingKey && (
        <div className={styles.groupLabel} id={headingId}>
          {t(headingKey)}
        </div>
      )}
      <div
        role={headingKey ? "group" : undefined}
        aria-labelledby={headingKey ? headingId : undefined}
      >
        {items.map((item) => (
          <StudioAccountMenuLink
            key={item.to}
            item={item}
            onNavigate={onNavigate}
          />
        ))}
        {children}
      </div>
    </>
  );
}
