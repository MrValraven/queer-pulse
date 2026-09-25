import { useId } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AdminSeg } from "../../ui";
import { EMAIL_DESIGN_VARIANTS } from "../emailDesign.types";
import { useEmailDesignVariant } from "../emailDesignVariant";
import styles from "./emailTemplateEditor.module.css";

/** The temporary `?emailDesign=` picker, a compact cluster in the live
 *  preview's head. The short visible label carries the full one as a tooltip.
 *  Delete it with the losing designs once one is chosen. */
export function EmailDesignSwitch() {
  const { t } = useTranslation();
  const labelId = useId();
  const { variant, isSwitchVisible, setVariant } = useEmailDesignVariant();
  if (!isSwitchVisible) return null;
  return (
    <div className={styles.designSwitch}>
      <span
        id={labelId}
        className={styles.designSwitchLabel}
        title={t("admin:emailTemplates.designSwitch.label")}
      >
        {t("admin:emailTemplates.designSwitch.shortLabel")}
      </span>
      <AdminSeg
        ariaLabelledby={labelId}
        value={variant}
        onChange={(value) => {
          const chosen = EMAIL_DESIGN_VARIANTS.find(
            (candidate) => candidate === value,
          );
          if (chosen) setVariant(chosen);
        }}
        options={EMAIL_DESIGN_VARIANTS.map((option) => ({
          value: option,
          label: t(`admin:emailTemplates.designSwitch.${option}`),
        }))}
      />
    </div>
  );
}
