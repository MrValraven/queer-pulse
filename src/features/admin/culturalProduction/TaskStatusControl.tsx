import { Select } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  CULTURAL_TASK_STATUSES,
  isCulturalTaskStatus,
  type CulturalTaskListItemDTO,
} from "./api/culturalProduction.types";
import {
  useIsCulturalWriteInFlight,
  useUpdateCulturalTask,
} from "./api/useCulturalTaskMutations";
import { CULTURAL_TASK_STATUS_KEY } from "./culturalProductionLabels.data";
import styles from "./Tasks.module.css";

/**
 * A row's status as a compact select, saved the moment a new one is picked
 * (a direct PATCH). The select shows the status on its way while the write
 * runs; a saved change reads "Moved to <status>" in a toast, and a refused
 * one goes to `onRefusal`, so the row can name why under the title. While
 * another Cultural Production write is in flight the select is disabled, so
 * the row reads busy and two writes never overlap.
 */
export function TaskStatusControl({
  task,
  refusalId,
  hasRefusal,
  onRefusal,
}: {
  task: CulturalTaskListItemDTO;
  /** The id of the row's refusal line, read as the select's description. */
  refusalId: string;
  hasRefusal: boolean;
  /** Null clears the line. */
  onRefusal: (cause: unknown) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const updateTask = useUpdateCulturalTask(task.id);
  const isWriting = useIsCulturalWriteInFlight();
  const pendingStatus = updateTask.isPending
    ? updateTask.variables?.status
    : undefined;
  const shownStatus = pendingStatus ?? task.status;
  const options = CULTURAL_TASK_STATUSES.map((status) => ({
    value: status,
    label: t(CULTURAL_TASK_STATUS_KEY[status]),
  }));

  const chooseStatus = (status: string | null) => {
    if (!isCulturalTaskStatus(status) || status === shownStatus) return;
    if (isWriting) return;
    onRefusal(null);
    updateTask.mutate(
      { status },
      {
        onSuccess: (saved) =>
          showToast(
            t("admin:culturalProduction.tasks.statusToast", {
              status: t(CULTURAL_TASK_STATUS_KEY[saved.status]),
            }),
            "success",
          ),
        onError: (cause) => onRefusal(cause),
      },
    );
  };

  return (
    <Select
      size="sm"
      className={`${styles.statusSelect} ${styles.phoneTarget}`}
      label={t("admin:culturalProduction.tasks.row.statusLabel", {
        title: task.title,
      })}
      options={options}
      value={shownStatus}
      disabled={isWriting && !updateTask.isPending}
      aria-invalid={hasRefusal || undefined}
      aria-describedby={hasRefusal ? refusalId : undefined}
      onChange={chooseStatus}
    />
  );
}
