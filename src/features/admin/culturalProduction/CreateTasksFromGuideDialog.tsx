import { useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, DatePicker, FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { lisbonLeadDay } from "../leads/leadDates";
import { AdminModal } from "../ui";
import {
  CULTURAL_DATE_MAX,
  CULTURAL_DATE_MIN,
  culturalRefusalDetailOf,
  type CulturalGuideDTO,
  type CulturalStaffSummaryDTO,
} from "./api/culturalProduction.types";
import {
  useCreateCulturalTaskBatch,
  useIsCulturalWriteInFlight,
} from "./api/useCulturalGuideMutations";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import { CulturalStaffPickerButton } from "./CulturalStaffPickerButton";
import {
  GuideBatchAssigneeChips,
  GuideBatchPreview,
} from "./GuideBatchPreview";
import {
  createdTasksHrefOf,
  guideStepsOf,
  previewGuideBatch,
} from "./guideBatch.model";
import { useCulturalViewerId } from "./useCulturalViewerId";
import styles from "./GuideBatch.module.css";

/**
 * Create tasks for an event: the event date (required), the staff every
 * task goes to (optional), and a preview of one task per checklist step
 * with its due day, which opens once the date is set. Create stays off
 * until then. A create in flight keeps the dialog open, so a refusal lands
 * here; one that names a person marks that person's pill. A success closes
 * the dialog and toasts with "Open the tasks", which opens the viewer's own
 * tasks when they are among the assignees and the whole Tasks tab when not.
 * A guide with no steps shows a line saying so and no form.
 */
export function CreateTasksFromGuideDialog({
  guide,
  onClose,
}: {
  guide: CulturalGuideDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const viewerId = useCulturalViewerId();
  const idPrefix = useId();
  const formId = `${idPrefix}-form`;
  const refusalId = `${idPrefix}-refusal`;
  const [eventOn, setEventOn] = useState<string | null>(null);
  const [assignees, setAssignees] = useState<CulturalStaffSummaryDTO[]>([]);
  const [refusal, setRefusal] = useState<unknown>(null);
  // Set the moment a press is accepted, since `isPending` only flips on the
  // next render and a same-tick double press would create two batches.
  const isSendingRef = useRef(false);
  // Holds the Assign staff trigger, which takes focus when the last pill goes.
  const pickerTriggerRef = useRef<HTMLDivElement>(null);
  const createBatch = useCreateCulturalTaskBatch(guide.id);
  const isWriteInFlight = useIsCulturalWriteInFlight();
  const isBusy = createBatch.isPending || isWriteInFlight;
  const stepCount = guideStepsOf(guide).length;
  const preview =
    eventOn === null
      ? null
      : previewGuideBatch(guide, eventOn, lisbonLeadDay());
  const refusedPersonId =
    refusal === null ? null : culturalRefusalDetailOf(refusal).userId;

  function close() {
    if (createBatch.isPending || isSendingRef.current) return;
    onClose();
  }

  function toggleAssignee(
    person: CulturalStaffSummaryDTO,
    isSelected: boolean,
  ) {
    if (isBusy) return;
    setRefusal(null);
    setAssignees((current) => {
      const others = current.filter((member) => member.id !== person.id);
      return isSelected ? others : [...others, person];
    });
  }

  function submit() {
    if (eventOn === null || isBusy || isSendingRef.current) return;
    const assigneeIds = assignees.map((person) => person.id);
    isSendingRef.current = true;
    setRefusal(null);
    createBatch.mutate(
      { eventOn, assigneeIds },
      {
        onSuccess: (batch) => {
          const href = createdTasksHrefOf(assigneeIds, viewerId);
          showToast(
            t("admin:culturalProduction.batch.createdToast", {
              count: batch.items.length,
            }),
            "success",
            undefined,
            {
              label: t("admin:culturalProduction.batch.openTasksCta"),
              onClick: () => void navigate(href),
            },
          );
          onClose();
        },
        onError: (cause) => setRefusal(cause),
        onSettled: () => {
          isSendingRef.current = false;
        },
      },
    );
  }

  if (stepCount === 0) return <NoStepsDialog onClose={onClose} />;

  return (
    <AdminModal
      title={t("admin:culturalProduction.batch.title")}
      eyebrow={guide.title}
      onClose={close}
      wide
      footer={
        <>
          <Button
            variant="ghost"
            aria-disabled={createBatch.isPending || undefined}
            onClick={close}
          >
            {t("admin:culturalProduction.common.cancel")}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            disabled={eventOn === null}
            aria-disabled={isBusy || undefined}
            aria-busy={createBatch.isPending || undefined}
            aria-describedby={refusal !== null ? refusalId : undefined}
          >
            {createBatch.isPending
              ? t("admin:culturalProduction.batch.creatingCta")
              : t("admin:culturalProduction.batch.submitCta", {
                  count: stepCount,
                })}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <p className={styles.intro}>
          {t("admin:culturalProduction.batch.intro")}
        </p>
        <FormField
          label={t("admin:culturalProduction.batch.eventDateLabel")}
          required
        >
          <DatePicker
            mode="date"
            id={`${idPrefix}-event-on`}
            label={t("admin:culturalProduction.batch.eventDateLabel")}
            value={eventOn}
            min={CULTURAL_DATE_MIN}
            max={CULTURAL_DATE_MAX}
            disabled={createBatch.isPending}
            onChange={(nextEventOn) => {
              setEventOn(nextEventOn);
              setRefusal(null);
            }}
          />
        </FormField>
        <div
          className={styles.assignees}
          role="group"
          aria-labelledby={`${idPrefix}-assignees`}
        >
          <div className={styles.assigneesHead}>
            <span
              id={`${idPrefix}-assignees`}
              className={styles.assigneesLabel}
            >
              {t("admin:culturalProduction.batch.assigneesLabel")}
            </span>
            <div ref={pickerTriggerRef}>
              <CulturalStaffPickerButton
                label={t("admin:culturalProduction.tasks.form.assignCta")}
                selectedPeople={assignees}
                onToggle={toggleAssignee}
                isBusy={isBusy}
              />
            </div>
          </div>
          <p className={styles.hint}>
            {t("admin:culturalProduction.batch.assigneesHint")}
          </p>
          <GuideBatchAssigneeChips
            people={assignees}
            viewerId={viewerId}
            refusedPersonId={refusedPersonId}
            refusalId={refusalId}
            isBusy={isBusy}
            onRemove={(person) => toggleAssignee(person, true)}
            onEmptied={() =>
              pickerTriggerRef.current?.querySelector("button")?.focus()
            }
          />
        </div>
        <CulturalRefusalLine error={refusal} id={refusalId} />
        <GuideBatchPreview preview={preview} />
      </form>
    </AdminModal>
  );
}

/** A guide with no checklist steps: the line saying so, and Close. */
function NoStepsDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <AdminModal
      title={t("admin:culturalProduction.batch.title")}
      onClose={onClose}
      footer={
        <Button variant="ghost" onClick={onClose}>
          {t("admin:culturalProduction.common.close")}
        </Button>
      }
    >
      <p className={styles.noSteps}>
        {t("admin:culturalProduction.batch.noSteps")}
      </p>
    </AdminModal>
  );
}
