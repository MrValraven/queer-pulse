import { FiX } from "react-icons/fi";
import {
  Button,
  Collapse,
  DatePicker,
  FormField,
  Select,
  type SelectOption,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  CULTURAL_DATE_MAX,
  CULTURAL_DATE_MIN,
  CULTURAL_TASK_NOTES_MAX,
  CULTURAL_TASK_STATUSES,
  CULTURAL_TITLE_MAX,
  isCulturalTaskStatus,
  type CulturalRefDTO,
} from "./api/culturalProduction.types";
import { useCulturalGuides } from "./api/useCulturalGuides";
import { useCulturalIdeas } from "./api/useCulturalIdeas";
import { CULTURAL_TASK_STATUS_KEY } from "./culturalProductionLabels.data";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import type {
  TaskFieldError,
  TaskFormField,
  TaskFormValues,
} from "./taskForm.model";
import styles from "./TaskForm.module.css";

const FORM_KEY = "admin:culturalProduction.tasks.form";
/** The option that leaves a task with no idea or guide; ids are never it. */
const NO_LINK_VALUE = "none";

export interface TaskFormFieldsProps {
  idPrefix: string;
  values: TaskFormValues;
  onChange: (next: TaskFormValues) => void;
  fieldError: TaskFieldError | null;
  /** The drawer edits the status; a new task starts as To do. */
  shouldShowStatus: boolean;
  isDisabled?: boolean;
  /** The saved links, offered even before (or without) the lists load. */
  linkedIdea?: CulturalRefDTO | null;
  linkedGuide?: CulturalRefDTO | null;
}

function refusalFor(fieldError: TaskFieldError | null, field: TaskFormField) {
  return fieldError?.field === field ? fieldError.cause : null;
}

/** The none option, then every item, then the saved link when the list
 *  does not hold it. */
function linkOptionsOf(
  noneLabel: string,
  items: readonly CulturalRefDTO[],
  linked: CulturalRefDTO | null | undefined,
): SelectOption[] {
  const options: SelectOption[] = [{ value: NO_LINK_VALUE, label: noneLabel }];
  for (const item of items) options.push({ value: item.id, label: item.title });
  if (linked && !items.some((item) => item.id === linked.id))
    options.push({ value: linked.id, label: linked.title });
  return options;
}

const linkValueOf = (selected: string | null): string | null =>
  selected === null || selected === NO_LINK_VALUE ? null : selected;

/** A labelled select with its refusal line below. */
function TaskSelectField({
  id,
  label,
  options,
  value,
  refusal,
  isLoading = false,
  isDisabled,
  onValueChange,
}: {
  id: string;
  label: string;
  options: SelectOption[];
  value: string;
  refusal: unknown;
  isLoading?: boolean;
  isDisabled: boolean;
  onValueChange: (next: string | null) => void;
}) {
  const refusalId = `${id}-refusal`;
  return (
    <div className={styles.fieldBlock}>
      <FormField label={label} className={styles.field}>
        <Select
          id={id}
          label={label}
          options={options}
          value={value}
          loading={isLoading}
          disabled={isDisabled}
          aria-invalid={refusal !== null || undefined}
          aria-describedby={refusal !== null ? refusalId : undefined}
          onChange={onValueChange}
        />
      </FormField>
      <CulturalRefusalLine error={refusal} id={refusalId} />
    </div>
  );
}

/** The due date with its own Clear due date button, shown while a date is
 *  set. */
function TaskDueField({
  idPrefix,
  values,
  onChange,
  fieldError,
  isDisabled = false,
}: TaskFormFieldsProps) {
  const { t } = useTranslation();
  const refusal = refusalFor(fieldError, "dueOn");
  const refusalId = `${idPrefix}-due-refusal`;
  return (
    <div className={styles.fieldBlock}>
      <FormField label={t(`${FORM_KEY}.dueLabel`)} className={styles.field}>
        <DatePicker
          mode="date"
          id={`${idPrefix}-due`}
          label={t(`${FORM_KEY}.dueLabel`)}
          value={values.dueOn}
          min={CULTURAL_DATE_MIN}
          max={CULTURAL_DATE_MAX}
          disabled={isDisabled}
          aria-invalid={refusal !== null || undefined}
          aria-describedby={refusal !== null ? refusalId : undefined}
          onChange={(dueOn) => onChange({ ...values, dueOn })}
        />
      </FormField>
      <Collapse isOpen={values.dueOn !== null}>
        <Button
          variant="quiet"
          size="sm"
          className={styles.clearDue}
          aria-disabled={isDisabled || undefined}
          onClick={() => {
            if (!isDisabled) onChange({ ...values, dueOn: null });
          }}
        >
          <FiX aria-hidden />
          {t(`${FORM_KEY}.dueClearCta`)}
        </Button>
      </Collapse>
      <CulturalRefusalLine error={refusal} id={refusalId} />
    </div>
  );
}

