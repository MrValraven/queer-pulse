import { useId } from "react";
import { AdminSeg } from "../../ui";
import { EMAIL_DESIGNS, type EmailDesign } from "../emailDesign.types";
import { isEmailDesign } from "../emailDesigns";
import {
  useEmailDesign,
  useIsEmailDesignSwitchVisible,
} from "../useEmailDesign";
import styles from "./emailTemplateEditor.module.css";

// Temporary comparison UI with literal labels; removed after the design pick.
const DESIGN_LABELS: Record<EmailDesign, string> = {
  current: "Current",
  masthead: "Masthead",
  letter: "Letter",
};

export function EmailDesignSwitch() {
  const isVisible = useIsEmailDesignSwitchVisible();
  const [design, setDesign] = useEmailDesign();
  const labelId = useId();
  if (!isVisible) return null;
  return (
    <div className={styles.designSwitch}>
      <span id={labelId} className={styles.designSwitchLabel}>
        Email design
      </span>
      <AdminSeg
        ariaLabelledby={labelId}
        value={design}
        onChange={(value) => {
          if (isEmailDesign(value)) setDesign(value);
        }}
        options={EMAIL_DESIGNS.map((option) => ({
          value: option,
          label: DESIGN_LABELS[option],
        }))}
      />
    </div>
  );
}
