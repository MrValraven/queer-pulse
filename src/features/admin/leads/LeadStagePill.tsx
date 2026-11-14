import type { ReactNode } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminChip } from "../ui";
import type { LeadStage } from "./api/leads.types";
import { LEAD_STAGE_LABEL_KEY, LEAD_STAGE_TONE } from "./leadLabels.data";

/** A lead's stage as a quiet pill, in the tone each stage keeps everywhere
 *  (list rows, the lead page, history). `trailing` sits inside the pill
 *  after the label, such as the chevron of the list's stage menu. */
export function LeadStagePill({
  stage,
  trailing,
  className,
}: {
  stage: LeadStage;
  trailing?: ReactNode;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <AdminChip tone={LEAD_STAGE_TONE[stage]} className={className}>
      {t(LEAD_STAGE_LABEL_KEY[stage])}
      {trailing}
    </AdminChip>
  );
}