/** The status (drawer only), the linked idea and the linked guide. */
function TaskLinkFields(props: TaskFormFieldsProps) {
  const { idPrefix, values, onChange, fieldError, isDisabled = false } = props;
  const { t } = useTranslation();
  const ideas = useCulturalIdeas();
  const guides = useCulturalGuides();
  const statusOptions = CULTURAL_TASK_STATUSES.map((status) => ({
    value: status,
    label: t(CULTURAL_TASK_STATUS_KEY[status]),
  }));
  return (
    <div className={styles.linkGrid}>
      {props.shouldShowStatus && (
        <TaskSelectField
          id={`${idPrefix}-status`}
          label={t(`${FORM_KEY}.statusLabel`)}
          options={statusOptions}
          value={values.status}
          refusal={refusalFor(fieldError, "status")}
          isDisabled={isDisabled}
          onValueChange={(status) => {
            if (isCulturalTaskStatus(status)) onChange({ ...values, status });
          }}
        />
      )}
      <TaskSelectField
        id={`${idPrefix}-idea`}
        label={t(`${FORM_KEY}.ideaLabel`)}
        options={linkOptionsOf(
          t(`${FORM_KEY}.ideaNone`),
          ideas.data?.items ?? [],
          props.linkedIdea,
        )}
        value={values.ideaId ?? NO_LINK_VALUE}
        refusal={refusalFor(fieldError, "ideaId")}
        isLoading={ideas.isPending}
        isDisabled={isDisabled}
        onValueChange={(ideaId) =>
          onChange({ ...values, ideaId: linkValueOf(ideaId) })
        }
      />
      <TaskSelectField
        id={`${idPrefix}-guide`}
        label={t(`${FORM_KEY}.guideLabel`)}
        options={linkOptionsOf(
          t(`${FORM_KEY}.guideNone`),
          guides.data?.items ?? [],
          props.linkedGuide,
        )}
        value={values.guideId ?? NO_LINK_VALUE}
        refusal={refusalFor(fieldError, "guideId")}
        isLoading={guides.isPending}
        isDisabled={isDisabled}
        onValueChange={(guideId) =>
          onChange({ ...values, guideId: linkValueOf(guideId) })
        }
      />
    </div>
  );
}

/** The task fields the add dialog and the drawer share: title, notes, due
 *  date, the status in the drawer, and the linked idea and guide. Each
 *  refusal shows under the field it names. */
export function TaskFormFields(props: TaskFormFieldsProps) {
  const { idPrefix, values, onChange, fieldError, isDisabled = false } = props;
  const { t } = useTranslation();
  const titleRefusal = refusalFor(fieldError, "title");
  const notesRefusal = refusalFor(fieldError, "notes");
  return (
    <div className={styles.fields}>
      <div className={styles.fieldBlock}>
        <FormField
          label={t(`${FORM_KEY}.titleLabel`)}
          required
          className={styles.field}
        >
          <input
            id={`${idPrefix}-title`}
            type="text"
            value={values.title}
            maxLength={CULTURAL_TITLE_MAX}
            placeholder={t(`${FORM_KEY}.titlePlaceholder`)}
            autoComplete="off"
            disabled={isDisabled}
            aria-invalid={titleRefusal !== null || undefined}
            aria-describedby={
              titleRefusal !== null ? `${idPrefix}-title-refusal` : undefined
            }
            onChange={(event) =>
              onChange({ ...values, title: event.target.value })
            }
          />
        </FormField>
        <CulturalRefusalLine
          error={titleRefusal}
          id={`${idPrefix}-title-refusal`}
        />
      </div>
      <div className={styles.fieldBlock}>
        <FormField
          label={t(`${FORM_KEY}.notesLabel`)}
          helper={t(`${FORM_KEY}.notesHint`)}
          className={styles.field}
        >
          <textarea
            id={`${idPrefix}-notes`}
            rows={4}
            className={styles.notes}
            value={values.notes}
            maxLength={CULTURAL_TASK_NOTES_MAX}
            disabled={isDisabled}
            aria-invalid={notesRefusal !== null || undefined}
            aria-describedby={
              notesRefusal !== null ? `${idPrefix}-notes-refusal` : undefined
            }
            onChange={(event) =>
              onChange({ ...values, notes: event.target.value })
            }
          />
        </FormField>
        <CulturalRefusalLine
          error={notesRefusal}
          id={`${idPrefix}-notes-refusal`}
        />
      </div>
      <TaskDueField {...props} />
      <TaskLinkFields {...props} />
    </div>
  );
}
