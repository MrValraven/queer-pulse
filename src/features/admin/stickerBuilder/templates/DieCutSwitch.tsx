import { useId } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AdminToggle } from "../../ui";
import styles from "./DieCutSwitch.module.css";

/**
 * One on/off style control as a labelled row. A <label> names the switch and
 * toggles it on click (a button is a labelable element), so the whole 44px
 * row is the target.
 */
export function LabelledSwitch({
  label,
  isOn,
  onChange,
}: {
  label: string;
  isOn: boolean;
  onChange: (isOn: boolean) => void;
}) {
  const switchId = useId();

  return (
    <div className={styles.switchRow}>
      <label className={styles.switchLabel} htmlFor={switchId}>
        {label}
      </label>
      <AdminToggle id={switchId} checked={isOn} onChange={onChange} />
    </div>
  );
}

/**
 * The white die-cut border around the art, on or off. Toggling it keeps the
 * sticker's size: the fit is always computed with the border.
 */
export function DieCutSwitch({
  hasDieCut,
  onChange,
}: {
  hasDieCut: boolean;
  onChange: (hasDieCut: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <LabelledSwitch
      label={t("admin:stickerPacks.dieCut.label")}
      isOn={hasDieCut}
      onChange={onChange}
    />
  );
}
