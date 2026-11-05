import { useId } from "react";
import { FiSliders } from "react-icons/fi";
import {
  Button,
  Select,
  type SelectOption,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { VjPackListProps } from "./VjPackList";
import styles from "./VjPacks.module.css";

/** The picker's value for All clips; pack ids are uuids, so it never clashes. */
const ALL_CLIPS_VALUE = "all";

/**
 * The phone's pack switch: a select over All clips and the packs, and
 * "Manage packs", which opens the full rail in a sheet.
 */
export function VjPackPicker({
  packs,
  selectedPackId,
  libraryClipCount,
  onSelect,
  onManage,
}: VjPackListProps & { onManage: () => void }) {
  const { t } = useTranslation();
  const labelId = useId();
  const options: SelectOption[] = [
    {
      value: ALL_CLIPS_VALUE,
      label:
        libraryClipCount === null
          ? t("vj:packs.allClips")
          : t("vj:packs.pickerOption", {
              name: t("vj:packs.allClips"),
              count: libraryClipCount,
            }),
    },
    ...packs.map((pack) => ({
      value: pack.id,
      label: t("vj:packs.pickerOption", {
        name: pack.name,
        count: pack.clipCount,
      }),
      keywords: pack.name,
    })),
  ];

  return (
    <div className={styles.picker}>
      <span id={labelId} className={styles.pickerLabel}>
        {t("vj:packs.pickerLabel")}
      </span>
      <div className={styles.pickerRow}>
        <Select
          className={styles.pickerSelect}
          labelledBy={labelId}
          options={options}
          value={selectedPackId ?? ALL_CLIPS_VALUE}
          onChange={(value) =>
            onSelect(value === null || value === ALL_CLIPS_VALUE ? null : value)
          }
        />
        <Button variant="ghost" size="sm" onClick={onManage}>
          <FiSliders aria-hidden="true" fill="none" focusable="false" />
          {t("vj:packs.manage")}
        </Button>
      </div>
    </div>
  );
}
