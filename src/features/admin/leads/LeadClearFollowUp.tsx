import { useRef, useState } from "react";
import { FiXCircle } from "react-icons/fi";
import { Button, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { LeadDTO } from "./api/leads.types";
import { useLeadIsWriting, useUpdateLead } from "./api/useLeadMutations";
import { leadFieldErrorOf, type LeadFieldError } from "./leadForm.model";
import { isFocusLostOrWithin } from "./leadFormRebase";
import { adminLeadPath } from "./leadPaths";
import { LeadRefusalLine } from "./LeadRefusalLine";
import styles from "./LeadDetails.module.css";

/** Clear follow-up: one press empties the stored date at once, so it
 *  lives in the read view alone. A quiet small button keeps the row as
 *  tall as its neighbours while keeping a 44px hit area. The button folds
 *  away under the finger, so `onCleared` hears whether focus was left
 *  there (or on the page) and should move on. `className` places the fold
 *  in the row that holds it. */
export function LeadClearFollowUp({
  lead,
  onCleared,
  className,
}: {
  lead: LeadDTO;
  onCleared: (shouldMoveFocus: boolean) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const clearFollowUp = useUpdateLead(lead.id);
  const isWriting = useLeadIsWriting();
  const [refusal, setRefusal] = useState<LeadFieldError | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const clear = () => {
    if (isWriting) return;
    setRefusal(null);
    clearFollowUp.mutate(
      { followUpOn: null },
      {
        onSuccess: () => onCleared(isFocusLostOrWithin(rowRef.current)),
        onError: (cause) => setRefusal(leadFieldErrorOf(cause)),
      },
    );
  };

  return (
    <Collapse isOpen={lead.followUpOn !== null} className={className}>
      <div ref={rowRef} className={styles.clearFollowUp}>
        <Button
          variant="quiet"
          size="sm"
          className={styles.clearFollowUpButton}
          aria-disabled={isWriting || undefined}
          onClick={clear}
        >
          <FiXCircle aria-hidden />
          {t("admin:leads.details.clearFollowUp")}
        </Button>
        <LeadRefusalLine error={refusal} openLeadPath={adminLeadPath} />
      </div>
    </Collapse>
  );
}
