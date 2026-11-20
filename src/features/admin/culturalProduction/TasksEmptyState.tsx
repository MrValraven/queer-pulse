import { FiCheckSquare, FiSearch, FiUser, FiUsers } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminEmptyState } from "../ui";
import type { CulturalProductionUrl } from "./useCulturalProductionUrl";
import type { TasksEmptyView } from "./tasksTab.data";
import styles from "./Tasks.module.css";

const EMPTY_PREFIX = "admin:culturalProduction.tasks.empty";

/**
 * The task list with nothing to show, by its empty view: "Nothing is
 * assigned to you" and "Every task has someone on it" offer Show everyone;
 * filters that match nothing offer Show everyone while an Assigned to view
 * is on, else Clear filters; no tasks at all points at the guides, where a
 * guide creates the tasks for an event.
 */
export function TasksEmptyState({
  view,
  url,
}: {
  view: TasksEmptyView;
  url: CulturalProductionUrl;
}) {
  const { t } = useTranslation();
  const showEveryone = (
    <Button variant="ghost" onClick={() => url.setAssignedTo(null)}>
      {t(`${EMPTY_PREFIX}.showEveryone`)}
    </Button>
  );

  let content;
  if (view === "mine") {
    content = (
      <AdminEmptyState
        icon={FiUser}
        title={t(`${EMPTY_PREFIX}.mine.title`)}
        body={t(`${EMPTY_PREFIX}.mine.body`)}
        action={showEveryone}
      />
    );
  } else if (view === "unassigned") {
    content = (
      <AdminEmptyState
        icon={FiUsers}
        title={t(`${EMPTY_PREFIX}.unassigned.title`)}
        action={showEveryone}
      />
    );
  } else if (view === "filtered" || view === "filteredNoAction") {
    const hasAssignee = url.taskFilters.assignedTo !== null;
    content = (
      <AdminEmptyState
        icon={FiSearch}
        title={t(`${EMPTY_PREFIX}.filtered.title`)}
        action={
          view === "filteredNoAction" ? undefined : hasAssignee ? (
            showEveryone
          ) : (
            <Button variant="ghost" onClick={() => url.clearTaskFilters()}>
              {t(`${EMPTY_PREFIX}.clearFilters`)}
            </Button>
          )
        }
      />
    );
  } else {
    content = (
      <AdminEmptyState
        icon={FiCheckSquare}
        title={t(`${EMPTY_PREFIX}.title`)}
        body={t(`${EMPTY_PREFIX}.body`)}
        action={
          <Button onClick={() => url.setTab("guides")}>
            {t(`${EMPTY_PREFIX}.guidesCta`)}
          </Button>
        }
      />
    );
  }
  return <div className={styles.listState}>{content}</div>;
}
