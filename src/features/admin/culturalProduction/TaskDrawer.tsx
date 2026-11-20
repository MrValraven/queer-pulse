import { useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiTrash2 } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  Button,
  ConfirmDialog,
  SkeletonLine,
} from "../../../shared/components/ui";
import { ViewFade } from "../../../shared/components/ui/ViewFade";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminDrawer, AdminEmptyState } from "../ui";
import {
  CULTURAL_TIME_ZONE,
  culturalReasonOf,
  type CulturalTaskDTO,
} from "./api/culturalProduction.types";
import { useCulturalTask } from "./api/useCulturalTasks";
import {
  useDeleteCulturalTask,
  useIsCulturalWriteInFlight,
  useUpdateCulturalTask,
} from "./api/useCulturalTaskMutations";
import { CulturalLoadError } from "./CulturalLoadError";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import {
  changedTaskFieldsOf,
  touchedFieldsOf,
  localTaskRefusalOf,
  taskFieldErrorOf,
  taskFormValuesOf,
  type TaskFieldError,
  type TaskFormValues,
} from "./taskForm.model";
import { TaskDrawerAssignees } from "./TaskDrawerAssignees";
import { TaskFormFields } from "./TaskFormFields";
import styles from "./TaskForm.module.css";

const DRAWER_KEY = "admin:culturalProduction.tasks.drawer";

/** The day a task was added, in Lisbon. */
const BYLINE_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: CULTURAL_TIME_ZONE,
};

/** The drawer body before the task is in: skeleton lines, the not found
 *  line with Close, or the load error with a retry. */
