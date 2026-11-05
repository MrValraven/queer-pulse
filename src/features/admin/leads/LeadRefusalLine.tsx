import { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { LeadFieldError } from "./leadForm.model";
import styles from "./LeadParts.module.css";

/**
 * The line that names why a lead write was refused, under the field it
 * belongs to. It folds open and shut through `Collapse`, and keeps drawing
 * the last refusal while it folds away, so the words leave with the fold.
 * A refusal that names another lead (a taken email, link or persona) adds
 * "Open <name>", a link to that lead, when `openLeadPath` is given. `id`
 * sits on the message, so a field can point `aria-describedby` at it.
 */
export function LeadRefusalLine({
  error,
  openLeadPath,
  id,
}: {
  error: LeadFieldError | null;
  openLeadPath?: (leadId: string) => string;
  id?: string;
}) {
  const { t } = useTranslation();
  const [lastError, setLastError] = useState<LeadFieldError | null>(error);
  if (error !== null && error !== lastError) setLastError(error);
  const shownError = error ?? lastError;
  const openLeadName =
    shownError?.openLeadName ?? shownError?.values.name ?? null;

  return (
    <Collapse isOpen={error !== null}>
      {shownError ? (
        <div className={styles.refusal}>
          <FiAlertCircle className={styles.refusalIcon} aria-hidden />
          <div className={styles.refusalBody}>
            <p id={id} className={styles.refusalText} role="alert">
              {t(shownError.messageKey, shownError.values)}
            </p>
            {openLeadPath &&
            shownError.openLeadId !== null &&
            openLeadName !== null ? (
              <Link
                to={openLeadPath(shownError.openLeadId)}
                className={styles.refusalLink}
              >
                {t("admin:leads.action.openLead", { name: openLeadName })}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </Collapse>
  );
}
