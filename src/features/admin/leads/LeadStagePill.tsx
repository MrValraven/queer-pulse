import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminChip } from "../ui";
import type { LeadStage } from "./api/leads.types";
import { LEAD_STAGE_LABEL_KEY, LEAD_STAGE_TONE } from "./leadLabels.data";

/** A lead's stage as a quiet pill, in the tone each stage keeps everywhere
 *  (list rows, the lead page, history). */
export function LeadStagePill({ stage }: { stage: LeadStage }) {
  const { t } = useTranslation();
  return (
    <AdminChip tone={LEAD_STAGE_TONE[stage]}>
      {t(LEAD_STAGE_LABEL_KEY[stage])}
    </AdminChip>
  );
}