function TaskDrawerState({
  view,
  query,
  onClose,
}: {
  view: "loading" | "notFound" | "error";
  query: ReturnType<typeof useCulturalTask>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  if (view === "loading")
    return (
      <div className={styles.skeleton} aria-hidden>
        <SkeletonLine width="70%" height={20} />
        <SkeletonLine height={80} />
        <SkeletonLine width="40%" />
      </div>
    );
  if (view === "notFound")
    return (
      <AdminEmptyState
        size="inline"
        title={t(`${DRAWER_KEY}.notFound`)}
        action={
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.close")}
          </Button>
        }
      />
    );
  return (
    <CulturalLoadError
      error={query.error}
      isRetrying={query.isFetching}
      onRetry={() => void query.refetch()}
      titleKey={`${DRAWER_KEY}.loadError.title`}
      retryKey={`${DRAWER_KEY}.loadError.retryCta`}
    />
  );
}

/** The task's title and who added it when, or the drawer's name while the
 *  task loads. */
function TaskDrawerHead({ task }: { task: CulturalTaskDTO | undefined }) {
  const { t } = useTranslation();
  const formatters = useFormat();
  if (!task)
    return <h2 className={styles.drawerTitle}>{t(`${DRAWER_KEY}.label`)}</h2>;
  const date = formatters.date(new Date(task.createdAt), BYLINE_DATE);
  return (
    <div className={styles.drawerHead}>
      <h2 className={styles.drawerTitle}>{task.title}</h2>
      <p className={styles.byline}>
        {task.author
          ? t(`${DRAWER_KEY}.byline`, { name: task.author.displayName, date })
          : t(`${DRAWER_KEY}.bylineUnknown`, { date })}
      </p>
    </div>
  );
}

/**
 * One task in the right-hand drawer: its fields prefilled and saved with
 * Save task (only the changed fields are sent), the assignees written at
 * once, the byline, and Delete task for whoever may delete it. Closing with
 * unsaved edits asks before discarding them.
 */
export function TaskDrawer({
  taskId,
  onClose,
}: {
  taskId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const idPrefix = useId();
  const formId = `${idPrefix}-form`;
  const query = useCulturalTask(taskId);
  const task = query.data;
  // Only the fields someone touched: a refetch that brings a teammate's
  // change to any other field shows it and never sends it back.
  const [touchedValues, setTouchedValues] = useState<Partial<TaskFormValues>>(
    {},
  );
  const [fieldError, setFieldError] = useState<TaskFieldError | null>(null);
  const [confirming, setConfirming] = useState<"discard" | "delete" | null>(
    null,
  );
  const updateTask = useUpdateCulturalTask(taskId);
  const deleteTask = useDeleteCulturalTask(taskId);
  const isWriteInFlight = useIsCulturalWriteInFlight();
  const isBusy =
    updateTask.isPending || deleteTask.isPending || isWriteInFlight;
  const isSendingRef = useRef(false);
  const savedValues = task ? taskFormValuesOf(task) : null;
  const values = savedValues ? { ...savedValues, ...touchedValues } : null;
  const changes =
    savedValues && values ? changedTaskFieldsOf(savedValues, values) : {};
  const hasChanges = Object.keys(changes).length > 0;
  const formRefusal = fieldError?.field === null ? fieldError.cause : null;
  const isNotFound =
    culturalReasonOf(query.error) === "CULTURAL_TASK_NOT_FOUND";
  const view = task
    ? "task"
    : query.isPending
      ? "loading"
      : isNotFound
        ? "notFound"
        : "error";

  function requestClose() {
    if (deleteTask.isPending) return;
    if (hasChanges) setConfirming("discard");
    else onClose();
  }

  function save() {
    if (values === null || !hasChanges) return;
    if (isBusy || isSendingRef.current) return;
    const localRefusal = localTaskRefusalOf(values);
    if (localRefusal !== null) {
      setFieldError(taskFieldErrorOf(localRefusal));
      return;
    }
    isSendingRef.current = true;
    setFieldError(null);
    updateTask.mutate(changes, {
      onSuccess: () => {
        setTouchedValues({});
        showToast(
          t("admin:culturalProduction.tasks.form.savedToast"),
          "success",
        );
      },
      onError: (cause) => setFieldError(taskFieldErrorOf(cause)),
      onSettled: () => {
        isSendingRef.current = false;
      },
    });
  }

  function confirmDelete() {
    if (deleteTask.isPending) return;
    deleteTask.mutate(undefined, {
      onSuccess: () => {
        showToast(t(`${DRAWER_KEY}.deletedToast`), "success");
        onClose();
      },
      onError: (cause) => {
        setConfirming(null);
        setFieldError({ field: null, cause });
      },
    });
  }

  const foot = task ? (
    <div className={styles.drawerFoot}>
      {task.canDelete && (
        <Button
          variant="quiet"
          className={styles.deleteButton}
          aria-disabled={isBusy || undefined}
          onClick={() => {
            if (!isBusy) setConfirming("delete");
          }}
        >
          <FiTrash2 aria-hidden />
          {t(`${DRAWER_KEY}.deleteCta`)}
        </Button>
      )}
      <Button
        type="submit"
        form={formId}
        variant="primary"
        aria-disabled={isBusy || !hasChanges || undefined}
        aria-busy={updateTask.isPending || undefined}
      >
        {t("admin:culturalProduction.tasks.form.saveEditCta")}
      </Button>
    </div>
  ) : undefined;

  return (
    <AdminDrawer
      label={t(`${DRAWER_KEY}.label`)}
      head={<TaskDrawerHead task={task} />}
      foot={foot}
      onClose={requestClose}
    >
      <div className={styles.drawerViews}>
        <AnimatePresence mode="popLayout" initial={false}>
          <ViewFade key={view}>
            {task && values ? (
              <form
                id={formId}
                className={styles.form}
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  save();
                }}
              >
                <TaskFormFields
                  idPrefix={idPrefix}
                  values={values}
                  onChange={(nextValues) => {
                    setTouchedValues((touched) =>
                      touchedFieldsOf(values, nextValues, touched),
                    );
                    setFieldError(null);
                  }}
                  isDisabled={updateTask.isPending}
                  fieldError={fieldError}
                  shouldShowStatus
                  linkedIdea={task.idea}
                  linkedGuide={task.guide}
                />
                <TaskDrawerAssignees task={task} />
                <CulturalRefusalLine error={formRefusal} />
              </form>
            ) : (
              <TaskDrawerState
                view={view === "task" ? "loading" : view}
                query={query}
                onClose={onClose}
              />
            )}
          </ViewFade>
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {confirming === "discard" && (
          <ConfirmDialog
            open
            tone="destructive"
            title={t(`${DRAWER_KEY}.discardTitle`)}
            confirmLabel={t(`${DRAWER_KEY}.discardCta`)}
            cancelLabel={t(`${DRAWER_KEY}.keepEditingCta`)}
            onClose={() => setConfirming(null)}
            onConfirm={onClose}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirming === "delete" && (
          <ConfirmDialog
            open
            tone="destructive"
            title={t(`${DRAWER_KEY}.deleteConfirmTitle`)}
            description={t(`${DRAWER_KEY}.deleteConfirmBody`)}
            confirmLabel={t(`${DRAWER_KEY}.deleteCta`)}
            loading={deleteTask.isPending}
            onClose={() => {
              if (!deleteTask.isPending) setConfirming(null);
            }}
            onConfirm={confirmDelete}
          />
        )}
      </AnimatePresence>
    </AdminDrawer>
  );
}
