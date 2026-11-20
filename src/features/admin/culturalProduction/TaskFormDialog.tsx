import { useId, useRef, useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminModal } from "../ui";
import type {
  CulturalRefDTO,
  CulturalStaffSummaryDTO,
  CulturalTaskDTO,
} from "./api/culturalProduction.types";
import {
  useCreateCulturalTask,
  useIsCulturalWriteInFlight,
} from "./api/useCulturalTaskMutations";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import { CulturalStaffPickerButton } from "./CulturalStaffPickerButton";
import {
  createTaskBodyOf,
  emptyTaskFormValues,
  focusAssignTrigger,
  localTaskRefusalOf,
  refusedAssigneeIdOf,
  taskFieldErrorOf,
  type TaskFieldError,
  type TaskFormValues,
} from "./taskForm.model";
import { TaskAssigneeChips } from "./TaskDrawerAssignees";
import { TaskFormFields } from "./TaskFormFields";
import styles from "./TaskForm.module.css";

const FORM_KEY = "admin:culturalProduction.tasks.form";

/**
 * Add a task: the task fields plus Assign staff, which holds the picked
 * people here as removable pills until Add task sends them with the task.
 * A blank title is named under its field and nothing is sent. A refusal
 * shows under the field it names; one naming a person marks that pill. A
 * create in flight keeps the dialog open so its answer lands here; a
 * success toasts, hands the task to `onCreated` and closes.
 */
export function TaskFormDialog({
  onClose,
  onCreated,
  initialIdea = null,
  initialGuide = null,
}: {
  onClose: () => void;
  onCreated?: (task: CulturalTaskDTO) => void;
  initialIdea?: CulturalRefDTO | null;
  initialGuide?: CulturalRefDTO | null;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const idPrefix = useId();
  const formId = `${idPrefix}-form`;
  const formRefusalId = `${idPrefix}-form-refusal`;
  const assigneesRefusalId = `${idPrefix}-assignees-refusal`;
  const [values, setValues] = useState<TaskFormValues>(() =>
    emptyTaskFormValues(initialIdea, initialGuide),
  );
  const [people, setPeople] = useState<CulturalStaffSummaryDTO[]>([]);
  const [fieldError, setFieldError] = useState<TaskFieldError | null>(null);
  const createTask = useCreateCulturalTask();
  const isWriteInFlight = useIsCulturalWriteInFlight();
  const isBusy = createTask.isPending || isWriteInFlight;
  // Set the moment a press is accepted, since `isPending` only flips on the
  // next render and a same-tick double press would add two tasks.
  const isSendingRef = useRef(false);
  const headRef = useRef<HTMLDivElement>(null);
  const assigneesRefusal =
    fieldError?.field === "assignees" ? fieldError.cause : null;
  const formRefusal = fieldError?.field === null ? fieldError.cause : null;

  function close() {
    if (createTask.isPending || isSendingRef.current) return;
    onClose();
  }

  function changeValues(nextValues: TaskFormValues) {
    setValues(nextValues);
    setFieldError(null);
  }

  // `isSelected` is whether the person was picked before the press (the
  // picker's convention): true removes them, false adds them once.
  function togglePerson(person: CulturalStaffSummaryDTO, isSelected: boolean) {
    setFieldError(null);
    setPeople((current) => {
      const others = current.filter((picked) => picked.id !== person.id);
      return isSelected ? others : [...others, person];
    });
  }

  function submit() {
    if (isBusy || isSendingRef.current) return;
    const localRefusal = localTaskRefusalOf(values);
    if (localRefusal !== null) {
      setFieldError(taskFieldErrorOf(localRefusal));
      return;
    }
    isSendingRef.current = true;
    setFieldError(null);
    const body = createTaskBodyOf(
      values,
      people.map((person) => person.id),
    );
    createTask.mutate(body, {
      onSuccess: (task) => {
        showToast(t(`${FORM_KEY}.addedToast`), "success");
        onCreated?.(task);
        onClose();
      },
      onError: (cause) => setFieldError(taskFieldErrorOf(cause)),
      onSettled: () => {
        isSendingRef.current = false;
      },
    });
  }

  return (
    <AdminModal
      title={t(`${FORM_KEY}.addTitle`)}
      onClose={close}
      wide
      footer={
        <>
          <Button
            variant="ghost"
            aria-disabled={createTask.isPending || undefined}
            onClick={close}
          >
            {t("admin:common.cancel")}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            aria-disabled={isBusy || undefined}
            aria-busy={createTask.isPending || undefined}
            aria-describedby={formRefusal !== null ? formRefusalId : undefined}
          >
            {t(`${FORM_KEY}.saveAddCta`)}
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
        <TaskFormFields
          idPrefix={idPrefix}
          values={values}
          onChange={changeValues}
          fieldError={fieldError}
          shouldShowStatus={false}
          linkedIdea={initialIdea}
          linkedGuide={initialGuide}
        />
        <section
          className={styles.assignees}
          aria-label={t(`${FORM_KEY}.assigneesLabel`)}
        >
          <div ref={headRef} className={styles.assigneesHead}>
            <span className={styles.assigneesHeading} aria-hidden>
              {t(`${FORM_KEY}.assigneesLabel`)}
            </span>
            <CulturalStaffPickerButton
              label={t(`${FORM_KEY}.assignCta`)}
              selectedPeople={people}
              onToggle={togglePerson}
              isBusy={createTask.isPending}
            />
          </div>
          <TaskAssigneeChips
            people={people}
            isBusy={createTask.isPending}
            refusedPersonId={refusedAssigneeIdOf(assigneesRefusal)}
            refusalId={assigneesRefusalId}
            onRemove={(person) => togglePerson(person, true)}
            onFocusFallback={() => focusAssignTrigger(headRef.current)}
          />
          <CulturalRefusalLine
            error={assigneesRefusal}
            id={assigneesRefusalId}
          />
        </section>
        <CulturalRefusalLine error={formRefusal} id={formRefusalId} />
      </form>
    </AdminModal>
  );
}
