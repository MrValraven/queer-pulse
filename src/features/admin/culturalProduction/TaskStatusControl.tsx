import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  type CulturalTaskListItemDTO,
  type CulturalTaskStatus,
} from "./api/culturalProduction.types";
import {
  useIsCulturalWriteInFlight,
  useUpdateCulturalTask,
} from "./api/useCulturalTaskMutations";
import { CULTURAL_TASK_STATUS_KEY } from "./culturalProductionLabels.data";
import { TaskStatusMenu } from "./TaskStatusMenu";

/**
 * A row's status as a compact pill and menu, saved the moment a new one is
 * picked (a direct PATCH). The pill shows the status on its way while the
 * write runs; a saved change reads "Moved to <status>" in a toast, and a
 * refused one goes to `onRefusal`, so the row can name why under the title.
 * While another Cultural Production write is in flight the pill is disabled,
 * so the row reads busy and two writes never overlap.
 */
export function TaskStatusControl({
  task,
  refusalId,
  hasRefusal,
  onRefusal,
}: {
  task: CulturalTaskListItemDTO;
  /** The id of the row's refusal line, read as the pill's description. */
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

  const chooseStatus = (status: CulturalTaskStatus) => {
    if (status === shownStatus || isWriting) return;
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
    <TaskStatusMenu
      status={shownStatus}
      label={t("admin:culturalProduction.tasks.row.statusLabel", {
        title: task.title,
      })}
      isDisabled={isWriting && !updateTask.isPending}
      isBusy={updateTask.isPending}
      isInvalid={hasRefusal}
      describedById={hasRefusal ? refusalId : undefined}
      onPick={chooseStatus}
    />
  );
}
