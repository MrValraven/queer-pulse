import { FiGlobe, FiList, FiMap } from "react-icons/fi";
import { SegmentedControl } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./LocalFilterBar.module.css";

/** The List/Map/Online switcher: at the end of the search row above the
 *  results on desktop, and in the sticky toolbar on phones. Each label sits
 *  in its own span, so a small phone's toolbar, and a narrow desktop results
 *  column, can fold the views the visitor is off down to their icons. The
 *  folded label stays in the button, so it keeps its accessible name. */
export function DirectoryViewSwitcher({
  view,
  onViewChange,
  className,
  labelClassName,
}: {
  view: string;
  onViewChange: (next: string) => void;
  /** Applied to the switcher itself, for the desktop row's sizing. */
  className?: string;
  /** Added to each label span, for the desktop row's label fold. */
  labelClassName?: string;
}) {
  const { t } = useTranslation();
  const labelClasses = [s.viewLabel, labelClassName].filter(Boolean).join(" ");
  return (
    <SegmentedControl
      label={t("marketing:local.view.toggleAria")}
      className={className}
      options={[
        {
          value: "list",
          label: (
            <span className={labelClasses}>
              {t("marketing:local.view.list")}
            </span>
          ),
          icon: <FiList />,
        },
        {
          value: "map",
          label: (
            <span className={labelClasses}>
              {t("marketing:local.view.map")}
            </span>
          ),
          icon: <FiMap />,
        },
        {
          value: "online",
          label: (
            <span className={labelClasses}>
              {t("marketing:local.view.online")}
            </span>
          ),
          icon: <FiGlobe />,
        },
      ]}
      value={view}
      onChange={onViewChange}
    />
  );
}
