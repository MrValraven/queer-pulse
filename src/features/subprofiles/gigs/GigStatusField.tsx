import { useId } from "react";
import type { IconType } from "react-icons";
import { FiCheckCircle, FiStar, FiTag, FiXCircle } from "react-icons/fi";
import { FilterChips } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { GigState } from "../api/subprofiles.api";
import styles from "./GigDrawer.module.css";

interface GigStatusOption {
  /** The stored `gigState`; empty is the standard, unmarked gig. */
  value: "" | GigState;
  labelKey: string;
  Icon: IconType;
}

/** The four statuses, labelled with the shared `richField.gigState.option.*`
 *  words. Each carries an icon so the choice is never colour alone. */
const GIG_STATUS_OPTIONS: GigStatusOption[] = [
  {
    value: "",
    labelKey: "subprofiles:richField.gigState.option.none",
    Icon: FiCheckCircle,
  },
  {
    value: "sold_out",
    labelKey: "subprofiles:richField.gigState.option.sold_out",
    Icon: FiTag,
  },
  {
    value: "cancelled",
    labelKey: "subprofiles:richField.gigState.option.cancelled",
    Icon: FiXCircle,
  },
  {
    value: "guest",
    labelKey: "subprofiles:richField.gigState.option.guest",
    Icon: FiStar,
  },
];

/**
 * The gig status as a single-select chip group: Standard, Sold out,
 * Cancelled, Guest set. Picking Standard stores `null`.
 */
export function GigStatusField({
  gigState,
  onChange,
}: {
  gigState: GigState | null;
  onChange: (gigState: GigState | null) => void;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  return (
    <div className={styles.group}>
      <span id={labelId} className={styles.groupLabel}>
        {t("subprofiles:gigEditor.field.status.label")}
      </span>
      <FilterChips
        labelledBy={labelId}
        size="touch"
        value={gigState ?? ""}
        onChange={(value) =>
          onChange(value === "" ? null : (value as GigState))
        }
        options={GIG_STATUS_OPTIONS.map(({ value, labelKey, Icon }) => ({
          value,
          label: (
            <span className={styles.statusChip}>
              <Icon size={14} aria-hidden />
              {t(labelKey)}
            </span>
          ),
        }))}
      />
    </div>
  );
}
