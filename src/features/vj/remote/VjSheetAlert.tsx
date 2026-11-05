import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui";
import type { TranslateOptions } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./VjSheets.module.css";

/**
 * One line naming why a command from a sheet failed, shared by the VJ
 * remote's sheets. It keeps the last line while it folds away.
 */
export function VjSheetAlert({
  errorKey,
  values,
}: {
  errorKey: string | null;
  values?: TranslateOptions;
}) {
  const { t } = useTranslation();
  const [shownKey, setShownKey] = useState(errorKey);
  if (errorKey !== null && errorKey !== shownKey) setShownKey(errorKey);
  return (
    <Collapse isOpen={errorKey !== null}>
      <p role="alert" className={styles.alert}>
        <FiAlertTriangle
          aria-hidden
          fill="none"
          className={styles.warningIcon}
        />
        <span>{shownKey === null ? "" : t(shownKey, values)}</span>
      </p>
    </Collapse>
  );
}
