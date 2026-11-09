import type { JSX } from "react";
import { FiHelpCircle } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui/Button";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjHelpCaptions } from "../hooks/useVjHelpCaptions";
import styles from "./VjTopRow.module.css";

/**
 * The top row's "?" button: turns the help captions under the dock and
 * top-row controls on and off. Pressed, it wears the coral wash the pressed
 * chips use; the choice is remembered on this device.
 */
export function VjHelpToggle(): JSX.Element {
  const { t } = useTranslation();
  const { isOn, toggle } = useVjHelpCaptions();
  return (
    <Button
      variant="stage-ghost"
      className={`${styles.iconButton} ${styles.helpToggle}`}
      aria-pressed={isOn}
      aria-label={t(isOn ? "vj:help.toggleHide" : "vj:help.toggleShow")}
      data-vj-help-toggle=""
      onClick={toggle}
    >
      <FiHelpCircle aria-hidden="true" focusable="false" fill="none" />
    </Button>
  );
}
