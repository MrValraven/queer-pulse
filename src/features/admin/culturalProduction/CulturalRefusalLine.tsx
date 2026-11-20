import { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  culturalErrorKeyOf,
  culturalErrorValuesOf,
} from "./culturalProductionErrors";
import styles from "./CulturalParts.module.css";

/**
 * The line that names why a Cultural Production write was refused, under
 * the field or the list it belongs to. It folds open and shut through
 * `Collapse`, and keeps drawing the last refusal while it folds away, so
 * the words leave with the fold. `id` sits on the message, so a field can
 * point `aria-describedby` at it.
 */
export function CulturalRefusalLine({
  error,
  id,
}: {
  error: unknown;
  id?: string;
}) {
  const { t } = useTranslation();
  const hasError = error !== null && error !== undefined;
  const [lastError, setLastError] = useState<unknown>(hasError ? error : null);
  if (hasError && error !== lastError) setLastError(error);
  const shownError = hasError ? error : lastError;

  return (
    <Collapse isOpen={hasError}>
      {shownError !== null ? (
        <div className={styles.refusal}>
          <FiAlertCircle className={styles.refusalIcon} aria-hidden />
          <p id={id} className={styles.refusalText} role="alert">
            {t(
              culturalErrorKeyOf(shownError),
              culturalErrorValuesOf(shownError),
            )}
          </p>
        </div>
      ) : null}
    </Collapse>
  );
}
