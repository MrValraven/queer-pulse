import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Collapse, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  LEAD_STAGES,
  isLeadStage,
  type LeadDTO,
  type LeadStage,
} from "./api/leads.types";
import { useLeadIsWriting, useUpdateLead } from "./api/useLeadMutations";
import { leadFieldErrorOf, type LeadFieldError } from "./leadForm.model";
import { LEAD_STAGE_LABEL_KEY } from "./leadLabels.data";
import { LeadDetailRow } from "./LeadDetailRows";
import { LeadRefusalLine } from "./LeadRefusalLine";
import styles from "./AdminLead.module.css";
import detailStyles from "./LeadDetails.module.css";

/**
 * The lead's stage as the first row of the details list, a compact select
 * saved the moment a new one is picked. The select shows
 * the stage on its way while the write runs. A saved change reads "Moved to
 * <stage>" in a polite status line; a refused one names why under the
 * select. The history logs every change on its own. While any lead write
 * is in flight (a note, the details, the persona) a pick is ignored and
 * the open list shows its waiting state, so two writes never overlap and
 * an older answer can't land over a newer one. The select keeps showing
 * the current stage meanwhile. While `shouldShowSaveNote` holds (edit mode)
 * a caption under the select says the pick saves at once, so Cancel is
 * never read as taking it back.
 */
export function LeadStageControl({
  lead,
  shouldShowSaveNote,
}: {
  lead: LeadDTO;
  shouldShowSaveNote: boolean;
}) {
  const { t } = useTranslation();
  const updateLead = useUpdateLead(lead.id);
  const isWriting = useLeadIsWriting();
  const [savedStage, setSavedStage] = useState<LeadStage>(lead.stage);
  const [isSavedLineOpen, setIsSavedLineOpen] = useState(false);
  const [refusal, setRefusal] = useState<LeadFieldError | null>(null);
  const selectId = `lead-${lead.id}-stage`;
  const refusalId = `${selectId}-refusal`;
  const pendingStage = updateLead.isPending
    ? updateLead.variables?.stage
    : undefined;
  const shownStage = pendingStage ?? lead.stage;
  const stageOptions = LEAD_STAGES.map((stage) => ({
    value: stage,
    label: t(LEAD_STAGE_LABEL_KEY[stage]),
  }));

  const chooseStage = (stage: string | null) => {
    if (!isLeadStage(stage) || stage === shownStage) return;
    if (isWriting) return;
    setIsSavedLineOpen(false);
    setRefusal(null);
    updateLead.mutate(
      { stage },
      {
        onSuccess: (saved) => {
          setSavedStage(saved.stage);
          setIsSavedLineOpen(true);
        },
        onError: (cause) => setRefusal(leadFieldErrorOf(cause)),
      },
    );
  };

  return (
    <dl className={`${detailStyles.detailList} ${detailStyles.stageList}`}>
      <LeadDetailRow label={t("admin:leads.field.stage")} hasValue>
        <Select
          id={selectId}
          size="sm"
          className={styles.stageSelect}
          label={t("admin:leads.field.stage")}
          options={stageOptions}
          value={shownStage}
          loading={isWriting}
          aria-invalid={refusal !== null || undefined}
          aria-describedby={refusal !== null ? refusalId : undefined}
          onChange={chooseStage}
        />
        {/* The live region stays mounted, so the line is read out as it
            opens. It closes once the stage moves on from the saved one. */}
        <div role="status">
          <Collapse isOpen={isSavedLineOpen && savedStage === lead.stage}>
            <p className={styles.stageSaved}>
              <FiCheck className={styles.stageSavedIcon} aria-hidden />
              {t("admin:leads.details.stageSaved", {
                stage: t(LEAD_STAGE_LABEL_KEY[savedStage]),
              })}
            </p>
          </Collapse>
        </div>
        <Collapse isOpen={shouldShowSaveNote}>
          <p className={styles.stageNote}>
            {t("admin:leads.details.stageSavesOnPick")}
          </p>
        </Collapse>
        <LeadRefusalLine error={refusal} id={refusalId} />
      </LeadDetailRow>
    </dl>
  );
}
