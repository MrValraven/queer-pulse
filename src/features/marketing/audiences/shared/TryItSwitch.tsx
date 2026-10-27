import { useId, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { Tabs, type Tab } from "../../../../shared/components/ui/Tabs";
import { tabPanelProps } from "../../../../shared/components/ui/tabIds";
import type { TryItOption } from "./audiences.data";
import styles from "./TryItSwitch.module.css";

/** The house curve (`--ease`), as the cubic bezier motion expects. */
const HOUSE_EASE = [0.22, 0.68, 0.16, 1] as const;

/**
 * The "Try it" control: a real tablist (arrow keys, Home and End move the
 * choice) above the panel it labels. The panel crossfades between choices in
 * one grid cell, so the outgoing and incoming content share the same space
 * while they fade. Lives outside any inert showcase frame; the frame goes inside
 * `children`.
 */
export function TryItSwitch<OptionId extends string>({
  label,
  options,
  activeId,
  onChange,
  children,
  className,
}: {
  label: string;
  options: readonly TryItOption<OptionId>[];
  activeId: OptionId;
  onChange: (id: OptionId) => void;
  children: ReactNode;
  className?: string;
}) {
  const idPrefix = useId();
  const { reducedMotion } = useMotionPrefs();
  const tabs: Tab[] = options.map(({ id, label: optionLabel, Icon }) => ({
    id,
    label: optionLabel,
    icon: Icon ? <Icon aria-hidden /> : undefined,
  }));
  const selectOption = (tabId: string) => {
    const option = options.find((candidate) => candidate.id === tabId);
    if (option) onChange(option.id);
  };
  const hidden = reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 };
  const shown = reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
  const transition = reducedMotion
    ? { duration: 0.12 }
    : { duration: 0.32, ease: HOUSE_EASE };

  return (
    <div className={[styles.tryIt, className].filter(Boolean).join(" ")}>
      <Tabs
        tabs={tabs}
        active={activeId}
        onChange={selectOption}
        variant="pill"
        idPrefix={idPrefix}
        label={label}
        className={styles.chipRow}
      />
      <div {...tabPanelProps(idPrefix, activeId)} className={styles.panel}>
        <AnimatePresence initial={false}>
          <m.div
            key={activeId}
            className={styles.cell}
            initial={hidden}
            animate={shown}
            exit={{ opacity: 0 }}
            transition={transition}
          >
            {children}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
