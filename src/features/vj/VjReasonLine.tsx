import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { vjErrorKeyOf, vjErrorValuesOf } from "./vjErrors";

interface VjReasonLineProps {
  /** The failure to explain; null or undefined folds the line away. */
  error: unknown;
  id?: string;
  /** The picked file's size, so a too-large refusal names it. */
  fileByteSize?: number;
}

/** One line naming the specific cause of a failed VJ action. It keeps the
 *  last error drawn while it folds, so the words do not vanish mid-motion. */
export function VjReasonLine({ error, id, fileByteSize }: VjReasonLineProps) {
  const { t } = useTranslation();
  const [lastError, setLastError] = useState<unknown>(error);
  if (error != null && error !== lastError) setLastError(error);
  const shownError = error ?? lastError;
  const isOpen = error != null;

  return (
    <Collapse isOpen={isOpen}>
      <p
        id={id}
        role="alert"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "var(--gap-xs)",
          margin: 0,
          paddingTop: "var(--gap-xs)",
          fontSize: "var(--text-13)",
          lineHeight: 1.4,
          color: "var(--danger-ink)",
        }}
      >
        <FiAlertTriangle
          aria-hidden="true"
          focusable="false"
          fill="none"
          style={{ flexShrink: 0, marginTop: "0.15em" }}
        />
        <span>
          {shownError == null
            ? ""
            : t(
                vjErrorKeyOf(shownError),
                vjErrorValuesOf(shownError, { fileByteSize }),
              )}
        </span>
      </p>
    </Collapse>
  );
}
