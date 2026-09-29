import { FiList } from "react-icons/fi";
import { Button, Tooltip } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { DeskMenu, type DeskMenuItem } from "./DeskMenu";
import { deskLayoutChoices } from "./deskWorkbar.data";
import type { DeskLayoutOption } from "./DeskWorkbar";
import styles from "./DeskWorkbar.module.css";

export interface DeskLayoutMenuProps {
  layout: DeskLayoutOption;
  onLayout: (layout: DeskLayoutOption) => void;
  isCalendarAvailable: boolean;
}

/**
 * The layout switch as one icon button, for a workbar narrower than its full
 * row (a tablet, a phone). Four labelled segments would push search onto a
 * line of its own and the first piece further down the first screen; folded
 * into a menu, search, layout, Views, Filter and Sort share one row. The
 * trigger shows the current layout's icon and names it in its accessible
 * name.
 *
 * The workbar renders this beside the segmented switch and its CSS picks one
 * by the workbar's own width, so both always offer the same layouts
 * (`deskLayoutChoices`).
 */
export function DeskLayoutMenu({
  layout,
  onLayout,
  isCalendarAvailable,
}: DeskLayoutMenuProps) {
  const { t } = useTranslation();
  const choices = deskLayoutChoices(isCalendarAvailable);
  const currentChoice = choices.find((choice) => choice.value === layout);
  const CurrentIcon = currentChoice?.icon ?? FiList;

  const items: DeskMenuItem[] = choices.map((choice) => ({
    kind: "radio",
    id: `layout:${choice.value}`,
    label: t(choice.labelKey),
    isChecked: choice.value === layout,
    onSelect: () => onLayout(choice.value),
  }));
  const triggerLabel = currentChoice
    ? t("magazine:desk.workbar.layoutTrigger", {
        layout: t(currentChoice.labelKey),
      })
    : t("magazine:desk.header.layoutAria");

  return (
    <DeskMenu
      label={t("magazine:desk.header.layoutAria")}
      items={items}
      align="end"
      renderTrigger={(triggerProps) => (
        // The trigger's icon changes with the current layout, which reads
        // less clearly than Views/Filter/Sort's text labels at the tablet
        // widths where this icon-only trigger sits among them (FB-review
        // minor); the tooltip repeats its own accessible name for a
        // pointer, the way the workbar's help button already does.
        <Tooltip label={triggerLabel}>
          <Button
            {...triggerProps}
            variant="ghost"
            size="sm"
            className={`${styles.menuTrigger} ${styles.layoutMenu}`}
            aria-label={triggerLabel}
          >
            <CurrentIcon aria-hidden />
          </Button>
        </Tooltip>
      )}
    />
  );
}
